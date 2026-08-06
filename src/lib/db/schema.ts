import { sql } from './client';
import { EventEmitter } from 'events';

// Declare global type for the event emitter
declare global {
  var roomEventEmitter: EventEmitter | undefined;
}

if (!globalThis.roomEventEmitter) {
  globalThis.roomEventEmitter = new EventEmitter();
  globalThis.roomEventEmitter.setMaxListeners(100);
}
export const roomEventEmitter = globalThis.roomEventEmitter;

export interface User {
  username: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  created_at: number;
}

export interface GameRoom {
  code: string;
  fen: string;
  turn: 'w' | 'b';
  white_player: string | null;
  black_player: string | null;
  white_player_rating?: number;
  black_player_rating?: number;
  moves: string[];
  status: 'waiting' | 'active' | 'finished';
  winner: string | null; // 'w', 'b', 'draw', or username
  is_private: boolean;
  last_chat?: string | null;
  updated_at: number;
}

// Memory fallback store if DB connection string is pending setup
const memoryRooms = new Map<string, GameRoom>();
const memoryUsers = new Map<string, User>();

export async function initDatabase() {
  if (!sql) return;
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(50) PRIMARY KEY,
        rating INT NOT NULL DEFAULT 1200,
        wins INT NOT NULL DEFAULT 0,
        losses INT NOT NULL DEFAULT 0,
        draws INT NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL
      );
    `;

    // Create rooms table
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        code VARCHAR(10) PRIMARY KEY,
        fen TEXT NOT NULL,
        turn VARCHAR(2) NOT NULL,
        white_player VARCHAR(50),
        black_player VARCHAR(50),
        moves JSONB NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'waiting',
        winner VARCHAR(50),
        is_private BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at BIGINT NOT NULL
      );
    `;

    // Alter table to add columns if table already existed without them
    await sql`
      ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT FALSE;
    `;
    await sql`
      ALTER TABLE rooms ADD COLUMN IF NOT EXISTS last_chat TEXT;
    `;
  } catch (err) {
    console.error('Neon DB init error:', err);
  }
}

// --- USER OPERATIONS ---

export async function getUser(username: string): Promise<User | null> {
  const normUser = username.trim();
  if (sql) {
    try {
      await initDatabase();
      const rows = await sql`SELECT * FROM users WHERE username = ${normUser} LIMIT 1`;
      if (rows && rows.length > 0) {
        const u = rows[0];
        return {
          username: u.username,
          rating: Number(u.rating),
          wins: Number(u.wins),
          losses: Number(u.losses),
          draws: Number(u.draws),
          created_at: Number(u.created_at),
        };
      }
    } catch (err) {
      console.error('getUser DB error:', err);
    }
  }
  return memoryUsers.get(normUser.toLowerCase()) || null;
}

export async function createUser(username: string): Promise<User> {
  const normUser = username.trim();
  const user: User = {
    username: normUser,
    rating: 1200,
    wins: 0,
    losses: 0,
    draws: 0,
    created_at: Date.now(),
  };

  if (sql) {
    try {
      await initDatabase();
      await sql`
        INSERT INTO users (username, rating, wins, losses, draws, created_at)
        VALUES (${normUser}, 1200, 0, 0, 0, ${user.created_at})
        ON CONFLICT (username) DO NOTHING;
      `;
      // Fetch user again in case they already existed
      const existing = await getUser(normUser);
      if (existing) return existing;
    } catch (err) {
      console.error('createUser DB error:', err);
    }
  }

  const lowKey = normUser.toLowerCase();
  if (!memoryUsers.has(lowKey)) {
    memoryUsers.set(lowKey, user);
  }
  return memoryUsers.get(lowKey)!;
}

export async function getTopUsers(): Promise<User[]> {
  if (sql) {
    try {
      await initDatabase();
      const rows = await sql`SELECT * FROM users ORDER BY rating DESC LIMIT 10`;
      return rows.map((u) => ({
        username: u.username,
        rating: Number(u.rating),
        wins: Number(u.wins),
        losses: Number(u.losses),
        draws: Number(u.draws),
        created_at: Number(u.created_at),
      }));
    } catch (err) {
      console.error('getTopUsers DB error:', err);
    }
  }
  return Array.from(memoryUsers.values())
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
}

// Helper for rating calculation
function calculateEloChange(ratingW: number, ratingB: number, outcome: 'w' | 'b' | 'draw') {
  const K = 32;
  const expectedW = 1 / (1 + Math.pow(10, (ratingB - ratingW) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (ratingW - ratingB) / 400));

  let scoreW = 0.5;
  let scoreB = 0.5;

  if (outcome === 'w') {
    scoreW = 1;
    scoreB = 0;
  } else if (outcome === 'b') {
    scoreW = 0;
    scoreB = 1;
  }

  const changeW = Math.round(K * (scoreW - expectedW));
  const changeB = Math.round(K * (scoreB - expectedB));

  return { changeW, changeB };
}

function normalizeOutcome(outcome: string | null, whitePlayer: string | null, blackPlayer: string | null): 'w' | 'b' | 'draw' {
  if (!outcome || outcome === 'draw' || outcome === 'Draw') return 'draw';

  const value = outcome.toLowerCase().trim();
  if (value === 'w' || value === 'white') return 'w';
  if (value === 'b' || value === 'black') return 'b';
  if (whitePlayer && value === whitePlayer.toLowerCase()) return 'w';
  if (blackPlayer && value === blackPlayer.toLowerCase()) return 'b';

  return 'draw';
}

// --- ROOM OPERATIONS ---

export async function createRoom(code: string, fen: string, whitePlayer: string, isPrivate: boolean): Promise<GameRoom> {
  const room: GameRoom = {
    code,
    fen,
    turn: 'w',
    white_player: whitePlayer,
    black_player: null,
    moves: [],
    status: 'waiting',
    winner: null,
    is_private: isPrivate,
    updated_at: Date.now(),
  };

  if (sql) {
    try {
      await initDatabase();
      await sql`
        INSERT INTO rooms (code, fen, turn, white_player, black_player, moves, status, winner, is_private, updated_at)
        VALUES (${code}, ${fen}, 'w', ${whitePlayer}, NULL, ${JSON.stringify([])}, 'waiting', NULL, ${isPrivate}, ${room.updated_at})
        ON CONFLICT (code) DO NOTHING;
      `;
      return room;
    } catch (err) {
      console.error('createRoom DB error:', err);
    }
  }
  memoryRooms.set(code, room);
  return room;
}

export async function getRoom(code: string): Promise<GameRoom | null> {
  const upperCode = code.toUpperCase();
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM rooms WHERE code = ${upperCode} LIMIT 1`;
      if (rows && rows.length > 0) {
        const r = rows[0];
        const whiteUser = r.white_player ? await getUser(r.white_player) : null;
        const blackUser = r.black_player ? await getUser(r.black_player) : null;
        return {
          code: r.code,
          fen: r.fen,
          turn: r.turn,
          white_player: r.white_player,
          black_player: r.black_player,
          white_player_rating: whiteUser?.rating || 1200,
          black_player_rating: blackUser?.rating || 1200,
          moves: typeof r.moves === 'string' ? JSON.parse(r.moves) : (r.moves || []),
          status: r.status,
          winner: r.winner,
          is_private: Boolean(r.is_private),
          last_chat: r.last_chat,
          updated_at: Number(r.updated_at),
        };
      }
    } catch (err) {
      console.error('getRoom DB error:', err);
    }
  }
  const memRoom = memoryRooms.get(upperCode);
  if (memRoom) {
    const whiteUser = memRoom.white_player ? await getUser(memRoom.white_player) : null;
    const blackUser = memRoom.black_player ? await getUser(memRoom.black_player) : null;
    return {
      ...memRoom,
      white_player_rating: whiteUser?.rating || 1200,
      black_player_rating: blackUser?.rating || 1200,
      last_chat: memRoom.last_chat,
    };
  }
  return null;
}

export async function joinRoom(code: string, username: string): Promise<GameRoom | null> {
  const upperCode = code.toUpperCase();
  const room = await getRoom(upperCode);
  if (!room) return null;

  // If already joined as white or black, return room
  if (room.white_player === username || room.black_player === username) {
    return room;
  }

  // If room is full, return null
  if (room.black_player && room.white_player) {
    return null;
  }

  let updatedRoom = { ...room };
  if (!room.white_player && room.black_player !== username) {
    updatedRoom.white_player = username;
  } else if (!room.black_player && room.white_player !== username) {
    updatedRoom.black_player = username;
  }

  // If both players are now present, set status to active
  if (updatedRoom.white_player && updatedRoom.black_player) {
    updatedRoom.status = 'active';
  }
  updatedRoom.updated_at = Date.now();

  if (sql) {
    try {
      await sql`
        UPDATE rooms
        SET white_player = ${updatedRoom.white_player}, black_player = ${updatedRoom.black_player}, status = ${updatedRoom.status}, updated_at = ${updatedRoom.updated_at}
        WHERE code = ${upperCode};
      `;
      roomEventEmitter.emit(`update:${upperCode}`, updatedRoom);
      return updatedRoom;
    } catch (err) {
      console.error('joinRoom DB error:', err);
    }
  }

  memoryRooms.set(upperCode, updatedRoom);
  roomEventEmitter.emit(`update:${upperCode}`, updatedRoom);
  return updatedRoom;
}

export async function updateRoomMove(
  code: string,
  fen: string,
  turn: 'w' | 'b',
  moves: string[],
  status: 'waiting' | 'active' | 'finished',
  winner: string | null
) {
  const upperCode = code.toUpperCase();
  const existingRoom = await getRoom(upperCode);
  if (!existingRoom) return;

  const wasFinished = existingRoom.status === 'finished';
  const isFinishing = !wasFinished && status === 'finished';

  const updated_at = Date.now();

  // If game finishes, update ratings
  if (isFinishing && existingRoom.white_player && existingRoom.black_player) {
    const whiteUser = await getUser(existingRoom.white_player);
    const blackUser = await getUser(existingRoom.black_player);

    if (whiteUser && blackUser) {
      const outcome = normalizeOutcome(winner, existingRoom.white_player, existingRoom.black_player);

      const { changeW, changeB } = calculateEloChange(whiteUser.rating, blackUser.rating, outcome);

      const newRatingW = Math.max(100, whiteUser.rating + changeW);
      const newRatingB = Math.max(100, blackUser.rating + changeB);

      const isWinW = outcome === 'w';
      const isLossW = outcome === 'b';
      const isDrawW = outcome === 'draw';

      const isWinB = outcome === 'b';
      const isLossB = outcome === 'w';
      const isDrawB = outcome === 'draw';

      if (sql) {
        try {
          // Update White User
          await sql`
            UPDATE users
            SET rating = ${newRatingW},
                wins = wins + ${isWinW ? 1 : 0},
                losses = losses + ${isLossW ? 1 : 0},
                draws = draws + ${isDrawW ? 1 : 0}
            WHERE username = ${existingRoom.white_player};
          `;

          // Update Black User
          await sql`
            UPDATE users
            SET rating = ${newRatingB},
                wins = wins + ${isWinB ? 1 : 0},
                losses = losses + ${isLossB ? 1 : 0},
                draws = draws + ${isDrawB ? 1 : 0}
            WHERE username = ${existingRoom.black_player};
          `;
        } catch (err) {
          console.error('updateUserRatings DB error:', err);
        }
      }

      // Memory fallback updates
      const mWhite = memoryUsers.get(existingRoom.white_player.toLowerCase());
      if (mWhite) {
        mWhite.rating = newRatingW;
        mWhite.wins += isWinW ? 1 : 0;
        mWhite.losses += isLossW ? 1 : 0;
        mWhite.draws += isDrawW ? 1 : 0;
      }
      const mBlack = memoryUsers.get(existingRoom.black_player.toLowerCase());
      if (mBlack) {
        mBlack.rating = newRatingB;
        mBlack.wins += isWinB ? 1 : 0;
        mBlack.losses += isLossB ? 1 : 0;
        mBlack.draws += isDrawB ? 1 : 0;
      }
    }
  }

  if (sql) {
    try {
      await sql`
        UPDATE rooms
        SET fen = ${fen}, turn = ${turn}, moves = ${JSON.stringify(moves)}, status = ${status}, winner = ${winner}, updated_at = ${updated_at}
        WHERE code = ${upperCode};
      `;
    } catch (err) {
      console.error('updateRoomMove DB error:', err);
    }
  }

  const finalRoom = {
    ...existingRoom,
    fen,
    turn,
    moves,
    status,
    winner,
    updated_at,
  };

  memoryRooms.set(upperCode, finalRoom);
  
  // Fetch fresh room to ensure ratings and status are correct, then emit event
  const freshRoom = await getRoom(upperCode);
  if (freshRoom) {
    roomEventEmitter.emit(`update:${upperCode}`, freshRoom);
  }
}

export async function listPublicRooms(): Promise<GameRoom[]> {
  if (sql) {
    try {
      await initDatabase();
      // Fetch rooms that are public and active or waiting (not finished)
      const rows = await sql`
        SELECT * FROM rooms
        WHERE is_private = FALSE AND status != 'finished'
        ORDER BY updated_at DESC
        LIMIT 20;
      `;
      return rows.map((r) => ({
        code: r.code,
        fen: r.fen,
        turn: r.turn,
        white_player: r.white_player,
        black_player: r.black_player,
        moves: typeof r.moves === 'string' ? JSON.parse(r.moves) : (r.moves || []),
        status: r.status,
        winner: r.winner,
        is_private: Boolean(r.is_private),
        updated_at: Number(r.updated_at),
      }));
    } catch (err) {
      console.error('listPublicRooms DB error:', err);
    }
  }
  return Array.from(memoryRooms.values())
    .filter((r) => !r.is_private && r.status !== 'finished')
    .sort((a, b) => b.updated_at - a.updated_at)
    .slice(0, 20);
}

export async function listRoomsForUser(username: string): Promise<GameRoom[]> {
  const normUser = username.trim().toLowerCase();
  if (sql) {
    try {
      await initDatabase();
      const rows = await sql`
        SELECT * FROM rooms
        WHERE lower(white_player) = ${normUser}
          OR lower(black_player) = ${normUser}
        ORDER BY updated_at DESC
        LIMIT 20;
      `;
      return rows.map((r) => ({
        code: r.code,
        fen: r.fen,
        turn: r.turn,
        white_player: r.white_player,
        black_player: r.black_player,
        moves: typeof r.moves === 'string' ? JSON.parse(r.moves) : (r.moves || []),
        status: r.status,
        winner: r.winner,
        is_private: Boolean(r.is_private),
        last_chat: r.last_chat,
        updated_at: Number(r.updated_at),
      }));
    } catch (err) {
      console.error('listRoomsForUser DB error:', err);
    }
  }

  return Array.from(memoryRooms.values())
    .filter((room) => room.white_player?.toLowerCase() === normUser || room.black_player?.toLowerCase() === normUser)
    .sort((a, b) => b.updated_at - a.updated_at)
    .slice(0, 20);
}

export async function sendRoomChat(code: string, chatMessage: string): Promise<GameRoom | null> {
  const upperCode = code.toUpperCase();
  const room = await getRoom(upperCode);
  if (!room) return null;

  const updated_at = Date.now();
  
  if (sql) {
    try {
      await sql`
        UPDATE rooms
        SET last_chat = ${chatMessage}, updated_at = ${updated_at}
        WHERE code = ${upperCode};
      `;
    } catch (err) {
      console.error('sendRoomChat DB error:', err);
    }
  }

  const updatedRoom = {
    ...room,
    last_chat: chatMessage,
    updated_at
  };
  
  memoryRooms.set(upperCode, updatedRoom);
  
  roomEventEmitter.emit(`update:${upperCode}`, updatedRoom);
  
  return updatedRoom;
}
