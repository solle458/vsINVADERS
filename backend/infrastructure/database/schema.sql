-- VSmaze Database Schema
-- SQLite schema for VSmaze AI Battle Platform

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Games table - Main game management
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_type TEXT NOT NULL CHECK(player1_type IN ('human', 'ai', 'com')),
    player1_id TEXT,                 -- AI ID or COM level
    player2_type TEXT NOT NULL CHECK(player2_type IN ('human', 'ai', 'com')),
    player2_id TEXT,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting', 'playing', 'finished')),
    current_turn INTEGER DEFAULT 1,
    game_state TEXT,                 -- JSON format game board state
    winner TEXT CHECK(winner IN ('player1', 'player2', 'draw')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Game moves table - Move history and replay data
CREATE TABLE IF NOT EXISTS game_moves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    turn_number INTEGER NOT NULL,
    player TEXT NOT NULL CHECK(player IN ('player1', 'player2')),
    move_type TEXT NOT NULL CHECK(move_type IN ('attack', 'move', 'defend')),
    move_data TEXT,                  -- JSON format action data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- AI models table - AI management
CREATE TABLE IF NOT EXISTS ai_models (
    id TEXT PRIMARY KEY,             -- UUID
    name TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'error')),
    win_rate REAL DEFAULT 0.0,
    total_games INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI rankings table - Ranking and rating system (Phase 3)
CREATE TABLE IF NOT EXISTS ai_rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ai_id TEXT NOT NULL,
    rank_position INTEGER NOT NULL,
    rating REAL NOT NULL DEFAULT 1200.0,  -- ELO rating
    win_rate REAL NOT NULL DEFAULT 0.0,
    total_games INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    draws INTEGER NOT NULL DEFAULT 0,
    last_game_date DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ai_id) REFERENCES ai_models(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);
CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1_type, player1_id);
CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2_type, player2_id);

CREATE INDEX IF NOT EXISTS idx_game_moves_game_id ON game_moves(game_id);
CREATE INDEX IF NOT EXISTS idx_game_moves_game_turn ON game_moves(game_id, turn_number);

CREATE INDEX IF NOT EXISTS idx_ai_models_status ON ai_models(status);
CREATE INDEX IF NOT EXISTS idx_ai_rankings_rating ON ai_rankings(rating DESC);
CREATE INDEX IF NOT EXISTS idx_ai_rankings_rank ON ai_rankings(rank_position);

-- Triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_games_updated_at
    AFTER UPDATE ON games
    FOR EACH ROW
BEGIN
    UPDATE games SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_ai_models_updated_at
    AFTER UPDATE ON ai_models
    FOR EACH ROW
BEGIN
    UPDATE ai_models SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_ai_rankings_updated_at
    AFTER UPDATE ON ai_rankings
    FOR EACH ROW
BEGIN
    UPDATE ai_rankings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Initial COM AI data (Level 1-4)
INSERT OR IGNORE INTO ai_models (id, name, description, file_path, status) VALUES
    ('com-level-1', 'COM Level 1', 'Basic random strategy AI', 'internal://com/level1', 'active'),
    ('com-level-2', 'COM Level 2', 'Simple tactical AI', 'internal://com/level2', 'active'),
    ('com-level-3', 'COM Level 3', 'Intermediate strategic AI', 'internal://com/level3', 'active'),
    ('com-level-4', 'COM Level 4', 'Advanced strategic AI', 'internal://com/level4', 'active');

-- Initial COM AI rankings
INSERT OR IGNORE INTO ai_rankings (ai_id, rank_position, rating) VALUES
    ('com-level-1', 4, 1000.0),
    ('com-level-2', 3, 1200.0),
    ('com-level-3', 2, 1400.0),
    ('com-level-4', 1, 1600.0); 
