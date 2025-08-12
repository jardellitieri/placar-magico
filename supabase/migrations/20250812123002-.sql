-- Add user_id columns to all tables for data ownership
ALTER TABLE public.players ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.games ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.drafted_teams ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.game_events ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id NOT NULL for new records (existing records will need to be handled)
-- We'll set a default for existing records first, then make it NOT NULL
UPDATE public.players SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE public.games SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE public.drafted_teams SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
UPDATE public.game_events SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Now make user_id NOT NULL
ALTER TABLE public.players ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.games ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.drafted_teams ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.game_events ALTER COLUMN user_id SET NOT NULL;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Authenticated users can view players" ON public.players;
DROP POLICY IF EXISTS "Authenticated users can insert players" ON public.players;
DROP POLICY IF EXISTS "Authenticated users can update players" ON public.players;
DROP POLICY IF EXISTS "Authenticated users can delete players" ON public.players;

DROP POLICY IF EXISTS "Authenticated users can view games" ON public.games;
DROP POLICY IF EXISTS "Authenticated users can insert games" ON public.games;
DROP POLICY IF EXISTS "Authenticated users can update games" ON public.games;
DROP POLICY IF EXISTS "Authenticated users can delete games" ON public.games;

DROP POLICY IF EXISTS "Authenticated users can view drafted teams" ON public.drafted_teams;
DROP POLICY IF EXISTS "Authenticated users can insert drafted teams" ON public.drafted_teams;
DROP POLICY IF EXISTS "Authenticated users can update drafted teams" ON public.drafted_teams;
DROP POLICY IF EXISTS "Authenticated users can delete drafted teams" ON public.drafted_teams;

DROP POLICY IF EXISTS "Authenticated users can view game events" ON public.game_events;
DROP POLICY IF EXISTS "Authenticated users can insert game events" ON public.game_events;
DROP POLICY IF EXISTS "Authenticated users can update game events" ON public.game_events;
DROP POLICY IF EXISTS "Authenticated users can delete game events" ON public.game_events;

-- Create new ownership-based RLS policies for players
CREATE POLICY "Users can view their own players" ON public.players
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own players" ON public.players
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own players" ON public.players
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own players" ON public.players
FOR DELETE USING (auth.uid() = user_id);

-- Create new ownership-based RLS policies for games
CREATE POLICY "Users can view their own games" ON public.games
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games" ON public.games
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games" ON public.games
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games" ON public.games
FOR DELETE USING (auth.uid() = user_id);

-- Create new ownership-based RLS policies for drafted teams
CREATE POLICY "Users can view their own drafted teams" ON public.drafted_teams
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drafted teams" ON public.drafted_teams
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafted teams" ON public.drafted_teams
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafted teams" ON public.drafted_teams
FOR DELETE USING (auth.uid() = user_id);

-- Create new ownership-based RLS policies for game events
CREATE POLICY "Users can view their own game events" ON public.game_events
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game events" ON public.game_events
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game events" ON public.game_events
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game events" ON public.game_events
FOR DELETE USING (auth.uid() = user_id);