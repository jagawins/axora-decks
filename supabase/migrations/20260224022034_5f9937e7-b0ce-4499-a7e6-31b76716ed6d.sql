
-- 1. Add tabs_block and toggle_block to the block_type enum
ALTER TYPE public.block_type ADD VALUE IF NOT EXISTS 'tabs_block';
ALTER TYPE public.block_type ADD VALUE IF NOT EXISTS 'toggle_block';

-- 2. Add share_passcode to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS share_passcode TEXT DEFAULT NULL;

-- 3. Create deck_views table for view analytics
CREATE TABLE IF NOT EXISTS public.deck_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  viewer_hash TEXT,
  slide_index INTEGER,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on deck_views
ALTER TABLE public.deck_views ENABLE ROW LEVEL SECURITY;

-- Anon/authenticated can insert views (needed for public share tracking)
CREATE POLICY "Anyone can insert deck views"
  ON public.deck_views
  FOR INSERT
  WITH CHECK (true);

-- Only project owner can read their own deck views
CREATE POLICY "Project owners can view their deck analytics"
  ON public.deck_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deck_views.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- Project owners can delete their own views
CREATE POLICY "Project owners can delete their deck views"
  ON public.deck_views
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deck_views.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- Index for efficient analytics queries
CREATE INDEX IF NOT EXISTS idx_deck_views_project_id ON public.deck_views(project_id);
CREATE INDEX IF NOT EXISTS idx_deck_views_created_at ON public.deck_views(created_at);
