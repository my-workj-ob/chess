'use client';

import React from 'react';
import { PieceColor, PieceType } from '@/lib/engine/types';
import { PieceIcon } from '../board/PieceIcon';

interface PromotionModalProps {
  color: PieceColor;
  onSelect: (piece: PieceType) => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect }) => {
  const pieces: { type: PieceType; name: string }[] = [
    { type: 'q', name: 'Vazir' },
    { type: 'r', name: 'Rux' },
    { type: 'b', name: 'Fil' },
    { type: 'n', name: 'Ot' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-xs w-full text-center shadow-2xl">
        <h3 className="text-sm font-bold text-slate-200 mb-4">Donani tanlang:</h3>
        <div className="grid grid-cols-2 gap-3">
          {pieces.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-100 border border-slate-700 transition group"
            >
              <div className="mb-1 group-hover:scale-110 transition-transform">
                <PieceIcon type={p.type} color={color} className="w-8 h-8" />
              </div>
              <span className="text-xs font-semibold">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
