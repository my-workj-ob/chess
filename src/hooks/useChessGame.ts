'use client';

import { useState, useEffect, useRef } from 'react';
import { ChessEngine } from '@/lib/engine/chessEngine';
import { getBestAIMove } from '@/lib/engine/aiEngine';
import { sounds } from '@/lib/audio/soundEffects';
import { ChessPuzzle } from '@/lib/puzzles/puzzleData';
import { Position, PieceType, Move } from '@/lib/engine/types';
import { GameMode } from '@/components/ui/ModeTabs';

export function useChessGame(initialRoomCode?: string) {
  const engineRef = useRef<ChessEngine>(new ChessEngine());
  const [engineState, setEngineState] = useState(engineRef.current.state);
  const [mode, setMode] = useState<GameMode>(
    initialRoomCode && !initialRoomCode.startsWith('puzzle-') ? 'online' : 'ai'
  );
  const [botMode, setBotMode] = useState<'none' | 'both'>('none');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [username, setUsername] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chess_username') || null;
    }
    return null;
  });

  // User Rating and Stats
  const [userRating, setUserRating] = useState<number>(1200);
  const [userStats, setUserStats] = useState<{ wins: number; losses: number; draws: number } | null>(null);

  // Multiplayer Game States
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'active' | 'finished' | null>(null);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [opponentRating, setOpponentRating] = useState<number | null>(null);
  const [lastChat, setLastChat] = useState<string | null>(null);

  // Bot switching state: tracks whether bot is playing both sides (only for non-online)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [pendingPromotion, setPendingPromotion] = useState<{ from: Position; to: Position } | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showPuzzlesModal, setShowPuzzlesModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDrawOffer, setShowDrawOffer] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(initialRoomCode || null);

  const fenHistoryRef = useRef<string[]>([]);
  const repetitionHistoryRef = useRef<Map<string, number>>(new Map());
  const lastAppliedRemoteFenRef = useRef<string | null>(null);
  const lastRemoteUpdateRef = useRef<number | null>(null);
  const roomStatusRef = useRef<'waiting' | 'active' | 'finished' | null>(null);
  const botMoveLockRef = useRef(false);
  const [gameResult, setGameResult] = useState<{ winner: string; reason: string; isDraw: boolean } | null>(null);

  // Fetch or register user ELO profile
  const fetchUserProfile = async (name: string) => {
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUserRating(data.user.rating);
        setUserStats({
          wins: data.user.wins,
          losses: data.user.losses,
          draws: data.user.draws,
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    const isOnlineRoom = initialRoomCode &&
      !initialRoomCode.startsWith('puzzle-') &&
      initialRoomCode !== 'ai' &&
      initialRoomCode !== 'pass';

    if (isOnlineRoom && username) {
      setMode('online');
      setBotMode('none');
      handleJoinRoom(initialRoomCode, username)
        .catch((err) => {
          console.error('Failed to join room from URL:', err);
        });
    }

    if (isOnlineRoom && !username) {
      setShowLoginModal(true);
    }
  }, [initialRoomCode, username]);

  useEffect(() => {
    roomStatusRef.current = roomStatus;
  }, [roomStatus]);

  // Clear lastChat bubble after 3 seconds
  useEffect(() => {
    if (lastChat) {
      const timer = setTimeout(() => {
        setLastChat(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastChat]);

  const handleLogin = async (name: string) => {
    setUsername(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chess_username', name);
    }
    await fetchUserProfile(name);
    setShowLoginModal(false);
  };

  const updateState = () => setEngineState({ ...engineRef.current.state });

  // Repetition check helper (if FEN repeated 3 times in history)
  const checkRepetition = (fen: string) => {
    const key = `${fen} ${engineRef.current.state.turn}`;
    const currentCount = repetitionHistoryRef.current.get(key) ?? 0;
    const nextCount = currentCount + 1;
    repetitionHistoryRef.current.set(key, nextCount);

    if (nextCount >= 3) {
      if (mode === 'online') {
        handleFinishOnlineGame('draw');
      } else {
        setGameResult({ winner: 'Durrang', reason: 'Uch martalik takrorlash', isDraw: true });
        setShowDrawOffer(true);
      }
    }
  };

  // AI Move Trigger (both standard AI mode and bot-vs-bot switching)
  // IMPORTANT: Never triggers in online mode
  useEffect(() => {
    if (mode === 'online') {
      botMoveLockRef.current = false;
      return;
    }

    // Standard AI mode: bot plays black
    const isAiTurn = mode === 'ai' && engineState.turn === 'b';
    // Bot mode: bot plays the current turn (both colors) in non-online modes
    const isBotBothTurn = botMode === 'both' && mode !== 'puzzle';

    if ((isAiTurn || isBotBothTurn) && !engineState.isCheckmate && !engineState.isStalemate && !showDrawOffer && !gameResult) {
      const botColor = engineState.turn;
      if (botMoveLockRef.current) return;
      botMoveLockRef.current = true;

      const timer = setTimeout(() => {
        const legalMoves = engineRef.current.getLegalMoves();
        const aiMove = legalMoves.length ? getBestAIMove(engineState.board, botColor, difficulty) : null;

        if (aiMove && engineRef.current.makeMove(aiMove)) {
          if (aiMove.captured) sounds.playCapture();
          else sounds.playMove();
          if (engineRef.current.state.isCheck) sounds.playCheck();
          updateState();
          checkRepetition(engineRef.current.getFen());
        }
        botMoveLockRef.current = false;
      }, 400);

      return () => {
        clearTimeout(timer);
        botMoveLockRef.current = false;
      };
    }
    botMoveLockRef.current = false;
    return undefined;
  }, [engineState.turn, mode, difficulty, showDrawOffer, botMode, engineState.board, engineState.isCheckmate, engineState.isStalemate, gameResult]);

  // Realtime SSE Sync for Online Mode
  useEffect(() => {
    if (mode !== 'online' || !roomCode) return;

    const eventSource = new EventSource(`/api/room/${roomCode}/stream`);
    eventSource.onmessage = (event) => {
      try {
        const room = JSON.parse(event.data);
        if (!room) return;

        const incomingUpdatedAt = typeof room.updated_at === 'number' ? room.updated_at : 0;
        const isDuplicate = incomingUpdatedAt && lastRemoteUpdateRef.current && incomingUpdatedAt <= lastRemoteUpdateRef.current;
        if (isDuplicate && room.fen === lastAppliedRemoteFenRef.current) {
          return;
        }
        if (incomingUpdatedAt && lastRemoteUpdateRef.current && incomingUpdatedAt < lastRemoteUpdateRef.current) {
          return;
        }

        if (room.fen) {
          if (room.fen !== lastAppliedRemoteFenRef.current) {
            engineRef.current.loadFen(room.fen);
            lastAppliedRemoteFenRef.current = room.fen;
            if (incomingUpdatedAt) {
              lastRemoteUpdateRef.current = incomingUpdatedAt;
            }
            sounds.playMove();
            updateState();
          } else if (incomingUpdatedAt) {
            lastRemoteUpdateRef.current = incomingUpdatedAt;
          }
        }

        const oldStatus = roomStatusRef.current;
        setRoomStatus(room.status);
        roomStatusRef.current = room.status;
        setLastChat(room.last_chat);

        if (username) {
          if (room.white_player === username) {
            setPlayerColor('w');
            setOpponentName(room.black_player);
            setOpponentRating(room.black_player_rating || 1200);
          } else if (room.black_player === username) {
            setPlayerColor('b');
            setOpponentName(room.white_player);
            setOpponentRating(room.white_player_rating || 1200);
          } else {
            setPlayerColor(null);
            setOpponentName(room.white_player);
            setOpponentRating(room.white_player_rating || 1200);
          }
        }

        if (room.status === 'finished' && oldStatus !== 'finished') {
          if (username) {
            fetchUserProfile(username);
          }
          let winnerName = 'Durrang';
          let isDraw = true;
          if (room.winner === 'w') {
            winnerName = 'Oqlar';
            isDraw = false;
          } else if (room.winner === 'b') {
            winnerName = 'Qoralar';
            isDraw = false;
          } else if (room.winner && room.winner !== 'draw') {
            winnerName = room.winner;
            isDraw = false;
          }
          setGameResult({
            winner: winnerName,
            reason: room.winner === 'draw' ? `Kelishuvga ko\\'ra durrang` : `Taslim bo\\'ldi yoki shoh va mot`,
            isDraw: isDraw
          });
          setShowGameOver(true);
        }
      } catch (err) {
        console.error('SSE Error processing message:', err);
      }
    };

    return () => eventSource.close();
  }, [mode, roomCode, username]);

  const handleFinishOnlineGame = (winner: string | null) => {
    if (!roomCode) return;
    fetch(`/api/room/${roomCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fen: engineRef.current.getFen(),
        turn: engineRef.current.state.turn,
        move: 'GAME_OVER',
        status: 'finished',
        winner: winner,
      }),
    }).catch(() => {});
  };

  const handleMakeMove = (from: Position, to: Position, promotionPiece?: PieceType) => {
    if (gameResult || engineState.isCheckmate || engineState.isStalemate) return;

    const piece = engineState.board[from.r][from.c];
    if (!piece) return;

    // Multiplayer validation
    if (mode === 'online') {
      if (!playerColor) return; // Spectator
      if (engineState.turn !== playerColor) return; // Out of turn
      if (piece.color !== playerColor) return; // Cannot move opponent's piece
      if (roomStatus !== 'active') return; // Game is not active
    }

    if (piece.type === 'p' && (piece.color === 'w' ? to.r === 0 : to.r === 7) && !promotionPiece) {
      setPendingPromotion({ from, to });
      return;
    }

    const moveAttempt: Move = { from, to, piece, promotion: promotionPiece };
    if (engineRef.current.makeMove(moveAttempt)) {
      const isCapture = Boolean(engineState.board[to.r][to.c]);
      if (isCapture) sounds.playCapture();
      else sounds.playMove();

      if (engineRef.current.state.isCheck) sounds.playCheck();
      if (engineRef.current.state.isCheckmate) sounds.playVictory();
      updateState();
      
      const newFen = engineRef.current.getFen();
      lastAppliedRemoteFenRef.current = newFen;
      lastRemoteUpdateRef.current = Date.now();
      checkRepetition(newFen);

      if (mode === 'online' && roomCode) {
        const isMate = engineRef.current.state.isCheckmate;
        const isStale = engineRef.current.state.isStalemate;
        
        let status: 'active' | 'finished' = 'active';
        let winnerName: string | null = null;

        if (isMate) {
          status = 'finished';
          // turn has already toggled, so the winner is the one who just made the move (playerColor)
          winnerName = playerColor === 'w' ? 'w' : 'b';
        } else if (isStale) {
          status = 'finished';
          winnerName = 'draw';
        }

        fetch(`/api/room/${roomCode}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fen: newFen,
            turn: engineRef.current.state.turn,
            move: `${from.r}${from.c}-${to.r}${to.c}`,
            status: status,
            winner: winnerName,
          }),
        })
          .then(async (response) => {
            const data = await response.json().catch(() => null);
            if (data?.room?.updated_at) {
              lastRemoteUpdateRef.current = Number(data.room.updated_at);
            }
          })
          .catch(() => {});
      }
    }
  };

  const handleRestart = () => {
    engineRef.current = new ChessEngine();
    fenHistoryRef.current = [];
    repetitionHistoryRef.current.clear();
    setGameResult(null);
    updateState();
    setShowGameOver(false);
    setShowDrawOffer(false);
    
    if (mode === 'online') {
      setRoomCode(null);
      setRoomStatus(null);
      roomStatusRef.current = null;
      setPlayerColor(null);
      setOpponentName(null);
      setOpponentRating(null);
      setIsPlaying(false);
    }
    lastAppliedRemoteFenRef.current = null;
    lastRemoteUpdateRef.current = null;
  };

  const handleUndo = () => {
    if (mode === 'online') return; // Undo is not allowed in online mode
    if (mode === 'ai') {
      engineRef.current.undoMove();
      engineRef.current.undoMove();
    } else {
      engineRef.current.undoMove();
    }
    updateState();
  };

  const handleSelectPuzzle = (puzzle: ChessPuzzle) => {
    engineRef.current = new ChessEngine(puzzle.fen);
    fenHistoryRef.current = [];
    repetitionHistoryRef.current.clear();
    setGameResult(null);
    setMode('puzzle');
    updateState();
    setShowPuzzlesModal(false);
    setIsPlaying(true);
  };


  const handleJoinRoom = async (code: string, forcedUsername?: string) => {
    const activeUsername = forcedUsername || username;
    if (!activeUsername) return;
    try {
      const res = await fetch(`/api/room/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: activeUsername }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setMode('online');
        setBotMode('none');
        engineRef.current = new ChessEngine(data.room.fen);
        lastAppliedRemoteFenRef.current = data.room.fen;
        lastRemoteUpdateRef.current = data.room.updated_at || Date.now();
        updateState();
        setRoomCode(data.room.code);
        setRoomStatus(data.room.status);
        roomStatusRef.current = data.room.status;
        
        if (data.room.white_player === activeUsername) {
          setPlayerColor('w');
          setOpponentName(data.room.black_player);
          setOpponentRating(data.room.black_player_rating || 1200);
        } else {
          setPlayerColor('b');
          setOpponentName(data.room.white_player);
          setOpponentRating(data.room.white_player_rating || 1200);
        }
        return data.room.code;
      } else {
        throw new Error(data.error || "Ulanib bo'lmadi");
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleCreateRoom = async (isPrivate: boolean) => {
    // Fallback: read from localStorage in case state hasn't hydrated yet
    const activeUsername = username || (typeof window !== 'undefined' ? localStorage.getItem('chess_username') : null);
    if (!activeUsername) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: activeUsername, is_private: isPrivate }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setMode('online');
        setBotMode('none');
        engineRef.current = new ChessEngine();
        lastAppliedRemoteFenRef.current = engineRef.current.getFen();
        lastRemoteUpdateRef.current = data.room.updated_at || Date.now();
        updateState();
        setRoomCode(data.room.code);
        setRoomStatus(data.room.status);
        roomStatusRef.current = data.room.status;
        setPlayerColor('w'); // Host is always white
        setOpponentName(null);
        setOpponentRating(null);
        return data.room.code;
      } else {
        throw new Error(data.error || "Xona yaratib bo'lmadi");
      }
    } catch (err: any) {
      throw err;
    }
  };


  // Switch current game to bot control (works only in AI and pass modes, NOT online)
  const handleSwitchToBot = () => {
    if (mode === 'online') return; // Never in online mode
    if (botMode === 'both') {
      setBotMode('none'); // Toggle off
    } else {
      setBotMode('both'); // Bot takes over both colors from current position
    }
  };

  const handleExitGame = () => {
    if (mode === 'online' && roomCode && roomStatus === 'active' && playerColor) {
      if (confirm("O'yindan chiqsangiz sizga mag'lubiyat yoziladi. Chiqishni xohlaysizmi?")) {
        const opponentColor = playerColor === 'w' ? 'b' : 'w';
        handleFinishOnlineGame(opponentColor);
        setIsPlaying(false);
        handleRestart();
      }
    } else {
      setIsPlaying(false);
      handleRestart();
    }
  };

  const handleDeclineDraw = () => {
    setShowDrawOffer(false);
    setGameResult(null);
    repetitionHistoryRef.current.clear();
  };

  return {
    engineRef, engineState, mode, setMode, difficulty, setDifficulty, soundEnabled, setSoundEnabled, username, handleLogin,
    pendingPromotion, setPendingPromotion, showGameOver, setShowGameOver, showOnlineModal, setShowOnlineModal,
    showPuzzlesModal, setShowPuzzlesModal, showLoginModal, setShowLoginModal, showDrawOffer, setShowDrawOffer,
    roomCode, setRoomCode, handleMakeMove, handleRestart, handleUndo, handleSelectPuzzle,
    userRating, userStats, playerColor, roomStatus, opponentName, opponentRating, lastChat,
    handleJoinRoom, handleCreateRoom, handleFinishOnlineGame,
    botMode, handleSwitchToBot,
    isPlaying, setIsPlaying, handleExitGame,
    gameResult, setGameResult,
    handleDeclineDraw,
  };
}

