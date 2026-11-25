/**
 * summarize-meeting — AI-powered meeting summary
 *
 * Takes a meeting transcript and generates a structured summary
 * using Claude: overview, decisions, action items, topics, follow-ups.
 *
 * Also supports saving transcript + summary to the meeting_notes table.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Anthropic API key not configured" }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const { transcript, title, meeting_id } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return new Response(
        JSON.stringify({ error: "No transcript provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Truncate very long transcripts to fit context window
    const maxChars = 100_000;
    const truncated =
      transcript.length > maxChars
        ? transcript.slice(0, maxChars) + "\n\n[Transcript truncated]"
        : transcript;

    const systemPrompt = `You are an expert executive assistant that creates structured meeting summaries.

Given a meeting transcript, produce a JSON object with these fields:
- "overview": 2-3 sentence high-level summary of what the meeting was about and its outcome
- "decisions": array of strings — specific decisions that were made (empty array if none)
- "action_items": array of objects with { "owner": string, "task": string, "deadline": string|null } — concrete next steps assigned to specific people
- "topics": array of strings — the main topics or agenda items discussed
- "follow_ups": array of strings — items that need follow-up but weren't assigned
- "key_quotes": array of strings — 2-3 notable or important direct quotes from the meeting (keep them short)
- "sentiment": "positive" | "neutral" | "mixed" | "tense" — overall tone of the meeting
- "duration_estimate": string — estimated duration based on transcript length (e.g., "~30 minutes")

Be concise. Focus on what matters for someone who missed the meeting. Extract real names when mentioned. If the transcript is from a solo recording or narration (not a multi-person meeting), adapt accordingly.

Return ONLY valid JSON, no markdown fencing.`;

    const userPrompt = `Meeting title: ${title || "Untitled Meeting"}

Transcript:
${truncated}`;

    console.log(
      `Summarizing meeting: ${title || "Untitled"}, transcript length: ${transcript.length}`,
    );

    const startTime = Date.now();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Anthropic API failed (${response.status}):`,
        errorText,
      );
      return new Response(
        JSON.stringify({ error: "Summary generation failed" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const aiResult = await response.json();
    const elapsed = Date.now() - startTime;

    // Extract the text content from Claude's response
    const textContent = aiResult.content?.find(
      (c: any) => c.type === "text",
    );
    if (!textContent?.text) {
      return new Response(
        JSON.stringify({ error: "No summary generated" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse the JSON summary
    let summary;
    try {
      // Strip markdown code fences if present
      const cleaned = textContent.text
        .replace(/^```json?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();
      summary = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse summary JSON:", textContent.text);
      summary = {
        overview: textContent.text,
        decisions: [],
        action_items: [],
        topics: [],
        follow_ups: [],
        key_quotes: [],
        sentiment: "neutral",
        duration_estimate: "unknown",
      };
    }

    // If meeting_id provided, update the record in Supabase
    if (meeting_id) {
      try {
        const authHeader = req.headers.get("Authorization");
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          {
            global: {
              headers: { Authorization: authHeader ?? "" },
            },
          },
        );

        await supabase
          .from("meeting_notes")
          .update({
            summary,
            status: "complete",
            updated_at: new Date().toISOString(),
          })
          .eq("id", meeting_id);

        console.log(`Updated meeting ${meeting_id} with summary`);
      } catch (err) {
        console.error("Failed to update meeting record:", err);
        // Don't fail the whole request — still return the summary
      }
    }

    console.log(`Summary generated in ${elapsed}ms`);

    return new Response(
      JSON.stringify({
        summary,
        duration_ms: elapsed,
        model: "claude-haiku-4-5-20251001",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Summarize error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
