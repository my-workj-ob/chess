'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChessGame } from '@/hooks/useChessGame';
import { ChessBoard } from '@/components/board/ChessBoard';
import { ChesslySidebar } from '@/components/ui/ChesslySidebar';
import { ChesslyHeader } from '@/components/ui/ChesslyHeader';
import { GamePlayerBar } from '@/components/game/GamePlayerBar';
import { GameMovesAndChat, ChatMessage } from '@/components/game/GameMovesAndChat';
import { GameSidePanel } from '@/components/game/GameSidePanel';
import { PromotionModal } from '@/components/ui/PromotionModal';
import { DrawOfferModal } from '@/components/ui/DrawOfferModal';
import { GameOverModal } from '@/components/ui/GameOverModal';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { UserProfileModal } from '@/components/ui/UserProfileModal';
import { TournamentsModal } from '@/components/ui/TournamentsModal';
import { PieceType } from '@/lib/engine/types';

export default function ActiveGamePage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const { code: initialRoomCode } = use(params);

  const {
    engineRef,
    engineState,
    mode,
    difficulty,
    soundEnabled,
    setSoundEnabled,
    username,
    pendingPromotion,
    setPendingPromotion,
    showDrawOffer,
    setShowDrawOffer,
    roomCode,
    handleMakeMove,
    handleRestart,
    handleUndo,
    playerColor,
    roomStatus,
    opponentName,
    opponentRating,
    handleFinishOnlineGame,
    gameResult,
    setGameResult,
    handleDeclineDraw,
    userRating,
    userStats,
    handleLogin,
  } = useChessGame(initialRoomCode);

  // Active move index for notation navigation
  const [activeMoveIndex, setActiveMoveIndex] = useState<number>(-1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Clocks (10 minutes = 600 seconds)
  const [whiteClock, setWhiteClock] = useState(574); // 09:34
  const [blackClock, setBlackClock] = useState(492); // 08:12

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTournamentsModal, setShowTournamentsModal] = useState(false);
  const [boardTheme, setBoardTheme] = useState<'classic' | 'emerald' | 'wood' | 'cyberpunk'>('classic');
  const [is3D, setIs3D] = useState(false);

  // Initial chat messages matching Image 2
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ChessMaster99',
      avatarUrl: '/images/avatar_opponent.jpg',
      text: 'Nice move! 👏',
      timestamp: '14:24',
      isSelf: false,
    },
    {
      id: 'm2',
      sender: 'Zuhriddin',
      avatarUrl: '/images/avatar_zuhriddin.jpg',
      text: 'Thanks! Want a rematch?',
      timestamp: '14:25',
      isSelf: true,
    },
    {
      id: 'm3',
      sender: 'ChessMaster99',
      avatarUrl: '/images/avatar_opponent.jpg',
      text: "Sure! Let's go!",
      timestamp: '14:25',
      isSelf: false,
    },
  ]);

  // Sync active move index when moves change
  useEffect(() => {
    setActiveMoveIndex(engineState.moveHistory.length - 1);
  }, [engineState.moveHistory.length]);

  // Clock countdown timer
  useEffect(() => {
    const isFinished = engineState.isCheckmate || engineState.isStalemate || gameResult;
    if (isFinished) return;

    const timer = setInterval(() => {
      if (engineState.turn === 'w') {
        setWhiteClock((prev) => {
          if (prev <= 1) {
            handleFinishOnlineGame('b');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackClock((prev) => {
          if (prev <= 1) {
            handleFinishOnlineGame('w');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [engineState.turn, engineState.isCheckmate, engineState.isStalemate, gameResult, handleFinishOnlineGame]);

  const formatClock = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: username || 'Zuhriddin',
      avatarUrl: '/images/avatar_zuhriddin.jpg',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };
    setChatMessages((prev) => [...prev, newMsg]);

    // Send to online room if multiplayer
    if (mode === 'online' && roomCode) {
      fetch(`/api/room/${roomCode}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username || 'Zuhriddin', message: text }),
      }).catch(() => {});
    }
  };

  const handleResign = () => {
    if (confirm('Are you sure you want to resign?')) {
      const winnerColor = playerColor === 'w' ? 'b' : 'w';
      handleFinishOnlineGame(winnerColor);
      setGameResult({
        winner: winnerColor === 'w' ? 'White' : 'Black',
        reason: 'Resignation',
        isDraw: false,
      });
    }
  };

  const handleOfferDraw = () => {
    if (mode === 'online') {
      alert('Draw offer sent to opponent.');
    } else {
      if (confirm('Opponent accepts your draw offer! End game in a draw?')) {
        setGameResult({
          winner: 'Draw',
          reason: 'Mutual agreement',
          isDraw: true,
        });
      }
    }
  };

  const handleAnalysis = () => {
    alert('Analysis mode active: review moves using the navigation arrows.');
  };

  const handleReport = () => {
    alert('Thank you for reporting. Fair play moderators will review this game.');
  };

  // Determine players info
  const currentUsername = username || 'Zuhriddin';
  const currentRating = userRating || 1200;

  const topPlayerName = mode === 'online' ? opponentName || 'Opponent' : 'ChessMaster99';
  const topPlayerRating = mode === 'online' ? opponentRating || 1245 : 1245;
  const topPlayerAvatar = '/images/avatar_opponent.jpg';

  const bottomPlayerName = currentUsername;
  const bottomPlayerRating = currentRating;
  const bottomPlayerAvatar = '/images/avatar_zuhriddin.jpg';

  const isWhiteTurn = engineState.turn === 'w';
  const isBlackTurn = engineState.turn === 'b';

  const isCheckmate = engineState.isCheckmate;
  const isStalemate = engineState.isStalemate;
  const isFinished = Boolean(isCheckmate || isStalemate || gameResult || (mode === 'online' && roomStatus === 'finished'));

  let winnerColor: 'w' | 'b' | 'draw' | null = null;
  let reasonText = '';

  if (isFinished) {
    if (isCheckmate) {
      winnerColor = engineState.turn === 'w' ? 'b' : 'w';
      reasonText = 'Checkmate';
    } else if (isStalemate) {
      winnerColor = 'draw';
      reasonText = 'Stalemate';
    } else if (gameResult) {
      winnerColor = gameResult.isDraw ? 'draw' : gameResult.winner.toLowerCase().startsWith('w') ? 'w' : 'b';
      reasonText = gameResult.reason;
    }
  }

  return (
    <div className="h-screen bg-[#070A12] text-slate-100 flex flex-row font-sans overflow-hidden select-none">
      {/* Global Sidebar with Play active */}
      <div className="hidden lg:block shrink-0">
        <ChesslySidebar
          activeTab="play"
          onSelectTab={(tab) => {
            if (tab === 'home') router.push('/');
            else if (tab === 'tournaments') setShowTournamentsModal(true);
            else if (tab === 'puzzles') router.push('/room/puzzle-1');
          }}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenPremium={() => alert('Chessly Premium')}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <ChesslyHeader
          username={currentUsername}
          rating={currentRating}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenNotifications={() => alert('No new notifications')}
          onSearch={(q) => console.log('Search:', q)}
        />

        {/* 3-Column Game Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-hidden max-w-[1580px] w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full items-stretch">
            {/* Column 1: Board Area (span 5) */}
            <div className="lg:col-span-5 flex flex-col justify-between items-center h-full max-w-[540px] mx-auto w-full space-y-3">
              {/* Top Player (Opponent) */}
              <GamePlayerBar
                name={topPlayerName}
                rating={topPlayerRating}
                avatarUrl={topPlayerAvatar}
                flag="🇺🇿"
                clockTime={formatClock(blackClock)}
                isCurrentTurn={isBlackTurn}
                statusBadge="Analyzing... 📶"
                isBottomPlayer={false}
              />

              {/* Interactive Chessboard */}
              <div className="relative w-full aspect-square flex items-center justify-center p-2 rounded-3xl bg-[#0F1424] border border-[#1C253B] shadow-2xl">
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
                  reasonText={reasonText}
                  onRestart={handleRestart}
                  mode={mode}
                />
              </div>

              {/* Bottom Player (You) */}
              <GamePlayerBar
                name={bottomPlayerName}
                rating={bottomPlayerRating}
                avatarUrl={bottomPlayerAvatar}
                flag="🇺🇿"
                clockTime={formatClock(whiteClock)}
                isCurrentTurn={isWhiteTurn}
                isBottomPlayer={true}
              />
            </div>

            {/* Column 2: Move Notation Table & Live Chat (span 4) */}
            <div className="lg:col-span-4 h-full flex flex-col min-h-0">
              <GameMovesAndChat
                moves={engineState.moveHistory}
                activeMoveIndex={activeMoveIndex}
                onSelectMoveIndex={(idx) => setActiveMoveIndex(idx)}
                onStepFirst={() => setActiveMoveIndex(0)}
                onStepPrev={() => setActiveMoveIndex((prev) => Math.max(0, prev - 1))}
                onStepNext={() =>
                  setActiveMoveIndex((prev) => Math.min(engineState.moveHistory.length - 1, prev + 1))
                }
                onStepLast={() => setActiveMoveIndex(engineState.moveHistory.length - 1)}
                onToggleAutoPlay={() => setIsAutoPlaying(!isAutoPlaying)}
                isAutoPlaying={isAutoPlaying}
                chatMessages={chatMessages}
                onSendMessage={handleSendMessage}
                timeControl="Rapid • 10 min"
                gameId="#324"
              />
            </div>

            {/* Column 3: Game Details, Captured Pieces, Quick Actions, Quote (span 3) */}
            <div className="lg:col-span-3 h-full flex flex-col min-h-0 overflow-y-auto scrollbar-thin">
              <GameSidePanel
                timeControl="Rapid • 10 min"
                whitePlayerName={bottomPlayerName}
                whitePlayerRating={bottomPlayerRating}
                whitePlayerAvatar={bottomPlayerAvatar}
                blackPlayerName={topPlayerName}
                blackPlayerRating={topPlayerRating}
                blackPlayerAvatar={topPlayerAvatar}
                capturedWhite={engineState.capturedWhite}
                capturedBlack={engineState.capturedBlack}
                onResign={handleResign}
                onOfferDraw={handleOfferDraw}
                onAnalysis={handleAnalysis}
                onReport={handleReport}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Promotion Dialog */}
      {pendingPromotion && (
        <PromotionModal
          color={engineState.turn}
          onSelect={(piece: PieceType) => {
            handleMakeMove(pendingPromotion.from, pendingPromotion.to, piece);
            setPendingPromotion(null);
          }}
        />
      )}

      {/* Draw Offer Dialog */}
      {showDrawOffer && (
        <DrawOfferModal
          onAccept={() => {
            setShowDrawOffer(false);
            setGameResult({ winner: 'Draw', reason: 'Mutual Agreement', isDraw: true });
          }}
          onDecline={handleDeclineDraw}
        />
      )}

      {/* Game Over Dialog */}
      {isFinished && (
        <GameOverModal
          winner={winnerColor === 'draw' ? 'Draw' : winnerColor === 'w' ? 'White' : 'Black'}
          reason={reasonText}
          isDraw={winnerColor === 'draw'}
          onRestart={handleRestart}
          onNewGame={() => router.push('/')}
        />
      )}

      {/* Modals */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        username={currentUsername}
        rating={currentRating}
        stats={userStats}
        onUpdateUsername={(name) => handleLogin(name)}
      />

      <TournamentsModal
        isOpen={showTournamentsModal}
        onClose={() => setShowTournamentsModal(false)}
        onRegister={(tId) => alert(`Joined tournament ${tId}`)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        boardTheme={boardTheme}
        onChangeBoardTheme={(t) => setBoardTheme(t)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        is3D={is3D}
        onToggle3D={() => setIs3D(!is3D)}
      />
    </div>
  );
}
