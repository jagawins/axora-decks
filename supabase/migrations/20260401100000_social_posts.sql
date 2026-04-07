-- Social posts history table
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter')),
  content TEXT NOT NULL,
  style TEXT,
  topic TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own posts" ON public.social_posts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create posts" ON public.social_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.social_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_social_posts_user ON public.social_posts(user_id);
