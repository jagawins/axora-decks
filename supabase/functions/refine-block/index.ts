import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_INSTRUCTION_LENGTH = 500;
const VALID_BLOCK_TYPES = ["text", "heading", "list", "callout", "two_col", "table", "image"] as const;

interface BlockContent {
  [key: string]: unknown;
}

interface Block {
  type: typeof VALID_BLOCK_TYPES[number];
  content: BlockContent;
  order_index?: number;
}

interface RefineRequest {
  block: {
    type: string;
    content: BlockContent;
    order_index?: number;
  };
  instruction: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  block?: Block;
  instruction?: string;
}

function validateRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const { block, instruction } = body as RefineRequest;

  if (!block || typeof block !== "object") {
    return { valid: false, error: "block is required and must be an object" };
  }

  if (!block.type || !VALID_BLOCK_TYPES.includes(block.type as typeof VALID_BLOCK_TYPES[number])) {
    return { valid: false, error: `block.type must be one of: ${VALID_BLOCK_TYPES.join(", ")}` };
  }

  if (!block.content || typeof block.content !== "object") {
    return { valid: false, error: "block.content is required and must be an object" };
  }

  if (!instruction || typeof instruction !== "string" || instruction.trim().length === 0) {
    return { valid: false, error: "instruction is required and must be a non-empty string" };
  }

  return {
    valid: true,
    block: {
      type: block.type as Block["type"],
      content: block.content,
      order_index: typeof block.order_index === "number" ? block.order_index : 0,
    },
    instruction: instruction.slice(0, MAX_INSTRUCTION_LENGTH).trim(),
  };
}

serve(async (req) => {
  const requestId = crypto.randomUUID();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = validateRequest(body);

    if (!validation.valid) {
      console.error(`[${requestId}] Validation failed:`, validation.error);
      return new Response(
        JSON.stringify({ error: validation.error, requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { block, instruction } = validation;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error(`[${requestId}] LOVABLE_API_KEY not configured`);
      return new Response(
        JSON.stringify({ error: "AI service not configured", requestId }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[${requestId}] Refining ${block!.type} block with instruction: "${instruction}"`);

    const systemPrompt = `You are an expert content editor for executive presentations.

Block types and content structure:
- heading: { "level": 1|2|3, "text": "..." }
- text: { "text": "..." }
- list: { "items": ["..."], "ordered": false }
- callout: { "text": "...", "icon": "info"|"warning"|"success" }
- two_col: { "left": "...", "right": "..." }
- table: { "headers": [...], "rows": [[...]] }
- image: { "src": "...", "alt": "...", "caption": "..." }

Guidelines:
- Maintain block type unless explicitly asked to change
- Keep professional executive tone
- Be concise but impactful
- Follow instructions precisely

You MUST call the update_block function. If you cannot, return ONLY valid JSON - no markdown:
{ "type": "...", "content": {...} }`;

    const userPrompt = `Refine this ${block!.type} block:

Current content:
${JSON.stringify(block!.content, null, 2)}

Instruction: ${instruction}

Return the updated block.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "update_block",
              description: "Update block content based on instruction",
              parameters: {
                type: "object",
                properties: {
                  type: { type: "string", enum: VALID_BLOCK_TYPES as unknown as string[] },
                  content: { type: "object" }
                },
                required: ["type", "content"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "update_block" } }
      }),
    });

    if (!response.ok) {
      const status = response.status;
      console.error(`[${requestId}] AI gateway error: ${status}`);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment.", requestId }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue.", requestId }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable", requestId }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log(`[${requestId}] AI response received`);

    // Try tool call first
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const updatedBlock = JSON.parse(toolCall.function.arguments);
        const result: Block = {
          type: updatedBlock.type as Block["type"],
          content: updatedBlock.content,
          order_index: block!.order_index || 0,
        };

        console.log(`[${requestId}] Block refined successfully`);
        return new Response(
          JSON.stringify({ block: result, requestId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parseError) {
        console.error(`[${requestId}] Failed to parse tool call:`, parseError);
      }
    }

    // Fallback: try content
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const updatedBlock = JSON.parse(cleanContent);
        const result: Block = {
          type: updatedBlock.type as Block["type"],
          content: updatedBlock.content,
          order_index: block!.order_index || 0,
        };

        console.log(`[${requestId}] Block refined (fallback)`);
        return new Response(
          JSON.stringify({ block: result, requestId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parseError) {
        console.error(`[${requestId}] Failed to parse content fallback:`, parseError);
      }
    }

    console.error(`[${requestId}] No valid parseable response`);
    return new Response(
      JSON.stringify({ error: "Failed to refine block. Please try again.", requestId }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({
        error: error instanceof SyntaxError ? "Invalid JSON in request body" : "Internal server error",
        requestId
      }),
      { status: error instanceof SyntaxError ? 400 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
