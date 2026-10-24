'use client';

import React, { useState } from 'react';
import { ChessEngine } from '@/lib/engine/chessEngine';
import { PieceIcon } from '@/components/board/PieceIcon';
import { ChevronRight, Plus } from 'lucide-react';

interface PlayOnlineWidgetProps {
  onStartMatch: (color: 'w' | 'b' | 'random', timeControl: string, rated: boolean) => void;
  onCreateGame: () => void;
}

export const PlayOnlineWidget: React.FC<PlayOnlineWidgetProps> = ({
  onStartMatch,
  onCreateGame,
}) => {
  const [previewEngine] = useState(() => new ChessEngine());
  const [timeControl, setTimeControl] = useState('10 min');
  const [isRated, setIsRated] = useState(true);
  const [variant, setVariant] = useState('Standard');

  const board = previewEngine.state.board;

  const cycleTimeControl = () => {
    const options = ['1 min', '3 min', '5 min', '10 min', '15 min', '30 min'];
    const idx = options.indexOf(timeControl);
    const next = options[(idx + 1) % options.length];
    setTimeControl(next);
  };

  const cycleVariant = () => {
    const options = ['Standard', 'Chess960', 'Blitz Arena'];
    const idx = options.indexOf(variant);
    const next = options[(idx + 1) % options.length];
    setVariant(next);
  };

  return (
    <div className="rounded-3xl bg-[#0F1424] border border-[#1C253B] p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-white">Play Online</h2>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Online players: 12,487</span>
        </div>
      </div>

      {/* Main Grid: Left Chessboard, Right Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
        {/* Left Chessboard Preview */}
        <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden border border-[#202B44] shadow-lg">
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {board.map((row, r) =>
              row.map((piece, c) => {
                const isDark = (r + c) % 2 === 1;
                const showRank = c === 0;
                const showFile = r === 7;
                const rankLabel = (8 - r).toString();
                const fileLabel = String.fromCharCode(97 + c);

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`relative w-full h-full flex items-center justify-center ${
                      isDark ? 'bg-[#5B6A82]' : 'bg-[#C5CCD8]'
                    }`}
                  >
                    {showRank && (
                      <span
                        className={`absolute top-0.5 left-0.5 text-[8px] font-bold leading-none ${
                          isDark ? 'text-[#C5CCD8]' : 'text-[#5B6A82]'
                        }`}
                      >
                        {rankLabel}
                      </span>
                    )}
                    {showFile && (
                      <span
                        className={`absolute bottom-0.5 right-0.5 text-[8px] font-bold leading-none ${
                          isDark ? 'text-[#C5CCD8]' : 'text-[#5B6A82]'
                        }`}
                      >
                        {fileLabel}
                      </span>
                    )}
                    {piece && (
                      <div className="w-[82%] h-[82%] flex items-center justify-center">
                        <PieceIcon type={piece.type} color={piece.color} className="w-full h-full" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Match Options & Settings */}
        <div className="flex flex-col space-y-3">
          {/* Play as White */}
          <button
            type="button"
            onClick={() => onStartMatch('w', timeControl, isRated)}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#141B30] hover:bg-[#1A233E] border border-[#222E4D] hover:border-[#334470] transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 border border-white/50 flex items-center justify-center shadow">
                <PieceIcon type="k" color="w" className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">White</span>
                <span className="text-[10px] text-slate-400">Find an opponent</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-200 transition" />
          </button>

          {/* Play as Black */}
          <button
            type="button"
            onClick={() => onStartMatch('b', timeControl, isRated)}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#141B30] hover:bg-[#1A233E] border border-[#222E4D] hover:border-[#334470] transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow">
                <PieceIcon type="k" color="b" className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">Black</span>
                <span className="text-[10px] text-slate-400">Find an opponent</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-200 transition" />
          </button>

          {/* Divider */}
          <div className="flex items-center justify-center my-0.5">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">— OR —</span>
          </div>

          {/* Create a Game Button */}
          <button
            type="button"
            onClick={onCreateGame}
            className="w-full py-3 px-4 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-[#6355F6] to-[#7B68EE] hover:from-[#5446E8] hover:to-[#6C57E0] shadow-md shadow-[#6355F6]/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Plus size={16} />
            Create a Game
          </button>

          {/* Game Settings */}
          <div className="pt-2 border-t border-[#1C253B] space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Game Settings
            </span>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-400 flex items-center gap-2">⏱ Time Control</span>
              <button
                type="button"
                onClick={cycleTimeControl}
                className="font-bold text-slate-200 hover:text-white flex items-center gap-1 bg-[#141B30] px-2.5 py-1 rounded-lg border border-[#222E4D]"
              >
                {timeControl} <ChevronRight size={12} />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-400 flex items-center gap-2">🎯 Rated</span>
              <button
                type="button"
                onClick={() => setIsRated(!isRated)}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  isRated ? 'bg-[#5B4DF6]' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isRated ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-400 flex items-center gap-2">♟ Variant</span>
              <button
                type="button"
                onClick={cycleVariant}
                className="font-bold text-slate-200 hover:text-white flex items-center gap-1 bg-[#141B30] px-2.5 py-1 rounded-lg border border-[#222E4D]"
              >
                {variant} <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
