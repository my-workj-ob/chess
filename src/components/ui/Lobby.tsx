'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe, ShieldAlert, Plus, LogIn, RefreshCw, Play,
  Clock, Lock, Unlock, Trophy, Zap,
  RotateCcw, Wifi, WifiOff, History, Crown
} from 'lucide-react';
import { GameRoom, User } from '@/lib/db/schema';

interface RoomHistoryEntry {
  code: string;
  isPrivate: boolean;
  status: 'waiting' | 'active' | 'finished';
  createdAt: number;
  opponentName?: string;
}

interface LobbyProps {
  username: string;
  userRating: number;
  userStats: { wins: number; losses: number; draws: number } | null;
  onJoinRoom: (code: string) => void;
  onCreateRoom: (isPrivate: boolean) => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  username,
  userRating,
  userStats,
  onJoinRoom,
  onCreateRoom,
}) => {
  const [publicRooms, setPublicRooms] = useState<GameRoom[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [inputCode, setInputCode] = useState('');
  const [isPrivateCreate, setIsPrivateCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomHistory, setRoomHistory] = useState<RoomHistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'leaderboard'>('create');

  const loadRoomHistory = useCallback(() => {
    try {
      const key = 'apex_chess_room_history_' + username;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: RoomHistoryEntry[] = JSON.parse(stored);
        setRoomHistory(parsed.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10));
      }
    } catch { /* ignore */ }
  }, [username]);

  const fetchLobbyData = async () => {
    try {
      const res = await fetch('/api/lobby');
      const data = await res.json();
      if (data.success) {
        setPublicRooms(data.rooms || []);
        setTopUsers(data.topUsers || []);
      }
    } catch (err) {
      console.error('Lobby fetch error:', err);
    }
  };

  useEffect(() => {
    fetchLobbyData();
    loadRoomHistory();
    const interval = setInterval(fetchLobbyData, 3000);
    return () => clearInterval(interval);
  }, [loadRoomHistory]);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      await onCreateRoom(isPrivateCreate);
    } catch (err: any) {
      setError(err.message || 'Xona yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (codeToJoin: string) => {
    const cleanCode = codeToJoin.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      setError("Xona kodi 6 ta belgidan iborat bo'lishi kerak!");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onJoinRoom(cleanCode);
    } catch (err: any) {
      setError(err.message || 'Xonaga ulanishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleRejoin = async (entry: RoomHistoryEntry) => {
    setLoading(true);
    setError('');
    try {
      await onJoinRoom(entry.code);
    } catch (err: any) {
      setError(err.message || 'Xonaga qayta ulanishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleReopen = async (_entry: RoomHistoryEntry) => {
    setLoading(true);
    setError('');
    try {
      await onCreateRoom(_entry.isPrivate);
    } catch (err: any) {
      setError(err.message || 'Xona yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: RoomHistoryEntry['status']) => {
    if (status === 'active') {
      return (
        <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
          <Wifi size={8} />Faol
        </span>
      );
    }
    if (status === 'waiting') {
      return (
        <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
          <Clock size={8} />Kutmoqda
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/40">
        <WifiOff size={8} />Tugadi
      </span>
    );
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return days + ' kun oldin';
    if (hours > 0) return hours + ' soat oldin';
    if (mins > 0) return mins + ' daqiqa oldin';
    return 'Hozirgina';
  };

  const MEDAL_1 = '\uD83E\uDD47';
  const MEDAL_2 = '\uD83E\uDD48';
  const MEDAL_3 = '\uD83E\uDD49';

  return (
    <div className="w-full max-w-md mx-auto px-0 py-4 space-y-4">

      {/* Player Stats Card */}
      <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-4 flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-700/30 border border-violet-500/30 flex items-center justify-center text-2xl shadow-lg">
            &#9823;
          </div>
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#111827]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white tracking-wide truncate">{username}</h2>
              <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">&#9679; Online</p>
            </div>
            <button
              onClick={fetchLobbyData}
              className="p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700/70 transition active:scale-90"
              title="Yangilash"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1 mt-2.5 text-center">
            <div className="bg-[#0d1321] rounded-xl py-1.5">
              <div className="flex items-center justify-center gap-0.5 text-amber-400 font-black text-xs">
                <Trophy size={9} className="mt-px" />{userRating}
              </div>
              <div className="text-[8px] text-slate-600 uppercase tracking-wider mt-0.5">ELO</div>
            </div>
            <div className="bg-[#0d1321] rounded-xl py-1.5">
              <div className="text-xs font-black text-emerald-400">{userStats?.wins || 0}</div>
              <div className="text-[8px] text-slate-600 mt-0.5">G&apos;alaba</div>
            </div>
            <div className="bg-[#0d1321] rounded-xl py-1.5">
              <div className="text-xs font-black text-rose-400">{userStats?.losses || 0}</div>
              <div className="text-[8px] text-slate-600 mt-0.5">Mag&apos;lub</div>
            </div>
            <div className="bg-[#0d1321] rounded-xl py-1.5">
              <div className="text-xs font-black text-slate-300">{userStats?.draws || 0}</div>
              <div className="text-[8px] text-slate-600 mt-0.5">Durang</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs px-4 py-3 rounded-2xl flex items-center gap-2">
          <ShieldAlert size={14} className="text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex bg-[#0d1321] border border-slate-800/80 rounded-2xl p-1 gap-1">
        <button
          onClick={() => setActiveTab('create')}
          className={'flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-xl transition-all ' + (activeTab === 'create' ? 'bg-violet-600 text-white shadow-md shadow-violet-900/50' : 'text-slate-500 hover:text-slate-300')}
        >
          <Plus size={11} />
          Yangi O&apos;yin
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={'flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-xl transition-all ' + (activeTab === 'history' ? 'bg-violet-600 text-white shadow-md shadow-violet-900/50' : 'text-slate-500 hover:text-slate-300')}
        >
          <History size={11} />
          Tarix
          {roomHistory.length > 0 && (
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500/90 text-slate-950 text-[8px] font-black flex items-center justify-center">
              {roomHistory.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={'flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-xl transition-all ' + (activeTab === 'leaderboard' ? 'bg-violet-600 text-white shadow-md shadow-violet-900/50' : 'text-slate-500 hover:text-slate-300')}
        >
          <Crown size={11} />
          Reyting
        </button>
      </div>

      {/* CREATE TAB */}
      {activeTab === 'create' && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Plus size={13} className="text-violet-400" />
              Yangi O&apos;yin Yaratish
            </h3>

            <div className="flex bg-[#0d1321] p-1 rounded-2xl border border-slate-800/60 gap-1">
              <button
                onClick={() => setIsPrivateCreate(false)}
                className={'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ' + (!isPrivateCreate ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200')}
              >
                <Globe size={12} />
                Ochiq (Public)
              </button>
              <button
                onClick={() => setIsPrivateCreate(true)}
                className={'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all ' + (isPrivateCreate ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200')}
              >
                <Lock size={12} />
                Yopiq (Private)
              </button>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed px-0.5 flex items-start gap-1.5">
              <Globe size={10} className="mt-0.5 shrink-0 text-slate-600" />
              {isPrivateCreate
                ? "Yopiq xonalar ochiq royxatda korinmaydi. Raqibingizga 6 xonali kodni yuboring."
                : "Ochiq xonalar barcha oyinchilarga korinadi va istalgan kishi togridantogri qoshilishi mumkin."}
            </p>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus size={16} strokeWidth={3} />
              {loading ? 'Yaratilmoqda...' : '+ Xona Yaratish'}
            </button>
          </div>

          <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <LogIn size={13} className="text-emerald-400" />
              Kod Orqali Ulanish
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Xona kodini kiriting..."
                maxLength={6}
                className="flex-1 px-4 py-3 bg-[#0d1321] border border-slate-800/60 rounded-2xl font-mono text-sm tracking-widest text-slate-100 placeholder-slate-700 uppercase focus:border-violet-500/60 focus:outline-none transition"
              />
              <button
                onClick={() => handleJoin(inputCode)}
                disabled={loading || inputCode.length !== 6}
                className="px-4 py-3 bg-violet-600 text-white font-black text-xs rounded-2xl disabled:opacity-40 hover:bg-violet-500 active:scale-95 transition shadow-lg"
              >
                Ulanish
              </button>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Globe size={13} className="text-indigo-400" />
              Ochiq Xonalar
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-black">{publicRooms.length}</span>
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {publicRooms.length === 0 ? (
                <div className="py-5 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl mb-2">&#128164;</span>
                  <p className="text-xs text-slate-500">Hozircha ochiq xonalar yoq.</p>
                </div>
              ) : (
                publicRooms.map((room) => {
                  const isFull = Boolean(room.white_player && room.black_player);
                  return (
                    <div
                      key={room.code}
                      className="p-3 bg-[#0d1321] rounded-2xl border border-slate-800/60 flex items-center justify-between gap-2 hover:border-slate-700/80 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-violet-400 tracking-widest">{room.code}</span>
                          <span className={'w-1.5 h-1.5 rounded-full ' + (isFull ? 'bg-rose-500' : 'bg-emerald-500')} />
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                          {room.white_player || 'Nomalum'} vs {room.black_player || 'Kutilmoqda...'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoin(room.code)}
                        disabled={isFull}
                        className={'px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1 transition ' + (isFull ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95')}
                      >
                        <Play size={9} strokeWidth={3} />
                        {isFull ? 'Toliq' : 'Qoshil'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-5 space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <History size={13} className="text-amber-400" />
            Serverlar Tarixi
          </h3>

          {roomHistory.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-3">&#127963;</span>
              <p className="text-sm font-bold text-slate-400">Hali xona tarixi yoq</p>
              <p className="text-[10px] text-slate-600 mt-1">Xona yaratgach, u bu yerda saqlanadi</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {roomHistory.map((entry) => (
                <div
                  key={entry.code}
                  className="p-3.5 bg-[#0d1321] rounded-2xl border border-slate-800/60 hover:border-slate-700/80 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {entry.isPrivate ? (
                        <Lock size={10} className="text-slate-500" />
                      ) : (
                        <Unlock size={10} className="text-slate-500" />
                      )}
                      <span className="font-mono text-sm font-black text-violet-400 tracking-widest">{entry.code}</span>
                      {getStatusBadge(entry.status)}
                    </div>
                    <span className="text-[9px] text-slate-600 shrink-0">{timeAgo(entry.createdAt)}</span>
                  </div>

                  {entry.opponentName && (
                    <p className="text-[10px] text-slate-500 mb-2">
                      Raqib: <span className="text-slate-300 font-semibold">{entry.opponentName}</span>
                    </p>
                  )}

                  <div className="flex gap-2">
                    {(entry.status === 'waiting' || entry.status === 'active') && (
                      <button
                        onClick={() => handleRejoin(entry)}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 active:scale-95 transition"
                      >
                        <Wifi size={11} />
                        Qayta Kirish
                      </button>
                    )}
                    <button
                      onClick={() => handleReopen(entry)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/25 hover:bg-violet-500/25 active:scale-95 transition"
                    >
                      <RotateCcw size={11} />
                      Qayta Ochish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-5 space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Crown size={13} className="text-amber-400" />
            Top Reytinglar
          </h3>

          <div className="space-y-2">
            {topUsers.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <p className="text-xs text-slate-500">Reyting jadvali bosh.</p>
              </div>
            ) : (
              topUsers.map((user, idx) => {
                const isCurrentUser = user.username === username;
                const medals = [MEDAL_1, MEDAL_2, MEDAL_3];
                const medal = idx < 3 ? medals[idx] : null;

                return (
                  <div
                    key={user.username}
                    className={'p-3 rounded-2xl border flex items-center gap-3 transition ' + (isCurrentUser ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#0d1321] border-slate-800/60')}
                  >
                    <span className="w-6 text-center text-sm font-black shrink-0">
                      {medal ? medal : <span className="text-slate-600 text-xs">{idx + 1}</span>}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={'text-xs font-black truncate ' + (isCurrentUser ? 'text-amber-300' : 'text-slate-200')}>
                          {user.username}
                        </span>
                        {isCurrentUser && <Zap size={10} className="text-amber-400 shrink-0" />}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        {user.wins}G &#183; {user.losses}M &#183; {user.draws}D
                      </div>
                    </div>

                    <div className={'text-sm font-black shrink-0 ' + (isCurrentUser ? 'text-amber-400' : 'text-slate-300')}>
                      {user.rating}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
