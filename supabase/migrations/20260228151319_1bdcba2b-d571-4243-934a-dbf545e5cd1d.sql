
-- Table to track trial drip emails sent to users
CREATE TABLE public.trial_emails (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email_key text NOT NULL, -- e.g. 'day0', 'day3', 'day5', 'day10', 'day13'
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, email_key)
);

-- Enable RLS
ALTER TABLE public.trial_emails ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (from edge function)
-- Users can view their own records
CREATE POLICY "Users can view their own trial emails"
  ON public.trial_emails FOR SELECT
  USING (auth.uid() = user_id);
