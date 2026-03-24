
-- Drop overly permissive policies on newsletter_broadcasts
DROP POLICY IF EXISTS "Authenticated users can insert broadcasts" ON public.newsletter_broadcasts;
DROP POLICY IF EXISTS "Users can read broadcasts" ON public.newsletter_broadcasts;

-- Only service role (edge functions) can insert broadcast records
CREATE POLICY "Service role inserts broadcasts"
  ON public.newsletter_broadcasts FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Only service role (edge functions) can read broadcast records
CREATE POLICY "Service role reads broadcasts"
  ON public.newsletter_broadcasts FOR SELECT
  USING (auth.role() = 'service_role');
