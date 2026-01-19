-- Create image_cache table for caching stock/AI image results
CREATE TABLE public.image_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('pexels', 'unsplash', 'ai')),
  src TEXT NOT NULL,
  alt TEXT NOT NULL,
  credit TEXT,
  aspect TEXT DEFAULT '16:9',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on query + provider for cache lookups
CREATE UNIQUE INDEX idx_image_cache_query_provider ON public.image_cache (query, provider);

-- Create assets table for storing resolved images linked to blocks
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  block_id UUID,
  src TEXT NOT NULL,
  alt TEXT NOT NULL,
  query TEXT,
  provider TEXT,
  credit TEXT,
  aspect TEXT DEFAULT '16:9',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on project_id for efficient lookups
CREATE INDEX idx_assets_project_id ON public.assets (project_id);
CREATE INDEX idx_assets_block_id ON public.assets (block_id);

-- Enable RLS on both tables
ALTER TABLE public.image_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- image_cache is publicly readable (it's a shared cache)
CREATE POLICY "Image cache is publicly readable"
ON public.image_cache
FOR SELECT
USING (true);

-- Only authenticated users can insert into cache via edge functions
CREATE POLICY "Authenticated users can insert cache entries"
ON public.image_cache
FOR INSERT
WITH CHECK (true);

-- Assets are viewable by project owner
CREATE POLICY "Users can view their project assets"
ON public.assets
FOR SELECT
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Users can insert assets for their projects
CREATE POLICY "Users can insert assets for their projects"
ON public.assets
FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Users can update their project assets
CREATE POLICY "Users can update their project assets"
ON public.assets
FOR UPDATE
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Users can delete their project assets
CREATE POLICY "Users can delete their project assets"
ON public.assets
FOR DELETE
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);