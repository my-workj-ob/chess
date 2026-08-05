-- Users Table (Foydalanuvchilar va ularning reytinglari)
CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(50) PRIMARY KEY,
  rating INT NOT NULL DEFAULT 1200,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  draws INT NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL
);

-- Game Rooms Table (O'yin xonalari va holati)
CREATE TABLE IF NOT EXISTS rooms (
  code VARCHAR(10) PRIMARY KEY,
  fen TEXT NOT NULL,
  turn VARCHAR(2) NOT NULL,
  white_player VARCHAR(50) REFERENCES users(username) ON DELETE SET NULL,
  black_player VARCHAR(50) REFERENCES users(username) ON DELETE SET NULL,
  moves JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'finished'
  winner VARCHAR(50), -- 'w', 'b', or 'draw'
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  last_chat TEXT,
  updated_at BIGINT NOT NULL
);
