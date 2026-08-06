'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Globe, Trophy, Clock, Users, ArrowRight, Loader2, ShieldAlert, CheckCircle } from 'lucide-react';

interface RoomInfo {
  code: string;
  white_player: string | null;
  black_player: string | null;
  white_player_rating?: number;
  black_player_rating?: number;
  status: 'waiting' | 'active' | 'finished';
  is_private: boolean;
}

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  // Next.js 15+: params is a Promise, must be unwrapped with React.use()
  const { code: rawCode } = use(params);
  const code = rawCode?.toUpperCase();

  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState('');

  // User auth
  const [username, setUsername] = useState('');
  const [savedUsername, setSavedUsername] = useState<string | null>(null);

  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chess_username');
      if (saved) setSavedUsername(saved);
    }
  }, []);

  useEffect(() => {
    if (!code) return;
    setLoadingRoom(true);
    fetch(`/api/room/${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.room) {
          setRoom(data.room);
        } else {
          setRoomError('Xona topilmadi yoki mavjud emas.');
        }
      })
      .catch(() => setRoomError("Serverga ulanib bo'lmadi."))
      .finally(() => setLoadingRoom(false));
  }, [code]);

  // Auto-redirect: if already a player in this room, go directly
  useEffect(() => {
    if (!room || !savedUsername) return;
    const isAlreadyPlayer =
      room.white_player?.toLowerCase() === savedUsername.toLowerCase() ||
      room.black_player?.toLowerCase() === savedUsername.toLowerCase();
    if (isAlreadyPlayer && room.status !== 'finished') {
      router.replace(`/room/${code}`);
    }
  }, [room, savedUsername, code, router]);

  const handleJoin = async () => {
    const activeUsername = (savedUsername || username).trim();
    if (!activeUsername || activeUsername.length < 3) {
      setJoinError("Ism kamida 3 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    setJoining(true);
    setJoinError('');
    try {
      // Register/login user first
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: activeUsername }),
      });

      // Save username
      localStorage.setItem('chess_username', activeUsername);

      // Join the room
      const res = await fetch(`/api/room/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: activeUsername }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/room/${code}`);
      } else {
        setJoinError(data.error || "Xonaga ulanib bo'lmadi");
      }
    } catch {
      setJoinError('Xonaga ulanishda xatolik yuz berdi');
    } finally {
      setJoining(false);
    }
  };

  // Determine if current user is already in this room
  const activeUsername = savedUsername || username;
  const isAlreadyInRoom =
    room &&
    activeUsername &&
    (room.white_player?.toLowerCase() === activeUsername.toLowerCase() ||
      room.black_player?.toLowerCase() === activeUsername.toLowerCase());

  return (
    <div className="min-h-screen bg-[#070A13] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-3xl mb-4">
            ♟️
          </div>
          <h1 className="text-xl font-black text-white">Xonaga Kirish</h1>
          <p className="text-xs text-slate-500 mt-1">Taklif havolasi orqali kirdingiz</p>
        </div>

        {/* Room Info Card */}
        <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-5 mb-4 space-y-4">
          {loadingRoom ? (
            <div className="flex items-center justify-center py-6 gap-3">
              <Loader2 className="animate-spin text-violet-400" size={20} />
              <span className="text-sm text-slate-400 font-bold">Xona ma&apos;lumotlari yuklanmoqda...</span>
            </div>
          ) : roomError ? (
            <div className="flex items-center gap-3 py-4 text-rose-400">
              <ShieldAlert size={18} />
              <span className="text-sm font-bold">{roomError}</span>
            </div>
          ) : room ? (
            <>
              {/* Room Code + Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {room.is_private ? (
                    <Lock size={14} className="text-amber-400" />
                  ) : (
                    <Globe size={14} className="text-emerald-400" />
                  )}
                  <span className="font-mono text-lg font-black text-violet-400 tracking-widest">{code}</span>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    room.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : room.status === 'waiting'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-slate-700/50 text-slate-500 border-slate-600/30'
                  }`}
                >
                  {room.status === 'active' ? '🟢 Faol' : room.status === 'waiting' ? '⏳ Kutmoqda' : '⛔ Tugadi'}
                </span>
              </div>

              {/* Players */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#0d1321] rounded-2xl p-3">
                  <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="text-slate-400">⬜</span> Oq
                  </div>
                  <div className="text-xs font-black text-slate-200 truncate flex items-center gap-1">
                    {room.white_player || <span className="text-slate-600">Kutilmoqda...</span>}
                    {room.white_player?.toLowerCase() === activeUsername?.toLowerCase() && (
                      <CheckCircle size={10} className="text-emerald-400 shrink-0" />
                    )}
                  </div>
                  {room.white_player_rating && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Trophy size={8} className="text-amber-400" />
                      <span className="text-[9px] text-amber-400 font-bold">{room.white_player_rating}</span>
                    </div>
                  )}
                </div>
                <div className="bg-[#0d1321] rounded-2xl p-3">
                  <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="text-slate-800">⬛</span> Qora
                  </div>
                  <div className="text-xs font-black text-slate-200 truncate flex items-center gap-1">
                    {room.black_player || <span className="text-slate-600">Kutilmoqda...</span>}
                    {room.black_player?.toLowerCase() === activeUsername?.toLowerCase() && (
                      <CheckCircle size={10} className="text-emerald-400 shrink-0" />
                    )}
                  </div>
                  {room.black_player_rating && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Trophy size={8} className="text-amber-400" />
                      <span className="text-[9px] text-amber-400 font-bold">{room.black_player_rating}</span>
                    </div>
                  )}
                </div>
              </div>

              {room.status === 'finished' && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-center">
                  <p className="text-xs text-rose-400 font-bold">Bu o&apos;yin allaqachon tugagan</p>
                </div>
              )}

              {room.is_private && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                  <Lock size={11} className="text-amber-400 shrink-0" />
                  <span className="text-[10px] text-amber-300 font-semibold">
                    Yopiq xona — faqat havolaga ega kishilar kirishi mumkin
                  </span>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Action Section */}
        {!loadingRoom && !roomError && room && room.status !== 'finished' && (
          <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-5 space-y-4">

            {/* Already in room — just re-enter */}
            {isAlreadyInRoom ? (
              <>
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3">
                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-emerald-300">Siz bu xonada o&apos;ynaysiz!</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{activeUsername}</div>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/room/${code}`)}
                  className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <ArrowRight size={16} strokeWidth={3} />
                  O&apos;yinga Qaytish
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-violet-400" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Kimligingizni tanishtiring</h3>
                </div>

                {savedUsername ? (
                  <div className="flex items-center gap-3 bg-violet-600/10 border border-violet-500/25 rounded-2xl p-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-base">
                      ♟️
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-black text-violet-300">{savedUsername}</div>
                      <div className="text-[9px] text-slate-500">Saqlangan profil</div>
                    </div>
                    <button
                      onClick={() => setSavedUsername(null)}
                      className="text-[10px] text-slate-500 hover:text-slate-300 transition underline"
                    >
                      O&apos;zgartirish
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                      placeholder="Ismingizni kiriting..."
                      maxLength={20}
                      autoFocus
                      className="w-full px-4 py-3 bg-[#0d1321] border border-slate-800/60 rounded-2xl text-sm text-slate-100 placeholder-slate-700 focus:border-violet-500/60 focus:outline-none transition"
                    />
                    <p className="text-[9px] text-slate-600 px-0.5">Kamida 3 ta belgi</p>
                  </div>
                )}

                {joinError && (
                  <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/25 rounded-xl px-3 py-2">
                    <ShieldAlert size={11} className="text-rose-400 shrink-0" />
                    <span className="text-[10px] text-rose-300">{joinError}</span>
                  </div>
                )}

                <button
                  onClick={handleJoin}
                  disabled={joining || (!savedUsername && username.trim().length < 3)}
                  className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {joining ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Ulanmoqda...
                    </>
                  ) : (
                    <>
                      <ArrowRight size={16} strokeWidth={3} />
                      Xonaga Kirish
                    </>
                  )}
                </button>
              </>
            )}

            <button
              onClick={() => router.push('/')}
              className="w-full py-2 rounded-xl text-[10px] font-black bg-transparent text-slate-600 hover:text-slate-400 transition"
            >
              ← Bosh sahifaga qaytish
            </button>
          </div>
        )}

        {/* Room finished */}
        {!loadingRoom && !roomError && room && room.status === 'finished' && (
          <button
            onClick={() => router.push('/')}
            className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            🏠 Bosh Sahifaga Qaytish
          </button>
        )}

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-700">
          <Clock size={10} />
          <span>Xonalar 24 soat o&apos;tgach avtomatik o&apos;chiriladi</span>
        </div>
      </div>
    </div>
  );
}
