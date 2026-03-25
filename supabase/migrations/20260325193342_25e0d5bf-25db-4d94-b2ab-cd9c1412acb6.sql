
-- Create live_polls table
CREATE TABLE public.live_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  question text NOT NULL,
  options jsonb,
  code text UNIQUE NOT NULL,
  results jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_polls ENABLE ROW LEVEL SECURITY;

-- Authenticated users can CRUD their own polls
CREATE POLICY "Users can view their own polls"
  ON public.live_polls FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own polls"
  ON public.live_polls FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own polls"
  ON public.live_polls FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own polls"
  ON public.live_polls FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Anonymous users can SELECT active polls (for participants)
CREATE POLICY "Anyone can view active polls"
  ON public.live_polls FOR SELECT
  TO anon
  USING (is_active = true);

-- Security definer function for atomic vote increment
CREATE OR REPLACE FUNCTION public.increment_poll_vote(poll_code text, choice text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.live_polls
  SET results = jsonb_set(
    results,
    ARRAY[choice],
    to_jsonb(COALESCE((results->>choice)::int, 0) + 1)
  )
  WHERE code = poll_code AND is_active = true;
END;
$$;
