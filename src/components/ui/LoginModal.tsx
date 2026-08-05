'use client';

import React, { useState } from 'react';
import { User, Sparkles } from 'lucide-react';

interface LoginModalProps {
  onLogin: (username: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length < 3) {
      setError('Taxallus kamida 3 ta belgidan iborat bo\'lishi kerak!');
      return;
    }
    onLogin(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center text-2xl mb-3">
          <User size={28} />
        </div>

        <h2 className="text-lg font-bold text-slate-100 mb-1">Xush kelibsiz!</h2>
        <p className="text-xs text-slate-400 mb-5">
          O'yinga kirish uchun unikal nickname (taxallus) kiriting:
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Masalan: Baxtiyor"
              maxLength={15}
              autoFocus
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-semibold text-center text-slate-100 placeholder-slate-600 focus:border-amber-500 focus:outline-none transition"
            />
            {error && <p className="text-[11px] text-red-400 mt-1 font-semibold">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 active:scale-95 transition"
          >
            <Sparkles size={16} />
            <span>O'yinga Kirish</span>
          </button>
        </form>
      </div>
    </div>
  );
};
