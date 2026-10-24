'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface TopPlayersWidgetProps {
  onViewAll?: () => void;
  onSelectPlayer?: (username: string) => void;
}

export const TopPlayersWidget: React.FC<TopPlayersWidgetProps> = ({
  onViewAll,
  onSelectPlayer,
}) => {
  const topPlayers = [
    { rank: 1, name: 'MagnusCarlsen', title: 'GM', flag: '🇳🇴', rating: 2835 },
    { rank: 2, name: 'hikaru', title: 'GM', flag: '🇺🇸', rating: 2804 },
    { rank: 3, name: 'GukeshD', title: 'GM', flag: '🇮🇳', rating: 2787 },
    { rank: 4, name: 'FabianoCaruana', title: 'GM', flag: '🇺🇸', rating: 2764 },
    { rank: 5, name: 'AlirezaFirouzja', title: 'GM', flag: '🇫🇷', rating: 2748 },
  ];

  return (
    <div className="rounded-3xl bg-[#0F1424] border border-[#1C253B] p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-black text-white">Top Players</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition"
        >
          View all <ChevronRight size={13} />
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-[#182033]">
        {topPlayers.map((p) => (
          <button
            key={p.rank}
            type="button"
            onClick={() => onSelectPlayer?.(p.name)}
            className="w-full flex items-center justify-between py-2 px-2 hover:bg-[#141B30] rounded-xl transition group text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-500 w-3 text-center">
                {p.rank}
              </span>
              <div className="w-6 h-6 rounded-full bg-violet-900/40 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-300">
                {p.name.charAt(0)}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white group-hover:text-violet-300 transition">
                  {p.name}
                </span>
                <span className="text-[9px] font-black px-1 py-0.2 rounded bg-rose-600/20 text-rose-400 border border-rose-500/30">
                  {p.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-200">
                {p.rating}
              </span>
              <ChevronRight
                size={13}
                className="text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
