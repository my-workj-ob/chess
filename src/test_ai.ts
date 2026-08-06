import { generateLegalMoves } from './lib/engine/moveGenerator';

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
    null,                      // d3 (Black Knight is not yet at d3, let's assume it starts on b4 index [4][1]!)
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

// Place Knight on b4
board[4][1] = { type: 'n', color: 'b' };

const legalMoves = generateLegalMoves(board, 'b', { w: { ks: true, qs: true }, b: { ks: true, qs: true } }, null);
const queenMoves = legalMoves.filter(m => m.piece.type === 'q' && m.from.r === 5 && m.from.c === 6);

console.log('--- Black Queen legal moves from g3 ---');
queenMoves.forEach(m => {
  console.log(`Q to (${m.to.r}, ${m.to.c})`);
});
