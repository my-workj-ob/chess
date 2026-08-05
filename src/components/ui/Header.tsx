'use client';

import React from 'react';
import { Bell, Volume2, VolumeX, User } from 'lucide-react';

interface HeaderProps {
  username: string | null;
  userRating?: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onChangeUser: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  username,
  userRating = 1200,
  soundEnabled,
  onToggleSound,
  onChangeUser,
}) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#0B0F19] sticky top-0 z-40">
      {/* Brand Logo */}
      <div className="flex items-center space-x-2">
        <span className="text-2xl text-violet-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]">♟️</span>
        <h1 className="text-lg font-extrabold tracking-wider text-slate-100 font-sans">
          SHOH<span className="text-amber-500">MOT</span>
        </h1>
      </div>

      {/* User Profile / ELO Pill */}
      {username && (
        <button
          onClick={onChangeUser}
          className="flex items-center bg-[#131B2E] border border-slate-800 rounded-2xl pl-3 pr-1 py-1 hover:border-slate-700 transition"
          title="Taxallusi almashtirish"
        >
          <div className="flex items-center space-x-1.5 mr-3">
            <User size={13} className="text-indigo-400" />
            <span className="text-xs font-bold text-slate-200 max-w-[70px] truncate">{username}</span>
          </div>
          
          {/* ELO Rating Badge */}
          <div className="flex flex-col items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl px-2 py-0.5 min-w-[36px]">
            <span className="text-[9px] leading-none">★</span>
            <span className="text-[10px] font-black leading-none mt-0.5">{userRating}</span>
          </div>
        </button>
      )}

      {/* Right Controls */}
      <div className="flex items-center space-x-2">
        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="p-2 rounded-2xl bg-[#131B2E] border border-slate-800 text-slate-400 hover:text-white transition"
          title="Ovoz"
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-rose-400" />}
        </button>

        {/* Notification Bell */}
        <button
          className="p-2 rounded-2xl bg-[#131B2E] border border-slate-800 text-slate-400 hover:text-white transition relative"
          title="Bildirishnomalar"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        </button>
      </div>
    </header>
  );
};
