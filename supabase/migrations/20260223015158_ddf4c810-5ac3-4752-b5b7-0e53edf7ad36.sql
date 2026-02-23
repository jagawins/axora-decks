
-- Add brand_kit JSONB column to projects table
ALTER TABLE public.projects ADD COLUMN brand_kit jsonb DEFAULT '{}'::jsonb;

-- Add notes column to projects table (for presenter notes, stored as JSON string of section-keyed notes)
ALTER TABLE public.projects ADD COLUMN notes jsonb DEFAULT '{}'::jsonb;
