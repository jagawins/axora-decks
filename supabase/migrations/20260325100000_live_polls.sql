-- Live Polls table — persists polls created by users
CREATE TABLE IF NOT EXISTS public.live_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  poll_type TEXT NOT NULL CHECK (poll_type IN ('multiple-choice', 'yes-no', 'rating', 'qa', 'wordcloud', 'survey')),
  question TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  participant_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Live Poll Votes — individual votes for real-time tracking
CREATE TABLE IF NOT EXISTS public.live_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.live_polls(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL, -- anonymous session ID or user ID
  choice TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(poll_id, voter_id)
);

-- RLS policies
ALTER TABLE public.live_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_poll_votes ENABLE ROW LEVEL SECURITY;

-- Poll creators can CRUD their own polls
CREATE POLICY "Users can create polls" ON public.live_polls
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own polls" ON public.live_polls
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own polls" ON public.live_polls
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own polls" ON public.live_polls
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Anyone can view a poll by code (for participants)
CREATE POLICY "Anyone can view active polls by code" ON public.live_polls
  FOR SELECT TO anon USING (is_active = true);

-- Anyone can vote (anon or authenticated)
CREATE POLICY "Anyone can vote" ON public.live_poll_votes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can view votes" ON public.live_poll_votes
  FOR SELECT TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX idx_live_polls_code ON public.live_polls(code);
CREATE INDEX idx_live_polls_user ON public.live_polls(user_id);
CREATE INDEX idx_live_poll_votes_poll ON public.live_poll_votes(poll_id);
