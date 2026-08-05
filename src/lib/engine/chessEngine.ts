import { BoardState, GameState, Move, PieceColor, Position } from './types';
import { createInitialBoard } from './constants';
import { generateLegalMoves, isKingInCheck, makeHypotheticalMove } from './moveGenerator';

export class ChessEngine {
  public state: GameState;

  constructor(initialFen?: string) {
    this.state = this.createDefaultState();
    if (initialFen) {
      this.loadFen(initialFen);
    }
  }

  private createDefaultState(): GameState {
    const board = createInitialBoard();
    return {
      board,
      turn: 'w',
      castling: {
        w: { ks: true, qs: true },
        b: { ks: true, qs: true }
      },
      enPassantTarget: null,
      moveHistory: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false
    };
  }

  public getLegalMoves(pos?: Position): Move[] {
    const moves = generateLegalMoves(
      this.state.board,
      this.state.turn,
      this.state.castling,
      this.state.enPassantTarget
    );
    if (pos) {
      return moves.filter(m => m.from.r === pos.r && m.from.c === pos.c);
    }
    return moves;
  }

  public makeMove(move: Move): boolean {
    const legalMoves = this.getLegalMoves(move.from);
    const validMove = legalMoves.find(
      m => m.to.r === move.to.r && m.to.c === move.to.c && m.promotion === move.promotion
    );

    if (!validMove) return false;

    // Apply move to board
    this.state.board = makeHypotheticalMove(this.state.board, validMove);
    this.state.moveHistory.push(validMove);

    // Update En Passant Target
    if (validMove.piece.type === 'p' && Math.abs(validMove.from.r - validMove.to.r) === 2) {
      const epRow = (validMove.from.r + validMove.to.r) / 2;
      this.state.enPassantTarget = { r: epRow, c: validMove.from.c };
    } else {
      this.state.enPassantTarget = null;
    }

    // Update Castling Rights
    if (validMove.piece.type === 'k') {
      this.state.castling[this.state.turn] = { ks: false, qs: false };
    } else if (validMove.piece.type === 'r') {
      const row = this.state.turn === 'w' ? 7 : 0;
      if (validMove.from.r === row && validMove.from.c === 0) this.state.castling[this.state.turn].qs = false;
      if (validMove.from.r === row && validMove.from.c === 7) this.state.castling[this.state.turn].ks = false;
    }

    // Switch turn
    this.state.turn = this.state.turn === 'w' ? 'b' : 'w';

    // Evaluate Check, Checkmate, Stalemate
    this.state.isCheck = isKingInCheck(this.state.board, this.state.turn);
    const nextLegalMoves = generateLegalMoves(
      this.state.board,
      this.state.turn,
      this.state.castling,
      this.state.enPassantTarget
    );

    if (nextLegalMoves.length === 0) {
      if (this.state.isCheck) {
        this.state.isCheckmate = true;
      } else {
        this.state.isStalemate = true;
      }
    }

    return true;
  }

  public undoMove(): boolean {
    if (this.state.moveHistory.length === 0) return false;
    this.state.moveHistory.pop();

    // Rebuild board from initial state by re-playing moves
    const history = [...this.state.moveHistory];
    this.state = this.createDefaultState();
    for (const m of history) {
      this.makeMove(m);
    }
    return true;
  }

  public getFen(): string {
    const fenRows: string[] = [];
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      let rowStr = '';
      for (let c = 0; c < 8; c++) {
        const p = this.state.board[r][c];
        if (!p) {
          empty++;
        } else {
          if (empty > 0) {
            rowStr += empty.toString();
            empty = 0;
          }
          rowStr += p.color === 'w' ? p.type.toUpperCase() : p.type.toLowerCase();
        }
      }
      if (empty > 0) rowStr += empty.toString();
      fenRows.push(rowStr);
    }
    return `${fenRows.join('/')} ${this.state.turn} - - 0 1`;
  }

  public loadFen(fen: string) {
    const parts = fen.split(' ');
    const rows = parts[0].split('/');
    const newBoard: BoardState = Array(8).fill(null).map(() => Array(8).fill(null));

    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const char of rows[r]) {
        if (!isNaN(Number(char))) {
          c += Number(char);
        } else {
          const color: PieceColor = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toLowerCase() as any;
          newBoard[r][c] = { type, color };
          c++;
        }
      }
    }
    this.state.board = newBoard;
    this.state.turn = (parts[1] as PieceColor) || 'w';
    this.state.isCheck = isKingInCheck(this.state.board, this.state.turn);
  }
}
