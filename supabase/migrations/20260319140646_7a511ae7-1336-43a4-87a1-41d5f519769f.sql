
-- Server-side enforcement of project creation limits per subscription tier
CREATE OR REPLACE FUNCTION public.check_project_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier text;
  project_count integer;
  project_limit integer;
BEGIN
  -- Get user's subscription tier
  SELECT s.tier INTO user_tier
  FROM public.subscriptions s
  WHERE s.user_id = NEW.user_id;

  -- Default to free if no subscription record
  IF user_tier IS NULL THEN
    user_tier := 'free';
  END IF;

  -- Set limit based on tier (free = 10, paid = unlimited)
  IF user_tier = 'free' THEN
    project_limit := 10;
  ELSE
    RETURN NEW;
  END IF;

  -- Count existing projects
  SELECT COUNT(*) INTO project_count
  FROM public.projects
  WHERE projects.user_id = NEW.user_id;

  -- Enforce limit
  IF project_count >= project_limit THEN
    RAISE EXCEPTION 'Project limit reached for free tier (% projects maximum)', project_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Add trigger
CREATE TRIGGER enforce_project_limit
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.check_project_limit();
