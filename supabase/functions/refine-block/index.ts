import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RefineRequest {
  block: {
    type: string;
    content: Record<string, unknown>;
  };
  instruction: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { block, instruction } = await req.json() as RefineRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Refining block of type:", block.type, "with instruction:", instruction);

    const systemPrompt = `You are an expert content editor specializing in executive communications. Your task is to refine presentation content based on specific instructions.

Block types and their content structure:
- heading: { "level": 1|2|3, "text": "..." }
- text: { "text": "..." }
- list: { "items": ["...", "..."], "ordered": false }
- callout: { "text": "...", "icon": "info"|"warning"|"success" }
- two_col: { "left": "...", "right": "..." }
- table: { "headers": [...], "rows": [[...], [...]] }

Guidelines:
- Maintain the same block type unless explicitly asked to change it
- Preserve the professional, executive tone
- Be concise but impactful
- Follow the instruction precisely`;

    const userPrompt = `Refine this ${block.type} block based on the following instruction:

Current block content:
${JSON.stringify(block.content, null, 2)}

Instruction: ${instruction}

Return the updated content for this block.`;

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
              description: "Update the block content based on the instruction",
              parameters: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["heading", "text", "list", "callout", "two_col", "table", "image"]
                  },
                  content: {
                    type: "object",
                    description: "The updated content for the block"
                  }
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
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to refine block");
    }

    const data = await response.json();
    console.log("AI response received for refinement");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const updatedBlock = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(updatedBlock), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No valid response from AI");
  } catch (error) {
    console.error("refine-block error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
