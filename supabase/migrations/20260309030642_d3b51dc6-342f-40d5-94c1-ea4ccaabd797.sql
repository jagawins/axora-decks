CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  event text NOT NULL,
  properties jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert own events"
  ON public.analytics_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous can insert events"
  ON public.analytics_events FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);