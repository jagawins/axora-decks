-- Add theme column to projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'classic';