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
  } = useChessGame();

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

  // If in online mode but not in a room, render the lobby instead of the board
  if (mode === 'online' && !roomCode) {
    return (
      <div className="min-h-screen bg-[#070A13] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        <Header
          username={username}
          userRating={userRating}
          soundEnabled={soundEnabled}
          onToggleSound={() => { sounds.enabled = !soundEnabled; setSoundEnabled(!soundEnabled); }}
          onChangeUser={() => setShowLoginModal(true)}
        />

        <ModeTabs currentMode={mode} onSelectMode={handleSelectModeAction} />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-2">
          <Lobby
            username={username || ''}
            userRating={userRating}
            userStats={userStats}
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
          />
        </main>

        {showLoginModal && <LoginModal onLogin={handleLogin} />}

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
      </div>
    );
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
    <div className="min-h-screen bg-[#070A13] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Header
        username={username}
        userRating={userRating}
        soundEnabled={soundEnabled}
        onToggleSound={() => { sounds.enabled = !soundEnabled; setSoundEnabled(!soundEnabled); }}
        onChangeUser={() => setShowLoginModal(true)}
      />

      <ModeTabs currentMode={mode} onSelectMode={handleSelectModeAction} />

      <main className="flex-1 max-w-md w-full mx-auto px-3 py-2 flex flex-col justify-between space-y-3">
        
        {/* Connection status header for online room */}
        {mode === 'online' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-400">
              Xona: <span className="text-amber-400 font-mono font-bold">{roomCode}</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
              roomStatus === 'active' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {roomStatus === 'active' ? 'Faol O\'yin' : 'Raqib kutilmoqda...'}
            </span>
          </div>
        )}

        <PlayerCard
          name={topPlayerName}
          avatar={topPlayerAvatar}
          color={topColor}
          isCurrentTurn={isTopTurn}
          isCheck={isTopTurn && engineState.isCheck}
          capturedPieces={[]}
          activeChat={topChat}
          rating={mode === 'online' ? (opponentRating || 1200) : 1200}
          showSettings={true}
        />

        <div className="my-1">
          <ChessBoard
            board={engineState.board}
            legalMoves={engineRef.current.getLegalMoves()}
            lastMove={engineState.moveHistory[engineState.moveHistory.length - 1] || null}
            kingCheckSquare={null}
            onMakeMove={handleMakeMove}
            orientation={playerColor || 'w'}
          />
        </div>

        <PlayerCard
          name={bottomPlayerName}
          avatar={bottomPlayerAvatar}
          color={bottomColor}
          isCurrentTurn={isBottomTurn}
          isCheck={isBottomTurn && engineState.isCheck}
          capturedPieces={[]}
          activeChat={bottomChat}
          rating={userRating}
          showProfile={true}
        />

        {/* Realtime Quick Chat / Emojis reaction block for online multiplayer */}
        {mode === 'online' && roomStatus === 'active' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 space-y-2">
            <div className="flex justify-between items-center px-0.5">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Tezkor muloqot</span>
            </div>
            
            <div className="flex justify-between gap-1 overflow-x-auto pb-1 scrollbar-thin">
              {['😀', '😂', '👍', '👎', '🔥', '👏', '🧠', '😮', '😠', '👑'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSendChat(emoji)}
                  className="flex-1 py-1.5 px-2 text-sm bg-slate-950 hover:bg-slate-800 border border-slate-800/80 rounded-xl active:scale-95 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex gap-1 overflow-x-auto py-0.5 scrollbar-thin">
              {[
                'Rahmat! 🙏',
                'Ajoyib yurish! 👏',
                'Uzr, adashdim 😅',
                'Yaxshi o\'yin! 🤝',
                'Fikrlarim chalkashdi 🧠',
                'Shoh va mot kelmoqda! ♟️'
              ].map((msg) => (
                <button
                  key={msg}
                  onClick={() => handleSendChat(msg)}
                  className="whitespace-nowrap px-2.5 py-1 text-[10px] font-bold bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/80 rounded-xl active:scale-95 transition"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        )}

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
      </main>

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
    </div>
  );
}
