'use client';

import React from 'react';
import Image from 'next/image';

interface QuoteCardWidgetProps {
  quote?: string;
  author?: string;
  imageSrc?: string;
}

export const QuoteCardWidget: React.FC<QuoteCardWidgetProps> = ({
  quote = '“The best move is the one you see before your opponent.”',
  author = 'Bobby Fischer',
  imageSrc = '/images/chess_quote.jpg',
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#232F4E] p-6 shadow-xl min-h-[160px] flex flex-col justify-end">
      {/* Background Image */}
      <Image
        src={imageSrc}
        alt="Chess Art"
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 360px"
      />
      {/* Dark & Purple Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090D18] via-[#090D18]/80 to-transparent pointer-events-none" />

      {/* Quote Text */}
      <div className="relative z-10 space-y-2">
        <p className="text-xs italic text-slate-200 font-medium leading-relaxed max-w-xs">
          {quote}
        </p>
        <span className="text-[11px] font-bold text-violet-400 block tracking-wide">
          — {author}
        </span>
      </div>
    </div>
  );
};
