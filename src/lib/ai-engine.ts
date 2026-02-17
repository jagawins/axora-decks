import { invokeFunction } from "@/lib/supabase-function-client";

// Basic block types
export type BasicBlockType = "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout";

// Visual block types from the layout engine
export type VisualBlockType = 
  | "stat_block" 
  | "quote_block" 
  | "timeline_block" 
  | "comparison_table"
  | "card_grid" 
  | "hero_header" 
  | "exec_summary" 
  | "cta_section"
  | "section_divider" 
  | "icon_text_block" 
  | "framed_insight"
  | "three_pillars"
  | "two_by_two_matrix"
  | "decision_next_steps"
  | "chart_block";

// Decision block types (Decision Layer)
export type DecisionBlockType =
  | "decision_summary"
  | "evidence_map"
  | "scenario_set"
  | "recommendation_panel";

// All block types
export type BlockType = BasicBlockType | VisualBlockType | DecisionBlockType;

export interface Block {
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
  block_payload?: Record<string, unknown>;
  block_meta?: { schema_version: number };
}

export interface Outline {
  title: string;
  sections: Array<{
    heading: string;
    points: string[];
  }>;
  bullets: string[];
  summary: string;
}

export interface GenerateOutlineParams {
  prompt?: string;
  topic: string;
  tone?: "professional" | "crisp" | "analytical" | "persuasive" | "executive" | "casual";
  enableVisualBlocks?: boolean;
  decisionMode?: boolean;
}

export interface RefineBlockParams {
  block: {
    type: BlockType;
    content: Record<string, unknown>;
    order_index?: number;
  };
  instruction: string;
}

export interface GenerateBlockContentParams {
  type: BlockType;
  prompt: string;
  context?: string;
}

export const aiEngine = {
  /**
   * Generate an outline from a prompt
   */
  async generateOutline(params: GenerateOutlineParams): Promise<Outline> {
    const response = await invokeFunction<{ outline: Outline; requestId?: string }>(
      "generate-outline",
      {
        topic: params.topic,
        prompt: params.prompt || "",
        tone: params.tone || "professional",
      }
    );

    if (response.error || !response.data?.outline) {
      throw new Error(response.error || "Failed to generate outline");
    }

    return response.data.outline;
  },

  /**
   * Generate blocks from an outline
   */
  async generateBlocks(outline: Outline, enableVisualBlocks = true, decisionMode = false): Promise<Block[]> {
    const response = await invokeFunction<{ blocks: Block[]; requestId?: string }>(
      "generate-blocks",
      { outline, enableVisualBlocks, decision_mode: decisionMode }
    );

    if (response.error || !response.data?.blocks) {
      throw new Error(response.error || "Failed to generate blocks");
    }

    return response.data.blocks;
  },

  /**
   * Generate blocks directly from text, bypassing outline generation.
   * Preserves original text and uses it directly for block generation.
   */
  async generateBlocksFromText(
    text: string, 
    enableVisualBlocks = true,
    preserveWording = true,
    decisionMode = false
  ): Promise<Block[]> {
    // Create a minimal outline structure from the raw text
    // This preserves the original content without AI rewriting
    const lines = text.trim().split('\n').filter(l => l.trim());
    const firstLine = lines[0] || 'Content Import';
    
    // Build a minimal outline that preserves the original text
    const outline: Outline = {
      title: firstLine.substring(0, 100),
      sections: [{
        heading: 'Content',
        points: lines.slice(1).map(l => l.trim()).filter(Boolean)
      }],
      bullets: [],
      summary: text.substring(0, 500)
    };

    const response = await invokeFunction<{ blocks: Block[]; requestId?: string }>(
      "generate-blocks",
      { outline, enableVisualBlocks, preserveWording, decision_mode: decisionMode }
    );

    if (response.error || !response.data?.blocks) {
      throw new Error(response.error || "Failed to generate blocks from text");
    }

    return response.data.blocks;
  },

  /**
   * Refine a single block based on instructions
   */
  async refineBlock(params: RefineBlockParams): Promise<Block> {
    const response = await invokeFunction<{ block: Block; requestId?: string }>(
      "refine-block",
      {
        block: params.block,
        instruction: params.instruction,
      }
    );

    if (response.error || !response.data?.block) {
      throw new Error(response.error || "Failed to refine block");
    }

    return response.data.block;
  },

  /**
   * Generate block content from scratch based on a prompt
   */
  async generateBlockContent(params: GenerateBlockContentParams): Promise<Record<string, unknown>> {
    const response = await invokeFunction<{ content: Record<string, unknown>; requestId?: string }>(
      "generate-block-content",
      {
        type: params.type,
        prompt: params.prompt,
        context: params.context,
      }
    );

    if (response.error || !response.data?.content) {
      throw new Error(response.error || "Failed to generate content");
    }

    return response.data.content;
  },

  /**
   * Full pipeline: prompt → outline → blocks
   */
  async generateFromPrompt(params: GenerateOutlineParams): Promise<{
    outline: Outline;
    blocks: Block[];
  }> {
    // Step 1: Generate outline
    const outline = await this.generateOutline(params);

    // Step 2: Generate blocks from outline with visual blocks enabled
    const enableVisual = params.enableVisualBlocks !== false;
    const blocks = await this.generateBlocks(outline, enableVisual, params.decisionMode ?? false);

    return { outline, blocks };
  },
};
