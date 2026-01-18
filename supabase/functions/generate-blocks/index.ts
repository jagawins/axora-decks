import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Section {
  heading: string;
  points: string[];
}

interface Outline {
  title: string;
  sections: Section[];
  bullets: string[];
  summary: string;
}

interface Block {
  type: "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout";
  content: Record<string, unknown>;
  order_index: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { outline } = await req.json() as { outline: Outline };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating blocks from outline:", outline.title);

    const systemPrompt = `You are an expert presentation designer. Your task is to convert an outline into presentation blocks.

Available block types:
- heading: For section headers. Content: { "level": 1|2|3, "text": "..." }
- text: For paragraphs. Content: { "text": "..." }
- list: For bullet points. Content: { "items": ["...", "..."], "ordered": false }
- callout: For key insights. Content: { "text": "...", "icon": "info"|"warning"|"success" }
- two_col: For side-by-side content. Content: { "left": "...", "right": "..." }
- table: For data tables. Content: { "headers": [...], "rows": [[...], [...]] }

Guidelines:
- Start with an H1 heading block for the title
- Use H2 headings for main sections
- Convert bullet points to list blocks
- Use callouts for key takeaways or important points
- Use two_col for comparing concepts
- Maintain logical flow and visual hierarchy
- Keep text blocks concise (2-4 sentences max)`;

    const userPrompt = `Convert this outline into presentation blocks:

Title: ${outline.title}

Summary: ${outline.summary}

Sections:
${outline.sections.map((s, i) => `${i + 1}. ${s.heading}\n${s.points.map(p => `   - ${p}`).join('\n')}`).join('\n\n')}

Key Takeaways:
${outline.bullets.map(b => `- ${b}`).join('\n')}

Generate an array of blocks that would create a compelling, well-structured presentation.`;

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
              name: "create_blocks",
              description: "Create an array of presentation blocks from the outline",
              parameters: {
                type: "object",
                properties: {
                  blocks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["heading", "text", "list", "callout", "two_col", "table"]
                        },
                        content: { type: "object" }
                      },
                      required: ["type", "content"]
                    }
                  }
                },
                required: ["blocks"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_blocks" } }
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
      throw new Error("Failed to generate blocks");
    }

    const data = await response.json();
    console.log("AI response received for blocks");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      // Add order_index to each block
      const blocks: Block[] = result.blocks.map((block: Omit<Block, 'order_index'>, index: number) => ({
        ...block,
        order_index: index
      }));
      return new Response(JSON.stringify({ blocks }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No valid response from AI");
  } catch (error) {
    console.error("generate-blocks error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
