import { BoardState, Move, Position } from './types';

export function posToCoord(pos: Position): string {
  const file = String.fromCharCode(97 + pos.c);
  const rank = 8 - pos.r;
  return `${file}${rank}`;
}

export function coordToPos(coord: string): Position | null {
  if (!coord || coord.length < 2) return null;
  const file = coord.charCodeAt(0) - 97;
  const rank = 8 - parseInt(coord[1], 10);
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return { r: rank, c: file };
}

/**
 * Converts a chess move into Standard Algebraic Notation (SAN).
 * Examples: e4, exd4, Nf3, Nxd4, O-O, O-O-O, e8=Q#, Bxf7+
 */
export function moveToSan(
  _boardBefore: BoardState,
  move: Move,
  isCheck: boolean,
  isCheckmate: boolean,
  legalMovesBefore?: Move[]
): string {
  if (move.isCastling === 'ks') {
    return isCheckmate ? 'O-O#' : isCheck ? 'O-O+' : 'O-O';
  }
  if (move.isCastling === 'qs') {
    return isCheckmate ? 'O-O-O#' : isCheck ? 'O-O-O+' : 'O-O-O';
  }

  const piece = move.piece;
  const fromFile = String.fromCharCode(97 + move.from.c);
  const toFile = String.fromCharCode(97 + move.to.c);
  const toRank = (8 - move.to.r).toString();
  const toCoord = `${toFile}${toRank}`;

  const isCapture = Boolean(move.captured || move.isEnPassant);

  let san = '';

  if (piece.type === 'p') {
    if (isCapture) {
      san = `${fromFile}x${toCoord}`;
    } else {
      san = toCoord;
    }
    if (move.promotion) {
      san += `=${move.promotion.toUpperCase()}`;
    }
  } else {
    const pieceChar = piece.type.toUpperCase();
    san = pieceChar;

    // Disambiguation
    if (legalMovesBefore && legalMovesBefore.length > 0) {
      const candidates = legalMovesBefore.filter(
        (m) =>
          m.piece.type === piece.type &&
          m.piece.color === piece.color &&
          (m.from.r !== move.from.r || m.from.c !== move.from.c) &&
          m.to.r === move.to.r &&
          m.to.c === move.to.c
      );

      if (candidates.length > 0) {
        const sameFile = candidates.some((m) => m.from.c === move.from.c);
        const sameRank = candidates.some((m) => m.from.r === move.from.r);

        if (!sameFile) {
          san += fromFile;
        } else if (!sameRank) {
          san += (8 - move.from.r).toString();
        } else {
          san += `${fromFile}${8 - move.from.r}`;
        }
      }
    }

    if (isCapture) {
      san += 'x';
    }
    san += toCoord;
  }

  if (isCheckmate) {
    san += '#';
  } else if (isCheck) {
    san += '+';
  }

  return san;
}
