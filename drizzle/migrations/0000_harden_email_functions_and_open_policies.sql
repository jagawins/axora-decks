ALTER FUNCTION public.move_to_dlq(text,text,bigint,jsonb) SET search_path = '';
ALTER FUNCTION public.read_email_batch(text,integer,integer) SET search_path = '';
ALTER FUNCTION public.enqueue_email(text,jsonb) SET search_path = '';
ALTER FUNCTION public.delete_email(text,bigint) SET search_path = '';

DROP POLICY IF EXISTS "Authenticated users can insert cache entries" ON public.image_cache;
DROP POLICY IF EXISTS "Anyone can insert deck views" ON public.deck_views;

DROP POLICY IF EXISTS "Anyone can view votes" ON public.live_poll_votes;
CREATE POLICY "Poll owners can view votes" ON public.live_poll_votes
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.live_polls p WHERE p.id = live_poll_votes.poll_id AND p.user_id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
FOR INSERT TO anon, authenticated
WITH CHECK (
  subscribed = true
  AND unsubscribed_at IS NULL
  AND char_length(email) BETWEEN 3 AND 254
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (name IS NULL OR char_length(name) <= 200)
  AND (source IS NULL OR char_length(source) <= 100)
);