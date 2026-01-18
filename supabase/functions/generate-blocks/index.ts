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

interface BlockContent {
  [key: string]: unknown;
}

interface Block {
  type: "text" | "heading" | "list" | "callout" | "two_col" | "table";
  content: BlockContent;
  order_index: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  outline?: Outline;
}

function validateRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const { outline } = body as { outline?: unknown };

  if (!outline || typeof outline !== "object") {
    return { valid: false, error: "outline is required and must be an object" };
  }

  const o = outline as Partial<Outline>;

  if (!o.title || typeof o.title !== "string") {
    return { valid: false, error: "outline.title is required" };
  }

  if (!Array.isArray(o.sections) || o.sections.length === 0) {
    return { valid: false, error: "outline.sections must be a non-empty array" };
  }

  // Validate each section
  for (let i = 0; i < o.sections.length; i++) {
    const section = o.sections[i];
    if (!section.heading || typeof section.heading !== "string") {
      return { valid: false, error: `outline.sections[${i}].heading is required` };
    }
    if (!Array.isArray(section.points)) {
      return { valid: false, error: `outline.sections[${i}].points must be an array` };
    }
  }

  return {
    valid: true,
    outline: {
      title: o.title,
      sections: o.sections,
      bullets: Array.isArray(o.bullets) ? o.bullets : [],
      summary: typeof o.summary === "string" ? o.summary : "",
    },
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

    const outline = validation.outline!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error(`[${requestId}] LOVABLE_API_KEY not configured`);
      return new Response(
        JSON.stringify({ error: "AI service not configured", requestId }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[${requestId}] Generating blocks from outline: "${outline.title}"`);

    const systemPrompt = `You are an expert presentation designer. Convert outlines into presentation blocks.

Available block types:
- heading: { "level": 1|2|3, "text": "..." }
- text: { "text": "..." }
- list: { "items": ["..."], "ordered": false }
- callout: { "text": "...", "icon": "info"|"warning"|"success" }
- two_col: { "left": "...", "right": "..." }
- table: { "headers": [...], "rows": [[...]] }

Guidelines:
- Start with H1 heading for title
- Use H2 for main sections
- Convert bullets to list blocks
- Use callouts for key takeaways
- Keep text blocks to 2-4 sentences max
- Create 8-15 blocks total for a good presentation

You MUST call the create_blocks function. If you cannot use the function, return ONLY valid JSON - no markdown:
{ "blocks": [{ "type": "...", "content": {...} }] }`;

    const userPrompt = `Convert this outline into presentation blocks:

Title: ${outline.title}
Summary: ${outline.summary}

Sections:
${outline.sections.map((s, i) => `${i + 1}. ${s.heading}\n${s.points.map(p => `   - ${p}`).join("\n")}`).join("\n\n")}

Key Takeaways:
${outline.bullets.map(b => `- ${b}`).join("\n")}`;

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
              description: "Create presentation blocks from outline",
              parameters: {
                type: "object",
                properties: {
                  blocks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["heading", "text", "list", "callout", "two_col", "table"] },
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
        const result = JSON.parse(toolCall.function.arguments);
        const rawBlocks = result.blocks as Array<{ type: string; content: BlockContent }>;
        
        const blocks: Block[] = rawBlocks.map((b, i) => ({
          type: b.type as Block["type"],
          content: b.content,
          order_index: i,
        }));

        console.log(`[${requestId}] Generated ${blocks.length} blocks`);
        return new Response(
          JSON.stringify({ blocks, requestId }),
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
        const result = JSON.parse(cleanContent);
        const rawBlocks = result.blocks as Array<{ type: string; content: BlockContent }>;
        
        const blocks: Block[] = rawBlocks.map((b, i) => ({
          type: b.type as Block["type"],
          content: b.content,
          order_index: i,
        }));

        console.log(`[${requestId}] Generated ${blocks.length} blocks (fallback)`);
        return new Response(
          JSON.stringify({ blocks, requestId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parseError) {
        console.error(`[${requestId}] Failed to parse content fallback:`, parseError);
      }
    }

    console.error(`[${requestId}] No valid parseable response`);
    return new Response(
      JSON.stringify({ error: "Failed to generate blocks. Please try again.", requestId }),
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
