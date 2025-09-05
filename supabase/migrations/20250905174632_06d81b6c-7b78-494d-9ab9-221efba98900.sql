-- Update the check constraint for game_events table to accept new event types
ALTER TABLE game_events DROP CONSTRAINT IF EXISTS game_events_event_type_check;

-- Add new check constraint that includes all event types
ALTER TABLE game_events ADD CONSTRAINT game_events_event_type_check 
CHECK (event_type IN ('goal', 'assist', 'own_goal', 'goal_conceded'));