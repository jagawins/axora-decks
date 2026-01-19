import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface Template {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  tags: string[];
  thumbnail_url: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface TemplateBlock {
  id: string;
  template_id: string;
  type: "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout";
  content: Json;
  order_index: number;
}

// Categories for the UI tabs
export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'Strategy and Leadership', label: 'Strategy' },
  { id: 'Projects and Operations', label: 'Operations' },
  { id: 'Product and Technology', label: 'Product' },
  { id: 'Sales and Marketing', label: 'Marketing' },
  { id: 'Startup and Fundraising', label: 'Startup' },
  { id: 'AI and Data', label: 'AI & Data' },
] as const;

// Fetch all templates
export async function fetchTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('title');

  if (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }

  return (data || []) as Template[];
}

// Fetch template blocks for a specific template
export async function fetchTemplateBlocks(templateId: string): Promise<TemplateBlock[]> {
  const { data, error } = await supabase
    .from('template_blocks')
    .select('*')
    .eq('template_id', templateId)
    .order('order_index');

  if (error) {
    console.error('Error fetching template blocks:', error);
    throw error;
  }

  return (data || []) as TemplateBlock[];
}

// Create a deck from a template
export async function createDeckFromTemplate(
  templateId: string,
  userId: string
): Promise<{ projectId: string }> {
  // First, get the template details
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError || !template) {
    console.error('Error fetching template:', templateError);
    throw new Error('Template not found');
  }

  // Create the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      title: template.title,
      description: template.description,
      user_id: userId,
      theme: 'classic',
    })
    .select()
    .single();

  if (projectError || !project) {
    console.error('Error creating project:', projectError);
    throw new Error('Failed to create project');
  }

  // Fetch template blocks
  const blocks = await fetchTemplateBlocks(templateId);

  if (blocks.length > 0) {
    // Insert blocks into the project
    const { error: blocksError } = await supabase
      .from('blocks')
      .insert(
        blocks.map((block) => ({
          project_id: project.id,
          type: block.type as "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout",
          content: block.content,
          order_index: block.order_index,
        }))
      );

    if (blocksError) {
      console.error('Error copying blocks:', blocksError);
      // Clean up the project if blocks failed
      await supabase.from('projects').delete().eq('id', project.id);
      throw new Error('Failed to copy template blocks');
    }
  }

  return { projectId: project.id };
}

// Check if templates are seeded
export async function checkTemplatesSeeded(): Promise<boolean> {
  const { count, error } = await supabase
    .from('templates')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error checking templates:', error);
    return false;
  }

  return (count || 0) > 0;
}
