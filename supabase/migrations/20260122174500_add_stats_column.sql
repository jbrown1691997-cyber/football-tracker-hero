-- Add stats column to players table
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}'::jsonb;

-- Comment on column to describe structure
COMMENT ON COLUMN players.stats IS 'Stores comprehensive player metrics structured as: { attacking: {...}, playmaking: {...}, defending: {...} }';
