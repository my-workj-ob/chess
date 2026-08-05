'use client';

import React from 'react';
import { PieceIcon } from './PieceIcon';
import { PieceColor, PieceType } from '@/lib/engine/types';

interface CapturedPiecesProps {
  pieces: string[];
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ pieces }) => {
  return (
    <div className="flex items-center space-x-0.5 text-xs text-slate-400 overflow-x-auto">
      {pieces.map((p, idx) => {
        const isWhite = p === p.toUpperCase();
        const color: PieceColor = isWhite ? 'w' : 'b';
        const type = p.toLowerCase() as PieceType;

        return (
          <div key={idx} className="w-4 h-4 opacity-80 flex-shrink-0">
            <PieceIcon type={type} color={color} className="w-full h-full" />
          </div>
        );
      })}
    </div>
  );
};
