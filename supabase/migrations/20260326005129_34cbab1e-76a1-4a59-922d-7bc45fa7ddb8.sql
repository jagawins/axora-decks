
-- Add missing columns to live_polls
ALTER TABLE public.live_polls ADD COLUMN IF NOT EXISTS poll_type TEXT;
ALTER TABLE public.live_polls ADD COLUMN IF NOT EXISTS participant_count INTEGER DEFAULT 0;
ALTER TABLE public.live_polls ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Migrate data from 'type' to 'poll_type'
UPDATE public.live_polls SET poll_type = type WHERE poll_type IS NULL;

-- Drop old 'type' column
ALTER TABLE public.live_polls DROP COLUMN IF EXISTS type;

-- Make poll_type NOT NULL now that data is migrated
ALTER TABLE public.live_polls ALTER COLUMN poll_type SET NOT NULL;

-- Add check constraint on poll_type
ALTER TABLE public.live_polls ADD CONSTRAINT live_polls_poll_type_check
  CHECK (poll_type IN ('multiple-choice', 'yes-no', 'rating', 'qa', 'wordcloud', 'survey'));

-- Create live_poll_votes table
CREATE TABLE IF NOT EXISTS public.live_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.live_polls(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  choice TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(poll_id, voter_id)
);

-- RLS for live_poll_votes
ALTER TABLE public.live_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can vote" ON public.live_poll_votes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can view votes" ON public.live_poll_votes
  FOR SELECT TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_live_poll_votes_poll ON public.live_poll_votes(poll_id);
