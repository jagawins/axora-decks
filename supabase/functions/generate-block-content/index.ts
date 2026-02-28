import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_BLOCK_TYPES = ["text", "heading", "list", "callout", "two_col", "table", "image"] as const;
type BlockType = typeof VALID_BLOCK_TYPES[number];

interface GenerateRequest {
  type: string;
  prompt: string;
  context?: string;
}

// Utility to strip any Markdown formatting that slips through
function stripMarkdown(s: unknown): unknown {
  if (typeof s !== "string") return s;

  return s
    // bold/italic markers
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    // heading markers
    .replace(/^#{1,6}\s+/gm, "")
    // leading bullet markers
    .replace(/^\s*[*-]\s+/gm, "")
    // leading numbered list markers
    .replace(/^\s*\d+\.\s+/gm, "")
    // backticks
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function sanitizeContent(content: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const k of Object.keys(content)) {
    const v = content[k];
    if (typeof v === "string") out[k] = stripMarkdown(v);
    else if (Array.isArray(v)) out[k] = v.map(stripMarkdown);
    else if (v && typeof v === "object") out[k] = sanitizeContent(v as Record<string, unknown>);
    else out[k] = v;
  }

  return out;
}

serve(async (req) => {
  const requestId = crypto.randomUUID();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const _authClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { error: _authError } = await _authClient.auth.getClaims(authHeader.replace("Bearer ", ""));
  if (_authError) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const body = await req.json() as GenerateRequest;
    const { type, prompt, context } = body;

    if (!type || !VALID_BLOCK_TYPES.includes(type as BlockType)) {
      return new Response(
        JSON.stringify({ error: `type must be one of: ${VALID_BLOCK_TYPES.join(", ")}`, requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "prompt is required", requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error(`[${requestId}] LOVABLE_API_KEY not configured`);
      return new Response(
        JSON.stringify({ error: "AI service not configured", requestId }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[${requestId}] Generating ${type} block with prompt: "${prompt.slice(0, 100)}..."`);

    const contentSchemas: Record<string, object> = {
      text: {
        type: "object",
        properties: { text: { type: "string", description: "The generated text content - make it professional and impactful" } },
        required: ["text"]
      },
      heading: {
        type: "object",
        properties: {
          level: { type: "number", description: "Heading level: 1 for main title, 2 for section, 3 for subsection" },
          text: { type: "string", description: "The heading text - concise and compelling" }
        },
        required: ["level", "text"]
      },
      list: {
        type: "object",
        properties: {
          items: { type: "array", items: { type: "string" }, description: "3-7 clear, actionable list items as plain strings without bullet characters" },
          ordered: { type: "boolean", description: "true for numbered steps, false for bullet points" }
        },
        required: ["items", "ordered"]
      },
      callout: {
        type: "object",
        properties: {
          text: { type: "string", description: "Key insight or important message" },
          icon: { type: "string", enum: ["info", "warning", "success"], description: "info for tips, warning for caution, success for achievements" }
        },
        required: ["text", "icon"]
      },
      two_col: {
        type: "object",
        properties: {
          left: { type: "string", description: "Left column content - one perspective or aspect" },
          right: { type: "string", description: "Right column content - contrasting or complementary perspective" }
        },
        required: ["left", "right"]
      },
      table: {
        type: "object",
        properties: {
          headers: { type: "array", items: { type: "string" }, description: "2-5 clear column headers" },
          rows: { type: "array", items: { type: "array", items: { type: "string" } }, description: "3-6 rows of data matching the headers" }
        },
        required: ["headers", "rows"]
      },
      image: {
        type: "object",
        properties: {
          src: { type: "string", description: "Leave empty - user will add image URL" },
          alt: { type: "string", description: "Descriptive alt text for the image" },
          caption: { type: "string", description: "Caption explaining the image relevance" }
        },
        required: ["src", "alt", "caption"]
      }
    };

    const blockDescriptions: Record<string, string> = {
      text: "a professional paragraph of text (2-4 sentences)",
      heading: "a compelling heading with appropriate level",
      list: "a structured list of key points (3-7 items)",
      callout: "an important insight or key takeaway",
      two_col: "a two-column comparison or complementary content",
      table: "a data table with clear headers and relevant data",
      image: "image placeholder with descriptive alt text and caption"
    };

    const systemPrompt = `You are an expert content creator for executive presentations.

Output rules (non-negotiable):
- Return plain text only. No Markdown. No asterisks. No bullets using * or -.
- No **bold**, no _, no # headings, no backticks.
- Use short sentences. Use line breaks if needed.
- For "list" blocks: return items as plain strings without bullet characters or numbering.
- For "table" blocks: cell strings must be plain text without Markdown.

Guidelines:
- Write in a professional, executive tone
- Be concise but impactful
- Use clear, jargon-free language
- Make content actionable and relevant`;

    const userPrompt = `Create ${blockDescriptions[type]} about the following topic:

Topic: ${prompt.trim()}
${context ? `\nContext: ${context}` : ""}

Formatting requirements for ${type} block:
- text, callout, two_col: plain text, no Markdown symbols.
- heading: plain text title only.
- list: items must be strings without leading bullets (*-) or numbering (1.).
- table: cell strings without Markdown.

Generate content that would fit well in a business presentation.`;

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured", requestId }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropicTool = {
      name: "create_block_content",
      description: `Generate ${type} block content for an executive presentation. All strings must be plain text without Markdown formatting.`,
      input_schema: {
        type: "object",
        properties: {
          content: contentSchemas[type]
        },
        required: ["content"]
      }
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        tools: [anthropicTool],
        tool_choice: { type: "tool", name: "create_block_content" },
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
          JSON.stringify({ error: "AI credits exhausted. Please add credits.", requestId }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable", requestId }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log(`[${requestId}] Claude response received`);

    // Parse Anthropic tool_use response
    const toolUse = data.content?.find((c: { type: string }) => c.type === "tool_use");
    if (toolUse?.input) {
      const result = toolUse.input;
      if (result.content && Object.keys(result.content).length > 0) {
        const cleaned = sanitizeContent(result.content);
        console.log(`[${requestId}] Block content generated successfully`);
        return new Response(
          JSON.stringify({ content: cleaned, requestId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fallback: try text content
    const textBlock = data.content?.find((c: { type: string }) => c.type === "text");
    if (textBlock?.text) {
      try {
        const cleanContent = textBlock.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const result = JSON.parse(cleanContent);
        if (result.content) {
          const cleaned = sanitizeContent(result.content);
          console.log(`[${requestId}] Block content generated (fallback)`);
          return new Response(
            JSON.stringify({ content: cleaned, requestId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (parseError) {
        console.error(`[${requestId}] Failed to parse fallback:`, parseError);
      }
    }

    console.error(`[${requestId}] No valid content generated`);
    return new Response(
      JSON.stringify({ error: "Failed to generate content. Please try again.", requestId }),
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
