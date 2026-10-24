'use client';

import React from 'react';
import { Trophy, RefreshCw, Eye, Home } from 'lucide-react';

interface GameOverModalProps {
  winner: string;
  isStalemate?: boolean;
  isDraw?: boolean;
  reason?: string;
  onRestart: () => void;
  onClose?: () => void;
  onNewGame?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  isStalemate = false,
  isDraw = false,
  reason,
  onRestart,
  onClose,
  onNewGame,
}) => {
  const isDrawn = isStalemate || isDraw;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0F1424] border border-[#222E4D] rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10">
          <Trophy size={32} />
        </div>

        <div>
          <h2 className="text-xl font-black text-white tracking-wide">
            {isDrawn ? 'DRAW' : 'VICTORY'}
          </h2>
          <p className="text-sm font-bold text-slate-300 mt-1">
            {isDrawn ? (reason || 'Game drawn by rule') : `${winner} wins!`}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {reason || (isDrawn ? 'Stalemate' : 'Checkmate')}
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#5B4DF6] text-white font-black text-xs hover:bg-[#4E3FE4] shadow-md shadow-[#5B4DF6]/25 transition active:scale-98"
          >
            <RefreshCw size={15} />
            <span>Rematch</span>
          </button>

          {onNewGame && (
            <button
              type="button"
              onClick={onNewGame}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#141B30] text-slate-200 border border-[#20293E] hover:border-slate-600 font-bold text-xs transition active:scale-98"
            >
              <Home size={15} />
              <span>Back to Home</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl text-slate-400 hover:text-slate-200 text-xs transition"
            >
              <Eye size={14} />
              <span>Review Board</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
