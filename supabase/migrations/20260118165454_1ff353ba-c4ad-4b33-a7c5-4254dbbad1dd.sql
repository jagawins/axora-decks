-- Add policies to deny anonymous access to profiles, blocks, and exports tables

-- Profiles table - prevent email harvesting
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Blocks table - prevent content theft
CREATE POLICY "Deny anonymous access to blocks"
ON public.blocks
FOR SELECT
TO anon
USING (false);

-- Exports table - prevent access to export file URLs
CREATE POLICY "Deny anonymous access to exports"
ON public.exports
FOR SELECT
TO anon
USING (false);