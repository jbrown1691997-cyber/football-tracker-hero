-- Football Tracker Prototype - Database Schema
-- Based on Architecture Document

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  api_football_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  short_name VARCHAR(10),
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PLAYERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  api_football_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(50) NOT NULL,
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  photo_url TEXT,
  nationality VARCHAR(50),
  age INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast team-based lookups
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);

-- ============================================
-- PLAYER STATS TABLE (Gameweek-based)
-- ============================================
CREATE TABLE IF NOT EXISTS player_stats (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  gameweek INTEGER NOT NULL,
  season VARCHAR(10) NOT NULL DEFAULT '2024-25',
  
  -- Core Stats
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  minutes_played INTEGER DEFAULT 0,
  
  -- Shooting
  shots INTEGER DEFAULT 0,
  shots_on_target INTEGER DEFAULT 0,
  xg DECIMAL(4,2) DEFAULT 0,
  
  -- Passing
  key_passes INTEGER DEFAULT 0,
  xa DECIMAL(4,2) DEFAULT 0,
  pass_accuracy DECIMAL(5,2) DEFAULT 0,
  
  -- Defending
  tackles INTEGER DEFAULT 0,
  interceptions INTEGER DEFAULT 0,
  clearances INTEGER DEFAULT 0,
  
  -- Other
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one stat row per player per gameweek per season
  UNIQUE(player_id, gameweek, season)
);

-- Index for fast player stat lookups
CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_gameweek ON player_stats(gameweek, season);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (anonymous users can read)
CREATE POLICY "Public read access for teams"
  ON teams FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for players"
  ON players FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for player_stats"
  ON player_stats FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service role can write (for data sync from API-Football)
-- Service role bypasses RLS by default, so no explicit write policies needed

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get aggregated season stats for a player
CREATE OR REPLACE FUNCTION get_player_season_stats(p_player_id INTEGER, p_season VARCHAR DEFAULT '2024-25')
RETURNS TABLE (
  total_goals INTEGER,
  total_assists INTEGER,
  total_minutes INTEGER,
  avg_xg DECIMAL,
  avg_xa DECIMAL,
  total_shots INTEGER,
  total_key_passes INTEGER,
  games_played BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(goals), 0)::INTEGER as total_goals,
    COALESCE(SUM(assists), 0)::INTEGER as total_assists,
    COALESCE(SUM(minutes_played), 0)::INTEGER as total_minutes,
    COALESCE(AVG(xg), 0)::DECIMAL as avg_xg,
    COALESCE(AVG(xa), 0)::DECIMAL as avg_xa,
    COALESCE(SUM(shots), 0)::INTEGER as total_shots,
    COALESCE(SUM(key_passes), 0)::INTEGER as total_key_passes,
    COUNT(*) as games_played
  FROM player_stats
  WHERE player_id = p_player_id AND season = p_season;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Sample Premier League Players)
-- ============================================

-- Insert teams
INSERT INTO teams (api_football_id, name, short_name, logo_url) VALUES
  (40, 'Liverpool', 'LIV', 'https://media.api-sports.io/football/teams/40.png'),
  (50, 'Manchester City', 'MCI', 'https://media.api-sports.io/football/teams/50.png'),
  (49, 'Chelsea', 'CHE', 'https://media.api-sports.io/football/teams/49.png'),
  (42, 'Arsenal', 'ARS', 'https://media.api-sports.io/football/teams/42.png'),
  (33, 'Manchester United', 'MUN', 'https://media.api-sports.io/football/teams/33.png')
ON CONFLICT (api_football_id) DO NOTHING;

-- Insert players
INSERT INTO players (api_football_id, name, position, team_id, nationality, age) VALUES
  (306, 'Mohamed Salah', 'Forward', (SELECT id FROM teams WHERE short_name = 'LIV'), 'Egypt', 32),
  (1100, 'Erling Haaland', 'Forward', (SELECT id FROM teams WHERE short_name = 'MCI'), 'Norway', 24),
  (116594, 'Cole Palmer', 'Midfielder', (SELECT id FROM teams WHERE short_name = 'CHE'), 'England', 22),
  (1161, 'Bukayo Saka', 'Forward', (SELECT id FROM teams WHERE short_name = 'ARS'), 'England', 23),
  (1485, 'Bruno Fernandes', 'Midfielder', (SELECT id FROM teams WHERE short_name = 'MUN'), 'Portugal', 30)
ON CONFLICT (api_football_id) DO NOTHING;

-- Insert sample stats (Gameweeks 1-5)
INSERT INTO player_stats (player_id, gameweek, season, goals, assists, minutes_played, xg, xa, shots, key_passes) VALUES
  -- Salah (id: from query)
  ((SELECT id FROM players WHERE api_football_id = 306), 1, '2024-25', 1, 1, 90, 0.85, 0.45, 4, 3),
  ((SELECT id FROM players WHERE api_football_id = 306), 2, '2024-25', 2, 0, 90, 1.20, 0.30, 5, 2),
  ((SELECT id FROM players WHERE api_football_id = 306), 3, '2024-25', 0, 2, 90, 0.65, 0.80, 3, 4),
  ((SELECT id FROM players WHERE api_football_id = 306), 4, '2024-25', 1, 1, 85, 0.90, 0.55, 4, 3),
  ((SELECT id FROM players WHERE api_football_id = 306), 5, '2024-25', 1, 0, 90, 0.75, 0.25, 3, 2),
  -- Haaland
  ((SELECT id FROM players WHERE api_football_id = 1100), 1, '2024-25', 2, 0, 90, 1.50, 0.20, 6, 1),
  ((SELECT id FROM players WHERE api_football_id = 1100), 2, '2024-25', 3, 0, 90, 2.10, 0.15, 7, 0),
  ((SELECT id FROM players WHERE api_football_id = 1100), 3, '2024-25', 1, 1, 90, 1.30, 0.40, 5, 2),
  ((SELECT id FROM players WHERE api_football_id = 1100), 4, '2024-25', 2, 0, 90, 1.65, 0.10, 6, 1),
  ((SELECT id FROM players WHERE api_football_id = 1100), 5, '2024-25', 1, 0, 75, 0.95, 0.20, 4, 1),
  -- Palmer
  ((SELECT id FROM players WHERE api_football_id = 116594), 1, '2024-25', 1, 2, 90, 0.70, 0.90, 3, 5),
  ((SELECT id FROM players WHERE api_football_id = 116594), 2, '2024-25', 2, 1, 90, 1.10, 0.65, 4, 4),
  ((SELECT id FROM players WHERE api_football_id = 116594), 3, '2024-25', 0, 2, 85, 0.45, 0.85, 2, 5),
  ((SELECT id FROM players WHERE api_football_id = 116594), 4, '2024-25', 1, 1, 90, 0.80, 0.70, 3, 4),
  ((SELECT id FROM players WHERE api_football_id = 116594), 5, '2024-25', 1, 0, 90, 0.65, 0.50, 3, 3),
  -- Saka
  ((SELECT id FROM players WHERE api_football_id = 1161), 1, '2024-25', 1, 1, 90, 0.60, 0.75, 3, 4),
  ((SELECT id FROM players WHERE api_football_id = 1161), 2, '2024-25', 0, 2, 90, 0.50, 0.90, 2, 5),
  ((SELECT id FROM players WHERE api_football_id = 1161), 3, '2024-25', 1, 1, 90, 0.70, 0.70, 3, 4),
  ((SELECT id FROM players WHERE api_football_id = 1161), 4, '2024-25', 0, 2, 80, 0.40, 0.85, 2, 5),
  ((SELECT id FROM players WHERE api_football_id = 1161), 5, '2024-25', 1, 0, 90, 0.65, 0.55, 3, 3),
  -- Bruno
  ((SELECT id FROM players WHERE api_football_id = 1485), 1, '2024-25', 0, 2, 90, 0.35, 0.95, 2, 6),
  ((SELECT id FROM players WHERE api_football_id = 1485), 2, '2024-25', 1, 1, 90, 0.55, 0.80, 3, 5),
  ((SELECT id FROM players WHERE api_football_id = 1485), 3, '2024-25', 0, 2, 90, 0.30, 0.90, 2, 6),
  ((SELECT id FROM players WHERE api_football_id = 1485), 4, '2024-25', 1, 1, 85, 0.50, 0.75, 3, 5),
  ((SELECT id FROM players WHERE api_football_id = 1485), 5, '2024-25', 0, 1, 90, 0.40, 0.70, 2, 4)
ON CONFLICT (player_id, gameweek, season) DO NOTHING;
