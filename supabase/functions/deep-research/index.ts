import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AlignmentData {
  goal: string;
  audience: string;
  outcome: string;
  mustIncludeFacts?: string;
  fileExtracts?: string[];
}

serve(async (req) => {
  const requestId = crypto.randomUUID();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const alignment = body.alignment as AlignmentData | undefined;

    if (!alignment?.goal || !alignment?.audience || !alignment?.outcome) {
      return new Response(
        JSON.stringify({ error: "goal, audience, and outcome are required", requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured", requestId }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from uploaded files
    const fileContext = alignment.fileExtracts?.length
      ? `\n\nAdditional context from user documents:\n${alignment.fileExtracts.join("\n\n---\n\n")}`
      : "";

    const systemPrompt = `You are an expert research analyst preparing a briefing for an executive presentation.

IMPORTANT: You are synthesising from training knowledge, NOT live web search.
For any statistic or data point:
- If you are confident it is accurate: include it with source_label "AI-knowledge"
- If you are uncertain: flag it with "verify_required": true
- Do NOT invent specific URLs. Set source_url to null if you cannot confirm a real URL exists.
- Do NOT invent specific statistics. If you don't have reliable data, say so explicitly.

Your research should be thorough, balanced, and clearly labelled as AI-synthesised knowledge.
Training data is current to early 2025.`;

    const userPrompt = `Research the following topic for an executive presentation:

GOAL: ${alignment.goal}
AUDIENCE: ${alignment.audience}
DESIRED OUTCOME: ${alignment.outcome}
${alignment.mustIncludeFacts ? `MUST-INCLUDE FACTS: ${alignment.mustIncludeFacts}` : ""}
${fileContext}

Provide a comprehensive research brief with findings, data points, and any conflicting information.`;

    console.log(`[${requestId}] Deep research for user ${user.id}: "${alignment.goal.substring(0, 80)}"`);

    const toolSchema = {
      name: "deliver_research_brief",
      description: "Return a structured research brief with findings, conflicts, and summary.",
      input_schema: {
        type: "object",
        properties: {
          findings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Finding headline" },
                detail: { type: "string", description: "2-3 sentence explanation" },
                source_url: {
                  type: ["string", "null"],
                  description: "Real URL if known, null otherwise",
                },
                source_label: {
                  type: "string",
                  enum: ["AI-knowledge", "User document"],
                  description: "Source type",
                },
                data_points: {
                  type: "array",
                  items: { type: "string" },
                  description: "Key statistics or data points",
                },
                verify_required: {
                  type: "boolean",
                  description: "True if the finding needs independent verification",
                },
              },
              required: ["title", "detail", "source_label", "data_points", "verify_required"],
            },
          },
          conflicts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                positions: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["topic", "positions"],
            },
            description: "Conflicting viewpoints or data",
          },
          summary: {
            type: "string",
            description: "3-5 sentence executive summary of research findings",
          },
        },
        required: ["findings", "conflicts", "summary"],
      },
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
        tools: [toolSchema],
        tool_choice: { type: "tool", name: "deliver_research_brief" },
      }),
    });

    if (!response.ok) {
      const status = response.status;
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
      const errorText = await response.text();
      console.error(`[${requestId}] Anthropic API error: ${status}`, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable", requestId }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    console.log(`[${requestId}] Claude response received`);

    // Extract tool_use result from Anthropic format
    const toolUseBlock = (aiData.content as Array<{ type: string; name?: string; input?: unknown }>)
      ?.find((block) => block.type === "tool_use" && block.name === "deliver_research_brief");

    if (!toolUseBlock?.input) {
      console.error(`[${requestId}] No tool_use in response`);
      return new Response(
        JSON.stringify({ error: "Failed to parse research results", requestId }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const brief = toolUseBlock.input as Record<string, unknown>;

    // Validate structure
    if (!Array.isArray(brief.findings) || !brief.summary) {
      console.error(`[${requestId}] Invalid brief structure`);
      return new Response(
        JSON.stringify({ error: "Incomplete research results", requestId }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(
      `[${requestId}] Research complete: ${brief.findings.length} findings, ${brief.conflicts?.length || 0} conflicts`
    );

    return new Response(JSON.stringify({ brief, requestId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof SyntaxError
            ? "Invalid JSON in request body"
            : "Internal server error",
        requestId,
      }),
      {
        status: error instanceof SyntaxError ? 400 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
