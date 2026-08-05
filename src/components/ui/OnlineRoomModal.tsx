'use client';

import React, { useState } from 'react';
import { Globe, Copy, Check, X } from 'lucide-react';

interface OnlineRoomModalProps {
  currentRoomCode: string | null;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onClose: () => void;
}

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({
  currentRoomCode,
  onCreateRoom,
  onJoinRoom,
  onClose,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (currentRoomCode) {
      navigator.clipboard.writeText(currentRoomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-xs w-full relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-3">
          <Globe size={18} />
          <span className="text-sm">Online Realtime Room</span>
        </div>

        {currentRoomCode ? (
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center mb-4">
            <span className="text-xs text-slate-400 block mb-1">Xona kodi:</span>
            <div className="text-2xl font-mono font-extrabold text-amber-400 tracking-widest mb-3">
              {currentRoomCode}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center space-x-1.5 w-full py-2 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-semibold hover:bg-indigo-600/50 transition"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Nusxalandi!' : 'Kodni nusxalash'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={onCreateRoom}
              className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-2xl hover:bg-amber-400 transition"
            >
              Yangi Xona Yaratish
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase">YOKI</span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Xona kodini kiriting..."
                maxLength={6}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-center text-slate-100 uppercase focus:border-amber-500 focus:outline-none"
              />
              <button
                onClick={() => inputCode.length === 6 && onJoinRoom(inputCode)}
                disabled={inputCode.length !== 6}
                className="w-full py-2.5 bg-slate-800 text-slate-200 font-semibold text-xs rounded-2xl disabled:opacity-40 hover:bg-slate-700 transition"
              >
                Xonaga Ulanish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
