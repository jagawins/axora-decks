-- Remove the dangerous UPDATE policy that lets users self-grant Pro
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;