export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Square = Piece | null;
export type BoardState = Square[][];

export interface Position {
  r: number; // Row: 0 to 7 (0 is 8th rank, 7 is 1st rank)
  c: number; // Col: 0 to 7 (0 is 'a', 7 is 'h')
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece | null;
  promotion?: PieceType;
  isCastling?: 'ks' | 'qs';
  isEnPassant?: boolean;
}

export interface CastlingRights {
  w: { ks: boolean; qs: boolean };
  b: { ks: boolean; qs: boolean };
}

export interface GameState {
  board: BoardState;
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: Position | null;
  moveHistory: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
}
