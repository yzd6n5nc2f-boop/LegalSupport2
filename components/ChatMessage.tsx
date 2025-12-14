import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { User, Scale } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
          isUser 
            ? 'bg-indigo-100 ml-3' 
            : 'bg-blue-600 mr-3'
        }`}>
          {isUser ? <User className="text-indigo-600 h-5 w-5" /> : <Scale className="text-white h-5 w-5" />}
        </div>

        {/* Bubble */}
        <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden ${
          isUser 
            ? 'bg-indigo-600 text-white rounded-tr-none' 
            : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 ring-1 ring-slate-50'
        }`}>
          {isUser ? (
             <p>{message.text}</p>
          ) : (
            <div className="prose prose-slate prose-sm max-w-none prose-p:my-1 prose-headings:text-slate-900 prose-strong:text-slate-900">
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
