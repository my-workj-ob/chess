'use client';

import React from 'react';
import { RotateCcw, Lightbulb, RefreshCw, Sliders, LogOut, Flag, Bot, UserCheck, Share2 } from 'lucide-react';
import { GameMode } from './ModeTabs';

interface GameControlsProps {
  onUndo: () => void;
  onHint: () => void;
  onRestart: () => void;
  difficulty: 'easy' | 'medium' | 'hard';
  onChangeDifficulty: () => void;
  mode: GameMode;
  onResign?: () => void;
  botMode?: 'none' | 'both';
  onSwitchToBot?: () => void;
  roomCode?: string;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onUndo,
  onHint,
  onRestart,
  difficulty,
  onChangeDifficulty,
  mode,
  onResign,
  botMode = 'none',
  onSwitchToBot,
  roomCode,
}) => {
  const diffLabels = {
    easy: 'Oson',
    medium: "O'rta",
    hard: 'Qiyin',
  };

  const isOnline = mode === 'online';
  const canSwitchBot = (mode === 'ai' || mode === 'pass') && !isOnline;

  const handleShare = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}/join/${roomCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => alert('Xona havolasi nusxalandi!'))
        .catch(err => console.error('Could not copy text: ', err));
    } else {
      // Fallback for non-secure contexts
      alert(`Havolani nusxalang: ${url}`);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-1.5 mt-1.5 max-w-md mx-auto w-full">
      {/* Button 1: Undo or Resign */}
      {isOnline ? (
        <button
          onClick={onResign}
          className="flex flex-col items-center justify-center p-1.5 h-[50px] rounded-xl bg-[#111827] border border-slate-800/80 hover:bg-[#1f2937]/30 text-rose-400 hover:border-slate-700 active:scale-95 transition"
        >
          <Flag size={14} className="stroke-[2] mb-0.5 text-rose-500" />
          <span className="text-[9px] font-black text-slate-300 leading-none">Taslim</span>
        </button>
      ) : (
        <button
          onClick={onUndo}
          disabled={mode === 'puzzle' || botMode === 'both'}
          className="flex flex-col items-center justify-center p-1.5 h-[50px] rounded-xl bg-[#111827] border border-slate-800/80 hover:bg-[#1f2937]/30 text-slate-300 hover:border-slate-700 active:scale-95 disabled:opacity-40 transition"
        >
          <RotateCcw size={14} className="stroke-[2] mb-0.5 text-amber-500" />
          <span className="text-[9px] font-black text-slate-300 leading-none">Qaytarish</span>
        </button>
      )}

      {/* Button 2: Hint or Share */}
      {isOnline ? (
        <button
          onClick={handleShare}
          disabled={!roomCode}
          className="flex flex-col items-center justify-center p-1.5 h-[50px] rounded-xl bg-[#111827] border border-sky-500/40 hover:bg-[#1f2937]/30 text-sky-400 hover:border-sky-700 active:scale-95 disabled:opacity-40 transition"
        >
          <Share2 size={14} className="stroke-[2] mb-0.5 text-sky-500" />
          <span className="text-[9px] font-black text-slate-300 leading-none">Ulashish</span>
        </button>
      ) : (
        <button
          onClick={onHint}
          disabled={mode === 'puzzle' || botMode === 'both'}
          className="flex flex-col items-center justify-center p-1.5 h-[50px] rounded-xl bg-[#111827] border border-amber-500/40 hover:bg-[#1f2937]/30 active:scale-95 disabled:opacity-40 transition"
        >
          <Lightbulb size={14} className="stroke-[2] mb-0.5 text-amber-500" />
          <span className="text-[9px] font-black text-slate-300 leading-none">Maslahat</span>
        </button>
      )}

      {/* Button 3: Bot Switch (non-online only) or Exit/Restart */}
      {canSwitchBot ? (
        <button
          onClick={onSwitchToBot}
          className={`flex flex-col items-center justify-center p-1.5 h-[50px] rounded-xl border active:scale-95 transition ${
            botMode === 'both'
              ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
              : 'bg-[#111827] border-slate-800/80 text-slate-300 hover:bg-[#1f2937]/30 hover:border-slate-700'
          }`}
        >
          {botMode === 'both' ? (
            <>
              <UserCheck size={14} className="stroke-[2] mb-0.5 text-violet-400" />
              <span className="text-[9px] font-black text-violet-300 leading-none text-center">Inson</span>
            </>
          ) : (
            <>
              <Bot size={14} className="stroke-[2] mb-0.5 text-violet-400" />
              <span className="text-[9px] font-black text-slate-300 leading-none text-center">Bot</span>
            </>
          )}
        </button>
      ) : (
        <button
          onClick={onRestart}
          className="flex flex-col items-center justify-center p-1.5 h-[50px] rounded-xl bg-[#111827] border border-slate-800/80 hover:bg-[#1f2937]/30 text-slate-300 hover:border-slate-700 active:scale-95 transition"
        >
          {isOnline ? (
            <>
              <LogOut size={14} className="stroke-[2] mb-0.5 text-rose-500" />
              <span className="text-[9px] font-black text-slate-300 leading-none">Chiqish</span>
            </>
          ) : (
            <>
              <RefreshCw size={14} className="stroke-[2] mb-0.5 text-emerald-400" />
              <span className="text-[9px] font-black text-slate-300 leading-none">Qayta</span>
            </>
          )}
        </button>
      )}

      {/* Button 4: Difficulty (AI mode, bot off) / Restart (bot on) / Mode label */}
      {canSwitchBot && botMode !== 'both' && mode === 'ai' ? (
        <button
          onClick={onChangeDifficulty}
          className="flex flex-col items-center justify-center p-1.5 h-[50px] rounded-xl bg-[#111827] border border-slate-800/80 hover:bg-[#1f2937]/30 text-slate-300 hover:border-slate-700 active:scale-95 transition"
        >
          <Sliders size={14} className="stroke-[2] mb-0.5 text-indigo-400" />
          <span className="text-[9px] font-black text-slate-300 leading-none">{diffLabels[difficulty]}</span>
        </button>
      ) : canSwitchBot ? (
        <button
          onClick={onRestart}
          className="flex flex-col items-center justify-center p-1.5 h-[50px] rounded-xl bg-[#111827] border border-slate-800/80 hover:bg-[#1f2937]/30 text-slate-300 hover:border-slate-700 active:scale-95 transition"
        >
          <RefreshCw size={14} className="stroke-[2] mb-0.5 text-emerald-400" />
          <span className="text-[9px] font-black text-slate-300 leading-none">Qayta</span>
        </button>
      ) : (
        <div className="flex flex-col items-center justify-center p-1.5 h-[50px] rounded-xl bg-[#111827]/40 border border-slate-800/40 text-slate-500">
          <span className="text-[9px] font-black leading-none truncate max-w-[60px]">
            {mode === 'puzzle' ? 'Masala' : mode === 'online' ? 'Online' : 'P2P'}
          </span>
        </div>
      )}
    </div>
  );
};
