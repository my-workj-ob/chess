'use client';

import React from 'react';
import { ChessPuzzle } from '@/lib/puzzles/puzzleData';
import { Sparkles, X, ChevronRight } from 'lucide-react';

interface PuzzlesModalProps {
  puzzles: ChessPuzzle[];
  onSelectPuzzle: (puzzle: ChessPuzzle) => void;
  onClose: () => void;
}

export const PuzzlesModal: React.FC<PuzzlesModalProps> = ({
  puzzles,
  onSelectPuzzle,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full relative shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold">
            <Sparkles size={18} />
            <span className="text-sm">Shaxmat Masalalari</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1">
          {puzzles.map((puzzle) => (
            <button
              key={puzzle.id}
              onClick={() => onSelectPuzzle(puzzle)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/50 transition group text-left"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-200">{puzzle.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    puzzle.difficulty === 'Oson'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : puzzle.difficulty === "O'rta"
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {puzzle.difficulty}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{puzzle.desc}</p>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-amber-400 transition" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
