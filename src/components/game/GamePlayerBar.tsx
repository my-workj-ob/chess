'use client';

import React from 'react';
import Image from 'next/image';
import { Clock, Wifi } from 'lucide-react';

interface GamePlayerBarProps {
  name: string;
  rating: number;
  avatarUrl?: string;
  flag?: string;
  clockTime: string; // e.g. "09:34" or "08:12"
  isCurrentTurn: boolean;
  isClockActive?: boolean;
  statusBadge?: string; // e.g. "Analyzing... 📶"
  isBottomPlayer?: boolean;
  capturedPieces?: string[];
}

export const GamePlayerBar: React.FC<GamePlayerBarProps> = ({
  name,
  rating,
  avatarUrl = '/images/avatar_zuhriddin.jpg',
  flag = '🇺🇿',
  clockTime,
  isCurrentTurn,
  isClockActive = false,
  statusBadge,
  isBottomPlayer = false,
}) => {
  return (
    <div
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all ${
        isCurrentTurn
          ? 'bg-[#151C2E] border border-violet-500/40 shadow-lg shadow-violet-500/10'
          : 'bg-[#0E1322] border border-[#1C253B]'
      }`}
    >
      {/* Left: Avatar, Name, Rating, Status */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-violet-500/30 shrink-0">
          <Image
            src={avatarUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="36px"
          />
          {/* Online green dot */}
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#0E1322]" />
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white">{name}</span>
            {flag && <span className="text-xs">{flag}</span>}
          </div>
          <span className="text-[10px] font-semibold text-slate-400">
            {rating}
          </span>
        </div>

        {statusBadge && (
          <div className="hidden sm:flex items-center gap-1 ml-2 px-2.5 py-0.5 rounded-full bg-[#1A2238] border border-[#263354] text-[10px] font-bold text-slate-300">
            <span>{statusBadge}</span>
          </div>
        )}
      </div>

      {/* Right: Clock */}
      <div
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-sm font-black transition-all ${
          isBottomPlayer && isCurrentTurn
            ? 'bg-[#5B4DF6] text-white shadow-md shadow-[#5B4DF6]/30'
            : isCurrentTurn
              ? 'bg-[#222B42] text-amber-300 border border-amber-400/30'
              : 'bg-[#141A2B] text-slate-300 border border-[#20293E]'
        }`}
      >
        <Clock size={14} className={isCurrentTurn ? 'animate-pulse' : 'text-slate-400'} />
        <span>{clockTime}</span>
      </div>
    </div>
  );
};
