'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Clock,
  Flame,
  ChevronsLeft,
  ChevronLeft,
  Play,
  Pause,
  ChevronRight,
  ChevronsRight,
  Smile,
  Send,
} from 'lucide-react';
import { Move } from '@/lib/engine/types';

export interface ChatMessage {
  id: string;
  sender: string;
  avatarUrl: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

interface GameMovesAndChatProps {
  moves: Move[];
  activeMoveIndex: number;
  onSelectMoveIndex: (index: number) => void;
  onStepFirst: () => void;
  onStepPrev: () => void;
  onStepNext: () => void;
  onStepLast: () => void;
  onToggleAutoPlay?: () => void;
  isAutoPlaying?: boolean;
  chatMessages: ChatMessage[];
  onSendMessage: (message: string) => void;
  timeControl?: string;
  gameId?: string;
}

export const GameMovesAndChat: React.FC<GameMovesAndChatProps> = ({
  moves,
  activeMoveIndex,
  onSelectMoveIndex,
  onStepFirst,
  onStepPrev,
  onStepNext,
  onStepLast,
  onToggleAutoPlay,
  isAutoPlaying = false,
  chatMessages,
  onSendMessage,
  timeControl = 'Rapid • 10 min',
  gameId = '#324',
}) => {
  const [topTab, setTopTab] = useState<'game' | 'analysis' | 'info'>('game');
  const [chatTab, setChatTab] = useState<'chat' | 'spectators'>('chat');
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Group moves into turns: [ { number: 1, white: Move, black?: Move }, ... ]
  const movePairs: { number: number; white?: Move; black?: Move; whiteIndex: number; blackIndex?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      whiteIndex: i,
      black: moves[i + 1],
      blackIndex: i + 1 < moves.length ? i + 1 : undefined,
    });
  }

  // Scroll chat to bottom when message arrives
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji: string) => {
    onSendMessage(emoji);
    setShowEmojiPicker(false);
  };

  const emojis = ['👍', '👏', '🤝', '🔥', '🧠', '😮', '😅', '👑'];

  return (
    <div className="flex flex-col h-full bg-[#0F1424] border border-[#1C253B] rounded-3xl overflow-hidden shadow-2xl">
      {/* Top Header Tabs */}
      <div className="flex items-center justify-between border-b border-[#1C253B] px-4 pt-3 pb-2 bg-[#0C101C]">
        <div className="flex items-center gap-2">
          {(['game', 'analysis', 'info'] as const).map((tab) => {
            const active = topTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setTopTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  active
                    ? 'bg-[#192238] text-white border border-[#2B3A60]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
          <span className="flex items-center gap-1 text-slate-300">
            <Clock size={12} className="text-violet-400" />
            {timeControl}
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
            {gameId} <Flame size={12} />
          </span>
        </div>
      </div>

      {/* Move History Table */}
      <div className="flex-1 min-h-[160px] max-h-[220px] overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin">
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium py-8">
            Game started. White to move.
          </div>
        ) : (
          <table className="w-full text-xs">
            <tbody>
              {movePairs.map((pair) => {
                const isWhiteActive = activeMoveIndex === pair.whiteIndex;
                const isBlackActive = pair.blackIndex !== undefined && activeMoveIndex === pair.blackIndex;

                return (
                  <tr key={pair.number} className="hover:bg-[#141B30] rounded-lg">
                    <td className="w-10 py-1 text-slate-500 font-bold text-[11px]">
                      {pair.number}.
                    </td>
                    <td className="py-1 w-[45%]">
                      {pair.white && (
                        <button
                          type="button"
                          onClick={() => onSelectMoveIndex(pair.whiteIndex)}
                          className={`px-2.5 py-1 rounded-lg text-left font-bold transition-all w-full ${
                            isWhiteActive
                              ? 'bg-[#5B4DF6] text-white shadow-sm'
                              : 'text-slate-200 hover:bg-[#1C253D]'
                          }`}
                        >
                          {pair.white.san || 'e4'}
                        </button>
                      )}
                    </td>
                    <td className="py-1 w-[45%]">
                      {pair.black && pair.blackIndex !== undefined && (
                        <button
                          type="button"
                          onClick={() => onSelectMoveIndex(pair.blackIndex!)}
                          className={`px-2.5 py-1 rounded-lg text-left font-bold transition-all w-full ${
                            isBlackActive
                              ? 'bg-[#5B4DF6] text-white shadow-sm'
                              : 'text-slate-200 hover:bg-[#1C253D]'
                          }`}
                        >
                          {pair.black.san || 'e5'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Step Navigation Controls (<<, <, Play, >, >>) */}
      <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#0C101C] border-y border-[#1C253B]">
        <button
          type="button"
          onClick={onStepFirst}
          title="First move"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#182034] active:scale-95 transition"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          type="button"
          onClick={onStepPrev}
          title="Previous move"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#182034] active:scale-95 transition"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={onToggleAutoPlay}
          title={isAutoPlaying ? 'Pause' : 'Play'}
          className="p-2.5 rounded-2xl bg-[#5B4DF6] text-white hover:bg-[#4E3FE4] shadow-md shadow-[#5B4DF6]/25 active:scale-95 transition"
        >
          {isAutoPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
        </button>
        <button
          type="button"
          onClick={onStepNext}
          title="Next move"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#182034] active:scale-95 transition"
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          onClick={onStepLast}
          title="Last move"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#182034] active:scale-95 transition"
        >
          <ChevronsRight size={16} />
        </button>
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col min-h-[220px] bg-[#0E1322]">
        {/* Chat Tabs */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#1A2238] bg-[#0C101C]">
          <span className="text-xs font-black text-white">Chat</span>
          <div className="flex items-center gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => setChatTab('chat')}
              className={`flex items-center gap-1 font-bold ${
                chatTab === 'chat' ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chat <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={() => setChatTab('spectators')}
              className={`font-bold ${
                chatTab === 'spectators' ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Spectators (2)
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 text-xs ${
                msg.isSelf ? 'justify-end' : 'justify-start'
              }`}
            >
              {!msg.isSelf && (
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-700 shrink-0">
                  <Image src={msg.avatarUrl} alt={msg.sender} fill className="object-cover" sizes="24px" />
                </div>
              )}
              <div className="flex flex-col max-w-[75%]">
                <div
                  className={`p-2.5 rounded-2xl ${
                    msg.isSelf
                      ? 'bg-[#5B4DF6] text-white rounded-tr-none shadow-md'
                      : 'bg-[#182034] text-slate-100 rounded-tl-none border border-[#24304D]'
                  }`}
                >
                  <p className="leading-snug font-medium text-[11px]">{msg.text}</p>
                </div>
                <span
                  className={`text-[9px] text-slate-500 mt-0.5 ${
                    msg.isSelf ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Emoji quick bar */}
        {showEmojiPicker && (
          <div className="p-2 border-t border-[#1C253B] bg-[#101628] flex items-center justify-around gap-1">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="text-base p-1 hover:scale-125 transition active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input */}
        <form
          onSubmit={handleSend}
          className="p-2.5 border-t border-[#1C253B] bg-[#0C101C] flex items-center gap-2"
        >
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-[#141B2D] border border-[#222E4D] focus:border-[#5B4DF6] focus:outline-none text-xs text-white placeholder:text-slate-500 rounded-full pl-3 pr-8 py-2 transition"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2.5 text-slate-400 hover:text-amber-400 transition"
              title="Add emoji"
            >
              <Smile size={16} />
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-8 h-8 rounded-full bg-[#5B4DF6] disabled:opacity-40 text-white flex items-center justify-center shadow-md active:scale-90 transition shrink-0"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
