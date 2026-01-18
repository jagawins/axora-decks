-- Add policy to prevent anonymous access to projects table
-- This ensures only authenticated users can access the table at all
CREATE POLICY "Deny anonymous access to projects"
ON public.projects
FOR SELECT
TO anon
USING (false);