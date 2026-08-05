import { BoardState, Move, Position, PieceColor, PieceType } from '../types';

export function getSlidingMoves(
  board: BoardState,
  from: Position,
  color: PieceColor,
  type: 'r' | 'b' | 'q'
): Move[] {
  const moves: Move[] = [];
  const piece = { type, color };

  const straightDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const diagonalDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  let directions: number[][] = [];
  if (type === 'r') directions = straightDirections;
  else if (type === 'b') directions = diagonalDirections;
  else if (type === 'q') directions = [...straightDirections, ...diagonalDirections];

  for (const [dr, dc] of directions) {
    let r = from.r + dr;
    let c = from.c + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const target = board[r][c];
      if (!target) {
        moves.push({ from, to: { r, c }, piece });
      } else {
        if (target.color !== color) {
          moves.push({ from, to: { r, c }, piece, captured: target });
        }
        break; // Stop sliding when hitting any piece
      }
      r += dr;
      c += dc;
    }
  }

  return moves;
}
