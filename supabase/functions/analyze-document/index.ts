import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRequest {
  blocks: Array<{ type: string; content: Record<string, unknown> }>;
  mode: "improve_argument" | "identify_weak_logic" | "suggest_missing_metric" | "stress_test_narrative";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blocks, mode } = (await req.json()) as AnalyzeRequest;

    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      return new Response(JSON.stringify({ error: "blocks array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const documentText = blocks
      .map((b, i) => `[Block ${i + 1} - ${b.type}]: ${JSON.stringify(b.content)}`)
      .join("\n\n");

    const modePrompts: Record<string, string> = {
      improve_argument:
        "Analyze this executive presentation and provide 3-5 specific, actionable recommendations to strengthen the overall argument. Focus on logical flow, evidence quality, and persuasive impact.",
      identify_weak_logic:
        "Identify any logical gaps, unsupported claims, or weak reasoning in this presentation. For each issue found, explain why it's weak and suggest how to fix it.",
      suggest_missing_metric:
        "Review this presentation and suggest 3-5 specific metrics, KPIs, or data points that are missing but would significantly strengthen the narrative. Explain where each metric should be added.",
      stress_test_narrative:
        "Stress test this presentation's narrative. What counterarguments could a skeptical executive raise? What assumptions are being made? Provide a structured critique with specific rebuttals the presenter should prepare.",
    };

    const systemPrompt = `You are a senior McKinsey-level strategy consultant reviewing an executive presentation. Provide structured, actionable feedback. Be direct and specific. No fluff. Format your response as a JSON object with these fields:
- summary: A one-sentence overall assessment
- findings: Array of objects, each with { title: string, severity: "high" | "medium" | "low", detail: string, suggestion: string, blockIndex?: number }
- overallScore: number 1-10 rating the presentation quality`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `${modePrompts[mode] || modePrompts.improve_argument}\n\nDocument:\n${documentText}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_analysis",
              description: "Provide structured analysis of the document",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  findings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        severity: { type: "string", enum: ["high", "medium", "low"] },
                        detail: { type: "string" },
                        suggestion: { type: "string" },
                        blockIndex: { type: "number" },
                      },
                      required: ["title", "severity", "detail", "suggestion"],
                    },
                  },
                  overallScore: { type: "number" },
                },
                required: ["summary", "findings", "overallScore"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_analysis" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: parse from message content
    const content = data.choices?.[0]?.message?.content || "";
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify({ analysis }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch { /* fall through */ }

    return new Response(
      JSON.stringify({
        analysis: {
          summary: content.slice(0, 200),
          findings: [],
          overallScore: 0,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-document error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
