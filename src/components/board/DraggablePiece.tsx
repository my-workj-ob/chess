'use client';

import React from 'react';
import { Piece } from '@/lib/engine/types';
import { PieceIcon } from './PieceIcon';

interface DraggablePieceProps {
  piece: Piece;
  row: number;
  col: number;
  isSelected: boolean;
  onDragStart: (r: number, c: number) => void;
  onClick: (r: number, c: number) => void;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({
  piece,
  row,
  col,
  isSelected,
  onDragStart,
  onClick,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ r: row, c: col }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(row, col);
  };

  const handleTouchStart = () => {
    onClick(row, col);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
      onClick={(e) => {
        e.stopPropagation();
        onClick(row, col);
      }}
      className={`w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none transition-transform duration-100 p-1 ${
        isSelected ? 'scale-125 z-30 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]' : 'hover:scale-105 z-10'
      }`}
    >
      <PieceIcon type={piece.type} color={piece.color} className="w-9 h-9 sm:w-11 sm:h-11" />
    </div>
  );
};
