'use client';

import React from 'react';

interface SquareContainerProps {
  row: number;
  col: number;
  isDark: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove: boolean;
  isKingCheck: boolean;
  onSquareClick: (r: number, c: number) => void;
  onDropPiece: (fromR: number, fromC: number, toR: number, toC: number) => void;
  children?: React.ReactNode;
  showRank?: boolean;
  showFile?: boolean;
  rankLabel?: string;
  fileLabel?: string;
}

export const SquareContainer: React.FC<SquareContainerProps> = ({
  row,
  col,
  isDark,
  isSelected,
  isLegalMove,
  isLastMove,
  isKingCheck,
  onSquareClick,
  onDropPiece,
  children,
  showRank = false,
  showFile = false,
  rankLabel = '',
  fileLabel = '',
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (data) {
      try {
        const { r: fromR, c: fromC } = JSON.parse(data);
        onDropPiece(fromR, fromC, row, col);
      } catch {}
    }
  };

  return (
    <div
      data-row={row}
      data-col={col}
      onClick={() => onSquareClick(row, col)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative w-full h-full flex items-center justify-center transition-colors duration-150 ${
        isKingCheck ? '!bg-[#991B1B] animate-pulse' : ''
      }`}
      style={{
        backgroundColor: isKingCheck
          ? undefined
          : isSelected
            ? 'var(--color-board-selected)'
            : isLastMove
              ? 'var(--color-board-last)'
              : isDark
                ? 'var(--color-board-dark)'
                : 'var(--color-board-light)',
      }}
    >
      {/* Rank label overlaid on left-edge squares */}
      {showRank && rankLabel && (
        <span
          className="absolute top-0.5 left-0.5 text-[9px] font-black select-none z-10 leading-none"
          style={{ color: isDark ? 'var(--color-board-light)' : 'var(--color-board-dark)', opacity: 0.75 }}
        >
          {rankLabel}
        </span>
      )}

      {/* File label overlaid on bottom-edge squares */}
      {showFile && fileLabel && (
        <span
          className="absolute bottom-0.5 right-0.5 text-[9px] font-black select-none z-10 leading-none"
          style={{ color: isDark ? 'var(--color-board-light)' : 'var(--color-board-dark)', opacity: 0.75 }}
        >
          {fileLabel}
        </span>
      )}

      {/* Piece */}
      {children}

      {/* Legal move dot */}
      {isLegalMove && !children && (
        <span
          className="w-[30%] h-[30%] rounded-full opacity-35 pointer-events-none"
          style={{ backgroundColor: isDark ? 'var(--color-board-light)' : 'var(--color-board-dark)' }}
        />
      )}
    </div>
  );
};


