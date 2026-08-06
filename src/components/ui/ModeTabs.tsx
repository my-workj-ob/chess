'use client';

import React from 'react';
import { Bot, Globe, Users, Puzzle, ArrowRight } from 'lucide-react';

export type GameMode = 'ai' | 'online' | 'pass' | 'puzzle';

interface ModeTabsProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
}

export const ModeTabs: React.FC<ModeTabsProps> = ({ currentMode, onSelectMode }) => {
  const tabs = [
    {
      id: 'ai' as GameMode,
      label: 'Bot AI',
      desc: 'AI ga qarshi o\'ynang',
      icon: <Bot size={18} />,
    },
    {
      id: 'online' as GameMode,
      label: 'Online',
      desc: '1v1',
      icon: <Globe size={18} />,
    },
    {
      id: 'pass' as GameMode,
      label: '2 Kishi',
      desc: 'Lokal PvP',
      icon: <Users size={18} />,
    },
    {
      id: 'puzzle' as GameMode,
      label: 'Masalalar',
      desc: 'Taktikalar',
      icon: <Puzzle size={18} />,
    },
  ];

  return (
    <div className="px-4 py-3 bg-[#0B0F19]">
      <div className="grid grid-cols-4 gap-2.5 max-w-xl mx-auto">
        {tabs.map((tab) => {
          const isActive = currentMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectMode(tab.id)}
              className={`relative flex flex-col justify-between items-start p-3 rounded-2xl h-[92px] text-left transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-violet-600 to-indigo-700 border border-violet-500/30 text-white shadow-lg shadow-violet-600/25 scale-[1.02] z-10'
                  : 'bg-[#111827] border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-[#1f2937]/50 transition'
              }`}
            >
              {/* Icon Container */}
              <div className={`p-1 rounded-lg ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {tab.icon}
              </div>

              {/* Title & Description */}
              <div className="mt-2.5">
                <div className={`text-xs font-black tracking-wide ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {tab.label}
                </div>
                {isActive ? (
                  <div className="text-[9px] text-violet-200 font-medium leading-tight mt-0.5 max-w-[65px] truncate">
                    {tab.desc}
                  </div>
                ) : (
                  <div className="text-[9px] text-slate-500 font-medium leading-tight mt-0.5">
                    {tab.id === 'online' ? '1v1' : ''}
                  </div>
                )}
              </div>

              {/* Active Arrow Indicator */}
              {isActive && (
                <div className="absolute bottom-2.5 right-2.5 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <ArrowRight size={11} className="stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
