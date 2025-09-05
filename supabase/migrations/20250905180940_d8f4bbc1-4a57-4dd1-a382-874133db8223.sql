-- Add goals_conceded column to players table
ALTER TABLE players ADD COLUMN goals_conceded integer NOT NULL DEFAULT 0;