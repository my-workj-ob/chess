'use client';

import React from 'react';
import { useChessGame } from '@/hooks/useChessGame';
import { sounds } from '@/lib/audio/soundEffects';
import { PUZZLES_DATA } from '@/lib/puzzles/puzzleData';
import { PieceType } from '@/lib/engine/types';
import { useRouter } from 'next/navigation';

import { Header } from '@/components/ui/Header';
import { ModeTabs, GameMode } from '@/components/ui/ModeTabs';
import { PuzzlesModal } from '@/components/ui/PuzzlesModal';
import { LoginModal } from '@/components/ui/LoginModal';
import { Lobby } from '@/components/ui/Lobby';
import { ChessPuzzle } from '@/lib/puzzles/puzzleData';

export default function Home() {
  const router = useRouter();
  const {
    mode, setMode, difficulty, setDifficulty, soundEnabled, setSoundEnabled, username, handleLogin,
    showPuzzlesModal, setShowPuzzlesModal, showLoginModal, setShowLoginModal,
    userRating, userStats,
    handleJoinRoom, handleCreateRoom, handleSelectPuzzle,
    setIsPlaying,
  } = useChessGame();

  const handleCreateRoomAndRedirect = async (isPrivate: boolean) => {
    // If no username, show login first
    if (!username) {
      setShowLoginModal(true);
      return;
    }
    try {
      const newRoomCode = await handleCreateRoom(isPrivate);
      if (newRoomCode) {
        router.push(`/room/${newRoomCode}`);
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Xona yaratib bo'lmadi");
    }
  };

  const handleJoinRoomAndRedirect = async (code: string) => {
    try {
      await handleJoinRoom(code);
      router.push(`/room/${code}`);
    } catch (error) {
      console.error("Failed to join room:", error);
      alert(`Xonaga ulanib bo'lmadi: ${code}`);
    }
  };

  const handleSelectPuzzleAndRedirect = (puzzle: ChessPuzzle) => {
    handleSelectPuzzle(puzzle);
    // For now, puzzles will also use the room page with a special indicator.
    // This could be changed to a dedicated /puzzle/[id] route in the future.
    router.push(`/room/puzzle-${puzzle.id}`);
  };
  
  const handleSelectModeAction = (m: GameMode) => {
    if (m === 'puzzle') {
      setShowPuzzlesModal(true);
      return;
    }
    setMode(m);
  };

  return (
    <>
      <div className="min-h-screen bg-[#070A13] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 pb-8">
        <Header
          username={username}
          userRating={userRating}
          soundEnabled={soundEnabled}
          onToggleSound={() => { sounds.enabled = !soundEnabled; setSoundEnabled(!soundEnabled); }}
          onChangeUser={() => setShowLoginModal(true)}
        />

        <ModeTabs currentMode={mode} onSelectMode={handleSelectModeAction} />

        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-2">
          {mode === 'online' && (
            <Lobby
              username={username || ''}
              userRating={userRating}
              userStats={userStats}
              onJoinRoom={handleJoinRoomAndRedirect}
              onCreateRoom={handleCreateRoomAndRedirect}
              onNeedLogin={() => setShowLoginModal(true)}
            />
          )}

          {mode === 'ai' && (
              <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-5 space-y-5 shadow-2xl mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/25 flex items-center justify-center text-violet-400">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide">StockBot AI bilan o&apos;yin</h3>
                    <p className="text-[10px] text-slate-500">O&apos;z kuchingizni sun&apos;iy intellektga qarshi sinab ko&apos;ring</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Qiyinchilik darajasi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((d) => {
                      const active = difficulty === d;
                      const labels = { easy: "Oson (800 ELO)", medium: "O'rta (1500 ELO)", hard: "Qiyin (2200 ELO)" };
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          className={`py-2.5 px-1 rounded-xl text-[10px] font-bold border transition ${
                            active
                              ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/20'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {labels[d]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl text-[10px] text-slate-400 leading-relaxed">
                  {difficulty === 'easy' && "Oson bot shaxmat asoslarini biladi va tez-tez xatolarga yo'l qo'yadi. Yangi o'rganuvchilar uchun ajoyib raqib!"}
                  {difficulty === 'medium' && "O'rta darajali bot taktik harakatlarni yaxshi tushunadi va o'rtacha kuchdagi shaxmat havaskorlariga mos keladi."}
                  {difficulty === 'hard' && "Qiyin bot yuqori darajada o'ynaydi. U deyarli barcha xatolaringizdan foydalanadi. O'zingizni sinab ko'ring!"}
                </div>

                <button
                  onClick={() => {
                    setMode('ai');
                    setIsPlaying(true);
                    router.push('/room/ai');
                  }}
                  className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  🎮 O&apos;yinni boshlash
                </button>
              </div>
            )}

            {mode === 'pass' && (
              <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-5 space-y-5 shadow-2xl mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/25 flex items-center justify-center text-violet-400">
                    <span className="text-xl">👥</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide">Lokal 2 Kishi (PvP)</h3>
                    <p className="text-[10px] text-slate-500">Bitta qurilmada do&apos;stingiz bilan shaxmat o&apos;ynang</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl text-[10px] text-slate-400 leading-relaxed">
                  Oq va qora donalar navbat bilan yuriladi. Telefoningizni o&apos;rtaga qo&apos;yib, do&apos;stingiz bilan do&apos;stona jang qiling.
                </div>

                <button
                  onClick={() => {
                    setMode('pass');
                    setIsPlaying(true);
                    router.push('/room/pass');
                  }}
                  className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  ⚔️ O&apos;yinni boshlash
                </button>
              </div>
            )}
        </main>
      </div>

      {showLoginModal && <LoginModal onLogin={handleLogin} />}

      {showPuzzlesModal && (
        <PuzzlesModal
          puzzles={PUZZLES_DATA}
          onSelectPuzzle={handleSelectPuzzleAndRedirect}
          onClose={() => setShowPuzzlesModal(false)}
        />
      )}
    </>
  );
}
