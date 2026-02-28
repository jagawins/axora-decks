import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
  density?: "vibes" | "minimal" | "context" | "plenty";
  cardsCount?: number;
}

interface Outline {
  title: string;
  sections: Array<{ heading: string; points: string[] }>;
  bullets: string[];
  summary: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: {
    prompt: string;
    topic: string;
    tone: string;
    density: string;
    cardsCount: number;
  };
}

interface OutlineValidation {
  valid: boolean;
  errors: string[];
}

function validateRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const { prompt, topic, tone, density, cardsCount } = body as OutlineRequest;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return { valid: false, error: "topic is required and must be a non-empty string" };
  }

  if (topic.length > MAX_TOPIC_LENGTH) {
    return { valid: false, error: `topic must be ${MAX_TOPIC_LENGTH} characters or less` };
  }

  const sanitizedPrompt = typeof prompt === "string" ? prompt.slice(0, MAX_PROMPT_LENGTH).trim() : "";

  let sanitizedTone = DEFAULT_TONE;
  if (typeof tone === "string" && VALID_TONES.includes(tone.toLowerCase() as typeof VALID_TONES[number])) {
    sanitizedTone = tone.toLowerCase();
  }

  const validDensities = ["vibes", "minimal", "context", "plenty"];
  const sanitizedDensity = typeof density === "string" && validDensities.includes(density) ? density : "context";
  const sanitizedCardsCount = typeof cardsCount === "number" && cardsCount >= 3 && cardsCount <= 25 ? cardsCount : 10;

  return {
    valid: true,
    sanitized: {
      prompt: sanitizedPrompt,
      topic: topic.trim(),
      tone: sanitizedTone,
      density: sanitizedDensity,
      cardsCount: sanitizedCardsCount,
    },
  };
}

// Validate outline has required content
function validateOutline(outline: unknown): OutlineValidation {
  const errors: string[] = [];

  if (!outline || typeof outline !== "object") {
    return { valid: false, errors: ["outline is not an object"] };
  }

  const o = outline as Partial<Outline>;

  if (!o.title || typeof o.title !== "string" || o.title.length < 5) {
    errors.push("title missing or too short (min 5 chars)");
  }

  if (!Array.isArray(o.sections) || o.sections.length < 3) {
    errors.push(`sections missing or too few (got ${Array.isArray(o.sections) ? o.sections.length : 0}, need 3+)`);
  } else {
    for (let i = 0; i < o.sections.length; i++) {
      const s = o.sections[i];
      if (!s.heading || typeof s.heading !== "string" || s.heading.length < 3) {
        errors.push(`section[${i}].heading missing or too short`);
      }
      if (!Array.isArray(s.points) || s.points.length < 2) {
        errors.push(`section[${i}].points missing or too few (need 2+)`);
      }
    }
  }

  if (!Array.isArray(o.bullets) || o.bullets.length < 3) {
    errors.push(`bullets missing or too few (got ${Array.isArray(o.bullets) ? o.bullets.length : 0}, need 3+)`);
  }

  if (!o.summary || typeof o.summary !== "string" || o.summary.length < 20) {
    errors.push("summary missing or too short (min 20 chars)");
  }

  return { valid: errors.length === 0, errors };
}

function getToolSchema() {
  return {
    name: "create_outline",
    description: "Create a structured outline for a presentation. You MUST provide at least 3 sections with 2+ points each, and 3+ key takeaways.",
    input_schema: {
      type: "object",
      properties: {
        title: { 
          type: "string", 
          description: "The title of the presentation (at least 5 characters)"
        },
        sections: {
          type: "array",
          description: "3-6 sections, each with a heading and 2-5 talking points",
          items: {
            type: "object",
            properties: {
              heading: { type: "string", description: "Section heading (at least 3 characters)" },
              points: { 
                type: "array", 
                description: "2-5 talking points per section",
                items: { type: "string" }
              }
            },
            required: ["heading", "points"]
          }
        },
        bullets: { 
          type: "array", 
          items: { type: "string" }, 
          description: "3-5 key takeaway bullet points"
        },
        summary: { 
          type: "string", 
          description: "2-3 sentence executive summary (at least 50 characters)"
        }
      },
      required: ["title", "sections", "bullets", "summary"]
    }
  };
}

function getDensityConstraints(density: string): string {
  switch (density) {
    case "vibes":
      return `
DENSITY: JUST VIBES (STRICT CONSTRAINTS)
- Prefer headings and visual impact over text
- Maximum 2-3 very short points per section
- Points should be punchy phrases, not sentences
- No detailed explanations
- Focus on bold statements and key phrases only`;
    
    case "minimal":
      return `
DENSITY: MINIMAL TEXT (STRICT CONSTRAINTS)
- Maximum 3 bullet points per section
- Each point: maximum 2 short sentences
- Keep all content concise and punchy
- No lengthy explanations`;
    
    case "context":
      return `
DENSITY: A LITTLE CONTEXT (CONSTRAINTS)
- 3-5 bullet points per section allowed
- Points can have supporting context
- Balance between detail and readability`;
    
    case "plenty":
      return `
DENSITY: PLENTY OF TEXT (CONSTRAINTS)
- Allow detailed explanations in points
- 4-6 points per section permitted
- Include comprehensive context and supporting information`;
    
    default:
      return "";
  }
}

function buildSystemPrompt(tone: string, density: string, cardsCount: number, isRetry: boolean, validationErrors?: string[]): string {
  const densityConstraints = getDensityConstraints(density);
  const sectionCount = Math.max(3, Math.min(6, Math.ceil(cardsCount / 2)));
  
  let prompt = `You are an expert executive presentation consultant. Create structured outlines for executive-grade presentations.

CRITICAL REQUIREMENTS (non-negotiable):
1. You MUST provide ${sectionCount} sections with bullet points each
2. You MUST provide 3-5 key takeaways in the bullets array
3. All text must be plain text - NO Markdown formatting
4. No asterisks, bold, italic, headings, or bullet characters
5. Use a ${tone} tone throughout
6. This outline should support approximately ${cardsCount} slides/cards
${densityConstraints}

Structure requirements:
- Title: Clear, compelling title (5+ characters)
- Sections: ${sectionCount} sections, each with heading and talking points
- Bullets: 3-5 key takeaways for the audience
- Summary: 2-3 sentence executive summary (50+ characters)

You MUST call create_outline with ALL fields populated. Empty arrays will fail.`;

  if (isRetry && validationErrors?.length) {
    prompt += `

CORRECTION REQUIRED - Previous response failed validation:
${validationErrors.join("\n")}

Fix ALL issues above. Provide complete sections with points and bullets.`;
  }

  return prompt;
}

async function callAI(
  _apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ response?: Response; error?: string }> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    return { error: "ANTHROPIC_API_KEY not configured" };
  }

  try {
    const anthropicTool = getToolSchema();

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
        tool_choice: { type: "tool", name: "create_outline" },
      }),
    });

    // Convert Anthropic response to OpenAI-compatible format for parseAIResponse
    if (response.ok) {
      const data = await response.json();
      const toolUse = data.content?.find((c: { type: string }) => c.type === "tool_use");
      const fakeOpenAI = {
        choices: [{
          message: {
            tool_calls: toolUse ? [{
              function: {
                name: toolUse.name,
                arguments: JSON.stringify(toolUse.input),
              }
            }] : undefined,
            content: !toolUse ? data.content?.find((c: { type: string }) => c.type === "text")?.text : undefined,
          }
        }]
      };
      return {
        response: new Response(JSON.stringify(fakeOpenAI), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      };
    }

    // Log and pass through error responses
    const errorBody = await response.text();
    console.error(`Anthropic API error ${response.status}: ${errorBody}`);
    return { response: new Response(errorBody, { status: response.status, headers: { "Content-Type": "application/json" } }) };
  } catch (e) {
    return { error: `fetch error: ${e}` };
  }
}

function parseAIResponse(data: Record<string, unknown>): { outline: Outline | null; parseError?: string } {
  const toolCall = (data.choices as Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }> } }>)?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall?.function?.arguments) {
    try {
      return { outline: JSON.parse(toolCall.function.arguments) };
    } catch (e) {
      return { outline: null, parseError: `tool call parse error: ${e}` };
    }
  }

  const content = (data.choices as Array<{ message?: { content?: string } }>)?.[0]?.message?.content;
  if (content) {
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return { outline: JSON.parse(cleanContent) };
    } catch (e) {
      return { outline: null, parseError: `content parse error: ${e}` };
    }
  }

  return { outline: null, parseError: "no tool call or content in response" };
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
    const body = await req.json();
    const validation = validateRequest(body);

    if (!validation.valid) {
      console.error(`[${requestId}] Validation failed:`, validation.error);
      return new Response(
        JSON.stringify({ error: validation.error, requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, topic, tone, density, cardsCount } = validation.sanitized!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error(`[${requestId}] LOVABLE_API_KEY not configured`);
      return new Response(
        JSON.stringify({ error: "AI service not configured", requestId }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[${requestId}] Generating outline for topic: "${topic}" with tone: ${tone}, density: ${density}, cards: ${cardsCount}`);

    const userPrompt = `Create a detailed outline for:

Topic: ${topic}
${prompt ? `\nAdditional context:\n${prompt}` : ""}

Generate a structured outline suitable for an executive presentation with approximately ${cardsCount} slides/cards.`;

    // First attempt
    const systemPrompt1 = buildSystemPrompt(tone, density, cardsCount, false);
    const result1 = await callAI(LOVABLE_API_KEY, systemPrompt1, userPrompt);

    if (result1.error) {
      console.error(`[${requestId}] AI call failed:`, result1.error);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable", requestId }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response1 = result1.response!;
    if (!response1.ok) {
      const status = response1.status;
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

    const data1 = await response1.json();
    console.log(`[${requestId}] AI response received`);

    const parsed1 = parseAIResponse(data1);

    if (parsed1.outline) {
      const outlineValidation1 = validateOutline(parsed1.outline);

      if (outlineValidation1.valid) {
        console.log(`[${requestId}] Generated valid outline with ${parsed1.outline.sections.length} sections`);
        return new Response(
          JSON.stringify({ outline: parsed1.outline, requestId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Retry with correction
      console.warn(`[${requestId}] Outline validation failed (attempt 1): ${outlineValidation1.errors.join("; ")}`);
      console.log(`[${requestId}] Retrying with correction prompt...`);

      const systemPrompt2 = buildSystemPrompt(tone, density, cardsCount, true, outlineValidation1.errors);
      const result2 = await callAI(LOVABLE_API_KEY, systemPrompt2, userPrompt);

      if (result2.response?.ok) {
        const data2 = await result2.response.json();
        const parsed2 = parseAIResponse(data2);

        if (parsed2.outline) {
          const outlineValidation2 = validateOutline(parsed2.outline);

          if (outlineValidation2.valid) {
            console.log(`[${requestId}] Generated valid outline after retry with ${parsed2.outline.sections.length} sections`);
            return new Response(
              JSON.stringify({ outline: parsed2.outline, requestId }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          console.error(`[${requestId}] Outline still invalid after retry: ${outlineValidation2.errors.join("; ")}`);
        }
      }

      return new Response(
        JSON.stringify({ 
          error: "Failed to generate valid outline after retry", 
          requestId,
          validationErrors: outlineValidation1.errors.slice(0, 5)
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else {
      console.error(`[${requestId}] Parse failed: ${parsed1.parseError}`);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", requestId }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
