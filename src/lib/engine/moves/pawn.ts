import { BoardState, Move, Position, PieceColor } from '../types';

export function getPawnMoves(
  board: BoardState,
  from: Position,
  color: PieceColor,
  enPassantTarget: Position | null
): Move[] {
  const moves: Move[] = [];
  const dir = color === 'w' ? -1 : 1;
  const startRow = color === 'w' ? 6 : 1;
  const piece = { type: 'p' as const, color };

  // Single Step Forward
  const forwardRow = from.r + dir;
  if (forwardRow >= 0 && forwardRow < 8 && !board[forwardRow][from.c]) {
    const isPromotion = color === 'w' ? forwardRow === 0 : forwardRow === 7;
    if (isPromotion) {
      ['q', 'r', 'b', 'n'].forEach((promo) => {
        moves.push({ from, to: { r: forwardRow, c: from.c }, piece, promotion: promo as any });
      });
    } else {
      moves.push({ from, to: { r: forwardRow, c: from.c }, piece });
    }

    // Double Step Forward from initial row
    const doubleRow = from.r + dir * 2;
    if (from.r === startRow && !board[doubleRow][from.c]) {
      moves.push({ from, to: { r: doubleRow, c: from.c }, piece });
    }
  }

  // Diagonal Captures & En Passant
  const captureCols = [from.c - 1, from.c + 1];
  for (const c of captureCols) {
    if (c >= 0 && c < 8 && forwardRow >= 0 && forwardRow < 8) {
      const target = board[forwardRow][c];
      const isPromotion = color === 'w' ? forwardRow === 0 : forwardRow === 7;

      if (target && target.color !== color) {
        if (isPromotion) {
          ['q', 'r', 'b', 'n'].forEach((promo) => {
            moves.push({ from, to: { r: forwardRow, c }, piece, captured: target, promotion: promo as any });
          });
        } else {
          moves.push({ from, to: { r: forwardRow, c }, piece, captured: target });
        }
      } else if (enPassantTarget && enPassantTarget.r === forwardRow && enPassantTarget.c === c) {
        // En Passant
        const epCaptured = board[from.r][c];
        moves.push({ from, to: { r: forwardRow, c }, piece, captured: epCaptured, isEnPassant: true });
      }
    }
  }

  return moves;
}
