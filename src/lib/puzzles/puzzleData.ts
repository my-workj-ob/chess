export interface ChessPuzzle {
  id: number;
  title: string;
  desc: string;
  difficulty: 'Oson' | "O'rta" | 'Qiyin';
  fen: string;
  solution: { fromR: number; fromC: number; toR: number; toC: number }[];
}

export const PUZZLES_DATA: ChessPuzzle[] = [
  {
    id: 1,
    title: "1-Bosqich: Vazir Bilan Mot (Mate in 1)",
    desc: "Vazir bilan bitta yurishda shoh va mot qiling!",
    difficulty: 'Oson',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    solution: [{ fromR: 3, fromC: 7, toR: 1, toC: 5 }] // Qh5xf7#
  },
  {
    id: 2,
    title: "2-Bosqich: Oxirgi Qatorda Mot (Back-Rank Mate)",
    desc: "Rux bilan pastki qatordagi shohni mot qiling!",
    difficulty: 'Oson',
    fen: '6k1/5ppp/8/8/8/8/8/1R4K1 w - - 0 1',
    solution: [{ fromR: 7, fromC: 1, toR: 0, toC: 1 }] // Rb1-b8#
  },
  {
    id: 3,
    title: "3-Bosqich: Ot Bilan Ayri (Knight Fork)",
    desc: "Ot bilan Shoh va Vazirga bir vaqtda hujum qiling!",
    difficulty: "O'rta",
    fen: 'r1b1k2r/pppp1ppp/8/n3q3/4N3/8/PPPP1PPP/R1BQK2R w KQkq - 0 1',
    solution: [{ fromR: 4, fromC: 4, toR: 2, toC: 2 }] // Ne4-c3 or fork
  },
  {
    id: 4,
    title: "4-Bosqich: Fil va Vazir Hujumi",
    desc: "Vazirni f7 katagiga surib g'alaba qozoning!",
    difficulty: "O'rta",
    fen: 'r1bqk2r/pppp1ppp/2n5/4p3/2B1P1n1/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
    solution: [{ fromR: 4, fromC: 2, toR: 1, toC: 5 }] // Bxf7+
  },
  {
    id: 5,
    title: "5-Bosqich: Qirolicha Qurbonligi (Smothered Mate)",
    desc: "Vazir va Ot bilan ajoyib mot kombinatsiyasini bajaring!",
    difficulty: 'Qiyin',
    fen: '6rk/5Npp/8/8/8/8/8/7K w - - 0 1',
    solution: [{ fromR: 1, fromC: 5, toR: 1, toC: 7 }] // Nf7#
  }
];
