-- Fix critical security vulnerability: Replace unrestricted public access with authenticated-only policies

-- Drop all existing permissive policies that allow public access
DROP POLICY IF EXISTS "Anyone can view players" ON public.players;
DROP POLICY IF EXISTS "Anyone can insert players" ON public.players;
DROP POLICY IF EXISTS "Anyone can update players" ON public.players;
DROP POLICY IF EXISTS "Anyone can delete players" ON public.players;

DROP POLICY IF EXISTS "Anyone can view games" ON public.games;
DROP POLICY IF EXISTS "Anyone can insert games" ON public.games;
DROP POLICY IF EXISTS "Anyone can update games" ON public.games;
DROP POLICY IF EXISTS "Anyone can delete games" ON public.games;

DROP POLICY IF EXISTS "Anyone can view drafted teams" ON public.drafted_teams;
DROP POLICY IF EXISTS "Anyone can insert drafted teams" ON public.drafted_teams;
DROP POLICY IF EXISTS "Anyone can update drafted teams" ON public.drafted_teams;
DROP POLICY IF EXISTS "Anyone can delete drafted teams" ON public.drafted_teams;

DROP POLICY IF EXISTS "Anyone can view game events" ON public.game_events;
DROP POLICY IF EXISTS "Anyone can insert game events" ON public.game_events;
DROP POLICY IF EXISTS "Anyone can update game events" ON public.game_events;
DROP POLICY IF EXISTS "Anyone can delete game events" ON public.game_events;

-- Create secure policies that require authentication
-- Players table policies
CREATE POLICY "Authenticated users can view players" 
ON public.players 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert players" 
ON public.players 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update players" 
ON public.players 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete players" 
ON public.players 
FOR DELETE 
TO authenticated 
USING (true);

-- Games table policies
CREATE POLICY "Authenticated users can view games" 
ON public.games 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert games" 
ON public.games 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update games" 
ON public.games 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete games" 
ON public.games 
FOR DELETE 
TO authenticated 
USING (true);

-- Drafted teams table policies
CREATE POLICY "Authenticated users can view drafted teams" 
ON public.drafted_teams 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert drafted teams" 
ON public.drafted_teams 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update drafted teams" 
ON public.drafted_teams 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete drafted teams" 
ON public.drafted_teams 
FOR DELETE 
TO authenticated 
USING (true);

-- Game events table policies
CREATE POLICY "Authenticated users can view game events" 
ON public.game_events 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert game events" 
ON public.game_events 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update game events" 
ON public.game_events 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete game events" 
ON public.game_events 
FOR DELETE 
TO authenticated 
USING (true);