-- Add available_for_draft column to players table
ALTER TABLE public.players 
ADD COLUMN available_for_draft boolean NOT NULL DEFAULT true;