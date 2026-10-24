'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Bell, ChevronDown, Trophy, User, LogOut, Check } from 'lucide-react';

interface ChesslyHeaderProps {
  username: string;
  rating: number;
  avatarUrl?: string;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  onSearch?: (query: string) => void;
}

export const ChesslyHeader: React.FC<ChesslyHeaderProps> = ({
  username,
  rating,
  avatarUrl = '/images/avatar_zuhriddin.jpg',
  onOpenProfile,
  onOpenNotifications,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <header className="h-16 px-6 border-b border-[#1A2234] bg-[#0A0E17]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-6">
      {/* Search Input Box */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-xl relative"
      >
        <div className="relative flex items-center">
          <Search
            size={16}
            className="absolute left-4 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players, games, tournaments..."
            className="w-full bg-[#121827] border border-[#20293E] hover:border-[#2C3854] focus:border-[#5B4DF6] focus:outline-none focus:ring-1 focus:ring-[#5B4DF6] text-xs text-slate-100 placeholder:text-slate-500 rounded-full pl-10 pr-4 py-2.5 transition"
          />
        </div>
      </form>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-full bg-[#121827] border border-[#20293E] text-slate-300 hover:text-white hover:border-[#2E3B5A] transition active:scale-95"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-[#0A0E17]" />
        </button>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (onOpenProfile) onOpenProfile();
              else setShowUserMenu(!showUserMenu);
            }}
            className="flex items-center gap-3 pl-1.5 pr-3 py-1 rounded-full bg-[#121827] border border-[#20293E] hover:border-[#2E3B5A] transition active:scale-98"
          >
            {/* Avatar */}
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-violet-500/30">
              <Image
                src={avatarUrl}
                alt={username}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>

            {/* User Info */}
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-100 leading-tight">
                {username}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 leading-none">
                {rating}
              </span>
            </div>

            {/* Chevron */}
            <ChevronDown size={14} className="text-slate-400 ml-1" />
          </button>
        </div>
      </div>
    </header>
  );
};
