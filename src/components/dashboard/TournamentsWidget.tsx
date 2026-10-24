'use client';

import React from 'react';
import { Trophy, Crown, ChevronRight } from 'lucide-react';

interface TournamentsWidgetProps {
  onViewAll?: () => void;
  onJoinTournament?: (tournamentId: string) => void;
}

export const TournamentsWidget: React.FC<TournamentsWidgetProps> = ({
  onViewAll,
  onJoinTournament,
}) => {
  return (
    <div className="rounded-3xl bg-[#0F1424] border border-[#1C253B] p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-white">Tournaments</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition"
        >
          View all <ChevronRight size={13} />
        </button>
      </div>

      {/* Featured Tournament Card: Weekly Blitz */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-[#161D32] to-[#111728] border border-[#232F4E] space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Crown size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black text-white leading-tight">
                Weekly Blitz Championship
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Blitz • 3 min • Swiss</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => onJoinTournament?.('weekly-blitz')}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#5B4DF6] hover:bg-[#4E3FE4] shadow-md shadow-[#5B4DF6]/20 transition active:scale-95"
          >
            Join
          </button>
          <span className="text-[10px] font-medium text-slate-400">Ends in 2 days</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1E2844] text-center">
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Players</span>
            <span className="text-xs font-black text-slate-200">1,248</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Prizes</span>
            <span className="text-xs font-black text-amber-400">$500</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Prize pool</span>
            <span className="text-xs font-black text-emerald-400">$500</span>
          </div>
        </div>
      </div>

      {/* Secondary Tournament: Daily Arena */}
      <div className="p-3.5 rounded-2xl bg-[#141B30] border border-[#1E2844] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Trophy size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Daily Arena</h4>
            <p className="text-[10px] text-slate-400">Rapid • 10 min • Arena</p>
            <p className="text-[9px] text-violet-400 mt-0.5">Starts in 4 hours</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onJoinTournament?.('daily-arena')}
          className="px-3 py-1 rounded-lg text-xs font-bold text-slate-200 bg-[#1E2844] hover:bg-[#28365C] transition"
        >
          Join
        </button>
      </div>
    </div>
  );
};
