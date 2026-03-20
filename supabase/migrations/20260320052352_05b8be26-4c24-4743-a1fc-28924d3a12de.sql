-- Fix overly permissive UPDATE policy on newsletter_subscribers
DROP POLICY IF EXISTS "Anyone can unsubscribe" ON public.newsletter_subscribers;

-- Replace with a scoped policy: only allow updating the row where email matches,
-- and only allow changing subscribed/unsubscribed_at fields via edge function.
-- Since anonymous users need to unsubscribe, we handle it via edge function with service role.
-- Remove direct UPDATE access entirely — unsubscribe will go through a dedicated endpoint.
-- No new UPDATE policy is created, forcing all updates through server-side logic.