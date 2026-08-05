'use client';

import React, { useState, useEffect } from 'react';
import { BoardState, Move, Position } from '@/lib/engine/types';
import { SquareContainer } from './SquareContainer';
import { DraggablePiece } from './DraggablePiece';

interface ChessBoardProps {
  board: BoardState;
  legalMoves: Move[];
  lastMove: Move | null;
  kingCheckSquare: Position | null;
  onMakeMove: (from: Position, to: Position) => void;
  orientation?: 'w' | 'b';
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  legalMoves,
  lastMove,
  kingCheckSquare,
  onMakeMove,
  orientation = 'w',
}) => {
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [boardTheme, setBoardTheme] = useState<'classic' | 'emerald' | 'cyberpunk' | 'wood'>('classic');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apex_chess_board_theme') as any;
      if (saved) setBoardTheme(saved);
    }
  }, []);

  const handleThemeChange = (newTheme: typeof boardTheme) => {
    setBoardTheme(newTheme);
    localStorage.setItem('apex_chess_board_theme', newTheme);
  };

  const targetMoves = selectedPos
    ? legalMoves.filter((m) => m.from.r === selectedPos.r && m.from.c === selectedPos.c)
    : [];

  const handleSquareClick = (r: number, c: number) => {
    const piece = board[r][c];

    if (selectedPos) {
      const isTarget = targetMoves.some((m) => m.to.r === r && m.to.c === c);
      if (isTarget) {
        onMakeMove(selectedPos, { r, c });
        setSelectedPos(null);
        return;
      }
    }

    if (piece) {
      if (selectedPos && selectedPos.r === r && selectedPos.c === c) {
        setSelectedPos(null);
      } else {
        setSelectedPos({ r, c });
      }
    } else {
      setSelectedPos(null);
    }
  };

  const handleDropPiece = (fromR: number, fromC: number, toR: number, toC: number) => {
    onMakeMove({ r: fromR, c: fromC }, { r: toR, c: toC });
    setSelectedPos(null);
  };

  const rows = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const cols = orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  const themes = [
    { id: 'classic', label: 'Klasik', color: 'bg-[#2d3a4b]' },
    { id: 'emerald', label: 'Zumrad', color: 'bg-[#769656]' },
    { id: 'cyberpunk', label: 'Neon', color: 'bg-[#4c1d95]' },
    { id: 'wood', label: 'Yog\'och', color: 'bg-[#b58863]' },
  ] as const;

  const files = orientation === 'w' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
  const ranks = orientation === 'w' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <div className="space-y-2 max-w-md mx-auto w-full">
      {/* Theme selection circles */}
      <div className="flex justify-between items-center px-1">
        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Doska mavzusi</span>
        <div className="flex items-center space-x-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${t.color} ${
                boardTheme === t.id
                  ? 'border-amber-400 scale-125 shadow-md shadow-amber-400/20'
                  : 'border-slate-800 hover:scale-110'
              }`}
              title={t.label}
            />
          ))}
        </div>
      </div>

      {/* Board Outer Container — no padding, board fills full square */}
      <div className={`theme-${boardTheme} w-full aspect-square max-w-[480px] mx-auto rounded-[20px] overflow-hidden shadow-2xl border-[5px] border-[#131B29] relative touch-none`}>
        {/* The 8x8 Board Grid — fills entire container */}
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 overflow-hidden">
          {rows.map((r) =>
            cols.map((c) => {
              const piece = board[r][c];
              const isDark = (r + c) % 2 === 1;
              const isSelected = selectedPos?.r === r && selectedPos?.c === c;
              const isLegal = targetMoves.some((m) => m.to.r === r && m.to.c === c);
              const isLast = (lastMove?.from.r === r && lastMove?.from.c === c) || (lastMove?.to.r === r && lastMove?.to.c === c);
              const isCheck = kingCheckSquare?.r === r && kingCheckSquare?.c === c;

              return (
                <SquareContainer
                  key={`${r}-${c}`}
                  row={r}
                  col={c}
                  isDark={isDark}
                  isSelected={isSelected}
                  isLegalMove={isLegal}
                  isLastMove={Boolean(isLast)}
                  isKingCheck={Boolean(isCheck)}
                  onSquareClick={handleSquareClick}
                  onDropPiece={handleDropPiece}
                  showRank={c === 0}
                  showFile={r === 7}
                  rankLabel={ranks[rows.indexOf(r)]}
                  fileLabel={files[cols.indexOf(c)]}
                >
                  {piece && (
                    <DraggablePiece
                      piece={piece}
                      row={r}
                      col={c}
                      isSelected={isSelected}
                      onDragStart={(dr, dc) => setSelectedPos({ r: dr, c: dc })}
                      onDrop={handleDropPiece}
                      onClick={handleSquareClick}
                    />
                  )}
                </SquareContainer>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
