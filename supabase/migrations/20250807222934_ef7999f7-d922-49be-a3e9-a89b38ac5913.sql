-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level IN (1, 2)),
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create games table
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_goals INTEGER NOT NULL DEFAULT 0,
  away_goals INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game events table
CREATE TABLE public.game_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'assist')),
  minute INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drafted teams table
CREATE TABLE public.drafted_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  goalkeepers JSONB NOT NULL DEFAULT '[]'::jsonb,
  defenders JSONB NOT NULL DEFAULT '[]'::jsonb,
  midfielders JSONB NOT NULL DEFAULT '[]'::jsonb,
  forwards JSONB NOT NULL DEFAULT '[]'::jsonb,
  level1_count INTEGER NOT NULL DEFAULT 0,
  level2_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafted_teams ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a club management app)
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can insert players" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete players" ON public.players FOR DELETE USING (true);

CREATE POLICY "Anyone can view games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Anyone can insert games" ON public.games FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update games" ON public.games FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete games" ON public.games FOR DELETE USING (true);

CREATE POLICY "Anyone can view game events" ON public.game_events FOR SELECT USING (true);
CREATE POLICY "Anyone can insert game events" ON public.game_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update game events" ON public.game_events FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete game events" ON public.game_events FOR DELETE USING (true);

CREATE POLICY "Anyone can view drafted teams" ON public.drafted_teams FOR SELECT USING (true);
CREATE POLICY "Anyone can insert drafted teams" ON public.drafted_teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update drafted teams" ON public.drafted_teams FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete drafted teams" ON public.drafted_teams FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drafted_teams_updated_at
  BEFORE UPDATE ON public.drafted_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_players_position ON public.players(position);
CREATE INDEX idx_players_level ON public.players(level);
CREATE INDEX idx_games_date ON public.games(date);
CREATE INDEX idx_game_events_game_id ON public.game_events(game_id);
CREATE INDEX idx_game_events_player_id ON public.game_events(player_id);