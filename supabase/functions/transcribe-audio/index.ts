/**
 * transcribe-audio — OpenAI GPT Transcribe edge function
 *
 * Receives audio blob from the browser, sends to OpenAI's
 * transcription API, returns text. Keeps API key server-side.
 *
 * Pro tier feature — free users use browser Web Speech API.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key not configured" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");
    const language = formData.get("language") || "en";
    const context = formData.get("context") || "";

    if (!audioFile || !(audioFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No audio file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size (max 25MB per OpenAI limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Audio file too large (max 25MB)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Transcribing ${audioFile.size} bytes, language: ${language}`);

    // Build form data for OpenAI
    const openaiForm = new FormData();
    openaiForm.append("file", audioFile, "audio.webm");
    openaiForm.append("model", "gpt-4o-transcribe");
    openaiForm.append("language", String(language));
    openaiForm.append("response_format", "json");

    // Add context as prompt if provided (helps with jargon/names)
    if (context) {
      openaiForm.append("prompt", String(context));
    }

    const startTime = Date.now();

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: openaiForm,
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI transcription failed (${response.status}):`, errorText);
      return new Response(
        JSON.stringify({
          error: "Transcription failed",
          detail: response.status === 429 ? "Rate limited, try again" : "Service error",
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();

    console.log(`Transcription complete in ${elapsed}ms: "${result.text?.substring(0, 50)}..."`);

    return new Response(
      JSON.stringify({
        text: result.text || "",
        duration_ms: elapsed,
        model: "gpt-4o-transcribe",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Transcription error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
