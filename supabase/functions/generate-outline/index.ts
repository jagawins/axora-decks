import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation limits
const MAX_TOPIC_LENGTH = 200;
const MAX_PROMPT_LENGTH = 6000;
const VALID_TONES = ["professional", "crisp", "analytical", "persuasive", "executive", "casual"] as const;
const DEFAULT_TONE = "professional";

interface OutlineRequest {
  prompt?: string;
  topic: string;
  tone?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: {
    prompt: string;
    topic: string;
    tone: string;
  };
}

function validateRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const { prompt, topic, tone } = body as OutlineRequest;

  // Topic is required
  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return { valid: false, error: "topic is required and must be a non-empty string" };
  }

  if (topic.length > MAX_TOPIC_LENGTH) {
    return { valid: false, error: `topic must be ${MAX_TOPIC_LENGTH} characters or less` };
  }

  // Prompt is optional but must be string if provided
  const sanitizedPrompt = typeof prompt === "string" ? prompt.slice(0, MAX_PROMPT_LENGTH).trim() : "";

  // Tone with default
  let sanitizedTone = DEFAULT_TONE;
  if (typeof tone === "string" && VALID_TONES.includes(tone.toLowerCase() as typeof VALID_TONES[number])) {
    sanitizedTone = tone.toLowerCase();
  }

  return {
    valid: true,
    sanitized: {
      prompt: sanitizedPrompt,
      topic: topic.trim(),
      tone: sanitizedTone,
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

    const { prompt, topic, tone } = validation.sanitized!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error(`[${requestId}] LOVABLE_API_KEY not configured`);
      return new Response(
        JSON.stringify({ error: "AI service not configured", requestId }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[${requestId}] Generating outline for topic: "${topic}" with tone: ${tone}`);

    const systemPrompt = `You are an expert executive presentation consultant. Create structured outlines for executive-grade presentations.

Guidelines:
- Create clear, hierarchical structures with 3-6 main sections
- Focus on executive-level communication
- Be concise but comprehensive
- Ensure logical flow between sections
- Use a ${tone} tone throughout

You MUST call the create_outline function with your response. If for any reason you cannot use the function, return ONLY valid JSON matching this schema - no markdown, no commentary:
{
  "title": "string",
  "sections": [{"heading": "string", "points": ["string"]}],
  "bullets": ["string"],
  "summary": "string"
}`;

    const userPrompt = `Create a detailed outline for:

Topic: ${topic}
${prompt ? `\nAdditional context:\n${prompt}` : ""}

Generate a structured outline suitable for an executive presentation.`;

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
              name: "create_outline",
              description: "Create a structured outline for a presentation",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "The title of the presentation" },
                  sections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        heading: { type: "string" },
                        points: { type: "array", items: { type: "string" } }
                      },
                      required: ["heading", "points"]
                    }
                  },
                  bullets: { type: "array", items: { type: "string" }, description: "Key takeaways" },
                  summary: { type: "string", description: "2-3 sentence executive summary" }
                },
                required: ["title", "sections", "bullets", "summary"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_outline" } }
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
        const outline = JSON.parse(toolCall.function.arguments);
        console.log(`[${requestId}] Parsed tool call response successfully`);
        return new Response(
          JSON.stringify({ outline, requestId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parseError) {
        console.error(`[${requestId}] Failed to parse tool call:`, parseError);
      }
    }

    // Fallback: try to parse content directly
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        // Strip markdown code blocks if present
        const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const outline = JSON.parse(cleanContent);
        console.log(`[${requestId}] Parsed content fallback successfully`);
        return new Response(
          JSON.stringify({ outline, requestId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parseError) {
        console.error(`[${requestId}] Failed to parse content fallback:`, parseError);
      }
    }

    console.error(`[${requestId}] No valid parseable response from AI`);
    return new Response(
      JSON.stringify({ error: "Failed to generate valid outline. Please try again.", requestId }),
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
