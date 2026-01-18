import { invokeFunction, type FunctionResponse } from "@/lib/supabase-function-client";

// Consistent types
export type BlockType = "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout";

export interface Block {
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
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

// Re-export for backward compatibility
interface APIResponse<T> {
  data: T | null;
  error: string | null;
  requestId?: string;
}

// Wrapper to maintain existing interface
async function callFunction<T>(
  functionName: string,
  body: Record<string, unknown>
): Promise<APIResponse<T>> {
  const response = await invokeFunction<T>(functionName, body);
  return {
    data: response.data,
    error: response.error,
    requestId: response.requestId,
  };
}

export const aiEngine = {
  /**
   * Generate an outline from a prompt
   */
  async generateOutline(params: GenerateOutlineParams): Promise<Outline> {
    const response = await callFunction<{ outline: Outline; requestId?: string }>(
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
  async generateBlocks(outline: Outline): Promise<Block[]> {
    const response = await invokeFunction<{ blocks: Block[]; requestId?: string }>(
      "generate-blocks",
      { outline }
    );

    if (response.error || !response.data?.blocks) {
      throw new Error(response.error || "Failed to generate blocks");
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

    // Step 2: Generate blocks from outline
    const blocks = await this.generateBlocks(outline);

    return { outline, blocks };
  },
};
