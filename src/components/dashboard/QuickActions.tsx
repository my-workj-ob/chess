'use client';

import React from 'react';
import { Zap, Crosshair, Trophy, BookOpen, ArrowRight } from 'lucide-react';

interface QuickActionsProps {
  onQuickPlay: () => void;
  onPlayOnline: () => void;
  onTournaments: () => void;
  onPractice: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onQuickPlay,
  onPlayOnline,
  onTournaments,
  onPractice,
}) => {
  const actions = [
    {
      id: 'quick_play',
      title: 'Quick Play',
      subtitle: '3 min • Blitz',
      icon: Zap,
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      action: onQuickPlay,
    },
    {
      id: 'play_online',
      title: 'Play Online',
      subtitle: 'Find your match',
      icon: Crosshair,
      iconBg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
      action: onPlayOnline,
    },
    {
      id: 'tournaments',
      title: 'Tournaments',
      subtitle: 'Compete & win',
      icon: Trophy,
      iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      action: onTournaments,
    },
    {
      id: 'practice',
      title: 'Practice',
      subtitle: 'Puzzles & lessons',
      icon: BookOpen,
      iconBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      action: onPractice,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            type="button"
            onClick={act.action}
            className="group relative flex flex-col justify-between p-4 rounded-2xl bg-[#0F1424] hover:bg-[#141B30] border border-[#1C253B] hover:border-[#2C3B5E] text-left transition-all duration-150 shadow-lg active:scale-[0.98]"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center ${act.iconBg}`}
              >
                <Icon size={20} />
              </div>
              <ArrowRight
                size={16}
                className="text-slate-500 group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all"
              />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{act.title}</h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                {act.subtitle}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
