import { supabase } from "@/integrations/supabase/client";

export interface Outline {
  title: string;
  sections: Array<{
    heading: string;
    points: string[];
  }>;
  bullets: string[];
  summary: string;
}

export interface Block {
  type: "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout";
  content: Record<string, unknown>;
  order_index: number;
}

export interface GenerateOutlineParams {
  prompt: string;
  topic: string;
  tone: string;
}

export interface RefineBlockParams {
  block: {
    type: string;
    content: Record<string, unknown>;
  };
  instruction: string;
}

export const aiEngine = {
  /**
   * Generate an outline from a prompt
   */
  async generateOutline(params: GenerateOutlineParams): Promise<Outline> {
    const { data, error } = await supabase.functions.invoke("generate-outline", {
      body: params,
    });

    if (error) {
      console.error("Generate outline error:", error);
      throw new Error(error.message || "Failed to generate outline");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data as Outline;
  },

  /**
   * Generate blocks from an outline
   */
  async generateBlocks(outline: Outline): Promise<Block[]> {
    const { data, error } = await supabase.functions.invoke("generate-blocks", {
      body: { outline },
    });

    if (error) {
      console.error("Generate blocks error:", error);
      throw new Error(error.message || "Failed to generate blocks");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data.blocks as Block[];
  },

  /**
   * Refine a single block based on instructions
   */
  async refineBlock(params: RefineBlockParams): Promise<Block> {
    const { data, error } = await supabase.functions.invoke("refine-block", {
      body: params,
    });

    if (error) {
      console.error("Refine block error:", error);
      throw new Error(error.message || "Failed to refine block");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data as Block;
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
