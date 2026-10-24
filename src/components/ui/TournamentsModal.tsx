'use client';

import React, { useState } from 'react';
import { X, Trophy, Crown, Users, Clock, Check } from 'lucide-react';

interface TournamentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (tournamentId: string) => void;
}

export const TournamentsModal: React.FC<TournamentsModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const tournaments = [
    {
      id: 'weekly-blitz',
      title: 'Weekly Blitz Championship',
      format: 'Blitz • 3 min • Swiss 7 Rounds',
      status: 'In Progress (Ends in 2 days)',
      players: 1248,
      prizes: '$500',
      icon: Crown,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'daily-arena',
      title: 'Daily Arena Challenge',
      format: 'Rapid • 10 min • Arena',
      status: 'Starts in 4 hours',
      players: 480,
      prizes: '$200',
      icon: Trophy,
      iconColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    },
    {
      id: 'bullet-brawl',
      title: 'Friday Night Bullet Brawl',
      format: 'Bullet • 1 min • Arena',
      status: 'Registration Open',
      players: 890,
      prizes: '$350',
      icon: Users,
      iconColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    },
  ];

  const handleToggleJoin = (id: string) => {
    const isNowJoined = !joined[id];
    setJoined({ ...joined, [id]: isNowJoined });
    if (isNowJoined) {
      onRegister(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0F1424] border border-[#20293E] rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Trophy className="text-amber-400" size={18} />
            Tournaments
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#182034] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tournaments List */}
        <div className="space-y-3">
          {tournaments.map((t) => {
            const Icon = t.icon;
            const isUserJoined = joined[t.id];

            return (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-[#141B30] border border-[#1E2844] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center ${t.iconColor}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">{t.title}</h3>
                      <p className="text-[10px] text-slate-400">{t.format}</p>
                      <span className="text-[9px] font-bold text-violet-400 block mt-0.5">
                        {t.status}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleJoin(t.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isUserJoined
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#5B4DF6] text-white hover:bg-[#4D3FE0] shadow-md shadow-[#5B4DF6]/20'
                    }`}
                  >
                    {isUserJoined ? (
                      <>
                        <Check size={13} />
                        Joined
                      </>
                    ) : (
                      'Register'
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1C253B] text-[10px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-slate-500" />
                    <span>{t.players} Registered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy size={12} className="text-amber-500" />
                    <span>Prize Pool: <strong className="text-white">{t.prizes}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
