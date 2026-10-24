import { BoardState, PieceType } from './types';

/**
 * Checks for insufficient material to deliver checkmate under FIDE rules.
 * Automatically drawn positions:
 * - K vs K
 * - K+B vs K
 * - K+N vs K
 * - K+B vs K+B where both bishops are on the same square color
 */
export function isInsufficientMaterial(board: BoardState): boolean {
  const whitePieces: { type: PieceType; r: number; c: number }[] = [];
  const blackPieces: { type: PieceType; r: number; c: number }[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        if (p.color === 'w') {
          whitePieces.push({ type: p.type, r, c });
        } else {
          blackPieces.push({ type: p.type, r, c });
        }
      }
    }
  }

  // Any pawn, rook, or queen means sufficient material
  const hasHeavyOrPawn = [...whitePieces, ...blackPieces].some(
    (p) => p.type === 'p' || p.type === 'r' || p.type === 'q'
  );
  if (hasHeavyOrPawn) return false;

  // Filter out kings
  const whiteMinors = whitePieces.filter((p) => p.type !== 'k');
  const blackMinors = blackPieces.filter((p) => p.type !== 'k');

  // K vs K
  if (whiteMinors.length === 0 && blackMinors.length === 0) {
    return true;
  }

  // K+N vs K or K+B vs K
  if (whiteMinors.length === 1 && blackMinors.length === 0) {
    return true;
  }
  if (blackMinors.length === 1 && whiteMinors.length === 0) {
    return true;
  }

  // K+B vs K+B (same square color)
  if (
    whiteMinors.length === 1 &&
    whiteMinors[0].type === 'b' &&
    blackMinors.length === 1 &&
    blackMinors[0].type === 'b'
  ) {
    const whiteBishopSquareColor = (whiteMinors[0].r + whiteMinors[0].c) % 2;
    const blackBishopSquareColor = (blackMinors[0].r + blackMinors[0].c) % 2;
    if (whiteBishopSquareColor === blackBishopSquareColor) {
      return true;
    }
  }

  return false;
}
