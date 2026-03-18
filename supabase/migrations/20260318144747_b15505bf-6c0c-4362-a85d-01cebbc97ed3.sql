
-- Fix PUBLIC_DATA_EXPOSURE: Drop the overly-broad "Deny anonymous access to profiles" policy
-- that evaluates TRUE for all authenticated users, overriding the owner-only policy
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- Fix the owner policies to use user_id (which stores auth UID) instead of id (table PK)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
