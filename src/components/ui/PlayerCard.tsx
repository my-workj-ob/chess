'use client';

import React from 'react';
import { PieceColor } from '@/lib/engine/types';
import { Sliders, User, Info } from 'lucide-react';

interface PlayerCardProps {
  name: string;
  avatar: string;
  color: PieceColor;
  isCurrentTurn: boolean;
  isCheck: boolean;
  capturedPieces: string[];
  activeChat?: string | null;
  rating?: number;
  showSettings?: boolean;
  showProfile?: boolean;
  gameResultStatus?: 'winner' | 'loser' | 'draw' | null;
  gameResultReason?: string | null;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  avatar,
  color,
  isCurrentTurn,
  isCheck,
  capturedPieces,
  activeChat,
  rating = 1200,
  showSettings = false,
  showProfile = false,
  gameResultStatus = null,
  gameResultReason = null,
}) => {
  const isBot = avatar === '🤖';

  // Determine card styles (always standard, no red/green alerts)
  const cardStyle = isCurrentTurn
    ? 'bg-[#111827] border-amber-500/50 shadow-md shadow-amber-500/5'
    : 'bg-[#111827]/70 border-slate-900 opacity-90';

  return (
    <div
      className={`relative flex items-center justify-between p-3.5 rounded-[24px] border transition-all duration-200 ${cardStyle}`}
    >
      {/* Floating Chat Bubble */}
      {activeChat && (
        <div className="absolute -top-10 left-12 z-30 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-2xl shadow-xl border border-indigo-400 animate-bounce max-w-[200px] truncate">
          <div className="absolute bottom-[-4px] left-4 rotate-45 w-2 h-2 bg-indigo-600 border-r border-b border-indigo-400" />
          {activeChat}
        </div>
      )}

      <div className="flex items-center space-x-3.5">
        {/* Avatar Container */}
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl border shadow-inner ${
            isBot
              ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
              : 'bg-slate-950 border-slate-800/80 text-violet-500'
          }`}
        >
          {avatar === '👤' ? '♟️' : avatar}
        </div>

        {/* Player Name and Rating */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-slate-100">{name}</span>
            {isBot ? (
              <Info size={11} className="text-slate-500 cursor-pointer hover:text-slate-300 transition" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            )}
          </div>
          <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
            ELO: {rating}
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        {isCheck && isCurrentTurn && !gameResultStatus && (
          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg animate-pulse">
            SHOH!
          </span>
        )}

        {showSettings && (
          <button className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition">
            <Sliders size={13} className="stroke-[2.5]" />
          </button>
        )}

        {showProfile && (
          <button className="flex items-center px-3 py-1.5 bg-slate-950/40 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-[10px] font-extrabold rounded-xl transition">
            <User size={11} className="mr-1 text-slate-400" />
            Profil
          </button>
        )}

        {isCurrentTurn && !showSettings && !showProfile && !gameResultStatus && (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        )}
      </div>
    </div>
  );
};
