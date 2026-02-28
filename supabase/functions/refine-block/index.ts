import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_INSTRUCTION_LENGTH = 500;
const MAX_CONTEXT_LENGTH = 200;

// All supported block types including visual blocks
const BASIC_BLOCK_TYPES = ["text", "heading", "list", "callout", "two_col", "table", "image"] as const;
const VISUAL_BLOCK_TYPES = [
  "stat_block", "quote_block", "timeline_block", "comparison_table",
  "card_grid", "hero_header", "exec_summary", "cta_section",
  "section_divider", "icon_text_block", "framed_insight"
] as const;
const VALID_BLOCK_TYPES = [...BASIC_BLOCK_TYPES, ...VISUAL_BLOCK_TYPES] as const;

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
  // Optional: template-based refinement
  templateId?: string;
  context?: string;
}

// Template definitions for type-preserving transformations
const TEMPLATES: Record<string, { type: string; instruction: string }> = {
  // Heading templates
  "heading-executive-title": {
    type: "heading",
    instruction: "Rewrite as a strong, action-oriented executive slide title. Use 5-8 words. Lead with outcome or impact. No punctuation at end.",
  },
  "heading-section-divider": {
    type: "heading",
    instruction: "Rewrite as a clear section divider heading. Use 2-4 words. Should signal a major topic transition. Simple and bold.",
  },
  "heading-one-line-takeaway": {
    type: "heading",
    instruction: "Rewrite as a memorable one-line takeaway. Capture the single most important insight. Make it quotable and impactful.",
  },
  // Text templates
  "text-executive-summary": {
    type: "text",
    instruction: "Rewrite as a crisp executive summary. Lead with the key insight. Maximum 3 sentences. Use active voice. Eliminate jargon.",
  },
  "text-problem-statement": {
    type: "text",
    instruction: "Rewrite as a clear problem statement. State the core problem in the first sentence. Quantify impact if possible. Keep under 3 sentences.",
  },
  "text-recommendation": {
    type: "text",
    instruction: "Rewrite as a direct recommendation. Start with 'We recommend...' or equivalent. Include one key reason. Be specific and actionable.",
  },
  "text-risks-mitigations": {
    type: "text",
    instruction: "Rewrite to highlight key risks and their mitigations. Format: Risk followed by mitigation. Keep concise and balanced.",
  },
  "text-next-steps": {
    type: "text",
    instruction: "Rewrite as clear next steps. Each action should be specific with owner or timeline implied. Use imperative voice.",
  },
  // List templates
  "list-key-points": {
    type: "list",
    instruction: "Rewrite as key points. Each item should be 5-10 words. Start each with a strong verb or noun. No sub-bullets. Maximum 5 items.",
  },
  "list-benefits": {
    type: "list",
    instruction: "Rewrite as a benefits list. Start each item with a quantifiable outcome or clear advantage. Focus on value to the audience. Maximum 5 items.",
  },
  "list-requirements": {
    type: "list",
    instruction: "Rewrite as requirements. Each item should be specific and measurable. Use 'must' or 'shall' language. Keep items brief.",
  },
  "list-risks": {
    type: "list",
    instruction: "Rewrite as a risk list. Each item should identify a specific risk. Order by impact or likelihood. Keep each under 10 words.",
  },
  "list-milestones": {
    type: "list",
    instruction: "Rewrite as milestones. Each item should be a deliverable with implied timeline. Use past or future tense. Keep chronological.",
  },
  // Callout templates
  "callout-key-insight": {
    type: "callout",
    instruction: "Rewrite as a key insight callout. Distill to the single most important revelation. Make it memorable. Under 20 words. Use icon: info.",
  },
  "callout-warning": {
    type: "callout",
    instruction: "Rewrite as a warning callout. Clearly state what could go wrong. Be direct but not alarmist. Under 20 words. Use icon: warning.",
  },
  "callout-success-metric": {
    type: "callout",
    instruction: "Rewrite as a success metric callout. Highlight the key number or KPI. Include target or achievement. Under 20 words. Use icon: success.",
  },
  // Two column templates
  "two_col-pros-cons": {
    type: "two_col",
    instruction: "Rewrite as pros vs cons format. Left column: advantages (3-4 points). Right column: disadvantages (3-4 points). Keep balanced and brief.",
  },
  "two_col-now-next": {
    type: "two_col",
    instruction: "Rewrite as now vs next comparison. Left column: current state. Right column: future state or recommendation. Show clear progression.",
  },
  "two_col-problem-solution": {
    type: "two_col",
    instruction: "Rewrite as problem vs solution format. Left column: the problem or pain point. Right column: the proposed solution. Keep parallel structure.",
  },
  // Table templates
  "table-options-comparison": {
    type: "table",
    instruction: "Rewrite as an options comparison table. First column: option names. Other columns: evaluation criteria. Keep cells to 1-3 words. Clear winner should emerge.",
  },
  "table-raci": {
    type: "table",
    instruction: "Rewrite as a RACI matrix. Rows: tasks/activities. Columns: stakeholder roles. Cells contain only R, A, C, or I. Keep focused on key activities.",
  },
  "table-timeline": {
    type: "table",
    instruction: "Rewrite as a timeline table. Columns: Phase/Date, Activity, Owner/Status. Keep cells brief. Show clear progression of work.",
  },
};

interface ValidationResult {
  valid: boolean;
  error?: string;
  block?: Block;
  instruction?: string;
  templateId?: string;
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

function sanitizeContent(content: BlockContent): BlockContent {
  const out: BlockContent = {};

  for (const k of Object.keys(content)) {
    const v = content[k];
    if (typeof v === "string") out[k] = stripMarkdown(v);
    else if (Array.isArray(v)) out[k] = v.map(stripMarkdown);
    else if (v && typeof v === "object") out[k] = sanitizeContent(v as BlockContent);
    else out[k] = v;
  }

  return out;
}

function validateRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const { block, instruction, templateId, context } = body as RefineRequest;

  if (!block || typeof block !== "object") {
    return { valid: false, error: "block is required and must be an object" };
  }

  if (!block.type || !VALID_BLOCK_TYPES.includes(block.type as typeof VALID_BLOCK_TYPES[number])) {
    return { valid: false, error: `block.type must be one of: ${VALID_BLOCK_TYPES.join(", ")}` };
  }

  if (!block.content || typeof block.content !== "object") {
    return { valid: false, error: "block.content is required and must be an object" };
  }

  // Support two modes: direct instruction OR template-based
  let finalInstruction = "";
  let validatedTemplateId: string | undefined;
  let validatedContext: string | undefined;

  if (templateId && typeof templateId === "string") {
    // Template-based refinement
    const template = TEMPLATES[templateId];
    if (!template) {
      return { valid: false, error: `Unknown template: ${templateId}` };
    }
    // Enforce type preservation: template type must match block type
    if (template.type !== block.type) {
      return { 
        valid: false, 
        error: `Template "${templateId}" is for ${template.type} blocks, but block is ${block.type}. Type must match.` 
      };
    }
    // Build instruction from template + optional context
    finalInstruction = template.instruction;
    if (context && typeof context === "string" && context.trim()) {
      finalInstruction += ` Additional context: ${context.slice(0, MAX_CONTEXT_LENGTH).trim()}`;
    }
    validatedTemplateId = templateId;
    validatedContext = context?.slice(0, MAX_CONTEXT_LENGTH).trim();
  } else if (instruction && typeof instruction === "string" && instruction.trim().length > 0) {
    // Direct instruction mode
    finalInstruction = instruction.slice(0, MAX_INSTRUCTION_LENGTH).trim();
  } else {
    return { valid: false, error: "Either instruction or templateId is required" };
  }

  return {
    valid: true,
    block: {
      type: block.type as Block["type"],
      content: block.content,
      order_index: typeof block.order_index === "number" ? block.order_index : 0,
    },
    instruction: finalInstruction,
    templateId: validatedTemplateId,
    context: validatedContext,
  };
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

Output rules (non-negotiable):
- Return plain text only. No Markdown. No asterisks. No bullets using * or -.
- No **bold**, no _, no # headings, no backticks.
- Use short sentences. Use line breaks if needed.
- For "list" blocks: return items as plain strings without bullet characters or numbering.
- For "table" blocks: cell strings must be plain text without Markdown.

Block types and their content structure:
- heading: { "level": number (1, 2, or 3), "text": string }
- text: { "text": string }
- list: { "items": array of plain strings (no * or - prefixes), "ordered": boolean }
- callout: { "text": string, "icon": "info" | "warning" | "success" }
- two_col: { "left": string, "right": string }
- table: { "headers": array of strings, "rows": array of array of strings }
- image: { "src": string, "alt": string, "caption": string }

Guidelines:
- Maintain the block type (${block!.type})
- Keep professional executive tone
- Be concise but impactful
- Follow the user's instruction precisely
- ALWAYS include the required content fields based on block type`;

    const userPrompt = `Refine this ${block!.type} block based on the instruction.

Current content:
${JSON.stringify(block!.content, null, 2)}

Instruction: "${instruction}"

Formatting requirements:
- All text must be plain text, no Markdown symbols (*, **, _, #, \`).
- List items must be plain strings without leading bullets or numbers.
- Table cells must be plain text.

Update the content according to the instruction. For a ${block!.type} block, the content must include:
${block!.type === "text" ? '{ "text": "your refined text here" }' : ''}
${block!.type === "heading" ? '{ "level": 1|2|3, "text": "your refined heading" }' : ''}
${block!.type === "list" ? '{ "items": ["item1", "item2", ...], "ordered": true/false }' : ''}
${block!.type === "callout" ? '{ "text": "your message", "icon": "info"|"warning"|"success" }' : ''}
${block!.type === "two_col" ? '{ "left": "left content", "right": "right content" }' : ''}
${block!.type === "table" ? '{ "headers": ["col1", "col2"], "rows": [["data1", "data2"]] }' : ''}
${block!.type === "image" ? '{ "src": "url", "alt": "description", "caption": "caption" }' : ''}`;

    // Build content schema based on block type
    const contentSchemas: Record<string, object> = {
      text: {
        type: "object",
        properties: { text: { type: "string", description: "The text content - plain text only, no Markdown" } },
        required: ["text"]
      },
      heading: {
        type: "object",
        properties: {
          level: { type: "number", description: "Heading level: 1, 2, or 3" },
          text: { type: "string", description: "The heading text - plain text only" }
        },
        required: ["level", "text"]
      },
      list: {
        type: "object",
        properties: {
          items: { type: "array", items: { type: "string" }, description: "List items as plain strings without bullet characters" },
          ordered: { type: "boolean", description: "Whether list is ordered (numbered)" }
        },
        required: ["items", "ordered"]
      },
      callout: {
        type: "object",
        properties: {
          text: { type: "string", description: "Callout message - plain text only" },
          icon: { type: "string", enum: ["info", "warning", "success"], description: "Icon type" }
        },
        required: ["text", "icon"]
      },
      two_col: {
        type: "object",
        properties: {
          left: { type: "string", description: "Left column content - plain text only" },
          right: { type: "string", description: "Right column content - plain text only" }
        },
        required: ["left", "right"]
      },
      table: {
        type: "object",
        properties: {
          headers: { type: "array", items: { type: "string" }, description: "Column headers - plain text" },
          rows: { type: "array", items: { type: "array", items: { type: "string" } }, description: "Table rows - plain text cells" }
        },
        required: ["headers", "rows"]
      },
      image: {
        type: "object",
        properties: {
          src: { type: "string", description: "Image URL" },
          alt: { type: "string", description: "Alt text - plain text" },
          caption: { type: "string", description: "Caption text - plain text" }
        },
        required: ["src", "alt", "caption"]
      }
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "update_block",
              description: `Update the ${block!.type} block content. Must include all required fields for this block type. All strings must be plain text without Markdown.`,
              parameters: {
                type: "object",
                properties: {
                  type: { 
                    type: "string", 
                    enum: [block!.type],
                    description: "Block type - must be " + block!.type
                  },
                  content: contentSchemas[block!.type] || { type: "object" }
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
    console.log(`[${requestId}] AI response received:`, JSON.stringify(data, null, 2));

    // Try tool call first
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const updatedBlock = JSON.parse(toolCall.function.arguments);
        console.log(`[${requestId}] Parsed tool call:`, JSON.stringify(updatedBlock, null, 2));
        
        // Validate content exists and is not empty
        if (!updatedBlock.content || Object.keys(updatedBlock.content).length === 0) {
          console.error(`[${requestId}] Empty content received, using original block content`);
          // Fall through to fallback
        } else {
          // Sanitize content to remove any stray Markdown
          const cleanedContent = sanitizeContent(updatedBlock.content);
          
          const result: Block = {
            type: updatedBlock.type as Block["type"],
            content: cleanedContent,
            order_index: block!.order_index || 0,
          };

          console.log(`[${requestId}] Block refined successfully:`, JSON.stringify(result.content));
          return new Response(
            JSON.stringify({ block: result, requestId }),
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
      console.log(`[${requestId}] Trying content fallback:`, content);
      try {
        const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const updatedBlock = JSON.parse(cleanContent);
        
        if (!updatedBlock.content || Object.keys(updatedBlock.content).length === 0) {
          console.error(`[${requestId}] Empty content in fallback`);
        } else {
          // Sanitize content to remove any stray Markdown
          const cleanedContent = sanitizeContent(updatedBlock.content);
          
          const result: Block = {
            type: updatedBlock.type as Block["type"],
            content: cleanedContent,
            order_index: block!.order_index || 0,
          };

          console.log(`[${requestId}] Block refined (fallback):`, JSON.stringify(result.content));
          return new Response(
            JSON.stringify({ block: result, requestId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (parseError) {
        console.error(`[${requestId}] Failed to parse content fallback:`, parseError);
      }
    }

    console.error(`[${requestId}] No valid parseable response, raw data:`, JSON.stringify(data));
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
