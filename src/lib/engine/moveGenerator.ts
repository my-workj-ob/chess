import { BoardState, Move, Position, PieceColor, CastlingRights } from './types';
import { getPawnMoves } from './moves/pawn';
import { getKnightMoves } from './moves/knight';
import { getSlidingMoves } from './moves/sliding';
import { getKingMoves } from './moves/king';

export function isSquareAttacked(
  board: BoardState,
  targetPos: Position,
  attackerColor: PieceColor
): boolean {
  // Check attacker pawns
  const pawnDir = attackerColor === 'w' ? 1 : -1;
  const pawnRow = targetPos.r + pawnDir;
  for (const c of [targetPos.c - 1, targetPos.c + 1]) {
    if (pawnRow >= 0 && pawnRow < 8 && c >= 0 && c < 8) {
      const p = board[pawnRow][c];
      if (p && p.color === attackerColor && p.type === 'p') return true;
    }
  }

  // Check attacker knights
  const knightOffsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  for (const [dr, dc] of knightOffsets) {
    const r = targetPos.r + dr;
    const c = targetPos.c + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const p = board[r][c];
      if (p && p.color === attackerColor && p.type === 'n') return true;
    }
  }

  // Check sliding attackers (Rook/Queen or Bishop/Queen)
  const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  for (const [dr, dc] of straightDirs) {
    let r = targetPos.r + dr;
    let c = targetPos.c + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const p = board[r][c];
      if (p) {
        if (p.color === attackerColor && (p.type === 'r' || p.type === 'q')) return true;
        break;
      }
      r += dr; c += dc;
    }
  }

  for (const [dr, dc] of diagDirs) {
    let r = targetPos.r + dr;
    let c = targetPos.c + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const p = board[r][c];
      if (p) {
        if (p.color === attackerColor && (p.type === 'b' || p.type === 'q')) return true;
        break;
      }
      r += dr; c += dc;
    }
  }

  // Check attacker king
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = targetPos.r + dr;
      const c = targetPos.c + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const p = board[r][c];
        if (p && p.color === attackerColor && p.type === 'k') return true;
      }
    }
  }

  return false;
}

export function findKingPosition(board: BoardState, color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.type === 'k') return { r, c };
    }
  }
  return null;
}

export function isKingInCheck(board: BoardState, color: PieceColor): boolean {
  const kingPos = findKingPosition(board, color);
  if (!kingPos) return false;
  const enemyColor: PieceColor = color === 'w' ? 'b' : 'w';
  return isSquareAttacked(board, kingPos, enemyColor);
}

export function generatePseudoLegalMoves(
  board: BoardState,
  color: PieceColor,
  castling: CastlingRights,
  enPassantTarget: Position | null
): Move[] {
  const moves: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        const pos = { r, c };
        if (p.type === 'p') moves.push(...getPawnMoves(board, pos, color, enPassantTarget));
        else if (p.type === 'n') moves.push(...getKnightMoves(board, pos, color));
        else if (p.type === 'r' || p.type === 'b' || p.type === 'q') moves.push(...getSlidingMoves(board, pos, color, p.type));
        else if (p.type === 'k') moves.push(...getKingMoves(board, pos, color, castling, isSquareAttacked));
      }
    }
  }
  return moves;
}

export function makeHypotheticalMove(board: BoardState, move: Move): BoardState {
  const newBoard = board.map(row => [...row]);
  newBoard[move.to.r][move.to.c] = move.promotion ? { type: move.promotion, color: move.piece.color } : move.piece;
  newBoard[move.from.r][move.from.c] = null;
  if (move.isEnPassant) {
    newBoard[move.from.r][move.to.c] = null;
  }
  if (move.isCastling) {
    const row = move.from.r;
    if (move.isCastling === 'ks') {
      newBoard[row][5] = newBoard[row][7];
      newBoard[row][7] = null;
    } else {
      newBoard[row][3] = newBoard[row][0];
      newBoard[row][0] = null;
    }
  }
  return newBoard;
}

export function generateLegalMoves(
  board: BoardState,
  color: PieceColor,
  castling: CastlingRights,
  enPassantTarget: Position | null
): Move[] {
  const pseudoMoves = generatePseudoLegalMoves(board, color, castling, enPassantTarget);
  return pseudoMoves.filter((move) => {
    const testBoard = makeHypotheticalMove(board, move);
    return !isKingInCheck(testBoard, color);
  });
}
