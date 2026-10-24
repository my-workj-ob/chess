'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Trophy, Flame, Award, Edit3, Check } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  rating: number;
  stats: { wins: number; losses: number; draws: number } | null;
  onUpdateUsername: (newName: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  username,
  rating,
  stats,
  onUpdateUsername,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(username);

  if (!isOpen) return null;

  const wins = stats?.wins ?? 14;
  const losses = stats?.losses ?? 8;
  const draws = stats?.draws ?? 5;
  const total = wins + losses + draws;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 50;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedName.trim()) {
      onUpdateUsername(editedName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F1424] border border-[#20293E] rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white">Player Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#182034] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#182038] to-[#12182A] border border-[#263456]">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-violet-500/40 shrink-0 shadow-lg">
            <Image
              src="/images/avatar_zuhriddin.jpg"
              alt={username}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="bg-[#0C101C] border border-[#304068] text-xs text-white px-2 py-1 rounded-lg focus:outline-none focus:border-violet-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1.5 bg-[#5B4DF6] text-white rounded-lg hover:bg-violet-600 transition"
                >
                  <Check size={14} />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white truncate">{username}</h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-slate-400 hover:text-violet-300 transition"
                  title="Edit username"
                >
                  <Edit3 size={13} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-black text-amber-400">★ {rating}</span>
              <span className="text-[10px] text-slate-400">Rapid Rating</span>
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-[#141B30] border border-[#1E2844]">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Games</span>
            <span className="text-sm font-black text-white">{total}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#141B30] border border-[#1E2844]">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Wins</span>
            <span className="text-sm font-black text-emerald-400">{wins}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#141B30] border border-[#1E2844]">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Losses</span>
            <span className="text-sm font-black text-rose-400">{losses}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#141B30] border border-[#1E2844]">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Draws</span>
            <span className="text-sm font-black text-slate-300">{draws}</span>
          </div>
        </div>

        {/* Win Rate Progress Bar */}
        <div className="p-4 rounded-2xl bg-[#141B30] border border-[#1E2844] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400">Win Rate</span>
            <span className="font-black text-violet-400">{winRate}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#5B4DF6] to-[#8B5CF6]"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
            Achievements
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '🏆', title: 'Grand Strategist', desc: '10+ Rapid Wins' },
              { icon: '⚡', title: 'Speed Demon', desc: 'Played Blitz' },
              { icon: '🧩', title: 'Puzzle Solver', desc: 'Solved Tactics' },
            ].map((ach, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-[#141B30] border border-[#1E2844] text-center"
              >
                <span className="text-lg block mb-1">{ach.icon}</span>
                <span className="text-[11px] font-bold text-white block leading-tight">{ach.title}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">{ach.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
