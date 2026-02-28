import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ReqBody {
  project_id: string;
  slide_index?: number;
  duration_seconds?: number;
  viewer_hash?: string;
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return json(503, { error: "Service not configured" });
    }

    const body = (await req.json()) as ReqBody;

    if (!body?.project_id || typeof body.project_id !== "string") {
      return json(400, { error: "project_id is required" });
    }

    // UUID validation
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(body.project_id)) {
      return json(400, { error: "project_id must be a valid UUID" });
    }

    // Insert the view record
    const insertRes = await fetch(
      `${SUPABASE_URL}/rest/v1/deck_views`,
      {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          project_id: body.project_id,
          slide_index: body.slide_index ?? null,
          duration_seconds: body.duration_seconds ?? null,
          viewer_hash: body.viewer_hash ?? null,
        }),
      }
    );

    if (!insertRes.ok) {
      console.error("Failed to insert view:", insertRes.status);
      return json(502, { error: "Failed to record view" });
    }

    return json(200, { ok: true });
  } catch (e) {
    console.error("Unexpected error:", e);
    return json(500, { error: "Internal server error" });
  }
});
