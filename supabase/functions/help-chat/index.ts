// Public help-chat for site visitors (no sign-in). Abuse limits: input caps,
// small output, per-IP in-memory rate limit. Returns no private data.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are AXIVA's AI assistant. You help visitors understand AXIVA and answer their questions concisely.

ABOUT AXIVA:
- AI-powered executive presentation platform
- Generates decks from one sentence using consulting methodology (answer-first structure)
- Speech prep with delivery coaching (vocal tips, story structure, body language)
- Live audience polls with QR codes (replaces Slido)
- Voice-Powered Smart Slides: OpenAI GPT Transcribe captures audience speech with 96% accuracy, even in noisy rooms. Slides adapt in real-time based on what the audience says. Pro feature.
- Meeting Notes: Record any meeting, OpenAI transcribes with 96% accuracy, AI summarizes with decisions/action items/follow-ups. Create a deck from the transcript in one click. Like Granola, built into your presentation tool. Dashboard > Meeting Notes.
- 98 executive templates across 6 categories
- 23 timeline styles
- PPTX and PDF export
- Webinar-ready: deck + speech + polls + coaching in one tool

PRICING:
- Free: $0. 10 AI generations per month, up to 10 projects, web sharing
- Pro: $28/month or $269/year. Unlimited projects, PPTX export, speech prep, live polls, Smart Slides, brand kit
- Team: $78/month per user. Everything in Pro + shared workspaces, governance
- Enterprise: Custom pricing. SSO, dedicated support, SLAs

COMPETITORS:
- vs Gamma: AXIVA has delivery coaching, live polls, speech generation. Gamma does not.
- vs Beautiful.ai: AXIVA has AI generation and live polls. Beautiful.ai does not.
- vs Canva: AXIVA is executive-focused with consulting methodology. Canva is general design.
- vs Slido: AXIVA builds polls INTO the deck. Slido is a separate tool.
- vs PowerPoint Copilot: AXIVA has delivery coaching and live polls built in.

RULES:
- Keep answers under 3 sentences when possible
- Be friendly and direct
- If asked about features, link to relevant pages: /features, /pricing, /executive, /live-polls, /webinars
- If asked how to do something, give step-by-step instructions
- If you don't know something specific, suggest they try the product or contact support
- Never make up features that don't exist`;

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (limited(ip)) return json({ error: "Too many messages. Please wait a minute." }, 429);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const raw = Array.isArray(body?.messages) ? body.messages.slice(-10) : [];
  const messages = raw
    .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string" && m.content.trim())
    .map((m: any) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return json({ error: "No question provided" }, 400);
  while (messages[0]?.role !== "user") messages.shift();

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "Assistant unavailable" }, 503);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 300, system: SYSTEM_PROMPT, messages }),
  });
  if (!res.ok) {
    console.error("help-chat upstream", res.status, (await res.text()).slice(0, 300));
    return json({ error: "Assistant unavailable" }, 502);
  }
  const data = await res.json();
  return json({ reply: (data?.content ?? []).filter((b: any) => b?.type === "text").map((b: any) => b.text).join("\n").trim(), stop: data?.stop_reason });
});
