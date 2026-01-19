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
  type: "text" | "heading" | "list" | "callout" | "two_col" | "table" | "image";
  content: BlockContent;
  order_index: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  outline?: Outline;
}

interface BlockValidationResult {
  valid: boolean;
  invalidCount: number;
  errors: string[];
  blocks: Block[];
}

// Required content keys by block type
const REQUIRED_KEYS: Record<string, string[]> = {
  heading: ["level", "text"],
  text: ["text"],
  list: ["items", "ordered"],
  callout: ["text", "icon"],
  two_col: ["left", "right"],
  table: ["headers", "rows"],
  image: ["src", "alt"],
};

const VALID_BLOCK_TYPES = ["heading", "text", "list", "callout", "two_col", "table", "image"];

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

function sanitizeContent(content: BlockContent): BlockContent {
  const out: BlockContent = {};

  for (const k of Object.keys(content)) {
    const v = content[k];
    if (typeof v === "string") out[k] = stripMarkdown(v);
    else if (Array.isArray(v)) out[k] = v.map(item => 
      typeof item === "string" ? stripMarkdown(item) : 
      (item && typeof item === "object") ? sanitizeContent(item as BlockContent) : item
    );
    else if (v && typeof v === "object") out[k] = sanitizeContent(v as BlockContent);
    else out[k] = v;
  }

  return out;
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

// Validate block content has required keys and non-empty values
function validateBlockContent(type: string, content: BlockContent): { valid: boolean; missingKeys: string[] } {
  const requiredKeys = REQUIRED_KEYS[type];
  if (!requiredKeys) {
    return { valid: false, missingKeys: [`unknown type: ${type}`] };
  }

  const missingKeys: string[] = [];

  for (const key of requiredKeys) {
    const value = content[key];
    
    if (value === undefined || value === null) {
      missingKeys.push(key);
      continue;
    }

    // Check for empty values
    if (typeof value === "string" && value.trim() === "") {
      missingKeys.push(`${key} (empty string)`);
      continue;
    }

    if (Array.isArray(value) && value.length === 0) {
      missingKeys.push(`${key} (empty array)`);
      continue;
    }
  }

  return { valid: missingKeys.length === 0, missingKeys };
}

// Validate all blocks and return detailed errors
function validateBlocks(rawBlocks: Array<{ type: string; content: BlockContent }>): BlockValidationResult {
  const validBlocks: Block[] = [];
  const errors: string[] = [];
  let invalidCount = 0;

  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i];

    // Check type
    if (!block.type || !VALID_BLOCK_TYPES.includes(block.type)) {
      errors.push(`block[${i}]: invalid type "${block.type || 'undefined'}"`);
      invalidCount++;
      continue;
    }

    // Check content exists
    if (!block.content || typeof block.content !== "object") {
      errors.push(`block[${i}] (${block.type}): content missing or not an object`);
      invalidCount++;
      continue;
    }

    // Validate required keys
    const contentValidation = validateBlockContent(block.type, block.content);
    if (!contentValidation.valid) {
      errors.push(`block[${i}] (${block.type}): missing keys [${contentValidation.missingKeys.join(", ")}]`);
      invalidCount++;
      continue;
    }

    // Block is valid
    validBlocks.push({
      type: block.type as Block["type"],
      content: sanitizeContent(block.content),
      order_index: i,
    });
  }

  return {
    valid: invalidCount === 0 && validBlocks.length > 0,
    invalidCount,
    errors,
    blocks: validBlocks,
  };
}

// Parse AI response and extract blocks
function parseAIResponse(data: Record<string, unknown>): { blocks: Array<{ type: string; content: BlockContent }> | null; parseError?: string } {
  // Try tool call first
  const toolCall = (data.choices as Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }> } }>)?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    try {
      const result = JSON.parse(toolCall.function.arguments);
      if (Array.isArray(result.blocks)) {
        return { blocks: result.blocks };
      }
      return { blocks: null, parseError: "tool call result missing blocks array" };
    } catch (e) {
      return { blocks: null, parseError: `tool call parse error: ${e}` };
    }
  }

  // Fallback: try content
  const content = (data.choices as Array<{ message?: { content?: string } }>)?.[0]?.message?.content;
  if (content) {
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const result = JSON.parse(cleanContent);
      if (Array.isArray(result.blocks)) {
        return { blocks: result.blocks };
      }
      return { blocks: null, parseError: "content result missing blocks array" };
    } catch (e) {
      return { blocks: null, parseError: `content parse error: ${e}` };
    }
  }

  return { blocks: null, parseError: "no tool call or content in response" };
}

// Build the system prompt
function buildSystemPrompt(isRetry: boolean, validationErrors?: string[]): string {
  const strictSchema = `
STRICT OUTPUT SCHEMA (JSON only, no markdown):
{
  "blocks": [
    { "type": "heading", "content": { "level": 1, "text": "string" } },
    { "type": "text", "content": { "text": "string" } },
    { "type": "list", "content": { "items": ["string"], "ordered": false } },
    { "type": "callout", "content": { "text": "string", "icon": "info|warning|success" } },
    { "type": "two_col", "content": { "left": "string", "right": "string" } },
    { "type": "table", "content": { "headers": ["string"], "rows": [["string"]] } }
  ]
}`;

  let prompt = `You are an expert presentation designer. Convert outlines into presentation blocks.

CRITICAL OUTPUT RULES (non-negotiable):
- Return ONLY valid JSON matching the schema below. NO markdown, NO code fences.
- Every block MUST have "type" and "content" fields.
- Content MUST include ALL required keys for the block type.
- All text must be plain strings - no asterisks, no bold markers, no bullet characters.
- List items must be plain strings WITHOUT leading bullet/number characters.
${strictSchema}

REQUIRED CONTENT KEYS BY TYPE:
- heading: { "level": number (1-3), "text": string }
- text: { "text": string }
- list: { "items": string[], "ordered": boolean }
- callout: { "text": string, "icon": "info"|"warning"|"success" }
- two_col: { "left": string, "right": string }
- table: { "headers": string[], "rows": string[][] }

Guidelines:
- Start with H1 heading for title
- Use H2 for main sections
- Convert bullets to list blocks
- Use callouts for key takeaways
- Keep text blocks to 2-4 sentences max
- Create 8-15 blocks total

You MUST call the create_blocks function with valid blocks.`;

  if (isRetry && validationErrors?.length) {
    prompt += `

CORRECTION REQUIRED: Your previous response had validation errors:
${validationErrors.slice(0, 5).join("\n")}

Fix ALL blocks to include required content keys. Do not return empty strings or empty arrays.`;
  }

  return prompt;
}

// Call the AI gateway
async function callAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ response?: Response; error?: string }> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
              description: "Create presentation blocks from outline. MUST include all required content keys.",
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
                          enum: ["heading", "text", "list", "callout", "two_col", "table"],
                          description: "The block type"
                        },
                        content: { 
                          type: "object",
                          description: "Content object with ALL required keys for the block type"
                        }
                      },
                      required: ["type", "content"]
                    },
                    minItems: 1
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

    return { response };
  } catch (e) {
    return { error: `fetch error: ${e}` };
  }
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

    const userPrompt = `Convert this outline into presentation blocks (return valid JSON only):

Title: ${outline.title}
Summary: ${outline.summary}

Sections:
${outline.sections.map((s, i) => `${i + 1}. ${s.heading}\n${s.points.map(p => `   - ${p}`).join("\n")}`).join("\n\n")}

Key Takeaways:
${outline.bullets.map(b => `- ${b}`).join("\n")}`;

    // First attempt
    const systemPrompt1 = buildSystemPrompt(false);
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
    console.log(`[${requestId}] AI response received (attempt 1)`);

    const parsed1 = parseAIResponse(data1);
    
    if (parsed1.blocks) {
      const blockValidation1 = validateBlocks(parsed1.blocks);
      
      if (blockValidation1.valid) {
        console.log(`[${requestId}] Generated ${blockValidation1.blocks.length} valid blocks`);
        return new Response(
          JSON.stringify({ blocks: blockValidation1.blocks, requestId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log validation issues and retry
      console.warn(`[${requestId}] Block validation failed (attempt 1): invalidBlocksCount=${blockValidation1.invalidCount}, errors=${blockValidation1.errors.slice(0, 3).join("; ")}`);

      // If we have some valid blocks, we can still use them
      if (blockValidation1.blocks.length >= 3) {
        console.log(`[${requestId}] Using ${blockValidation1.blocks.length} partially valid blocks`);
        return new Response(
          JSON.stringify({ blocks: blockValidation1.blocks, requestId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Retry with stricter prompt
      console.log(`[${requestId}] Retrying with correction prompt...`);
      
      const systemPrompt2 = buildSystemPrompt(true, blockValidation1.errors);
      const result2 = await callAI(LOVABLE_API_KEY, systemPrompt2, userPrompt);

      if (result2.error || !result2.response?.ok) {
        console.error(`[${requestId}] Retry AI call failed`);
        return new Response(
          JSON.stringify({ error: "Failed to generate valid blocks after retry", requestId }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data2 = await result2.response.json();
      console.log(`[${requestId}] AI response received (attempt 2)`);

      const parsed2 = parseAIResponse(data2);
      
      if (parsed2.blocks) {
        const blockValidation2 = validateBlocks(parsed2.blocks);
        
        if (blockValidation2.valid || blockValidation2.blocks.length >= 3) {
          console.log(`[${requestId}] Generated ${blockValidation2.blocks.length} blocks after retry`);
          return new Response(
            JSON.stringify({ blocks: blockValidation2.blocks, requestId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.error(`[${requestId}] Block validation still failed after retry: invalidBlocksCount=${blockValidation2.invalidCount}, errors=${blockValidation2.errors.slice(0, 3).join("; ")}`);
      } else {
        console.error(`[${requestId}] Parse failed on retry: ${parsed2.parseError}`);
      }
    } else {
      console.error(`[${requestId}] Parse failed (attempt 1): ${parsed1.parseError}`);
      
      // Single retry for parse failures too
      console.log(`[${requestId}] Retrying after parse failure...`);
      
      const systemPrompt2 = buildSystemPrompt(true, ["Previous response was not valid JSON"]);
      const result2 = await callAI(LOVABLE_API_KEY, systemPrompt2, userPrompt);

      if (result2.response?.ok) {
        const data2 = await result2.response.json();
        const parsed2 = parseAIResponse(data2);
        
        if (parsed2.blocks) {
          const blockValidation2 = validateBlocks(parsed2.blocks);
          
          if (blockValidation2.valid || blockValidation2.blocks.length >= 3) {
            console.log(`[${requestId}] Generated ${blockValidation2.blocks.length} blocks after retry`);
            return new Response(
              JSON.stringify({ blocks: blockValidation2.blocks, requestId }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }
    }

    // Final failure
    console.error(`[${requestId}] Failed to generate valid blocks after all attempts`);
    return new Response(
      JSON.stringify({ error: "Failed to generate valid presentation blocks. Please try again with a different topic.", requestId }),
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
