'use client';

import React, { useState } from 'react';
import { Piece } from '@/lib/engine/types';
import { PieceIcon } from './PieceIcon';

interface DraggablePieceProps {
  piece: Piece;
  row: number;
  col: number;
  isSelected: boolean;
  onDragStart: (r: number, c: number) => void;
  onDrop?: (fromR: number, fromC: number, toR: number, toC: number) => void;
  onClick: (r: number, c: number) => void;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({
  piece,
  row,
  col,
  isSelected,
  onDragStart,
  onDrop,
  onClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hasMovedSignificant, setHasMovedSignificant] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with left mouse click or touch pointer
    if (e.button !== 0) return;
    
    // Highlight / select piece immediately on press
    onClick(row, col);
    onDragStart(row, col);

    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setOffset({ x: 0, y: 0 });
    setHasMovedSignificant(false);
    
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    
    // Threshold of 5 pixels to differentiate dragging from tapping
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      setHasMovedSignificant(true);
    }
    
    setOffset({ x: dx, y: dy });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    const finalX = e.clientX;
    const finalY = e.clientY;

    // Reset offsets
    setOffset({ x: 0, y: 0 });

    if (hasMovedSignificant && onDrop) {
      // Find element under pointer (ignoring the piece itself via pointerEvents: none)
      const element = document.elementFromPoint(finalX, finalY);
      const square = element?.closest('[data-row]');
      if (square) {
        const toR = parseInt(square.getAttribute('data-row') || '', 10);
        const toC = parseInt(square.getAttribute('data-col') || '', 10);
        
        if (!isNaN(toR) && !isNaN(toC) && (toR !== row || toC !== col)) {
          onDrop(row, col, toR, toC);
          return;
        }
      }
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ r: row, c: col }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(row, col);
  };

  const style: React.CSSProperties = isDragging && hasMovedSignificant ? {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    zIndex: 50,
    position: 'relative',
    pointerEvents: 'none', // Allows elementFromPoint to hit the square behind the piece
    opacity: 0.85,
  } : {};

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={(e) => {
        e.stopPropagation();
        // Only click if it wasn't a drag release
        if (!hasMovedSignificant) {
          onClick(row, col);
        }
      }}
      style={style}
      className={`w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none transition-transform duration-75 p-1 touch-none ${
        isSelected && (!isDragging || !hasMovedSignificant)
          ? 'scale-125 z-30 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]'
          : 'hover:scale-105 z-10'
      }`}
    >
      <PieceIcon type={piece.type} color={piece.color} className="w-9 h-9 sm:w-11 sm:h-11 pointer-events-none" />
    </div>
  );
};
