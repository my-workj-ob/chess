'use client';

import React, { use, useEffect } from 'react';
import { useChessGame } from '@/hooks/useChessGame';
import { getBestAIMove } from '@/lib/engine/aiEngine';
import { sounds } from '@/lib/audio/soundEffects';
import { PieceType } from '@/lib/engine/types';
import { useRouter } from 'next/navigation';
import { Loader2, WifiOff } from 'lucide-react';

import { PlayerCard } from '@/components/ui/PlayerCard';
import { GameControls } from '@/components/ui/GameControls';
import { ChessBoard } from '@/components/board/ChessBoard';
import { PromotionModal } from '@/components/ui/PromotionModal';
import { DrawOfferModal } from '@/components/ui/DrawOfferModal';
import { LoginModal } from '@/components/ui/LoginModal';
import { GameMode } from '@/components/ui/ModeTabs';

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const { code: initialRoomCode } = use(params);

  const {
    engineRef, engineState, mode, setMode, difficulty, setDifficulty, soundEnabled, setSoundEnabled, username,
    pendingPromotion, setPendingPromotion, showDrawOffer, setShowDrawOffer,
    roomCode, handleMakeMove, handleRestart, handleUndo,
    playerColor, roomStatus, opponentName, opponentRating, lastChat,
    handleFinishOnlineGame,
    botMode, handleSwitchToBot,
    gameResult, setGameResult, handleDeclineDraw,
    userRating,
    showLoginModal, handleLogin,
  } = useChessGame(initialRoomCode);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  const handleExitGame = () => {
    router.push('/');
  };
  
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

  const handleRestartAction = () => {
    if (mode === 'online' && roomCode && roomStatus === 'active' && playerColor) {
      if (confirm("O'yindan chiqsangiz sizga mag'lubiyat yoziladi. Chiqishni xohlaysizmi?")) {
        const opponentColor = playerColor === 'w' ? 'b' : 'w';
        handleFinishOnlineGame(opponentColor);
      } else {
        return;
      }
    }
    handleRestart();
    router.push('/');
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

  let topPlayerName = 'Raqib';
  let topPlayerAvatar = '👤';
  let bottomPlayerName = username || 'Siz';
  let bottomPlayerAvatar = '👤';

  if (botMode === 'both' && mode !== 'online') {
    topPlayerName = 'Bot';
    topPlayerAvatar = '🤖';
    bottomPlayerName = 'Bot';
    bottomPlayerAvatar = '🤖';
  } else if (mode === 'ai') {
    topPlayerName = `Bot ${difficulty === 'easy' ? 'Oson' : difficulty === 'medium' ? `O'rta` : 'Qiyin'}`;
    topPlayerAvatar = '🤖';
  } else if (mode === 'puzzle') {
    topPlayerName = 'Masala';
    topPlayerAvatar = '🧩';
    bottomPlayerName = username ? `${username} ${userRating}` : 'Siz';
  } else if (mode === 'online') {
    topPlayerName = opponentName || 'Kutilmoqda...';
    bottomPlayerName = username || 'Siz';
  }

  const topColor = playerColor === 'b' ? 'w' : 'b';
  const bottomColor = playerColor === 'b' ? 'b' : 'w';

  const isTopTurn = engineState.turn === topColor;
  const isBottomTurn = engineState.turn === bottomColor;

  const isCheckmate = engineState.isCheckmate;
  const isStalemate = engineState.isStalemate;
  const isFinished = Boolean(isCheckmate || isStalemate || gameResult || (mode === 'online' && roomStatus === 'finished'));

  let winnerColor: 'w' | 'b' | 'draw' | null = null;
  let loserColor: 'w' | 'b' | null = null;
  let reasonText = '';

  if (isFinished) {
    if (isCheckmate) {
      loserColor = engineState.turn;
      winnerColor = engineState.turn === 'w' ? 'b' : 'w';
      reasonText = 'Shoh va mat';
    } else if (isStalemate) {
      winnerColor = 'draw';
      reasonText = `Pat (yurish yo'q)`;
    } else if (gameResult) {
      if (gameResult.isDraw || gameResult.winner === 'Durrang' || gameResult.winner === 'draw') {
        winnerColor = 'draw';
        reasonText = gameResult.reason || 'Durrang';
      } else {
        const winVal = gameResult.winner.toLowerCase();
        if (winVal === 'w' || winVal === 'oqlar' || winVal === 'white') {
          winnerColor = 'w';
          loserColor = 'b';
        } else if (winVal === 'b' || winVal === 'qoralar' || winVal === 'black') {
          winnerColor = 'b';
          loserColor = 'w';
        } else {
          if (username && winVal === username.toLowerCase()) {
            winnerColor = playerColor || 'w';
            loserColor = winnerColor === 'w' ? 'b' : 'w';
          } else if (opponentName && winVal === opponentName.toLowerCase()) {
            winnerColor = playerColor === 'w' ? 'b' : 'w';
            loserColor = winnerColor === 'w' ? 'b' : 'w';
          } else {
            winnerColor = 'w';
            loserColor = 'b';
          }
        }
        reasonText = gameResult.reason || `O'yin yakunlandi`;
      }
    }
  }

  let topResultStatus: 'winner' | 'loser' | 'draw' | null = null;
  let bottomResultStatus: 'winner' | 'loser' | 'draw' | null = null;
  let topResultReason: string | null = null;
  let bottomResultReason: string | null = null;

  if (isFinished) {
    if (winnerColor === 'draw') {
      topResultStatus = 'draw';
      bottomResultStatus = 'draw';
      topResultReason = reasonText;
      bottomResultReason = reasonText;
    } else {
      if (winnerColor === topColor) {
        topResultStatus = 'winner';
        topResultReason = reasonText;
      } else if (loserColor === topColor) {
        topResultStatus = 'loser';
        topResultReason = reasonText;
      }

      if (winnerColor === bottomColor) {
        bottomResultStatus = 'winner';
        bottomResultReason = reasonText;
      } else if (loserColor === bottomColor) {
        bottomResultStatus = 'loser';
        bottomResultReason = reasonText;
      }
    }
  }

  // Show fullscreen loading only when username is unknown and login modal isn't shown yet in online mode
  const isOnlineMode = initialRoomCode &&
    initialRoomCode !== 'ai' &&
    initialRoomCode !== 'pass' &&
    !initialRoomCode.startsWith('puzzle-');

  if (isOnlineMode && !username && !showLoginModal) {
    return (
      <>
        <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-[#070A13] gap-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-4xl">
              ♟️
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin text-violet-400" size={20} />
              <span className="text-sm text-slate-400 font-bold">Yuklanmoqda...</span>
            </div>
          </div>
        </div>
        <LoginModal onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      {/* Desktop: 2-column layout; Mobile: vertical stack */}
      <div className="h-[100dvh] w-full flex overflow-hidden bg-[#070A13] select-none touch-none">
        
        {/* Main game area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Top bar */}
          <div className="flex items-center justify-between bg-slate-900/60 border-b border-slate-800/60 px-4 py-2 text-xs shrink-0">
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

          {/* Waiting / Connecting banner */}
          {mode === 'online' && !isFinished && (
            <>
              {roomStatus === null && (
                <div className="bg-violet-500/8 border-b border-violet-500/20 py-1.5 px-4 flex items-center justify-center gap-2 text-[11px] shrink-0">
                  <Loader2 size={11} className="text-violet-400 animate-spin" />
                  <span className="font-bold text-violet-400">Xonaga ulanmoqda...</span>
                  {initialRoomCode && (
                    <span className="font-mono text-violet-300 font-black tracking-widest ml-1">{initialRoomCode.toUpperCase()}</span>
                  )}
                </div>
              )}
              {roomStatus === 'waiting' && (
                <div className="bg-amber-500/8 border-b border-amber-500/20 py-1.5 px-4 flex items-center justify-center gap-2 text-[11px] shrink-0">
                  <Loader2 size={11} className="text-amber-400 animate-spin" />
                  <span className="font-bold text-amber-400">Raqib kutilmoqda...</span>
                  {roomCode && (
                    <span className="font-mono text-amber-300 font-black tracking-widest ml-1">{roomCode}</span>
                  )}
                </div>
              )}
            </>
          )}


          {/* Disconnect banner */}
          {mode === 'online' && roomStatus === 'finished' && isFinished && (
            <div className="bg-rose-500/8 border-b border-rose-500/20 py-1 px-4 flex items-center justify-center gap-2 text-[10px] shrink-0">
              <WifiOff size={10} className="text-rose-400" />
              <span className="font-bold text-rose-400">O&apos;yin yakunlandi</span>
            </div>
          )}

          {/* Game area */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            
            {/* Players + Board + Controls stacked */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              
              {/* Centered content column */}
              <div className="flex-1 flex flex-col justify-center items-center gap-1.5 px-2 py-1 min-h-0 overflow-hidden max-w-lg w-full mx-auto">
                
                {/* Top Player */}
                <div className="w-full shrink-0">
                  <PlayerCard
                    name={topPlayerName}
                    avatar={topPlayerAvatar}
                    color={topColor}
                    isCurrentTurn={isTopTurn}
                    isCheck={isTopTurn && engineState.isCheck}
                    capturedPieces={[]}
                    activeChat={topChat}
                    rating={
                      mode === 'online'
                        ? (opponentRating || 1200)
                        : mode === 'ai'
                          ? (difficulty === 'easy' ? 800 : difficulty === 'medium' ? 1500 : 2200)
                          : 1200
                    }
                    showSettings={false}
                    gameResultStatus={topResultStatus}
                    gameResultReason={topResultReason}
                  />
                </div>

                {/* Chess Board */}
                <div className="w-full flex-1 flex items-center justify-center min-h-0 touch-none">
                  {/* Board sizing: on desktop max 480px, on mobile fills width */}
                  <div className="w-full max-w-[min(88vw,_88vh,_480px)] aspect-square flex items-center justify-center">
                    <ChessBoard
                      board={engineState.board}
                      legalMoves={engineRef.current.getLegalMoves()}
                      lastMove={engineState.moveHistory[engineState.moveHistory.length - 1] || null}
                      kingCheckSquare={null}
                      currentTurn={engineState.turn}
                      onMakeMove={handleMakeMove}
                      orientation={playerColor || 'w'}
                      isFinished={isFinished}
                      winnerColor={winnerColor}
                      loserColor={loserColor}
                      reasonText={reasonText}
                      onRestart={handleRestartAction}
                      mode={mode}
                    />
                  </div>
                </div>

                {/* Bottom Player */}
                <div className="w-full shrink-0">
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
                    gameResultStatus={bottomResultStatus}
                    gameResultReason={bottomResultReason}
                  />
                </div>

                {/* Emoji chat (online only) */}
                {mode === 'online' && roomStatus === 'active' && !isFinished && (
                  <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2 space-y-1.5 shrink-0">
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
                        'Rahmat! ',
                        'Ajoyib yurish! 👏',
                        'Uzr, adashdim 😅',
                        `Yaxshi o'yin! 🤝`,
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

                {/* Game controls */}
                <div className="w-full shrink-0">
                  <GameControls
                    onUndo={handleUndo}
                    onHint={handleHint}
                    onRestart={handleRestartAction}
                    difficulty={difficulty}
                    onChangeDifficulty={() => {
                      const next = difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : 'easy';
                      setDifficulty(next);
                    }}
                    mode={mode as GameMode}
                    onResign={handleResign}
                    botMode={botMode}
                    onSwitchToBot={handleSwitchToBot}
                    roomCode={roomCode ?? undefined}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showDrawOffer && (
        <DrawOfferModal
          onAccept={() => {
            setShowDrawOffer(false);
            setGameResult({ winner: 'Durrang', reason: 'Uch martalik takrorlash', isDraw: true });
          }}
          onDecline={handleDeclineDraw}
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

      {showLoginModal && <LoginModal onLogin={handleLogin} />}
    </>
  );
}
