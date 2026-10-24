'use client';

import React, { useState } from 'react';
import { X, Zap, Target, Shield, Clock, Loader2 } from 'lucide-react';
import { PieceIcon } from '@/components/board/PieceIcon';

interface MatchmakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (color: 'w' | 'b' | 'random', timeControl: string, rated: boolean, vsBot: boolean) => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
}) => {
  const [selectedTimeControl, setSelectedTimeControl] = useState('3 min');
  const [selectedColor, setSelectedColor] = useState<'w' | 'b' | 'random'>('random');
  const [isRated, setIsRated] = useState(true);
  const [opponentType, setOpponentType] = useState<'online' | 'bot'>('online');
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const timeControls = [
    { id: '1 min', label: '1 min', category: 'Bullet', icon: '⚡' },
    { id: '3 min', label: '3 min', category: 'Blitz', icon: '🔥' },
    { id: '5 min', label: '5 min', category: 'Blitz', icon: '🔥' },
    { id: '10 min', label: '10 min', category: 'Rapid', icon: '⏱' },
    { id: '15 min', label: '15 min', category: 'Rapid', icon: '⏱' },
    { id: '30 min', label: '30 min', category: 'Classical', icon: '♟' },
  ];

  const handleStart = () => {
    if (opponentType === 'online') {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        onStartGame(selectedColor, selectedTimeControl, isRated, false);
      }, 1200);
    } else {
      onStartGame(selectedColor, selectedTimeControl, isRated, true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F1424] border border-[#20293E] rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Zap className="text-violet-400" size={18} />
            Play Chess
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#182034] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Opponent Selection: Online vs Bot */}
        <div className="grid grid-cols-2 gap-2 bg-[#141B30] p-1.5 rounded-2xl border border-[#1E2844]">
          <button
            type="button"
            onClick={() => setOpponentType('online')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              opponentType === 'online'
                ? 'bg-[#5B4DF6] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target size={14} />
            Find Opponent
          </button>
          <button
            type="button"
            onClick={() => setOpponentType('bot')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              opponentType === 'bot'
                ? 'bg-[#5B4DF6] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={14} />
            Play vs Computer
          </button>
        </div>

        {/* Time Control Grid */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
            Time Control
          </label>
          <div className="grid grid-cols-3 gap-2">
            {timeControls.map((tc) => {
              const active = selectedTimeControl === tc.id;
              return (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setSelectedTimeControl(tc.id)}
                  className={`p-2.5 rounded-xl border text-center transition active:scale-95 ${
                    active
                      ? 'bg-[#5B4DF6]/20 border-[#5B4DF6] text-white shadow-md shadow-[#5B4DF6]/15'
                      : 'bg-[#141B30] border-[#1E2844] text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="text-sm block">{tc.icon}</span>
                  <span className="text-xs font-black block mt-1">{tc.label}</span>
                  <span className="text-[9px] text-slate-500 font-bold block">{tc.category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Choice */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
            Color Preference
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'w' as const, label: 'White', icon: 'k', color: 'w' as const },
              { id: 'random' as const, label: 'Random', icon: 'k', color: 'split' as const },
              { id: 'b' as const, label: 'Black', icon: 'k', color: 'b' as const },
            ].map((col) => {
              const active = selectedColor === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setSelectedColor(col.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition active:scale-95 ${
                    active
                      ? 'bg-[#5B4DF6]/20 border-[#5B4DF6] text-white'
                      : 'bg-[#141B30] border-[#1E2844] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center mb-1">
                    {col.color === 'w' ? (
                      <PieceIcon type="k" color="w" className="w-5 h-5" />
                    ) : col.color === 'b' ? (
                      <PieceIcon type="k" color="b" className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-black text-violet-400">½</span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold">{col.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rated Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#141B30] border border-[#1E2844]">
          <div>
            <span className="text-xs font-black text-white block">Rated Game</span>
            <span className="text-[10px] text-slate-400">Affects your ELO rating</span>
          </div>
          <button
            type="button"
            onClick={() => setIsRated(!isRated)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              isRated ? 'bg-[#5B4DF6]' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isRated ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleStart}
          disabled={isSearching}
          className="w-full py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#6355F6] to-[#7B68EE] hover:from-[#5446E8] hover:to-[#6C57E0] shadow-lg shadow-[#6355F6]/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
        >
          {isSearching ? (
            <>
              <Loader2 size={16} className="animate-spin text-white" />
              <span>Matching Opponent...</span>
            </>
          ) : (
            <span>Start Match</span>
          )}
        </button>
      </div>
    </div>
  );
};
