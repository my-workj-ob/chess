import { isSquareAttacked, findKingPosition } from './lib/engine/moveGenerator';

const board = [
  // Row 8 (index 0)
  [
    null,                      // a8
    { type: 'k', color: 'b' }, // b8
    null,                      // c8
    null,                      // d8
    null,                      // e8
    null,                      // f8
    null,                      // g8
    { type: 'r', color: 'b' }, // h8
  ],
  // Row 7 (index 1)
  [
    { type: 'p', color: 'b' }, // a7
    { type: 'p', color: 'b' }, // b7
    { type: 'p', color: 'b' }, // c7
    null,                      // d7
    null,                      // e7
    { type: 'p', color: 'b' }, // f7
    { type: 'p', color: 'b' }, // g7
    { type: 'p', color: 'b' }, // h7
  ],
  // Row 6 (index 2)
  [
    null,                      // a6
    null,                      // b6
    null,                      // c6
    { type: 'b', color: 'b' }, // d6 (Black Bishop)
    null,                      // e6
    null,                      // f6
    null,                      // g6
    null,                      // h6
  ],
  // Row 5 (index 3)
  [
    null,                      // a5
    null,                      // b5
    null,                      // c5
    { type: 'p', color: 'b' }, // d5 (Black Pawn)
    null,                      // e5
    null,                      // f5
    null,                      // g5
    null,                      // h5
  ],
  // Row 4 (index 4)
  [
    null,                      // a4
    null,                      // b4
    null,                      // c4
    null,                      // d4
    null,                      // e4
    null,                      // f4
    null,                      // g4
    null,                      // h4
  ],
  // Row 3 (index 5)
  [
    { type: 'b', color: 'w' }, // a3 (White Bishop)
    null,                      // b3
    { type: 'p', color: 'w' }, // c3 (White Pawn)
    { type: 'n', color: 'b' }, // d3 (Black Knight)
    null,                      // e3
    null,                      // f3
    { type: 'q', color: 'b' }, // g3 (Black Queen)
    null,                      // h3
  ],
  // Row 2 (index 6)
  [
    { type: 'p', color: 'w' }, // a2 (White Pawn)
    null,                      // b2
    null,                      // c2
    { type: 'n', color: 'w' }, // d2 (White Knight)
    { type: 'b', color: 'w' }, // e2 (White Bishop)
    null,                      // f2
    null,                      // g2
    null,                      // h2
  ],
  // Row 1 (index 7)
  [
    { type: 'r', color: 'w' }, // a1 (White Rook)
    null,                      // b1
    null,                      // c1
    null,                      // d1
    null,                      // e1
    null,                      // f1
    null,                      // g1
    { type: 'k', color: 'w' }, // h1 (White King)
  ]
] as any;

const targetPos = findKingPosition(board, 'b')!;
const attackerColor = 'w';

// Check attacker pawns
const pawnDir = attackerColor === 'w' ? 1 : -1;
const pawnRow = targetPos.r + pawnDir;
for (const c of [targetPos.c - 1, targetPos.c + 1]) {
  if (pawnRow >= 0 && pawnRow < 8 && c >= 0 && c < 8) {
    const p = board[pawnRow][c];
    if (p && p.color === attackerColor && p.type === 'p') {
      console.log('Attacked by pawn at:', pawnRow, c);
    }
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
    if (p && p.color === attackerColor && p.type === 'n') {
      console.log('Attacked by knight at:', r, c);
    }
  }
}

// Check sliding attackers
const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

for (const [dr, dc] of straightDirs) {
  let r = targetPos.r + dr;
  let c = targetPos.c + dc;
  while (r >= 0 && r < 8 && c >= 0 && c < 8) {
    const p = board[r][c];
    if (p) {
      if (p.color === attackerColor && (p.type === 'r' || p.type === 'q')) {
        console.log('Attacked by straight slider at:', r, c);
      }
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
      if (p.color === attackerColor && (p.type === 'b' || p.type === 'q')) {
        console.log('Attacked by diagonal slider at:', r, c);
      }
      break;
    }
    r += dr; c += dc;
  }
}
