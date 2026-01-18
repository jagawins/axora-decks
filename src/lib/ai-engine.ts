import { supabase } from "@/integrations/supabase/client";

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

interface APIResponse<T> {
  data: T | null;
  error: string | null;
  requestId?: string;
}

async function invokeFunction<T>(
  functionName: string,
  body: Record<string, unknown>
): Promise<APIResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
    });

    if (error) {
      console.error(`${functionName} invocation error:`, error);
      return { data: null, error: error.message || "Function invocation failed" };
    }

    if (data.error) {
      return { data: null, error: data.error, requestId: data.requestId };
    }

    return { data: data as T, error: null, requestId: data.requestId };
  } catch (err) {
    console.error(`${functionName} unexpected error:`, err);
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
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
