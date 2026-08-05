'use client';

import React from 'react';
import { HelpCircle, Check, X } from 'lucide-react';

interface DrawOfferModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const DrawOfferModal: React.FC<DrawOfferModalProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center text-2xl mb-3">
          <HelpCircle size={28} />
        </div>

        <h2 className="text-lg font-bold text-slate-100 mb-1">Durrang taklif etildi</h2>
        <p className="text-xs text-slate-300 mb-6 font-medium leading-relaxed">
          Ushbu pozitsiya 3 marta takrorlandi. Durrangga rozimisiz?
        </p>

        <div className="space-y-2">
          <button
            onClick={onAccept}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 active:scale-95 transition"
          >
            <Check size={16} />
            <span>Ha, durrangga roziman</span>
          </button>

          <button
            onClick={onDecline}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-2xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 active:scale-95 transition"
          >
            <X size={16} />
            <span>Yo'q, o'yinni davom ettiramiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};
