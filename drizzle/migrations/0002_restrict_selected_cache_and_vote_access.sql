DROP POLICY IF EXISTS "Image cache is publicly readable" ON public.image_cache;
REVOKE SELECT ON public.image_cache FROM anon, authenticated;
DROP POLICY IF EXISTS "Anyone can vote" ON public.live_poll_votes;
REVOKE INSERT ON public.live_poll_votes FROM anon, authenticated;