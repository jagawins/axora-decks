import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VISUAL_BLOCK_TYPES = [
  "chart_block", "stat_block", "kpi_dashboard", "comparison_table",
  "two_by_two_matrix", "three_pillars", "timeline_block", "flow_diagram"
];

const SYSTEM_PROMPT = `You are an HBR-quality data visualization expert. Return ONLY a valid JSON array of visual block objects. No markdown, no backticks, no explanation, no preamble.

Each object: { "type": "block_type", "content": { ... } }

Block schemas:
- chart_block: { "title":"str", "chartType":"bar"|"donut"|"area"|"line"|"stacked_bar", "data":[{"label":"str","value":number},...] }
- stat_block: { "title":"str", "stats":[{"value":"str","label":"str"},...]  } (2-4 stats)
- kpi_dashboard: { "title":"str", "cards":[{"title":"str","value":"str","change":"str","trend":"up"|"down","chartType":"bar","chartData":[{"value":number},...]},...] } (2-4 cards)
- comparison_table: { "title":"str", "headers":["str",...], "rows":[{"label":"str","values":["str",...]},...] }
- two_by_two_matrix: { "title":"str", "xAxis":"str", "yAxis":"str", "quadrants":[{"position":"top-left"|"top-right"|"bottom-left"|"bottom-right","label":"str","items":["str",...]},...] }
- three_pillars: { "title":"str", "pillars":[{"heading":"str","description":"str"},...] } (exactly 3)
- timeline_block: { "title":"str", "events":[{"date":"str","title":"str","description":"str"},...] }
- flow_diagram: { "title":"str", "columns":[{"title":"str","color":"string (hex)","items":[{"title":"str","subtitle":"str"},...]},...] }

RULES:
- Return 1-2 visual blocks as a JSON array
- Use realistic, specific numbers — not placeholders
- Match the visual quality of Harvard Business Review or McKinsey Quarterly
- NEVER return text, heading, list, or callout blocks
- ONLY return the JSON array, nothing else`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (authError) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const { prompt, blockType, chartSubtype, imageBase64 } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("[DATA-VISUAL] ANTHROPIC_API_KEY not configured");
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    let typeHint = "";
    if (blockType && VISUAL_BLOCK_TYPES.includes(blockType)) {
      typeHint = `\n\nREQUIRED: Generate type "${blockType}"`;
      if (chartSubtype) typeHint += ` with chartType "${chartSubtype}"`;
      typeHint += ".";
    }

    // Build messages — with or without image
    let messages: any[];
    if (imageBase64 && typeof imageBase64 === "string" && imageBase64.startsWith("data:image")) {
      // Extract base64 data and media type from data URL
      const match = imageBase64.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
      if (match) {
        const [, mediaType, base64Data] = match;
        console.log("[DATA-VISUAL] Processing image input:", mediaType);
        messages = [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64Data },
            },
            { type: "text", text: prompt },
          ],
        }];
      } else {
        messages = [{ role: "user", content: prompt }];
      }
    } else {
      messages = [{ role: "user", content: prompt }];
    }

    console.log("[DATA-VISUAL] Calling Anthropic API...", imageBase64 ? "(with image)" : "(text only)");

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM_PROMPT + typeHint,
        messages,
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      const body = await aiRes.text();
      console.error(`[DATA-VISUAL] AI error: ${status}`, body);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const aiData = await aiRes.json();
    const text = aiData.content?.[0]?.text || "";
    console.log("[DATA-VISUAL] AI response length:", text.length);

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let blocks: { type: string; content: Record<string, unknown> }[];
    try {
      const parsed = JSON.parse(cleaned);
      blocks = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        blocks = JSON.parse(match[0]);
      } else {
        console.error(`[DATA-VISUAL] Parse failed:`, cleaned.slice(0, 200));
        return new Response(JSON.stringify({ error: "Failed to parse visual data" }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // Filter to visual-only blocks
    const validBlocks = blocks
      .filter(b => VISUAL_BLOCK_TYPES.includes(b.type))
      .slice(0, 3);

    if (validBlocks.length === 0) {
      return new Response(JSON.stringify({ error: "No visual blocks generated. Try being more specific." }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("[DATA-VISUAL] Generated", validBlocks.length, "blocks");

    return new Response(JSON.stringify({ blocks: validBlocks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[DATA-VISUAL] Error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
