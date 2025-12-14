import React, { useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onFileUpload, disabled }) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      // Reset input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="flex-1 flex gap-2 w-full max-w-lg">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/pdf,image/jpeg,image/png"
      />
      
      <button
        type="button"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        className="p-3 bg-white text-slate-500 border border-slate-300 rounded-full hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 transition-colors shadow-sm"
        title="Upload PDF or Image"
      >
        <Paperclip size={18} />
      </button>

      <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          placeholder="Type details or upload documents..."
          className="flex-1 px-4 py-3 rounded-full border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm disabled:opacity-50 disabled:bg-slate-100 text-sm"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
