'use client';

import React from 'react';
import { Trophy, RefreshCw, Eye } from 'lucide-react';

interface GameOverModalProps {
  winner: string;
  isStalemate: boolean;
  reason?: string;
  onRestart: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  isStalemate,
  reason,
  onRestart,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center text-3xl mb-3">
          <Trophy size={32} />
        </div>

        <h2 className="text-xl font-bold text-slate-100 mb-1">
          {isStalemate ? 'DURRANG' : 'G\'ALABA'}
        </h2>
        <p className="text-xs text-slate-400 mb-2">
          {isStalemate
            ? `${reason || 'Durang'}.`
            : `${winner} g\'alaba qozondi.`}
        </p>
        <p className="text-[10px] text-slate-500 mb-6">
          {isStalemate ? 'Hech kim yutolmadi.' : `${reason || 'Shoh va mat'}.`}
        </p>

        <div className="space-y-2">
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
          >
            <RefreshCw size={15} />
            <span>Yangi O'yin Boshlash</span>
          </button>

          <button
            onClick={onClose}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-2xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition"
          >
            <Eye size={15} />
            <span>Doskani Ko'rish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
