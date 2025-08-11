-- Update RLS policies to use explicit authentication checks instead of 'true' conditions
-- This provides clearer security intent and removes any ambiguity

-- Drop existing policies and recreate with explicit auth checks
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

-- Create new policies with explicit authentication checks
-- Players table policies
CREATE POLICY "Authenticated users can view players" 
ON public.players 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert players" 
ON public.players 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update players" 
ON public.players 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete players" 
ON public.players 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Games table policies
CREATE POLICY "Authenticated users can view games" 
ON public.games 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert games" 
ON public.games 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update games" 
ON public.games 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete games" 
ON public.games 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Drafted teams table policies
CREATE POLICY "Authenticated users can view drafted teams" 
ON public.drafted_teams 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert drafted teams" 
ON public.drafted_teams 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update drafted teams" 
ON public.drafted_teams 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete drafted teams" 
ON public.drafted_teams 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Game events table policies
CREATE POLICY "Authenticated users can view game events" 
ON public.game_events 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert game events" 
ON public.game_events 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update game events" 
ON public.game_events 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete game events" 
ON public.game_events 
FOR DELETE 
USING (auth.uid() IS NOT NULL);