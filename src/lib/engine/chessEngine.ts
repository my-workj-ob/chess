import { BoardState, GameState, Move, PieceColor, Position, PieceType } from './types';
import { createInitialBoard } from './constants';
import { generateLegalMoves, isKingInCheck, makeHypotheticalMove } from './moveGenerator';
import { moveToSan } from './san';
import { isInsufficientMaterial } from './rules';

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
        b: { ks: true, qs: true },
      },
      enPassantTarget: null,
      moveHistory: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      drawReason: undefined,
      halfmoveClock: 0,
      capturedWhite: [],
      capturedBlack: [],
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
      return moves.filter((m) => m.from.r === pos.r && m.from.c === pos.c);
    }
    return moves;
  }

  public makeMove(move: Move): boolean {
    const legalMoves = this.getLegalMoves(move.from);
    const validMove = legalMoves.find(
      (m) => m.to.r === move.to.r && m.to.c === move.to.c && m.promotion === move.promotion
    );

    if (!validMove) return false;

    const boardBefore = this.state.board;
    const isPawnMove = validMove.piece.type === 'p';
    const isCapture = Boolean(validMove.captured || validMove.isEnPassant);

    // Apply move to board
    const newBoard = makeHypotheticalMove(this.state.board, validMove);
    this.state.board = newBoard;

    // Track captured pieces
    if (validMove.captured) {
      if (validMove.captured.color === 'w') {
        this.state.capturedWhite.push(validMove.captured.type);
      } else {
        this.state.capturedBlack.push(validMove.captured.type);
      }
    } else if (validMove.isEnPassant) {
      const epCapturedColor: PieceColor = validMove.piece.color === 'w' ? 'b' : 'w';
      if (epCapturedColor === 'w') {
        this.state.capturedWhite.push('p');
      } else {
        this.state.capturedBlack.push('p');
      }
    }

    // Update halfmove clock for 50-move rule
    if (isPawnMove || isCapture) {
      this.state.halfmoveClock = 0;
    } else {
      this.state.halfmoveClock += 1;
    }

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
        this.state.isDraw = true;
        this.state.drawReason = 'Stalemate';
      }
    }

    // Evaluate Insufficient Material
    if (!this.state.isCheckmate && !this.state.isStalemate) {
      if (isInsufficientMaterial(this.state.board)) {
        this.state.isDraw = true;
        this.state.drawReason = 'Insufficient material';
      } else if (this.state.halfmoveClock >= 100) {
        this.state.isDraw = true;
        this.state.drawReason = '50-move rule';
      }
    }

    // Compute and record SAN
    const san = moveToSan(boardBefore, validMove, this.state.isCheck, this.state.isCheckmate, legalMoves);
    validMove.san = san;
    this.state.moveHistory.push(validMove);

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

    const castlingParts: string[] = [];
    if (this.state.castling.w.ks) castlingParts.push('K');
    if (this.state.castling.w.qs) castlingParts.push('Q');
    if (this.state.castling.b.ks) castlingParts.push('k');
    if (this.state.castling.b.qs) castlingParts.push('q');
    const castlingStr = castlingParts.length ? castlingParts.join('') : '-';

    const epStr = this.state.enPassantTarget
      ? `${String.fromCharCode(97 + this.state.enPassantTarget.c)}${8 - this.state.enPassantTarget.r}`
      : '-';

    return `${fenRows.join('/')} ${this.state.turn} ${castlingStr} ${epStr} ${this.state.halfmoveClock} ${Math.floor(this.state.moveHistory.length / 2) + 1}`;
  }

  public loadFen(fen: string) {
    const parts = fen.trim().split(/\s+/);
    const rows = parts[0].split('/');
    const newBoard: BoardState = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const char of rows[r]) {
        if (!isNaN(Number(char))) {
          c += Number(char);
        } else {
          const color: PieceColor = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toLowerCase() as PieceType;
          newBoard[r][c] = { type, color };
          c++;
        }
      }
    }
    this.state.board = newBoard;
    this.state.turn = (parts[1] as PieceColor) || 'w';

    const castlingStr = parts[2] || '-';
    this.state.castling = {
      w: { ks: castlingStr.includes('K'), qs: castlingStr.includes('Q') },
      b: { ks: castlingStr.includes('k'), qs: castlingStr.includes('q') },
    };

    if (parts[3] && parts[3] !== '-') {
      const col = parts[3].charCodeAt(0) - 97;
      const row = 8 - parseInt(parts[3][1], 10);
      if (col >= 0 && col < 8 && row >= 0 && row < 8) {
        this.state.enPassantTarget = { r: row, c: col };
      }
    } else {
      this.state.enPassantTarget = null;
    }

    this.state.halfmoveClock = parts[4] ? parseInt(parts[4], 10) : 0;
    this.state.isCheck = isKingInCheck(this.state.board, this.state.turn);
    this.state.isCheckmate = false;
    this.state.isStalemate = false;
    this.state.isDraw = isInsufficientMaterial(this.state.board);
    if (this.state.isDraw) {
      this.state.drawReason = 'Insufficient material';
    }
  }
}
