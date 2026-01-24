-- =============================================================
-- AXORA TEMPLATE SYSTEM UPGRADE
-- Adds versioning, structured payloads, metadata, and preview storage
-- =============================================================

-- 1. Add version and updated_at to templates
ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS default_theme_id text DEFAULT 'classic',
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- 2. Add unique constraint on category + slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'templates_category_slug_unique'
  ) THEN
    ALTER TABLE public.templates ADD CONSTRAINT templates_category_slug_unique UNIQUE (category, slug);
  END IF;
END $$;

-- 3. Add block_payload and block_meta to template_blocks
-- First add the new columns
ALTER TABLE public.template_blocks 
ADD COLUMN IF NOT EXISTS block_payload jsonb,
ADD COLUMN IF NOT EXISTS block_meta jsonb DEFAULT '{}'::jsonb;

-- 4. Migrate existing content to block_payload (only if content exists and block_payload is null)
UPDATE public.template_blocks 
SET block_payload = content 
WHERE block_payload IS NULL AND content IS NOT NULL;

-- 5. Make block_payload NOT NULL after migration (with default for safety)
ALTER TABLE public.template_blocks 
ALTER COLUMN block_payload SET DEFAULT '{}'::jsonb;

-- 6. Add unique constraint on template_id + order_index
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'template_blocks_template_order_unique'
  ) THEN
    ALTER TABLE public.template_blocks ADD CONSTRAINT template_blocks_template_order_unique UNIQUE (template_id, order_index);
  END IF;
END $$;

-- 7. Create template_previews table for cached preview images
CREATE TABLE IF NOT EXISTS public.template_previews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  template_version integer NOT NULL DEFAULT 1,
  theme_id text NOT NULL DEFAULT 'classic',
  image_base64 text NOT NULL,
  renderer_version integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT template_previews_unique UNIQUE (template_id, template_version, theme_id)
);

-- 8. Enable RLS on template_previews
ALTER TABLE public.template_previews ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policy for public read access
CREATE POLICY "Template previews are publicly readable"
ON public.template_previews
FOR SELECT
USING (true);

-- 10. Create trigger for updated_at on templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON public.templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 11. Create trigger for updated_at on template_previews
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_template_previews_updated_at'
  ) THEN
    CREATE TRIGGER update_template_previews_updated_at
    BEFORE UPDATE ON public.template_previews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 12. Create index for faster preview lookups
CREATE INDEX IF NOT EXISTS idx_template_previews_lookup 
ON public.template_previews (template_id, template_version, theme_id);

-- 13. Create index for faster block ordering
CREATE INDEX IF NOT EXISTS idx_template_blocks_order 
ON public.template_blocks (template_id, order_index);