'use client';

import React from 'react';
import { useChessGame } from '@/hooks/useChessGame';
import { getBestAIMove } from '@/lib/engine/aiEngine';
import { sounds } from '@/lib/audio/soundEffects';
import { PUZZLES_DATA } from '@/lib/puzzles/puzzleData';
import { PieceType } from '@/lib/engine/types';

import { Header } from '@/components/ui/Header';
import { ModeTabs, GameMode } from '@/components/ui/ModeTabs';
import { PlayerCard } from '@/components/ui/PlayerCard';
import { GameControls } from '@/components/ui/GameControls';
import { ChessBoard } from '@/components/board/ChessBoard';
import { PromotionModal } from '@/components/ui/PromotionModal';
import { GameOverModal } from '@/components/ui/GameOverModal';
import { OnlineRoomModal } from '@/components/ui/OnlineRoomModal';
import { PuzzlesModal } from '@/components/ui/PuzzlesModal';
import { LoginModal } from '@/components/ui/LoginModal';
import { DrawOfferModal } from '@/components/ui/DrawOfferModal';
import { Lobby } from '@/components/ui/Lobby';

export default function Home() {
  const {
    engineRef, engineState, mode, setMode, difficulty, setDifficulty, soundEnabled, setSoundEnabled, username, handleLogin,
    pendingPromotion, setPendingPromotion, showGameOver, setShowGameOver, showOnlineModal, setShowOnlineModal,
    showPuzzlesModal, setShowPuzzlesModal, showLoginModal, setShowLoginModal, showDrawOffer, setShowDrawOffer,
    roomCode, setRoomCode, handleMakeMove, handleRestart, handleUndo, handleSelectPuzzle,
    userRating, userStats, playerColor, roomStatus, opponentName, opponentRating, lastChat,
    handleJoinRoom, handleCreateRoom, handleFinishOnlineGame,
    botMode, handleSwitchToBot,
    isPlaying, setIsPlaying, handleExitGame,
  } = useChessGame();

  React.useEffect(() => {
    if (isPlaying) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isPlaying]);

  const handleHint = () => {
    const legalMoves = engineRef.current.getLegalMoves();
    if (legalMoves.length > 0) {
      const best = getBestAIMove(engineState.board, engineState.turn, 'hard');
      if (best) {
        alert(`💡 Maslahat: ${String.fromCharCode(97 + best.from.c)}${8 - best.from.r} ➔ ${String.fromCharCode(97 + best.to.c)}${8 - best.to.r}`);
      }
    }
  };

  const handleResign = () => {
    if (confirm("Haqiqatan ham taslim bo'lmoqchimisiz?")) {
      const opponentColor = playerColor === 'w' ? 'b' : 'w';
      handleFinishOnlineGame(opponentColor);
    }
  };

  // Intercept exit/restart action to count as resign in active multiplayer
  const handleRestartAction = () => {
    if (mode === 'online' && roomCode && roomStatus === 'active' && playerColor) {
      if (confirm("O'yindan chiqsangiz sizga mag'lubiyat yoziladi. Chiqishni xohlaysizmi?")) {
        const opponentColor = playerColor === 'w' ? 'b' : 'w';
        handleFinishOnlineGame(opponentColor);
      } else {
        return; // cancel
      }
    }
    handleRestart();
  };

  // Intercept mode tabs selection to count as resign in active multiplayer
  const handleSelectModeAction = (m: GameMode) => {
    if (mode === 'online' && roomCode && roomStatus === 'active' && playerColor) {
      if (confirm("Faol o'yindan chiqsangiz sizga mag'lubiyat yoziladi. Rejimni o'zgartirasizmi?")) {
        const opponentColor = playerColor === 'w' ? 'b' : 'w';
        handleFinishOnlineGame(opponentColor);
      } else {
        return; // cancel
      }
    }
    
    // Puzzles mode opens modal
    if (m === 'puzzle') {
      setShowPuzzlesModal(true);
      return;
    }

    // Online tab: just go to lobby, no modal
    setMode(m);
    handleRestart();
  };

  const handleSendChat = async (message: string) => {
    if (!roomCode || !username) return;
    try {
      await fetch(`/api/room/${roomCode}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message }),
      });
    } catch (err) {
      console.error('Chat send error:', err);
    }
  };

  // Parse last chat to direct to correct PlayerCard
  let topChat: string | null = null;
  let bottomChat: string | null = null;
  if (lastChat) {
    const parts = lastChat.split(': ');
    const sender = parts[0];
    const text = parts.slice(1).join(': ');
    if (sender === opponentName) {
      topChat = text;
    } else if (sender === username) {
      bottomChat = text;
    }
  }

  // Display names based on mode and color
  let topPlayerName = 'Raqib (Qora)';
  let topPlayerAvatar = '👤';
  let bottomPlayerName = username ? `${username} (Oqlar)` : 'Siz (Oqlar)';
  let bottomPlayerAvatar = '👤';

  if (botMode === 'both' && mode !== 'online') {
    // Bot vs Bot mode
    topPlayerName = '🤖 ApexBot (Qoralar)';
    topPlayerAvatar = '🤖';
    bottomPlayerName = '🤖 ApexBot (Oqlar)';
    bottomPlayerAvatar = '🤖';
  } else if (mode === 'ai') {
    topPlayerName = `StockBot AI (${difficulty === 'easy' ? 'Oson' : difficulty === 'medium' ? "O'rta" : 'Qiyin'})`;
    topPlayerAvatar = '🤖';
  } else if (mode === 'puzzle') {
    topPlayerName = 'Shaxmat Masalasi';
    topPlayerAvatar = '🧩';
    bottomPlayerName = username ? `${username} (${userRating})` : 'Siz';
  } else if (mode === 'online') {
    // Top is opponent, bottom is us
    if (playerColor === 'b') {
      // We are Black (bottom), White is top (opponent)
      topPlayerName = opponentName ? `${opponentName} (Oq)` : 'Kutilmoqda...';
      bottomPlayerName = `${username} (Qora)`;
    } else {
      // We are White (bottom), Black is top (opponent)
      topPlayerName = opponentName ? `${opponentName} (Qora)` : 'Kutilmoqda (Qora)...';
      bottomPlayerName = `${username} (Oq)`;
    }
  }

  const topColor = playerColor === 'b' ? 'w' : 'b';
  const bottomColor = playerColor === 'b' ? 'b' : 'w';

  const isTopTurn = engineState.turn === topColor;
  const isBottomTurn = engineState.turn === bottomColor;

  return (
    <>
      {isPlaying ? (
        <div className="h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-[#070A13] p-3 safe-bottom select-none touch-none">
          {/* Slim Game Header */}
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-2xl px-4 py-2 text-xs shrink-0">
            <button
              onClick={handleExitGame}
              className="flex items-center gap-1 font-black text-rose-400 hover:text-rose-300 transition active:scale-95 py-1 px-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20"
            >
              ← Chiqish
            </button>
            <span className="font-extrabold text-slate-200 capitalize tracking-wide text-[11px]">
              {mode === 'ai' ? `Bot AI (${difficulty === 'easy' ? 'Oson' : difficulty === 'medium' ? "O'rta" : 'Qiyin'})` :
               mode === 'online' ? `Online Xona: ${roomCode}` :
               mode === 'pass' ? "Lokal PvP" :
               "Shaxmat Masalasi"}
            </span>
            <button
              onClick={() => { sounds.enabled = !soundEnabled; setSoundEnabled(!soundEnabled); }}
              className="p-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 active:scale-95 transition text-xs"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>

          {/* Connection status header for online room (when waiting) */}
          {mode === 'online' && roomStatus !== 'active' && (
            <div className="bg-slate-900/40 border border-slate-800/40 rounded-2xl py-1.5 px-3 flex items-center justify-between text-[11px] shrink-0 mt-1">
              <span className="font-semibold text-slate-400">Holat:</span>
              <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Raqib kutilmoqda...
              </span>
            </div>
          )}

          {/* Main Game Content Area */}
          <div className="flex-1 flex flex-col justify-center py-1 gap-1.5 overflow-hidden max-w-md w-full mx-auto min-h-0">
            {/* Top Player Card */}
            <div className="shrink-0">
              <PlayerCard
                name={topPlayerName}
                avatar={topPlayerAvatar}
                color={topColor}
                isCurrentTurn={isTopTurn}
                isCheck={isTopTurn && engineState.isCheck}
                capturedPieces={[]}
                activeChat={topChat}
                rating={mode === 'online' ? (opponentRating || 1200) : 1200}
                showSettings={false}
              />
            </div>

            {/* Chessboard Wrapper with touch-none */}
            <div className="w-full flex-1 flex items-center justify-center min-h-0 touch-none py-1">
              <div className="w-[88vw] max-w-[340px] sm:max-w-[420px] aspect-square flex items-center justify-center">
                <ChessBoard
                  board={engineState.board}
                  legalMoves={engineRef.current.getLegalMoves()}
                  lastMove={engineState.moveHistory[engineState.moveHistory.length - 1] || null}
                  kingCheckSquare={null}
                  onMakeMove={handleMakeMove}
                  orientation={playerColor || 'w'}
                />
              </div>
            </div>

            {/* Bottom Player Card */}
            <div className="shrink-0">
              <PlayerCard
                name={bottomPlayerName}
                avatar={bottomPlayerAvatar}
                color={bottomColor}
                isCurrentTurn={isBottomTurn}
                isCheck={isBottomTurn && engineState.isCheck}
                capturedPieces={[]}
                activeChat={bottomChat}
                rating={userRating}
                showProfile={false}
              />
            </div>

            {/* Chat emojis Reactions for online */}
            {mode === 'online' && roomStatus === 'active' && (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2 space-y-1.5 shrink-0">
                <div className="flex justify-between gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {['😀', '😂', '👍', '👎', '🔥', '👏', '🧠', '😮', '😠', '👑'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSendChat(emoji)}
                      className="py-1 px-1.5 text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800/80 rounded-lg active:scale-95 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1 overflow-x-auto py-0.5 scrollbar-none">
                  {[
                    'Rahmat! 🙏',
                    'Ajoyib yurish! 👏',
                    'Uzr, adashdim 😅',
                    'Yaxshi o\'yin! 🤝',
                    'Shoh va mot! ♟️'
                  ].map((msg) => (
                    <button
                      key={msg}
                      onClick={() => handleSendChat(msg)}
                      className="whitespace-nowrap px-2 py-0.5 text-[9px] font-bold bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/80 rounded-lg active:scale-95 transition"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Game Controls */}
            <div className="shrink-0">
              <GameControls
                onUndo={handleUndo}
                onHint={handleHint}
                onRestart={handleRestartAction}
                difficulty={difficulty}
                onChangeDifficulty={() => {
                  const next = difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : 'easy';
                  setDifficulty(next);
                }}
                mode={mode}
                onResign={handleResign}
                botMode={botMode}
                onSwitchToBot={handleSwitchToBot}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-[#070A13] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 pb-8">
          <Header
            username={username}
            userRating={userRating}
            soundEnabled={soundEnabled}
            onToggleSound={() => { sounds.enabled = !soundEnabled; setSoundEnabled(!soundEnabled); }}
            onChangeUser={() => setShowLoginModal(true)}
          />

          <ModeTabs currentMode={mode} onSelectMode={handleSelectModeAction} />

          <main className="flex-1 max-w-md w-full mx-auto px-4 py-2">
            {mode === 'online' && (
              <Lobby
                username={username || ''}
                userRating={userRating}
                userStats={userStats}
                onJoinRoom={handleJoinRoom}
                onCreateRoom={handleCreateRoom}
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
                  onClick={() => setIsPlaying(true)}
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
                  onClick={() => setIsPlaying(true)}
                  className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  ⚔️ O&apos;yinni boshlash
                </button>
              </div>
            )}

            {mode === 'puzzle' && (
              <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-2xl mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/25 flex items-center justify-center text-violet-400">
                    <span className="text-xl">🧩</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide">Shaxmat Masalalarahi</h3>
                    <p className="text-[10px] text-slate-500">Taktik mahoratingizni oshirish uchun masalalarni yeching</p>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {PUZZLES_DATA.map((puzzle) => (
                    <div
                      key={puzzle.id}
                      className="p-3 bg-[#0d1321] rounded-2xl border border-slate-800/60 flex items-center justify-between gap-3 hover:border-slate-700/80 transition"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-200">{puzzle.title}</div>
                        <div className="text-[9px] text-slate-500">{puzzle.desc}</div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black ${
                          puzzle.difficulty === 'Oson' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          puzzle.difficulty === "O'rta" ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {puzzle.difficulty}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSelectPuzzle(puzzle)}
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-black rounded-xl transition shrink-0 active:scale-95"
                      >
                        Yechish
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Global Modals */}
      {showLoginModal && <LoginModal onLogin={handleLogin} />}

      {showDrawOffer && (
        <DrawOfferModal
          onAccept={() => { setShowDrawOffer(false); setShowGameOver(true); }}
          onDecline={() => setShowDrawOffer(false)}
        />
      )}

      {pendingPromotion && (
        <PromotionModal
          color={engineState.turn}
          onSelect={(piece: PieceType) => {
            handleMakeMove(pendingPromotion.from, pendingPromotion.to, piece);
            setPendingPromotion(null);
          }}
        />
      )}

      {(engineState.isCheckmate || engineState.isStalemate || showGameOver) && (
        <GameOverModal
          winner={engineState.turn === 'w' ? 'Qoralar' : 'Oqlar'}
          isStalemate={engineState.isStalemate || showDrawOffer}
          onRestart={handleRestartAction}
          onClose={() => setShowGameOver(false)}
        />
      )}

      {showOnlineModal && (
        <OnlineRoomModal
          currentRoomCode={roomCode}
          onCreateRoom={() => handleCreateRoom(false)}
          onJoinRoom={handleJoinRoom}
          onClose={() => setShowOnlineModal(false)}
        />
      )}

      {showPuzzlesModal && (
        <PuzzlesModal
          puzzles={PUZZLES_DATA}
          onSelectPuzzle={handleSelectPuzzle}
          onClose={() => setShowPuzzlesModal(false)}
        />
      )}
    </>
  );
}
