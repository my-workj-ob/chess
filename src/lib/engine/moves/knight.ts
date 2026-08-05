import { BoardState, Move, Position, PieceColor } from '../types';

export function getKnightMoves(board: BoardState, from: Position, color: PieceColor): Move[] {
  const moves: Move[] = [];
  const piece = { type: 'n' as const, color };
  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  for (const [dr, dc] of offsets) {
    const r = from.r + dr;
    const c = from.c + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const target = board[r][c];
      if (!target || target.color !== color) {
        moves.push({ from, to: { r, c }, piece, captured: target });
      }
    }
  }

  return moves;
}
