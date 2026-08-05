import { BoardState, Move, Position, PieceColor, CastlingRights } from '../types';

export function getKingMoves(
  board: BoardState,
  from: Position,
  color: PieceColor,
  castling: CastlingRights,
  isSquareAttacked: (b: BoardState, pos: Position, attackerColor: PieceColor) => boolean
): Move[] {
  const moves: Move[] = [];
  const piece = { type: 'k' as const, color };
  const enemyColor: PieceColor = color === 'w' ? 'b' : 'w';

  // 1-step moves in 8 directions
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [dr, dc] of directions) {
    const r = from.r + dr;
    const c = from.c + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const target = board[r][c];
      if (!target || target.color !== color) {
        moves.push({ from, to: { r, c }, piece, captured: target });
      }
    }
  }

  // Castling
  const row = color === 'w' ? 7 : 0;
  if (from.r === row && from.c === 4) {
    const rights = castling[color];

    // Kingside Castling (e1-g1 / e8-g8)
    if (rights.ks && !board[row][5] && !board[row][6]) {
      if (
        !isSquareAttacked(board, { r: row, c: 4 }, enemyColor) &&
        !isSquareAttacked(board, { r: row, c: 5 }, enemyColor) &&
        !isSquareAttacked(board, { r: row, c: 6 }, enemyColor)
      ) {
        moves.push({ from, to: { r: row, c: 6 }, piece, isCastling: 'ks' });
      }
    }

    // Queenside Castling (e1-c1 / e8-c8)
    if (rights.qs && !board[row][1] && !board[row][2] && !board[row][3]) {
      if (
        !isSquareAttacked(board, { r: row, c: 4 }, enemyColor) &&
        !isSquareAttacked(board, { r: row, c: 3 }, enemyColor) &&
        !isSquareAttacked(board, { r: row, c: 2 }, enemyColor)
      ) {
        moves.push({ from, to: { r: row, c: 2 }, piece, isCastling: 'qs' });
      }
    }
  }

  return moves;
}
