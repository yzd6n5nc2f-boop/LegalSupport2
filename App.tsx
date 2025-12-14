import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Phone, PhoneOff, AlertCircle, Menu, X } from 'lucide-react';
import { useLiveAssistant } from './hooks/useLiveAssistant';
import { ChatMessage } from './components/ChatMessage';
import { SolicitorSelector, SOLICITORS } from './components/SolicitorSelector';
import { CaseSummary } from './components/CaseSummary';
import { ChatInput } from './components/ChatInput'; // New Import
import { ConnectionState, Solicitor } from './types';

const App: React.FC = () => {
  const [selectedSolicitor, setSelectedSolicitor] = useState<Solicitor | null>(null);
  const [showSummaryMobile, setShowSummaryMobile] = useState(false);
  
  // Initialize hook only if solicitor is selected
  const assistant = useLiveAssistant(selectedSolicitor || SOLICITORS[0]);

  const { 
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
  } = assistant;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Solicitor Selection
  if (!selectedSolicitor) {
    return <SolicitorSelector onSelect={setSelectedSolicitor} />;
  }

  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* LEFT COLUMN: Chat & Controls */}
      <div className={`flex flex-col flex-1 h-full bg-[#f8fafc] relative transition-all duration-300 ${showSummaryMobile ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header */}
        <header className="flex-shrink-0 bg-indigo-900 border-b border-indigo-800 h-16 flex items-center justify-between px-6 z-10 shadow-md">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setSelectedSolicitor(null)}
               className="md:hidden text-indigo-200 hover:text-white"
             >
                <X size={24} />
             </button>
             <div className="flex flex-col">
               <h1 className="font-bold text-white leading-tight flex items-center gap-2">
                 Family Court Assistant
               </h1>
               <span className="text-xs text-indigo-300">
                 Speaking with <span className="text-white font-medium">{selectedSolicitor.name}</span>
               </span>
             </div>
          </div>
          
          <button 
            className="md:hidden p-2 text-indigo-200 hover:text-white"
            onClick={() => setShowSummaryMobile(true)}
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/subtle-light-aluminum.png')]">
          <div className="max-w-2xl mx-auto min-h-full flex flex-col">
            
            {/* Solicitor Avatar Display (In-Chat) */}
            <div className="flex justify-center mb-8 mt-6">
              <div className="relative group">
                 <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 transition-all duration-300 ${isSpeaking ? 'opacity-70 scale-110' : 'opacity-30'}`}></div>
                 <img 
                   src={selectedSolicitor.imageUrl} 
                   alt={selectedSolicitor.name}
                   className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-xl transition-transform duration-300 ${isSpeaking ? 'scale-105 border-indigo-100' : ''}`} 
                 />
                 {isSpeaking && (
                   <div className="absolute bottom-1 right-2 bg-green-500 w-5 h-5 rounded-full border-4 border-white animate-pulse shadow-sm"></div>
                 )}
              </div>
            </div>

            {/* Welcome Message if empty */}
            {messages.length === 0 && (
              <div className="text-center opacity-80 mb-8 max-w-md mx-auto">
                 <p className="text-slate-600 bg-white/50 p-4 rounded-xl border border-slate-200 shadow-sm">
                   Hello, I am <span className="font-semibold text-indigo-700">{selectedSolicitor.name}</span>. 
                   <br/>I am here to help you draft your court documents. 
                   <br/><br/>
                   <span className="text-sm text-slate-500">Press the <span className="font-bold text-slate-800">Start Consultation</span> button below when you are ready.</span>
                 </p>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-4 pb-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </main>

        {/* Controls */}
        <footer className="bg-white border-t border-slate-200 p-4 md:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
             {error && (
                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm w-full justify-center shadow-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

             {/* Dynamic Footer Content */}
             {!isConnected && !isConnecting ? (
                 <button 
                   onClick={connect}
                   className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-3 rounded-full hover:from-indigo-700 hover:to-blue-700 hover:scale-105 transition-all shadow-lg hover:shadow-indigo-500/30"
                 >
                   <Phone size={20} className="animate-pulse" />
                   <span className="font-medium tracking-wide">Start Consultation</span>
                 </button>
             ) : isConnecting ? (
                 <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50 px-6 py-2 rounded-full">
                   <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-150"></div>
                   <span className="font-medium text-sm">Connecting...</span>
                 </div>
             ) : (
                 <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                   {/* Voice Controls */}
                   <div className="flex items-center gap-2 md:gap-4 order-2 md:order-1">
                     <button 
                       onClick={toggleMute}
                       className={`p-3 rounded-full transition-all shadow-md ${isMuted ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
                       title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                     >
                       {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                     </button>
                     
                     <button 
                       onClick={disconnect}
                       className="p-3 rounded-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all shadow-md"
                       title="End Call"
                     >
                       <PhoneOff size={20} />
                     </button>
                   </div>

                   {/* Text Input */}
                   <div className="flex-1 w-full order-1 md:order-2">
                     <ChatInput 
                        onSend={sendTextMessage} 
                        onFileUpload={sendFile}
                        disabled={!isConnected} 
                     />
                   </div>
                 </div>
             )}
          </div>
        </footer>
      </div>

      {/* RIGHT COLUMN: Case Summary (Desktop) */}
      <div className="hidden md:block w-[26rem] bg-white shadow-xl z-20 border-l border-slate-200">
         <CaseSummary data={caseData} />
      </div>

      {/* MOBILE DRAWER: Case Summary */}
      {showSummaryMobile && (
        <div className="fixed inset-0 z-50 md:hidden bg-indigo-900/40 backdrop-blur-sm" onClick={() => setShowSummaryMobile(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
            <div className="h-full relative flex flex-col">
               <div className="absolute top-4 right-4 z-10">
                 <button 
                   onClick={() => setShowSummaryMobile(false)}
                   className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"
                 >
                   <X size={20} />
                 </button>
               </div>
               <CaseSummary data={caseData} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
