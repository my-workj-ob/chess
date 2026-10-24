'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChesslySidebar } from '@/components/ui/ChesslySidebar';
import { ChesslyHeader } from '@/components/ui/ChesslyHeader';
import { HeroBanner } from '@/components/dashboard/HeroBanner';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PlayOnlineWidget } from '@/components/dashboard/PlayOnlineWidget';
import { RecentGamesWidget } from '@/components/dashboard/RecentGamesWidget';
import { TopPlayersWidget } from '@/components/dashboard/TopPlayersWidget';
import { TournamentsWidget } from '@/components/dashboard/TournamentsWidget';
import { OnlineFriendsWidget } from '@/components/dashboard/OnlineFriendsWidget';
import { QuoteCardWidget } from '@/components/dashboard/QuoteCardWidget';
import { MatchmakingModal } from '@/components/ui/MatchmakingModal';
import { UserProfileModal } from '@/components/ui/UserProfileModal';
import { TournamentsModal } from '@/components/ui/TournamentsModal';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { PuzzlesModal } from '@/components/ui/PuzzlesModal';
import { PUZZLES_DATA, ChessPuzzle } from '@/lib/puzzles/puzzleData';
import { useChessGame } from '@/hooks/useChessGame';

export default function HomePage() {
  const router = useRouter();
  const {
    username,
    userRating,
    userStats,
    soundEnabled,
    setSoundEnabled,
    handleCreateRoom,
    handleLogin,
  } = useChessGame();

  const [activeTab, setActiveTab] = useState('home');
  const [showMatchmakingModal, setShowMatchmakingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTournamentsModal, setShowTournamentsModal] = useState(false);
  const [showPuzzlesModal, setShowPuzzlesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [boardTheme, setBoardTheme] = useState<'classic' | 'emerald' | 'wood' | 'cyberpunk'>('classic');
  const [is3D, setIs3D] = useState(false);

  const currentUsername = username || 'Zuhriddin';
  const currentRating = userRating || 1200;

  const handleStartMatchmaking = async (
    color: 'w' | 'b' | 'random',
    _timeControl: string,
    _rated: boolean,
    vsBot: boolean
  ) => {
    setShowMatchmakingModal(false);
    if (vsBot) {
      router.push('/room/ai');
    } else {
      try {
        const roomCode = await handleCreateRoom(false);
        if (roomCode) {
          router.push(`/room/${roomCode}`);
        } else {
          router.push('/room/ai');
        }
      } catch {
        router.push('/room/ai');
      }
    }
  };

  const handleSelectPuzzle = (puzzle: ChessPuzzle) => {
    setShowPuzzlesModal(false);
    router.push(`/room/puzzle-${puzzle.id}`);
  };

  const handleSidebarTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') router.push('/');
    else if (tab === 'play') setShowMatchmakingModal(true);
    else if (tab === 'tournaments') setShowTournamentsModal(true);
    else if (tab === 'puzzles') setShowPuzzlesModal(true);
    else if (tab === 'friends') setActiveTab('friends');
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-row font-sans selection:bg-purple-600 selection:text-white">
      {/* Global Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <ChesslySidebar
          activeTab={activeTab}
          onSelectTab={handleSidebarTab}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenPremium={() => alert('Chessly Premium: All features, analysis, and unlimited games unlocked!')}
        />
      </div>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChesslyHeader
          username={currentUsername}
          rating={currentRating}
          avatarUrl="/images/avatar_zuhriddin.jpg"
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenNotifications={() => alert('No new notifications')}
          onSearch={(query) => console.log('Searching:', query)}
        />

        {/* Scrollable Content Container */}
        <main className="flex-1 p-5 lg:p-7 space-y-6 max-w-[1560px] w-full mx-auto overflow-y-auto">
          {/* Top Hero Banner */}
          <HeroBanner
            onPlayNow={() => setShowMatchmakingModal(true)}
            onLearnMore={() => setShowPuzzlesModal(true)}
          />

          {/* 4 Quick Action Cards */}
          <QuickActions
            onQuickPlay={() => setShowMatchmakingModal(true)}
            onPlayOnline={() => setShowMatchmakingModal(true)}
            onTournaments={() => setShowTournamentsModal(true)}
            onPractice={() => setShowPuzzlesModal(true)}
          />

          {/* 3-Column Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Play Online Card (span 5) */}
            <div className="lg:col-span-5 h-full">
              <PlayOnlineWidget
                onStartMatch={(color, timeControl, rated) =>
                  handleStartMatchmaking(color, timeControl, rated, false)
                }
                onCreateGame={() => setShowMatchmakingModal(true)}
              />
            </div>

            {/* Middle Column: Recent Games & Top Players (span 4) */}
            <div className="lg:col-span-4 flex flex-col space-y-5">
              <RecentGamesWidget
                onViewAll={() => setShowProfileModal(true)}
                onSelectGame={() => router.push('/room/ai')}
              />
              <TopPlayersWidget
                onViewAll={() => setShowTournamentsModal(true)}
                onSelectPlayer={(name) => alert(`Player profile for ${name}`)}
              />
            </div>

            {/* Right Column: Tournaments & Friends & Quote (span 3) */}
            <div className="lg:col-span-3 flex flex-col space-y-5">
              <TournamentsWidget
                onViewAll={() => setShowTournamentsModal(true)}
                onJoinTournament={() => setShowTournamentsModal(true)}
              />
              <OnlineFriendsWidget
                onViewAll={() => alert('All Friends list')}
                onSelectFriend={(friend) => {
                  if (confirm(`Challenge ${friend} to a friendly game?`)) {
                    setShowMatchmakingModal(true);
                  }
                }}
              />
              <QuoteCardWidget />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <MatchmakingModal
        isOpen={showMatchmakingModal}
        onClose={() => setShowMatchmakingModal(false)}
        onStartGame={handleStartMatchmaking}
      />

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        username={currentUsername}
        rating={currentRating}
        stats={userStats}
        onUpdateUsername={(newName) => handleLogin(newName)}
      />

      <TournamentsModal
        isOpen={showTournamentsModal}
        onClose={() => setShowTournamentsModal(false)}
        onRegister={(tId) => alert(`Successfully registered for ${tId}!`)}
      />

      <PuzzlesModal
        puzzles={PUZZLES_DATA}
        onSelectPuzzle={handleSelectPuzzle}
        onClose={() => setShowPuzzlesModal(false)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        boardTheme={boardTheme}
        onChangeBoardTheme={(t) => {
          setBoardTheme(t);
          if (typeof window !== 'undefined') {
            localStorage.setItem('shohmot_board_theme', t);
          }
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        is3D={is3D}
        onToggle3D={() => {
          const next = !is3D;
          setIs3D(next);
          if (typeof window !== 'undefined') {
            localStorage.setItem('shohmot_board_view_3d', JSON.stringify(next));
          }
        }}
      />
    </div>
  );
}
