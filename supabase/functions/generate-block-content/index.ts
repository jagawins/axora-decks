import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_BLOCK_TYPES = ["text", "heading", "list", "callout", "two_col", "table", "image"] as const;
type BlockType = typeof VALID_BLOCK_TYPES[number];

interface GenerateRequest {
  type: string;
  prompt: string;
  context?: string;
}

serve(async (req) => {
  const requestId = crypto.randomUUID();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
          items: { type: "array", items: { type: "string" }, description: "3-7 clear, actionable list items" },
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
Generate professional, impactful content based on the user's topic and block type.

Guidelines:
- Write in a professional, executive tone
- Be concise but impactful
- Use clear, jargon-free language
- Make content actionable and relevant`;

    const userPrompt = `Create ${blockDescriptions[type]} about the following topic:

Topic: ${prompt.trim()}
${context ? `\nContext: ${context}` : ""}

Generate content that would fit well in a business presentation.`;

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
              name: "create_block_content",
              description: `Generate ${type} block content for an executive presentation`,
              parameters: {
                type: "object",
                properties: {
                  content: contentSchemas[type]
                },
                required: ["content"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_block_content" } }
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
    console.log(`[${requestId}] AI response received`);

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const result = JSON.parse(toolCall.function.arguments);
        if (result.content && Object.keys(result.content).length > 0) {
          console.log(`[${requestId}] Block content generated successfully`);
          return new Response(
            JSON.stringify({ content: result.content, requestId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
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
        if (result.content) {
          console.log(`[${requestId}] Block content generated (fallback)`);
          return new Response(
            JSON.stringify({ content: result.content, requestId }),
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
