-- Meeting Notes table — stores transcripts, AI summaries, and action items
CREATE TABLE IF NOT EXISTS public.meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Meeting',
  transcript TEXT,
  summary JSONB,          -- { overview, decisions[], action_items[], topics[], follow_ups[] }
  duration_seconds INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'recording' CHECK (status IN ('recording', 'transcribing', 'summarizing', 'complete', 'error')),
  error_message TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meetings" ON public.meeting_notes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create meetings" ON public.meeting_notes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meetings" ON public.meeting_notes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meetings" ON public.meeting_notes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_meeting_notes_user ON public.meeting_notes(user_id);
CREATE INDEX idx_meeting_notes_recorded ON public.meeting_notes(recorded_at DESC);
CREATE INDEX idx_meeting_notes_status ON public.meeting_notes(status);

-- Full-text search on transcript
CREATE INDEX idx_meeting_notes_transcript_search ON public.meeting_notes
  USING gin(to_tsvector('english', COALESCE(transcript, '') || ' ' || COALESCE(title, '')));
