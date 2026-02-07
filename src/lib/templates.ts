import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// =============================================================================
// TYPES
// =============================================================================

// Legacy block types
export type LegacyBlockType = 'text' | 'heading' | 'image' | 'two_col' | 'table' | 'list' | 'callout';

// Visual block types (new)
export type VisualBlockType = 
  | 'stat_block' 
  | 'quote_block' 
  | 'timeline_block' 
  | 'comparison_table' 
  | 'card_grid' 
  | 'hero_header' 
  | 'exec_summary' 
  | 'cta_section' 
  | 'section_divider' 
  | 'icon_text_block' 
  | 'framed_insight';

// Decision block types (Decision Layer)
export type DecisionBlockType =
  | 'decision_summary'
  | 'evidence_map'
  | 'scenario_set'
  | 'recommendation_panel';

// All block types
export type BlockType = LegacyBlockType | VisualBlockType | DecisionBlockType;

export interface BlockMeta {
  purpose?: string | null;
  narrative_position?: string | null;
  clarity_target?: number | null;
}

export interface BlockPayload {
  // Common
  text?: string;
  // Heading
  level?: number;
  // List
  items?: string[];
  ordered?: boolean;
  // Callout
  icon?: string;
  // Two column
  left?: string;
  right?: string;
  // Table
  headers?: string[];
  rows?: string[][];
  // Image
  src?: string;
  prompt?: string;
  alt?: string;
  aspect?: '16:9' | '4:3' | '1:1';
  fit?: 'cover' | 'contain';
}

export interface TemplateBlock {
  id: string;
  template_id: string;
  type: BlockType;
  order_index: number;
  // New structured fields
  block_payload: BlockPayload;
  block_meta: BlockMeta;
  // Legacy field (kept for backwards compatibility)
  content?: Json;
}

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
  // New versioning fields
  version: number;
  default_theme_id: string;
  updated_at: string;
  // Runtime attached data
  preview_blocks?: TemplateBlock[];
  preview_url?: string | null;
}

export interface TemplatePreview {
  id: string;
  template_id: string;
  template_version: number;
  theme_id: string;
  image_base64: string;
  renderer_version: number;
  created_at: string;
  updated_at: string;
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

// Current renderer version for cache invalidation
export const RENDERER_VERSION = 1;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Normalize a template block from database format to our typed format.
 * Handles both legacy 'content' field and new 'block_payload' field.
 */
function normalizeTemplateBlock(raw: Record<string, unknown>): TemplateBlock {
  const block_payload = (raw.block_payload || raw.content || {}) as BlockPayload;
  const block_meta = (raw.block_meta || {}) as BlockMeta;
  
  return {
    id: raw.id as string,
    template_id: raw.template_id as string,
    type: raw.type as BlockType,
    order_index: raw.order_index as number,
    block_payload,
    block_meta,
    content: raw.content as Json,
  };
}

/**
 * Generate a new UUID for block cloning
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Fetch all templates with preview blocks (first 3 blocks per template)
 */
export async function fetchTemplates(): Promise<Template[]> {
  // Use type assertion since templates table was just updated
  const supabaseAny = supabase as any;
  
  // Fetch templates with new fields
  const { data: templates, error: templatesError } = await supabaseAny
    .from('templates')
    .select('id, slug, title, description, category, tags, thumbnail_url, is_featured, created_at, version, default_theme_id, updated_at')
    .order('is_featured', { ascending: false })
    .order('title');

  if (templatesError) {
    console.error('Error fetching templates:', templatesError);
    throw templatesError;
  }

  if (!templates || templates.length === 0) {
    return [];
  }

  // Fetch preview blocks for all templates (first 3 blocks each)
  const templateIds = (templates as any[]).map((t: any) => t.id);
  const { data: allBlocks, error: blocksError } = await supabaseAny
    .from('template_blocks')
    .select('id, template_id, type, order_index, block_payload, block_meta, content')
    .in('template_id', templateIds)
    .order('order_index');

  if (blocksError) {
    console.error('Error fetching preview blocks:', blocksError);
    return templates.map((t: any) => ({
      ...t,
      version: t.version || 1,
      default_theme_id: t.default_theme_id || 'classic',
      updated_at: t.updated_at || t.created_at,
      preview_blocks: [],
    })) as Template[];
  }

  // Group blocks by template_id and take first 3
  const blocksByTemplate: Record<string, TemplateBlock[]> = {};
  ((allBlocks || []) as any[]).forEach((block: any) => {
    const templateId = block.template_id;
    if (!blocksByTemplate[templateId]) {
      blocksByTemplate[templateId] = [];
    }
    if (blocksByTemplate[templateId].length < 3) {
      blocksByTemplate[templateId].push(normalizeTemplateBlock(block));
    }
  });

  // Attach preview_blocks to each template
  return (templates as any[]).map((template: any) => ({
    ...template,
    version: template.version || 1,
    default_theme_id: template.default_theme_id || 'classic',
    updated_at: template.updated_at || template.created_at,
    preview_blocks: blocksByTemplate[template.id] || [],
  })) as Template[];
}

/**
 * Fetch all blocks for a specific template, ordered by order_index
 */
export async function fetchTemplateBlocks(templateId: string): Promise<TemplateBlock[]> {
  const supabaseAny = supabase as any;
  const { data, error } = await supabaseAny
    .from('template_blocks')
    .select('id, template_id, type, order_index, block_payload, block_meta, content')
    .eq('template_id', templateId)
    .order('order_index');

  if (error) {
    console.error('Error fetching template blocks:', error);
    throw error;
  }

  return ((data || []) as any[]).map(normalizeTemplateBlock);
}

/**
 * Create a deck from a template using DETERMINISTIC cloning.
 * - Deep clones all blocks from DB
 * - Regenerates block IDs
 * - Does NOT use AI
 * - Does NOT reflow or alter content
 * - Inserts exactly as stored
 */
export async function createDeckFromTemplate(
  templateId: string,
  userId: string
): Promise<{ projectId: string }> {
  const supabaseAny = supabase as any;
  
  // 1. Get the template details
  const { data: template, error: templateError } = await supabaseAny
    .from('templates')
    .select('id, title, description, default_theme_id')
    .eq('id', templateId)
    .single();

  if (templateError || !template) {
    console.error('Error fetching template:', templateError);
    throw new Error('Template not found');
  }

  // 2. Create the project with template's default theme
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      title: template.title,
      description: template.description,
      user_id: userId,
      theme: template.default_theme_id || 'classic',
    })
    .select()
    .single();

  if (projectError || !project) {
    console.error('Error creating project:', projectError);
    throw new Error('Failed to create project');
  }

  // 3. Fetch ALL template blocks (not just preview)
  const blocks = await fetchTemplateBlocks(templateId);

  if (blocks.length > 0) {
    // 4. DETERMINISTIC CLONE: Deep clone blocks with new IDs
    const clonedBlocks = blocks.map((block) => ({
      project_id: project.id,
      type: block.type as "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout",
      // Use block_payload if available, fallback to content for legacy data
      content: JSON.parse(JSON.stringify(block.block_payload || block.content || {})) as Json,
      order_index: block.order_index,
    }));

    // 5. Insert cloned blocks
    const { error: blocksError } = await supabase
      .from('blocks')
      .insert(clonedBlocks);

    if (blocksError) {
      console.error('Error copying blocks:', blocksError);
      // Clean up the project if blocks failed
      await supabase.from('projects').delete().eq('id', project.id);
      throw new Error('Failed to copy template blocks');
    }
  }

  return { projectId: project.id };
}

/**
 * Fetch a single template by slug
 */
export async function fetchTemplateBySlug(slug: string): Promise<Template | null> {
  const supabaseAny = supabase as any;
  
  const { data: template, error } = await supabaseAny
    .from('templates')
    .select('id, slug, title, description, category, tags, thumbnail_url, is_featured, created_at, version, default_theme_id, updated_at')
    .eq('slug', slug)
    .single();

  if (error || !template) {
    return null;
  }

  // Fetch all blocks for this template
  const blocks = await fetchTemplateBlocks(template.id);

  return {
    ...template,
    version: template.version || 1,
    default_theme_id: template.default_theme_id || 'classic',
    updated_at: template.updated_at || template.created_at,
    preview_blocks: blocks,
  } as Template;
}

/**
 * Check if templates are seeded
 */
export async function checkTemplatesSeeded(): Promise<boolean> {
  const supabaseAny = supabase as any;
  const { count, error } = await supabaseAny
    .from('templates')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error checking templates:', error);
    return false;
  }

  return (count || 0) > 0;
}

// =============================================================================
// PREVIEW CACHE API
// =============================================================================

/**
 * Get cached preview from database
 */
export async function getTemplatePreview(
  templateId: string,
  templateVersion: number,
  themeId: string
): Promise<string | null> {
  const supabaseAny = supabase as any;
  
  const { data, error } = await supabaseAny
    .from('template_previews')
    .select('image_base64, renderer_version')
    .eq('template_id', templateId)
    .eq('template_version', templateVersion)
    .eq('theme_id', themeId)
    .single();

  if (error || !data) {
    return null;
  }

  // Check if renderer version matches
  if (data.renderer_version !== RENDERER_VERSION) {
    return null;
  }

  return data.image_base64;
}

/**
 * Generate preview cache key for IndexedDB
 */
export function getPreviewCacheKey(
  templateId: string,
  templateVersion: number,
  themeId: string
): string {
  return `axora:preview:${templateId}:v${templateVersion}:${themeId}:r${RENDERER_VERSION}`;
}
