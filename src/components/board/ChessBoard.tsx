'use client';

import React, { useState, useEffect } from 'react';
import { BoardState, Move, Position, PieceColor } from '@/lib/engine/types';
import { SquareContainer } from './SquareContainer';
import { DraggablePiece } from './DraggablePiece';
import { findKingPosition, isKingInCheck } from '@/lib/engine/moveGenerator';
import { ChessBoard3D } from './ChessBoard3D';

// Helper to trace attacking path to any target square (king or escape square)
function getAttackerPathsToSquare(board: BoardState, targetPos: Position, attackerColor: PieceColor): Position[][] {
  const paths: Position[][] = [];
  
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== attackerColor) continue;
      if (r === targetPos.r && c === targetPos.c) continue; // Skip self

      const dr = targetPos.r - r;
      const dc = targetPos.c - c;
      const absDr = Math.abs(dr);
      const absDc = Math.abs(dc);

      if (p.type === 'p') {
        const pawnDir = attackerColor === 'w' ? 1 : -1;
        if (dr === pawnDir && absDc === 1) {
          paths.push([{ r, c }, targetPos]);
        }
      } else if (p.type === 'n') {
        if ((absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2)) {
          paths.push([{ r, c }, targetPos]);
        }
      } else if (p.type === 'r' || (p.type === 'q' && (dr === 0 || dc === 0))) {
        if (dr === 0 || dc === 0) {
          const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
          const stepC = dc === 0 ? 0 : dc > 0 ? 1 : -1;
          let tempR = r + stepR;
          let tempC = c + stepC;
          let blocked = false;
          const currentPath: Position[] = [{ r, c }];

          while (tempR >= 0 && tempR < 8 && tempC >= 0 && tempC < 8 && (tempR !== targetPos.r || tempC !== targetPos.c)) {
            if (board[tempR][tempC]) {
              blocked = true;
              break;
            }
            currentPath.push({ r: tempR, c: tempC });
            tempR += stepR;
            tempC += stepC;
          }
          if (!blocked) {
            currentPath.push(targetPos);
            paths.push(currentPath);
          }
        }
      }
      
      if (p.type === 'b' || (p.type === 'q' && absDr === absDc)) {
        if (absDr === absDc) {
          const stepR = dr > 0 ? 1 : -1;
          const stepC = dc > 0 ? 1 : -1;
          let tempR = r + stepR;
          let tempC = c + stepC;
          let blocked = false;
          const currentPath: Position[] = [{ r, c }];

          while (tempR >= 0 && tempR < 8 && tempC >= 0 && tempC < 8 && (tempR !== targetPos.r || tempC !== targetPos.c)) {
            if (board[tempR][tempC]) {
              blocked = true;
              break;
            }
            currentPath.push({ r: tempR, c: tempC });
            tempR += stepR;
            tempC += stepC;
          }
          if (!blocked) {
            currentPath.push(targetPos);
            paths.push(currentPath);
          }
        }
      }
    }
  }

  return paths;
}

interface ChessBoardProps {
  board: BoardState;
  legalMoves: Move[];
  lastMove: Move | null;
  kingCheckSquare: Position | null;
  currentTurn: 'w' | 'b';
  onMakeMove: (from: Position, to: Position) => void;
  orientation?: 'w' | 'b';
  isFinished?: boolean;
  winnerColor?: 'w' | 'b' | 'draw' | null;
  loserColor?: 'w' | 'b' | null;
  reasonText?: string;
  onRestart?: () => void;
  mode?: string;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  legalMoves,
  lastMove,
  kingCheckSquare: propsKingCheckSquare,
  currentTurn,
  onMakeMove,
  orientation = 'w',
  isFinished = false,
  winnerColor = null,
  loserColor = null,
  reasonText = '',
  onRestart = () => {},
  mode = 'ai',
}) => {
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<Position | null>(null);
  const [dragTarget, setDragTarget] = useState<{ r: number; c: number; valid: boolean } | null>(null);
  const [boardTheme, setBoardTheme] = useState<'classic' | 'emerald' | 'cyberpunk' | 'wood'>('classic');
  const [showOverlay, setShowOverlay] = useState(false);
  const [is3D, setIs3D] = useState(false);

  // Reset overlay to false when board changes (keeps overlay hidden by default)
  useEffect(() => {
    setShowOverlay(false);
  }, [board]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shohmot_board_theme') as any;
      if (saved) setBoardTheme(saved);
      
      const saved3D = localStorage.getItem('shohmot_board_view_3d');
      if (saved3D) setIs3D(JSON.parse(saved3D));
    }
  }, []);

  const handleThemeChange = (newTheme: typeof boardTheme) => {
    setBoardTheme(newTheme);
    localStorage.setItem('shohmot_board_theme', newTheme);
  };

  const activeSelection = draggingFrom ?? selectedPos;

  // Oldin "&& !draggingFrom" sharti bo'lganligi uchun sudrab
  // (drag) borayotganda ruxsat etilgan yurishlar (yashil nuqtalar)
  // butunlay yo'qolib qolardi. Endi tanlangan dona doim o'z
  // legal yurishlarini ko'rsatadi — drag paytida ham.
  const targetMoves = activeSelection
    ? legalMoves.filter((m) => m.from.r === activeSelection.r && m.from.c === activeSelection.c)
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
    const isValid = legalMoves.some((m) => m.from.r === fromR && m.from.c === fromC && m.to.r === toR && m.to.c === toC);
    if (!isValid) {
      setDraggingFrom(null);
      setDragTarget(null);
      return;
    }

    onMakeMove({ r: fromR, c: fromC }, { r: toR, c: toC });
    setSelectedPos(null);
    setDraggingFrom(null);
    setDragTarget(null);
  };

  const handleDragPreview = (fromR: number, fromC: number, toR: number, toC: number) => {
    const isValid = legalMoves.some((m) => m.from.r === fromR && m.from.c === fromC && m.to.r === toR && m.to.c === toC);
    setDraggingFrom({ r: fromR, c: fromC });
    setDragTarget({ r: toR, c: toC, valid: isValid });
  };

  // Determine active king check state internally
  const activeKingColor = isFinished && loserColor ? loserColor : currentTurn;
  const inCheck = isKingInCheck(board, activeKingColor);
  const internalKingCheckSquare = inCheck ? findKingPosition(board, activeKingColor) : null;
  const finalKingCheckSquare = propsKingCheckSquare || internalKingCheckSquare;

  // Find King Position
  let kingPos: Position | null = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === activeKingColor) {
        kingPos = { r, c };
        break;
      }
    }
    if (kingPos) break;
  }

  const enemyColor: PieceColor = activeKingColor === 'w' ? 'b' : 'w';

  // Trace checking path (direct checkers)
  const directPaths = inCheck && kingPos ? getAttackerPathsToSquare(board, kingPos, enemyColor) : [];

  // Trace escape blocker paths (attackers covering escape squares)
  const escapePaths: { path: Position[]; target: Position }[] = [];
  const adjacentOffsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  if (kingPos && (inCheck || isFinished)) {
    for (const [dr, dc] of adjacentOffsets) {
      const r = kingPos.r + dr;
      const c = kingPos.c + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const p = board[r][c];
        if (!p || p.color === enemyColor) {
          const targetSq = { r, c };
          const pathsToSq = getAttackerPathsToSquare(board, targetSq, enemyColor);
          for (const path of pathsToSq) {
            escapePaths.push({ path, target: targetSq });
          }
        }
      }
    }
  }

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
      {/* View (2D/3D) & Theme Selectors */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center space-x-2">
          <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Ko'rinish</span>
          <button
            onClick={() => {
              const next = !is3D;
              setIs3D(next);
              localStorage.setItem('shohmot_board_view_3d', JSON.stringify(next));
            }}
            className={`px-2.5 py-1 rounded-xl border text-[8px] font-black uppercase transition active:scale-95 ${
              is3D
                ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {is3D ? '3D' : '2D'}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider mr-2">Mavzu</span>
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
      </div>

      {/* Board Outer Container — no padding, board fills full square */}
      <div
        data-board-root
        className={`theme-${boardTheme} w-full aspect-square max-w-[480px] mx-auto rounded-[20px] overflow-hidden shadow-2xl border-[5px] border-[#131B29] relative touch-none`}
      >
        {is3D ? (
          <ChessBoard3D
            board={board}
            legalMoves={legalMoves}
            lastMove={lastMove}
            kingCheckSquare={finalKingCheckSquare}
            currentTurn={currentTurn}
            onMakeMove={onMakeMove}
            orientation={orientation}
            isFinished={isFinished}
            winnerColor={winnerColor}
            loserColor={loserColor}
            reasonText={reasonText}
            theme={boardTheme}
          />
        ) : (
          <>
            {/* The 8x8 Board Grid — fills entire container */}
            <div className="w-full h-full grid grid-cols-8 grid-rows-8 overflow-hidden">
              {rows.map((r) =>
                cols.map((c) => {
                  const piece = board[r][c];
                  const isDark = (r + c) % 2 === 1;
                  const isSelected = selectedPos?.r === r && selectedPos?.c === c;
                  const isLegal = targetMoves.some((m) => m.to.r === r && m.to.c === c);
                  const isLast = (lastMove?.from.r === r && lastMove?.from.c === c) || (lastMove?.to.r === r && lastMove?.to.c === c);
                  const isCheck = finalKingCheckSquare?.r === r && finalKingCheckSquare?.c === c;
                  const isDropTarget = dragTarget?.r === r && dragTarget?.c === c;
                  const canDragPiece = Boolean(piece && piece.color === currentTurn);

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
                      isDropTarget={Boolean(isDropTarget)}
                      isDropValid={dragTarget?.valid ?? false}
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
                          canDrag={canDragPiece}
                          onDragStart={(dr, dc) => {
                            setSelectedPos({ r: dr, c: dc });
                            setDraggingFrom({ r: dr, c: dc });
                          }}
                          onDragPreview={handleDragPreview}
                          onDragClear={() => {
                            setDragTarget(null);
                            setDraggingFrom(null);
                          }}
                          onDrop={handleDropPiece}
                          onClick={handleSquareClick}
                        />
                      )}
                    </SquareContainer>
                  );
                })
              )}
            </div>

            {/* SVG Checking Vectors / Attack paths */}
            {(directPaths.length > 0 || escapePaths.length > 0) && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                <defs>
                  <marker
                    id="arrow-red"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
                  </marker>
                  <marker
                    id="arrow-amber"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
                  </marker>
                </defs>

                {/* 1. Draw Escape Blocker Paths (Thinner, Amber) */}
                {escapePaths.map((item, idx) => {
                  if (item.path.length < 2) return null;
                  const start = item.path[0];
                  const end = item.path[item.path.length - 1];

                  const x1 = (cols.indexOf(start.c) + 0.5) * 12.5;
                  const y1 = (rows.indexOf(start.r) + 0.5) * 12.5;
                  const x2 = (cols.indexOf(end.c) + 0.5) * 12.5;
                  const y2 = (rows.indexOf(end.r) + 0.5) * 12.5;

                  return (
                    <React.Fragment key={`escape-${idx}`}>
                      <line
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                        opacity="0.65"
                        markerEnd="url(#arrow-amber)"
                      />
                      {/* Small dot on the escape square */}
                      <circle
                        cx={`${x2}%`}
                        cy={`${y2}%`}
                        r="1.8%"
                        fill="#f59e0b"
                        opacity="0.8"
                      />
                    </React.Fragment>
                  );
                })}

                {/* 2. Draw Direct Checker Paths (Thicker, Red) */}
                {directPaths.map((path, idx) => {
                  if (path.length < 2) return null;
                  const start = path[0];
                  const end = path[path.length - 1];

                  const x1 = (cols.indexOf(start.c) + 0.5) * 12.5;
                  const y1 = (rows.indexOf(start.r) + 0.5) * 12.5;
                  const x2 = (cols.indexOf(end.c) + 0.5) * 12.5;
                  const y2 = (rows.indexOf(end.r) + 0.5) * 12.5;

                  return (
                    <React.Fragment key={`direct-${idx}`}>
                      <line
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke="#f43f5e"
                        strokeWidth="3.5"
                        strokeDasharray="6 4"
                        opacity="0.85"
                        markerEnd="url(#arrow-red)"
                      />
                      <circle
                        cx={`${x1}%`}
                        cy={`${y1}%`}
                        r="4.5%"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2"
                        className="animate-ping"
                        opacity="0.75"
                      />
                      <circle
                        cx={`${x1}%`}
                        cy={`${y1}%`}
                        r="4.5%"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                        opacity="0.9"
                      />
                    </React.Fragment>
                  );
                })}
              </svg>
            )}

            {/* Temporary Inspect Button */}
            {!showOverlay && isFinished && (
              <button
                onClick={() => setShowOverlay(true)}
                className="absolute top-3 right-3 z-30 px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800/80 backdrop-blur-md text-[10px] font-black text-amber-400 hover:text-white transition active:scale-95 shadow-xl flex items-center gap-1.5"
              >
                👁️ Natijani Ko'rish
              </button>
            )}

            {/* Glassmorphic Overlay for Game Result */}
            {isFinished && showOverlay && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-[2px] z-30 p-4 rounded-[15px] animate-fade-in">
                <div className="bg-[#0b0f19]/90 border border-slate-800/80 backdrop-blur-md p-5 rounded-3xl max-w-[260px] w-full text-center shadow-2xl space-y-4 transform scale-100 transition-all duration-300">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                      O'YIN YAKUNLANDI
                    </span>
                    <h3 className="text-sm font-black text-white leading-tight">
                      {winnerColor === 'draw'
                        ? 'DURRANG'
                        : (winnerColor === (orientation === 'b' ? 'w' : 'b') || winnerColor === 'b' && orientation === 'w' || winnerColor === 'w' && orientation === 'b')
                          ? 'MAG\'LUBIYAT'
                          : 'G\'ALABA!'}
                    </h3>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-bold leading-normal">
                    {winnerColor === 'draw'
                      ? `O'yin durrang bilan yakunlandi. Sabab: ${reasonText}`
                      : (winnerColor === orientation)
                        ? `Siz raqibni mag'lub etdingiz! Sabab: ${reasonText}`
                        : `Siz mag'lub bo'ldingiz. Sabab: ${reasonText}`}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={onRestart}
                      className="w-full py-2.5 rounded-xl text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 active:scale-95 transition-all shadow-lg shadow-amber-500/10"
                    >
                      {mode === 'online' ? 'Lobbyga Qaytish' : 'Yangi O\'yin Boshlash'}
                    </button>
                    <button
                      onClick={() => setShowOverlay(false)}
                      className="w-full py-2 rounded-xl text-[9px] font-black bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition"
                    >
                      Doskani Ko'rish
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};