import { BoardState, Move, PieceColor } from './types';
import { PIECE_VALUES, PAWN_TABLE, KNIGHT_TABLE } from './constants';
import { generateLegalMoves, makeHypotheticalMove, isKingInCheck } from './moveGenerator';

export function evaluateBoard(board: BoardState, color: PieceColor): number {
  let score = 0;
  const enemyColor: PieceColor = color === 'w' ? 'b' : 'w';

  // Checkmate / Check incentives
  if (isKingInCheck(board, enemyColor)) {
    const enemyMoves = generateLegalMoves(board, enemyColor, { w: { ks: true, qs: true }, b: { ks: true, qs: true } }, null);
    if (enemyMoves.length === 0) return 100000; // Deliver Mate!
    score += 150; // Check bonus
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        let val = PIECE_VALUES[p.type] || 0;
        if (p.type === 'p') val += p.color === 'w' ? PAWN_TABLE[r][c] : PAWN_TABLE[7 - r][c];
        else if (p.type === 'n') val += p.color === 'w' ? KNIGHT_TABLE[r][c] : KNIGHT_TABLE[7 - r][c];

        if (p.color === color) score += val;
        else score -= val;
      }
    }
  }
  return score;
}

// Move Ordering: Captures and Checks searched first for max Alpha-Beta pruning
function orderMoves(board: BoardState, moves: Move[], color: PieceColor): Move[] {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += 10 * PIECE_VALUES[a.captured.type] - PIECE_VALUES[a.piece.type];
    if (b.captured) scoreB += 10 * PIECE_VALUES[b.captured.type] - PIECE_VALUES[b.piece.type];
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;
    return scoreB - scoreA;
  });
}

export function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiColor: PieceColor,
  castling: any,
  enPassant: any
): { score: number; move: Move | null } {
  const currentTurn: PieceColor = isMaximizing ? aiColor : (aiColor === 'w' ? 'b' : 'w');
  const rawMoves = generateLegalMoves(board, currentTurn, castling, enPassant);

  if (depth === 0 || rawMoves.length === 0) {
    return { score: evaluateBoard(board, aiColor), move: null };
  }

  const legalMoves = orderMoves(board, rawMoves, currentTurn);
  let bestMove: Move | null = legalMoves[0] || null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      const nextBoard = makeHypotheticalMove(board, move);
      const evalResult = minimax(nextBoard, depth - 1, alpha, beta, false, aiColor, castling, enPassant);
      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      const nextBoard = makeHypotheticalMove(board, move);
      const evalResult = minimax(nextBoard, depth - 1, alpha, beta, true, aiColor, castling, enPassant);
      if (evalResult.score < minEval) {
        minEval = evalResult.score;
        bestMove = move;
      }
      beta = Math.min(beta, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
}

export function getBestAIMove(
  board: BoardState,
  aiColor: PieceColor,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  castling: any = { w: { ks: true, qs: true }, b: { ks: true, qs: true } },
  enPassant: any = null
): Move | null {
  const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  return minimax(board, depth, -Infinity, Infinity, true, aiColor, castling, enPassant).move;
}
