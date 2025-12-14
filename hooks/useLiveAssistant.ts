import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SYSTEM_INSTRUCTION, CASE_DATA_TOOL } from '../constants';
import { createPcmBlob, decodeBase64, decodeAudioData } from '../utils/audioUtils';
import { fileToBase64, isValidFileType } from '../utils/fileUtils';
import { db } from '../utils/db';
import { ConnectionState, Message, CaseData, Solicitor } from '../types';

export const useLiveAssistant = (selectedSolicitor: Solicitor) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [messages, setMessages] = useState<Message[]>([]);
  // Initialize with DB data or default
  const [caseData, setCaseData] = useState<CaseData>(() => {
    return db.loadCase() || { formType: 'Unknown', children: [] };
  });
  
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Persist CaseData whenever it changes
  useEffect(() => {
    if (caseData) {
      db.saveCase(caseData);
    }
  }, [caseData]);

  // Audio Contexts and Nodes
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  // Transcription State Accumulators
  const currentInputTransRef = useRef<string>('');
  const currentOutputTransRef = useRef<string>('');

  const disconnect = useCallback(async () => {
    // Stop all audio
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }
    if (inputAudioContextRef.current) {
      await inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      activeSourcesRef.current.forEach(source => source.stop());
      activeSourcesRef.current.clear();
      await outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    
    setConnectionState(ConnectionState.DISCONNECTED);
    setIsSpeaking(false);
    nextStartTimeRef.current = 0;
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (connectionState !== ConnectionState.CONNECTED || !sessionPromiseRef.current) return;
    
    // Add user message to UI immediately for feedback
    setMessages(prev => [...prev, {
      id: Date.now().toString() + '-user-text',
      role: 'user',
      text: text,
      isFinal: true
    }]);

    sessionPromiseRef.current.then((session: any) => {
      session.send({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text }] }],
          turnComplete: true
        }
      });
    }).catch(err => {
      console.error("Failed to send text message", err);
    });
  }, [connectionState]);

  const sendFile = useCallback(async (file: File) => {
    if (connectionState !== ConnectionState.CONNECTED || !sessionPromiseRef.current) {
      setError("Must be connected to upload files.");
      return;
    }

    if (!isValidFileType(file)) {
      setError("Invalid file type. Please upload PDF, PNG, or JPEG.");
      return;
    }

    try {
      const base64Data = await fileToBase64(file);
      
      // Visual feedback in chat
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-file',
        role: 'user',
        text: `📄 Uploading and analyzing document: ${file.name}...`,
        isFinal: true
      }]);

      // IMPORTANT: The Live API does not natively support PDF streams reliably.
      // We use the standard GenerateContent API to analyze the document first,
      // then feed the insights into the Live session.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const analysisPrompt = `
        You are an expert legal assistant. Analyze this document for a UK Family Court case.
        Extract specific details to update the Case File:
        1. Full names of Applicant, Respondent, and Children.
        2. Dates of birth.
        3. Financial figures (income, assets, debts) if this is a financial document.
        4. Any court orders or safety concerns mentioned.
        
        Provide a concise summary of these facts.
      `;

      const analysisResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
             { inlineData: { mimeType: file.type, data: base64Data } },
             { text: analysisPrompt }
          ]
        }
      });

      const analysisText = analysisResponse.text;

      // Send the analysis to the Live Session context
      sessionPromiseRef.current.then((session: any) => {
        // We send this as a user turn so the model reacts to it naturally
        const contextMessage = `[SYSTEM: The user uploaded a file named '${file.name}'. Here is the content analysis]:\n\n${analysisText}\n\n[INSTRUCTION: Use this information to update the case file using the 'update_case_data' tool immediately.]`;
        
        session.send({
          clientContent: {
            turns: [{ role: 'user', parts: [{ text: contextMessage }] }],
            turnComplete: true
          }
        });
      });
      
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-analysis',
        role: 'system',
        text: `✅ Document analyzed. I have reviewed the contents of ${file.name}.`,
        isFinal: true
      }]);
      
    } catch (err) {
      console.error("Failed to process file", err);
      setError("Failed to analyze file. Please try again.");
    }
  }, [connectionState]);

  const connect = useCallback(async () => {
    if (!process.env.API_KEY) {
      setError("API Key is missing.");
      return;
    }

    try {
      setConnectionState(ConnectionState.CONNECTING);
      setError(null);

      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);

      // Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Customize Instruction based on Persona
      const personalizedInstruction = SYSTEM_INSTRUCTION
        .replace('[SOLICITOR_NAME]', selectedSolicitor.name)
        .replace('[SOLICITOR_GENDER]', selectedSolicitor.gender);

      // Create Session
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: personalizedInstruction,
          tools: [CASE_DATA_TOOL],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedSolicitor.voiceName } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setConnectionState(ConnectionState.CONNECTED);
            
            // Setup Input Processing (Mic -> GenAI)
            if (!inputAudioContextRef.current) return;
            
            inputSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (e) => {
              if (isMuted) return; 
              
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              
              sessionPromise.then((session: any) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            inputSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
            
            // Send initial state to model if resuming
            if (caseData.applicantName || caseData.children?.length) {
               // Optional: We could inform the model of existing context here if needed
            }
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Tool Calls (Data Capture)
             if (message.toolCall) {
               console.log("Tool Call received:", message.toolCall);
               const functionCalls = message.toolCall.functionCalls;
               
               if (functionCalls && functionCalls.length > 0) {
                 const call = functionCalls[0];
                 if (call.name === 'update_case_data') {
                   // Update local state with the parsed arguments
                   const newData = call.args as Partial<CaseData>;
                   
                   setCaseData(prev => {
                     // Deep merge needed for nested objects like financials
                     return {
                        ...prev,
                        ...newData,
                        children: newData.children ? [...(prev.children || []), ...newData.children] : prev.children,
                        financials: { ...prev.financials, ...newData.financials }
                     };
                   });

                   // Send response back to model to confirm receipt
                   sessionPromise.then((session: any) => {
                      session.sendToolResponse({
                        functionResponses: [{
                          id: call.id,
                          name: call.name,
                          response: { result: "Case data updated successfully" }
                        }]
                      });
                   });
                 }
               }
             }

             // Handle Output Audio
             const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (audioData && outputAudioContextRef.current) {
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(
                  decodeBase64(audioData),
                  ctx,
                  24000,
                  1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNodeRef.current!);
                
                // Visualizer State
                source.onended = () => {
                   activeSourcesRef.current.delete(source);
                   if (activeSourcesRef.current.size === 0) setIsSpeaking(false);
                };
                
                setIsSpeaking(true);
                source.start(nextStartTimeRef.current);
                activeSourcesRef.current.add(source);
                nextStartTimeRef.current += audioBuffer.duration;
             }

             // Handle Transcriptions
             if (message.serverContent?.outputTranscription) {
               currentOutputTransRef.current += message.serverContent.outputTranscription.text;
             }
             if (message.serverContent?.inputTranscription) {
                currentInputTransRef.current += message.serverContent.inputTranscription.text;
             }

             if (message.serverContent?.turnComplete) {
                if (currentInputTransRef.current.trim()) {
                   setMessages(prev => [...prev, {
                     id: Date.now().toString() + '-user',
                     role: 'user',
                     text: currentInputTransRef.current.trim(),
                     isFinal: true
                   }]);
                   currentInputTransRef.current = '';
                }
                
                if (currentOutputTransRef.current.trim()) {
                   setMessages(prev => [...prev, {
                     id: Date.now().toString() + '-assistant',
                     role: 'assistant',
                     text: currentOutputTransRef.current.trim(),
                     isFinal: true
                   }]);
                   currentOutputTransRef.current = '';
                }
             }
             
             if (message.serverContent?.interrupted) {
               activeSourcesRef.current.forEach(source => source.stop());
               activeSourcesRef.current.clear();
               setIsSpeaking(false);
               nextStartTimeRef.current = 0;
               currentOutputTransRef.current = ''; 
             }
          },
          onclose: () => {
            setConnectionState(ConnectionState.DISCONNECTED);
            setIsSpeaking(false);
          },
          onerror: (err) => {
            console.error(err);
            setError("Connection error occurred.");
            setConnectionState(ConnectionState.ERROR);
            setIsSpeaking(false);
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error(err);
      setError("Failed to initialize audio or connection.");
      setConnectionState(ConnectionState.ERROR);
    }
  }, [isMuted, selectedSolicitor, caseData]); // Added caseData to dependency if strictly needed, but careful with re-connects. Usually keep connect stable.

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  return {
    connectionState,
    connect,
    disconnect,
    sendTextMessage,
    sendFile,
    messages,
    caseData, 
    isMuted,
    isSpeaking, 
    toggleMute,
    error
  };
};
