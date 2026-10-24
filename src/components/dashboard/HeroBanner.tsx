'use client';

import React from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface HeroBannerProps {
  onPlayNow: () => void;
  onLearnMore: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onPlayNow, onLearnMore }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17153B]/90 via-[#13172E] to-[#0D1120] border border-[#2B2956]/60 p-8 shadow-2xl flex items-center justify-between min-h-[220px]">
      {/* Background radial purple glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left Content */}
      <div className="relative z-10 max-w-lg space-y-4">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white">
          Think. <span className="text-[#8B5CF6]">Move.</span> Improve.
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-md">
          Play chess, learn new strategies, and become a better player — one game at a time.
        </p>

        <div className="flex items-center gap-3.5 pt-1">
          <button
            type="button"
            onClick={onPlayNow}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black text-white bg-gradient-to-r from-[#6355F6] to-[#7B68EE] hover:from-[#5446E8] hover:to-[#6C57E0] shadow-lg shadow-[#6355F6]/30 active:scale-95 transition-all"
          >
            <Play size={15} fill="currentColor" />
            Play Now
          </button>
          <button
            type="button"
            onClick={onLearnMore}
            className="px-6 py-3 rounded-full text-xs font-bold text-slate-200 bg-[#1A2035]/80 hover:bg-[#222B45] border border-[#2B3654] active:scale-95 transition-all"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Right 3D Visual Asset */}
      <div className="hidden md:block relative w-72 h-48 lg:w-96 lg:h-52 shrink-0">
        <Image
          src="/images/chess_hero.jpg"
          alt="3D Chess Pieces"
          fill
          priority
          className="object-cover rounded-2xl shadow-xl border border-purple-500/20"
          sizes="(max-width: 1024px) 288px, 384px"
        />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#17153B]/70 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
