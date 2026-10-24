'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface OnlineFriendsWidgetProps {
  onViewAll?: () => void;
  onSelectFriend?: (username: string) => void;
}

export const OnlineFriendsWidget: React.FC<OnlineFriendsWidgetProps> = ({
  onViewAll,
  onSelectFriend,
}) => {
  const friends = [
    {
      id: 'f1',
      name: 'Sardor_777',
      status: 'Online • Playing',
      statusColor: 'bg-emerald-400',
      textColor: 'text-emerald-400',
    },
    {
      id: 'f2',
      name: 'Ali_uzb',
      status: 'Online',
      statusColor: 'bg-emerald-400',
      textColor: 'text-slate-400',
    },
    {
      id: 'f3',
      name: 'dilshodchess',
      status: 'Online',
      statusColor: 'bg-emerald-400',
      textColor: 'text-slate-400',
    },
    {
      id: 'f4',
      name: 'Bekzod',
      status: 'Away • 12 min',
      statusColor: 'bg-amber-400',
      textColor: 'text-slate-400',
    },
    {
      id: 'f5',
      name: 'Umidbek',
      status: 'Offline',
      statusColor: 'bg-slate-600',
      textColor: 'text-slate-500',
    },
  ];

  return (
    <div className="rounded-3xl bg-[#0F1424] border border-[#1C253B] p-5 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-white">Online Friends</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition"
        >
          View all <ChevronRight size={13} />
        </button>
      </div>

      {/* Friends list */}
      <div className="divide-y divide-[#182033]">
        {friends.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFriend?.(f.name)}
            className="w-full flex items-center justify-between py-2 px-2 hover:bg-[#141B30] rounded-xl transition text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                  {f.name.charAt(0)}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-[#0F1424] ${f.statusColor}`}
                />
              </div>
              <div>
                <span className="text-xs font-bold text-white group-hover:text-violet-300 transition block">
                  {f.name}
                </span>
                <span className={`text-[10px] font-medium ${f.textColor}`}>
                  {f.status}
                </span>
              </div>
            </div>

            <ChevronRight
              size={13}
              className="text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
