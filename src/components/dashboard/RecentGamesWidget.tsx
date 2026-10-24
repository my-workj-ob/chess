'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface RecentGameItem {
  id: string;
  opponentName: string;
  opponentRating: number;
  result: string; // "1 - 0", "0 - 1", "1/2 - 1/2"
  time: string;
  avatarColor: string;
}

interface RecentGamesWidgetProps {
  onViewAll?: () => void;
  onSelectGame?: (gameId: string) => void;
}

export const RecentGamesWidget: React.FC<RecentGamesWidgetProps> = ({
  onViewAll,
  onSelectGame,
}) => {
  const games: RecentGameItem[] = [
    {
      id: 'g1',
      opponentName: 'dark_knight',
      opponentRating: 1187,
      result: '1 - 0',
      time: 'Today, 14:32',
      avatarColor: 'from-amber-600 to-orange-700',
    },
    {
      id: 'g2',
      opponentName: 'ChessMaster99',
      opponentRating: 1245,
      result: '0 - 1',
      time: 'Today, 13:18',
      avatarColor: 'from-blue-600 to-indigo-700',
    },
    {
      id: 'g3',
      opponentName: 'uzbek_king',
      opponentRating: 1120,
      result: '1/2 - 1/2',
      time: 'Today, 11:45',
      avatarColor: 'from-emerald-600 to-teal-700',
    },
    {
      id: 'g4',
      opponentName: 'tactics_guru',
      opponentRating: 1302,
      result: '0 - 1',
      time: 'Today, 10:22',
      avatarColor: 'from-purple-600 to-pink-700',
    },
    {
      id: 'g5',
      opponentName: 'johndoe',
      opponentRating: 1168,
      result: '1 - 0',
      time: 'Yesterday',
      avatarColor: 'from-slate-600 to-slate-800',
    },
  ];

  return (
    <div className="rounded-3xl bg-[#0F1424] border border-[#1C253B] p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-black text-white">Recent Games</h2>
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
        {games.map((g) => {
          const isWin = g.result === '1 - 0';
          const isDraw = g.result === '1/2 - 1/2' || g.result === '1 - 1';
          const resultBadgeColor = isWin
            ? 'text-emerald-400'
            : isDraw
              ? 'text-slate-300'
              : 'text-rose-400';

          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelectGame?.(g.id)}
              className="w-full flex items-center justify-between py-2.5 px-2 hover:bg-[#141B30] rounded-xl transition group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-tr ${g.avatarColor} flex items-center justify-center text-white text-[11px] font-bold border border-white/10`}
                >
                  {g.opponentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-violet-300 transition">
                    {g.opponentName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {g.opponentRating}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-xs font-black ${resultBadgeColor}`}>
                    {g.result}
                  </div>
                  <div className="text-[9px] text-slate-500 font-medium">
                    {g.time}
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
