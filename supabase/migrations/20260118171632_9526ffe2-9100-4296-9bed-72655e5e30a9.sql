-- Add share fields to projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS share_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS share_token uuid NOT NULL DEFAULT gen_random_uuid();

-- Ensure share_token is unique
CREATE UNIQUE INDEX IF NOT EXISTS projects_share_token_key ON public.projects(share_token);

-- Useful index for lookups
CREATE INDEX IF NOT EXISTS projects_share_enabled_idx ON public.projects(share_enabled);