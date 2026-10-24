'use client';

import React from 'react';
import Image from 'next/image';
import {
  Zap,
  Flag,
  Handshake,
  BarChart2,
  AlertTriangle,
} from 'lucide-react';
import { PieceType } from '@/lib/engine/types';
import { PieceIcon } from '@/components/board/PieceIcon';

interface GameSidePanelProps {
  timeControl?: string;
  whitePlayerName: string;
  whitePlayerRating: number;
  whitePlayerAvatar?: string;
  whitePlayerFlag?: string;
  blackPlayerName: string;
  blackPlayerRating: number;
  blackPlayerAvatar?: string;
  blackPlayerFlag?: string;
  capturedWhite: PieceType[]; // white pieces captured
  capturedBlack: PieceType[]; // black pieces captured
  onResign: () => void;
  onOfferDraw: () => void;
  onAnalysis: () => void;
  onReport: () => void;
}

export const GameSidePanel: React.FC<GameSidePanelProps> = ({
  timeControl = 'Rapid • 10 min',
  whitePlayerName,
  whitePlayerRating,
  whitePlayerAvatar = '/images/avatar_zuhriddin.jpg',
  whitePlayerFlag = '🇺🇿',
  blackPlayerName,
  blackPlayerRating,
  blackPlayerAvatar = '/images/avatar_opponent.jpg',
  blackPlayerFlag = '🇺🇿',
  capturedWhite,
  capturedBlack,
  onResign,
  onOfferDraw,
  onAnalysis,
  onReport,
}) => {
  return (
    <div className="flex flex-col space-y-4 h-full select-none">
      {/* Game Details */}
      <div className="p-4 rounded-3xl bg-[#0F1424] border border-[#1C253B] shadow-lg">
        <h3 className="text-xs font-black text-white mb-2">Game Details</h3>
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#141B30] border border-[#202A44]">
          <div className="w-8 h-8 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Zap size={18} />
          </div>
          <div>
            <span className="text-xs font-black text-white block">Rapid</span>
            <span className="text-[10px] text-slate-400 font-medium">10 min</span>
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="p-4 rounded-3xl bg-[#0F1424] border border-[#1C253B] shadow-lg space-y-2">
        <h3 className="text-xs font-black text-white mb-1">Players</h3>
        
        {/* White player */}
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#141B30] transition">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-slate-700">
            <Image src={whitePlayerAvatar} alt={whitePlayerName} fill className="object-cover" sizes="28px" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <span>{whitePlayerName}</span>
            <span>{whitePlayerFlag}</span>
            <span className="text-[10px] text-slate-400 ml-1">({whitePlayerRating})</span>
          </div>
        </div>

        {/* Black player */}
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#141B30] transition">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-slate-700">
            <Image src={blackPlayerAvatar} alt={blackPlayerName} fill className="object-cover" sizes="28px" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <span>{blackPlayerName}</span>
            <span>{blackPlayerFlag}</span>
            <span className="text-[10px] text-slate-400 ml-1">({blackPlayerRating})</span>
          </div>
        </div>
      </div>

      {/* Captured Pieces */}
      <div className="p-4 rounded-3xl bg-[#0F1424] border border-[#1C253B] shadow-lg space-y-2.5">
        <h3 className="text-xs font-black text-white">Captured Pieces</h3>

        {/* White pieces captured */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-300 w-12 px-2 py-0.5 rounded-lg bg-[#182034] text-center border border-[#24304D]">
            White
          </span>
          <div className="flex items-center gap-1 flex-wrap min-h-[24px]">
            {capturedWhite.length === 0 ? (
              <span className="text-[10px] text-slate-600 font-medium italic">None</span>
            ) : (
              capturedWhite.map((type, idx) => (
                <div key={idx} className="w-5 h-5 flex items-center justify-center">
                  <PieceIcon type={type} color="w" className="w-4 h-4" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Black pieces captured */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-300 w-12 px-2 py-0.5 rounded-lg bg-[#182034] text-center border border-[#24304D]">
            Black
          </span>
          <div className="flex items-center gap-1 flex-wrap min-h-[24px]">
            {capturedBlack.length === 0 ? (
              <span className="text-[10px] text-slate-600 font-medium italic">None</span>
            ) : (
              capturedBlack.map((type, idx) => (
                <div key={idx} className="w-5 h-5 flex items-center justify-center">
                  <PieceIcon type={type} color="b" className="w-4 h-4" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 rounded-3xl bg-[#0F1424] border border-[#1C253B] shadow-lg space-y-2">
        <h3 className="text-xs font-black text-white mb-2">Quick Actions</h3>

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onResign}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#141B30] hover:bg-[#1E2744] hover:border-rose-500/30 border border-[#202A44] text-xs font-bold text-rose-400 transition active:scale-98"
          >
            <Flag size={15} />
            <span>Resign</span>
          </button>

          <button
            type="button"
            onClick={onOfferDraw}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#141B30] hover:bg-[#1E2744] border border-[#202A44] text-xs font-bold text-slate-200 transition active:scale-98"
          >
            <Handshake size={15} />
            <span>Offer Draw</span>
          </button>

          <button
            type="button"
            onClick={onAnalysis}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#141B30] hover:bg-[#1E2744] border border-[#202A44] text-xs font-bold text-slate-200 transition active:scale-98"
          >
            <BarChart2 size={15} />
            <span>Analysis</span>
          </button>

          <button
            type="button"
            onClick={onReport}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#141B30] hover:bg-[#1E2744] border border-[#202A44] text-xs font-bold text-slate-400 hover:text-slate-200 transition active:scale-98"
          >
            <AlertTriangle size={15} />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Quote Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#24304D] p-5 shadow-xl min-h-[140px] flex flex-col justify-end mt-auto">
        <Image
          src="/images/chess_quote.jpg"
          alt="Chessly"
          fill
          className="object-cover"
          sizes="280px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E18] via-[#0A0E18]/85 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <p className="text-xs italic text-slate-200 font-semibold leading-relaxed">
            “Every move builds a better you.”
          </p>
          <span className="text-[10px] font-bold text-violet-400 block tracking-wide">
            — Chessly
          </span>
        </div>
      </div>
    </div>
  );
};
