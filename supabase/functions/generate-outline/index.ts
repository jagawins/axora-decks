import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OutlineRequest {
  prompt: string;
  topic: string;
  tone: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, topic, tone } = await req.json() as OutlineRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating outline for topic:", topic, "with tone:", tone);

    const systemPrompt = `You are an expert executive presentation consultant. Your task is to create structured outlines for executive-grade presentations and documents.

Guidelines:
- Create clear, hierarchical structures
- Focus on executive-level communication
- Be concise but comprehensive
- Ensure logical flow between sections
- Target a professional ${tone} tone

You must respond with a JSON object containing:
- title: A compelling, professional title
- sections: Array of section objects with "heading" and "points" (array of bullet points)
- bullets: Key takeaways as an array of strings
- summary: A 2-3 sentence executive summary`;

    const userPrompt = `Create a detailed outline for the following:

Topic: ${topic}

Additional context/requirements:
${prompt}

Generate a structured outline that would be suitable for an executive presentation or document.`;

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
              description: "Create a structured outline for a presentation or document",
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
                  bullets: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key takeaways"
                  },
                  summary: { type: "string", description: "Executive summary" }
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
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate outline");
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const outline = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(outline), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse content directly
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const parsed = JSON.parse(content);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        throw new Error("Failed to parse outline response");
      }
    }

    throw new Error("No valid response from AI");
  } catch (error) {
    console.error("generate-outline error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
