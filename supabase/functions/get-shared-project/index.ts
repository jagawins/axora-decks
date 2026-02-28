import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ReqBody {
  token: string;
  passcode?: string;
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  const requestId = crypto.randomUUID();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed", requestId });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error(`[${requestId}] Missing SUPABASE_URL or SERVICE_ROLE_KEY`);
      return json(503, { error: "Service not configured", requestId });
    }

    const body = (await req.json()) as ReqBody;

    if (!body?.token || typeof body.token !== "string") {
      return json(400, { error: "token is required", requestId });
    }

    const token = body.token.trim();
    
    // Accept UUID token only
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(token)) {
      return json(400, { error: "token must be a valid UUID", requestId });
    }

    console.log(`[${requestId}] Fetching shared project with token: ${token.slice(0, 8)}...`);

    // Fetch project by token (share must be enabled)
    const projRes = await fetch(
      `${SUPABASE_URL}/rest/v1/projects?select=id,title,description,theme,share_enabled,share_token,share_passcode&share_token=eq.${token}&limit=1`,
      {
        method: "GET",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );

    if (!projRes.ok) {
      console.error(`[${requestId}] Upstream error fetching project: ${projRes.status}`);
      return json(502, { error: "Upstream error fetching project", requestId });
    }

    const projects = await projRes.json();
    const project = projects?.[0];

    if (!project || project.share_enabled !== true) {
      console.log(`[${requestId}] Shared project not found or sharing disabled`);
      return json(404, { error: "Shared project not found", requestId });
    }

    // Check passcode if project has one set
    if (project.share_passcode && project.share_passcode.trim().length > 0) {
      if (!body.passcode || body.passcode !== project.share_passcode) {
        console.log(`[${requestId}] Passcode required or mismatch`);
        return json(403, { requires_passcode: true, error: "Passcode required", requestId });
      }
    }

    // Fetch blocks for that project
    const blocksRes = await fetch(
      `${SUPABASE_URL}/rest/v1/blocks?select=id,type,content,order_index&project_id=eq.${project.id}&order=order_index.asc`,
      {
        method: "GET",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );

    if (!blocksRes.ok) {
      console.error(`[${requestId}] Upstream error fetching blocks: ${blocksRes.status}`);
      return json(502, { error: "Upstream error fetching blocks", requestId });
    }

    const blocks = await blocksRes.json();

    // Log a view asynchronously (fire and forget)
    fetch(`${SUPABASE_URL}/rest/v1/deck_views`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        project_id: project.id,
        viewer_hash: null,
        slide_index: 0,
        duration_seconds: null,
      }),
    }).catch((err) => console.error(`[${requestId}] View logging failed:`, err));

    console.log(`[${requestId}] Successfully fetched shared project with ${blocks.length} blocks`);

    return json(200, {
      project: { id: project.id, title: project.title, description: project.description, theme: project.theme },
      blocks,
      requestId,
    });
  } catch (e) {
    console.error(`[${requestId}] Unexpected error:`, e);
    return json(500, { error: "Internal server error", requestId });
  }
});
