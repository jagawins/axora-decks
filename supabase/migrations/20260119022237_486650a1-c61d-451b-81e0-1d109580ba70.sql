-- Create templates table
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create template_blocks table
CREATE TABLE public.template_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  type block_type NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on templates (publicly readable)
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Templates are publicly readable (no auth required)
CREATE POLICY "Templates are publicly readable"
ON public.templates
FOR SELECT
USING (true);

-- Enable RLS on template_blocks (publicly readable)
ALTER TABLE public.template_blocks ENABLE ROW LEVEL SECURITY;

-- Template blocks are publicly readable (no auth required)
CREATE POLICY "Template blocks are publicly readable"
ON public.template_blocks
FOR SELECT
USING (true);

-- Create indexes for performance
CREATE INDEX idx_templates_category ON public.templates(category);
CREATE INDEX idx_templates_is_featured ON public.templates(is_featured);
CREATE INDEX idx_templates_slug ON public.templates(slug);
CREATE INDEX idx_template_blocks_template_id ON public.template_blocks(template_id);
CREATE INDEX idx_template_blocks_order_index ON public.template_blocks(order_index);