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

// Normalize block content to expected schema
function normalizeBlockContent(type: string, content: BlockContent): BlockContent {
  const normalized: BlockContent = { ...content };

  switch (type) {
    case "heading":
      // Handle various heading formats
      if (normalized.level === undefined) {
        normalized.level = normalized.heading_level ?? normalized.size ?? 1;
      }
      if (normalized.text === undefined) {
        normalized.text = normalized.heading ?? normalized.title ?? normalized.value ?? "";
      }
      break;

    case "text":
      // Handle various text formats
      if (normalized.text === undefined) {
        normalized.text = normalized.paragraph ?? normalized.body ?? normalized.content ?? normalized.value ?? "";
      }
      break;

    case "list":
      // Handle various list formats
      if (!Array.isArray(normalized.items)) {
        normalized.items = normalized.list ?? normalized.points ?? normalized.bullets ?? [];
      }
      if (normalized.ordered === undefined) {
        normalized.ordered = normalized.is_ordered ?? normalized.numbered ?? false;
      }
      break;

    case "callout":
      // Handle various callout formats
      if (normalized.text === undefined) {
        normalized.text = normalized.message ?? normalized.content ?? normalized.body ?? "";
      }
      if (normalized.icon === undefined) {
        normalized.icon = normalized.type ?? normalized.variant ?? "info";
      }
      break;

    case "two_col":
      // Handle various two-column formats
      if (normalized.left === undefined) {
        normalized.left = normalized.left_column ?? normalized.column1 ?? normalized.col1 ?? "";
      }
      if (normalized.right === undefined) {
        normalized.right = normalized.right_column ?? normalized.column2 ?? normalized.col2 ?? "";
      }
      break;

    case "table":
      // Handle various table formats
      if (!Array.isArray(normalized.headers)) {
        normalized.headers = normalized.header ?? normalized.columns ?? [];
      }
      if (!Array.isArray(normalized.rows)) {
        normalized.rows = normalized.data ?? normalized.cells ?? [];
      }
      break;

    case "image":
      // Handle various image formats
      if (normalized.src === undefined) {
        normalized.src = normalized.url ?? normalized.source ?? normalized.image_url ?? "";
      }
      if (normalized.alt === undefined) {
        normalized.alt = normalized.alt_text ?? normalized.description ?? normalized.title ?? "";
      }
      break;
  }

  return normalized;
}

// Validate block content has required keys and non-empty values
function validateBlockContent(type: string, content: BlockContent): { valid: boolean; missingKeys: string[] } {
  const requiredKeys = REQUIRED_KEYS[type];
  if (!requiredKeys) {
    return { valid: false, missingKeys: [`unknown type: ${type}`] };
  }

  // First normalize the content
  const normalizedContent = normalizeBlockContent(type, content);
  const missingKeys: string[] = [];

  for (const key of requiredKeys) {
    const value = normalizedContent[key];
    
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

    // Normalize the content first
    const normalizedContent = normalizeBlockContent(block.type, block.content);

    // Validate required keys on normalized content
    const contentValidation = validateBlockContent(block.type, normalizedContent);
    if (!contentValidation.valid) {
      errors.push(`block[${i}] (${block.type}): missing keys [${contentValidation.missingKeys.join(", ")}]`);
      invalidCount++;
      continue;
    }

    // Block is valid - use normalized and sanitized content
    validBlocks.push({
      type: block.type as Block["type"],
      content: sanitizeContent(normalizedContent),
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
function parseAIResponse(data: Record<string, unknown>, requestId: string): { blocks: Array<{ type: string; content: BlockContent }> | null; parseError?: string } {
  // Try tool call first
  const toolCall = (data.choices as Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }> } }>)?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    try {
      const result = JSON.parse(toolCall.function.arguments);
      console.log(`[${requestId}] Raw tool call blocks sample:`, JSON.stringify(result.blocks?.[0] ?? {}).slice(0, 200));
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
      console.log(`[${requestId}] Raw content blocks sample:`, JSON.stringify(result.blocks?.[0] ?? {}).slice(0, 200));
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
              description: "Create presentation blocks. Each block must have type and content with ALL required fields populated with actual text.",
              parameters: {
                type: "object",
                properties: {
                  blocks: {
                    type: "array",
                    description: "Array of presentation blocks. Each block MUST have non-empty content fields.",
                    items: {
                      type: "object",
                      properties: {
                        type: { 
                          type: "string", 
                          enum: ["heading", "text", "list", "callout", "two_col", "table"],
                          description: "Block type"
                        },
                        content: { 
                          type: "object",
                          description: "For heading: {level: 1|2|3, text: 'actual heading text'}. For text: {text: 'paragraph text'}. For list: {items: ['item1','item2'], ordered: false}. For callout: {text: 'callout text', icon: 'info'}. For two_col: {left: 'left text', right: 'right text'}. For table: {headers: ['col1'], rows: [['data']]}. ALL text fields MUST contain actual content, not empty strings.",
                          properties: {
                            level: { type: "number", description: "Heading level 1-3 (for heading type)" },
                            text: { type: "string", description: "The actual text content - MUST NOT be empty" },
                            items: { type: "array", items: { type: "string" }, description: "List items - MUST NOT be empty array" },
                            ordered: { type: "boolean" },
                            icon: { type: "string", enum: ["info", "warning", "success"] },
                            left: { type: "string", description: "Left column text - MUST NOT be empty" },
                            right: { type: "string", description: "Right column text - MUST NOT be empty" },
                            headers: { type: "array", items: { type: "string" } },
                            rows: { type: "array", items: { type: "array", items: { type: "string" } } }
                          }
                        }
                      },
                      required: ["type", "content"]
                    },
                    minItems: 5
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

    const parsed1 = parseAIResponse(data1, requestId);
    
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

      const parsed2 = parseAIResponse(data2, requestId);
      
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
        const parsed2 = parseAIResponse(data2, requestId);
        
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
