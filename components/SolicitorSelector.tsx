import React from 'react';
import { Solicitor } from '../types';
import { User, ShieldCheck, Star } from 'lucide-react';

interface SolicitorSelectorProps {
  onSelect: (solicitor: Solicitor) => void;
}

export const SOLICITORS: Solicitor[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    gender: 'female',
    voiceName: 'Kore',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300',
    description: 'Specialist in Child Arrangements (C100). Calm, empathetic, and clear.'
  },
  {
    id: 'james',
    name: 'James',
    gender: 'male',
    voiceName: 'Fenrir',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300&h=300',
    description: 'Expert in Financial Remedy (Form E). Detailed, structured, and formal.'
  }
];

export const SolicitorSelector: React.FC<SolicitorSelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-indigo-900 via-blue-800 to-slate-900">
      <div className="text-center mb-12 max-w-2xl">
        <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-full shadow-2xl mb-6 ring-1 ring-white/20">
          <ShieldCheck className="w-10 h-10 text-blue-200" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Select Your Assistant</h2>
        <p className="text-blue-100 text-lg">Choose your preferred legal guide to help navigate your family court documents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        {SOLICITORS.map((solicitor) => (
          <button
            key={solicitor.id}
            onClick={() => onSelect(solicitor)}
            className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          >
            {/* Decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative w-36 h-36 mb-6 rounded-full p-1 bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-400 group-hover:to-indigo-600 transition-colors duration-300">
                <img 
                  src={solicitor.imageUrl} 
                  alt={solicitor.name} 
                  className="w-full h-full rounded-full object-cover border-4 border-white"
                />
                <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-1">{solicitor.name}</h3>
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                Family Law Assistant
              </span>
              
              <p className="text-slate-600 leading-relaxed mb-8 min-h-[3rem]">
                {solicitor.description}
              </p>
              
              <div className="w-full py-3 bg-slate-50 text-slate-700 font-semibold rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 flex items-center justify-center gap-2">
                Start Consultation
                <Star className="w-4 h-4" />
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-12 text-blue-200/60 text-sm">
        Professional • Private • Secure
      </div>
    </div>
  );
};
