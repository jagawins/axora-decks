
-- Slide locks: protect slides from AI regeneration
CREATE TABLE public.slide_locks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  slide_index integer NOT NULL,
  locked_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (project_id, slide_index)
);

CREATE INDEX idx_slide_locks_project ON public.slide_locks(project_id);

ALTER TABLE public.slide_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view slide locks"
ON public.slide_locks FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = slide_locks.project_id AND p.user_id = auth.uid()));

CREATE POLICY "Owners can create slide locks"
ON public.slide_locks FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = locked_by AND
  EXISTS (SELECT 1 FROM public.projects p WHERE p.id = slide_locks.project_id AND p.user_id = auth.uid())
);

CREATE POLICY "Owners can delete slide locks"
ON public.slide_locks FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = slide_locks.project_id AND p.user_id = auth.uid()));

-- Project versions: full snapshots for restore
CREATE TABLE public.project_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'Snapshot',
  snapshot jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_versions_project_created ON public.project_versions(project_id, created_at DESC);

ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view versions"
ON public.project_versions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_versions.project_id AND p.user_id = auth.uid()));

CREATE POLICY "Owners can create versions"
ON public.project_versions FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_versions.project_id AND p.user_id = auth.uid())
);

CREATE POLICY "Owners can delete versions"
ON public.project_versions FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_versions.project_id AND p.user_id = auth.uid()));

-- Retention helper: keep last 30 per project
CREATE OR REPLACE FUNCTION public.prune_old_project_versions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.project_versions
  WHERE id IN (
    SELECT id FROM public.project_versions
    WHERE project_id = NEW.project_id
    ORDER BY created_at DESC
    OFFSET 30
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prune_project_versions
AFTER INSERT ON public.project_versions
FOR EACH ROW EXECUTE FUNCTION public.prune_old_project_versions();
