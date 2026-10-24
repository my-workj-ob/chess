'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Gamepad2,
  Trophy,
  Puzzle,
  BookOpen,
  Users,
  MessageSquare,
  Crown,
  Settings,
} from 'lucide-react';

interface ChesslySidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenSettings?: () => void;
  onOpenPremium?: () => void;
}

export const ChesslySidebar: React.FC<ChesslySidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenPremium,
}) => {
  const pathname = usePathname();

  const isHomeActive = activeTab ? activeTab === 'home' : pathname === '/';
  const isPlayActive = activeTab
    ? activeTab === 'play'
    : pathname?.startsWith('/room') || pathname?.startsWith('/play');

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      href: '/',
      active: isHomeActive,
    },
    {
      id: 'play',
      label: 'Play',
      icon: Gamepad2,
      href: '/room/ai',
      active: isPlayActive,
    },
    {
      id: 'tournaments',
      label: 'Tournaments',
      icon: Trophy,
      active: activeTab === 'tournaments',
    },
    {
      id: 'puzzles',
      label: 'Puzzles',
      icon: Puzzle,
      active: activeTab === 'puzzles',
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: BookOpen,
      active: activeTab === 'learn',
    },
    {
      id: 'friends',
      label: 'Friends',
      icon: Users,
      active: activeTab === 'friends',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: 3,
      active: activeTab === 'messages',
    },
  ];

  return (
    <aside className="w-60 shrink-0 bg-[#0A0E17] border-r border-[#1B2234] flex flex-col justify-between p-4 h-screen sticky top-0 select-none z-30">
      {/* Top Logo and Nav Items */}
      <div className="flex flex-col space-y-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 px-2 py-1 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <svg
              className="w-6 h-6 text-white drop-shadow"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 22H5a1 1 0 0 1-1-1c0-2.5 1.5-4 4-5 0-1.5.5-3 1.5-4C10.5 10.5 11 9 10 7.5 9 6 10 4 12 3c1.5 0 2.5 1 3 2.5 1 0 2 .5 2.5 1.5.5 1 .5 2-.5 3 1 1 1.5 2.5 1 4 .5.5 1 1.5 1 2.5v4.5a1 1 0 0 1-1 1z" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tight text-white font-sans">
            Chessly
          </span>
        </Link>

        {/* Navigation List */}
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            const content = (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  if (onSelectTab) onSelectTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#5B4DF6] text-white shadow-lg shadow-[#5B4DF6]/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#131928]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    size={20}
                    className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-violet-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );

            if (item.href && !onSelectTab) {
              return (
                <Link key={item.id} href={item.href} className="w-full">
                  {content}
                </Link>
              );
            }
            return content;
          })}
        </nav>
      </div>

      {/* Bottom Area: Premium Promotion Card & Settings */}
      <div className="flex flex-col space-y-3 pt-4 border-t border-[#182033]">
        {/* Premium Upgrade Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#151C2C] to-[#0F1422] border border-[#212B42] p-4 text-left shadow-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown size={14} />
            </div>
            <span className="text-xs font-black text-amber-400 tracking-wide uppercase">
              Premium
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug mb-3">
            Unlock more features, get better games.
          </p>
          <button
            type="button"
            onClick={onOpenPremium}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#6355F6] to-[#7B68EE] hover:from-[#5446E8] hover:to-[#6C57E0] shadow-md shadow-violet-600/30 active:scale-[0.98] transition-all"
          >
            Go Premium
          </button>
        </div>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-100 hover:bg-[#131928] transition"
        >
          <Settings size={18} className="text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
