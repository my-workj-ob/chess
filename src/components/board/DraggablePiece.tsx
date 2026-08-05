'use client';

import React, { useState } from 'react';
import { Piece } from '@/lib/engine/types';
import { PieceIcon } from './PieceIcon';

interface DraggablePieceProps {
  piece: Piece;
  row: number;
  col: number;
  isSelected: boolean;
  canDrag?: boolean;
  onDragStart: (r: number, c: number) => void;
  onDragPreview?: (fromR: number, fromC: number, toR: number, toC: number) => void;
  onDragClear?: () => void;
  onDrop?: (fromR: number, fromC: number, toR: number, toC: number) => void;
  onClick: (r: number, c: number) => void;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({
  piece,
  row,
  col,
  isSelected,
  canDrag = true,
  onDragStart,
  onDragPreview,
  onDragClear,
  onDrop,
  onClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hasMovedSignificant, setHasMovedSignificant] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (!canDrag) return;

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

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      if (!hasMovedSignificant) {
        onDragStart(row, col);
        setHasMovedSignificant(true);
      }
    }

    if (hasMovedSignificant) {
      setOffset({ x: dx, y: dy });

      const board = e.currentTarget.closest('[data-board-root]');
      if (board && onDragPreview) {
        const rect = board.getBoundingClientRect();
        const cellSize = rect.width / 8;
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;
        const toC = Math.min(7, Math.max(0, Math.floor(localX / cellSize)));
        const toR = Math.min(7, Math.max(0, Math.floor(localY / cellSize)));
        onDragPreview(row, col, toR, toC);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const moved = hasMovedSignificant;
    setIsDragging(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const finalX = e.clientX;
    const finalY = e.clientY;
    setOffset({ x: 0, y: 0 });
    if (onDragClear) onDragClear();

    if (moved && onDrop) {
      const board = e.currentTarget.closest('[data-board-root]');
      if (board) {
        const rect = board.getBoundingClientRect();
        const cellSize = rect.width / 8;
        const localX = finalX - rect.left;
        const localY = finalY - rect.top;
        const toC = Math.min(7, Math.max(0, Math.floor(localX / cellSize)));
        const toR = Math.min(7, Math.max(0, Math.floor(localY / cellSize)));

        if (toR !== row || toC !== col) {
          onDrop(row, col, toR, toC);
          return;
        }
      }
    }

    if (!moved) {
      onClick(row, col);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    setOffset({ x: 0, y: 0 });
    setHasMovedSignificant(false);
    if (onDragClear) onDragClear();
  };

  const style: React.CSSProperties = isDragging && hasMovedSignificant ? {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    zIndex: 50,
    position: 'relative',
    pointerEvents: 'none',
  } : {};

  return (
    <div
      draggable={false}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={(e) => {
        // Bosish (tap/click) logikasi to'liq pointerUp ichida hal qilinadi.
        // Bu handler faqat brauzerning o'z ichki "click" hodisasi
        // doskaga (SquareContainer) yugurib, onClick'ni QAYTA chaqirib
        // yubormasligi uchun kerak — shu ikkilanish tanlashni
        // darhol bekor qilib qo'yayotgan bug edi.
        e.stopPropagation();
      }}
      style={{
        ...style,
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      className={`w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none transition-all duration-75 p-1 touch-none ${
        isSelected && (!isDragging || !hasMovedSignificant)
          ? 'scale-125 z-30 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]'
          : 'hover:scale-105 z-10'
      }`}
    >
      <PieceIcon type={piece.type} color={piece.color} className="w-9 h-9 sm:w-11 sm:h-11 pointer-events-none" />
    </div>
  );
};