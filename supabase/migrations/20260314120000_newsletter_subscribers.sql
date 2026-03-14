-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT DEFAULT 'website',  -- website, footer, blog, popup
  subscribed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Anyone can unsubscribe (update their own row by email)
CREATE POLICY "Anyone can unsubscribe"
  ON public.newsletter_subscribers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Only service role can read all subscribers (for broadcast)
CREATE POLICY "Service role reads all subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON public.newsletter_subscribers(subscribed);

-- Newsletter broadcasts log
CREATE TABLE IF NOT EXISTS public.newsletter_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  sent_by UUID REFERENCES auth.users(id),
  recipient_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_broadcasts ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can insert broadcasts (admin check in edge function)
CREATE POLICY "Authenticated users can insert broadcasts"
  ON public.newsletter_broadcasts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can read their own broadcasts
CREATE POLICY "Users can read broadcasts"
  ON public.newsletter_broadcasts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
