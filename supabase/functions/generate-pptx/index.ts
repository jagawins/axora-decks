import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import pptxgen from "npm:pptxgenjs@3.12.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// --- Brand / theme helpers ---

interface BrandKit {
  colors?: {
    primary?: string;
    accent?: string;
    background?: string;
    foreground?: string;
  };
  typography?: {
    headingFont?: string;
    bodyFont?: string;
  };
}

function safeColor(hex: string | undefined, fallback: string): string {
  if (!hex) return fallback;
  // pptxgenjs wants hex without #
  return hex.replace(/^#/, "");
}

function fontName(font: string | undefined, fallback: string): string {
  return font || fallback;
}

// --- Block → slide mappers ---

type SlideBlock = {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order_index: number;
};

function addBlockToSlide(
  pres: InstanceType<typeof pptxgen>,
  block: SlideBlock,
  brand: BrandKit
) {
  const slide = pres.addSlide();
  const bg = safeColor(brand.colors?.background, "FFFFFF");
  const fg = safeColor(brand.colors?.foreground, "222222");
  const accent = safeColor(brand.colors?.accent, "3B82F6");
  const headFont = fontName(brand.typography?.headingFont, "Calibri");
  const bodyFont = fontName(brand.typography?.bodyFont, "Calibri");

  slide.background = { color: bg };

  const c = block.content || {};

  switch (block.type) {
    case "heading":
      slide.addText(String(c.text || ""), {
        x: 0.8,
        y: 1.5,
        w: 8.4,
        h: 1.5,
        fontSize: 36,
        fontFace: headFont,
        color: fg,
        bold: true,
        valign: "middle",
      });
      break;

    case "text":
      slide.addText(String(c.text || ""), {
        x: 0.8,
        y: 0.8,
        w: 8.4,
        h: 4,
        fontSize: 16,
        fontFace: bodyFont,
        color: fg,
        valign: "top",
        wrap: true,
      });
      break;

    case "hero_header":
      slide.addText(String(c.heading || c.title || ""), {
        x: 0.8,
        y: 1.2,
        w: 8.4,
        h: 1.5,
        fontSize: 40,
        fontFace: headFont,
        color: fg,
        bold: true,
        align: "center",
        valign: "middle",
      });
      if (c.subheading) {
        slide.addText(String(c.subheading), {
          x: 1.5,
          y: 3,
          w: 7,
          h: 1,
          fontSize: 18,
          fontFace: bodyFont,
          color: fg,
          align: "center",
        });
      }
      break;

    case "list": {
      const items = Array.isArray(c.items) ? c.items : [];
      const title = String(c.title || "");
      let yPos = 0.6;
      if (title) {
        slide.addText(title, {
          x: 0.8, y: yPos, w: 8.4, h: 0.8,
          fontSize: 24, fontFace: headFont, color: fg, bold: true,
        });
        yPos += 1;
      }
      const bullets = items.map((item: unknown) => ({
        text: String(item),
        options: { bullet: true, fontSize: 16, fontFace: bodyFont, color: fg },
      }));
      if (bullets.length) {
        slide.addText(bullets, {
          x: 0.8, y: yPos, w: 8.4, h: 4 - (yPos - 0.6),
          valign: "top",
        });
      }
      break;
    }

    case "callout":
      slide.addShape(pres.ShapeType.roundRect, {
        x: 1, y: 1.5, w: 8, h: 2.5,
        fill: { color: accent, transparency: 90 },
        line: { color: accent, width: 2 },
        rectRadius: 0.2,
      });
      slide.addText(String(c.text || ""), {
        x: 1.2, y: 1.7, w: 7.6, h: 2.1,
        fontSize: 18, fontFace: bodyFont, color: fg, valign: "middle", wrap: true,
      });
      break;

    case "two_col":
      slide.addText(String(c.left || ""), {
        x: 0.5, y: 0.8, w: 4.2, h: 4,
        fontSize: 14, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      slide.addText(String(c.right || ""), {
        x: 5.3, y: 0.8, w: 4.2, h: 4,
        fontSize: 14, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      break;

    case "table": {
      const headers = Array.isArray(c.headers) ? c.headers.map(String) : [];
      const rows = Array.isArray(c.rows) ? c.rows : [];
      const tableRows: Array<Array<{ text: string; options: Record<string, unknown> }>> = [];
      if (headers.length) {
        tableRows.push(
          headers.map((h: string) => ({
            text: h,
            options: { bold: true, fontSize: 12, fontFace: headFont, color: "FFFFFF", fill: { color: accent } },
          }))
        );
      }
      for (const row of rows) {
        if (Array.isArray(row)) {
          tableRows.push(
            row.map((cell: unknown) => ({
              text: String(cell),
              options: { fontSize: 11, fontFace: bodyFont, color: fg },
            }))
          );
        }
      }
      if (tableRows.length) {
        slide.addTable(tableRows, {
          x: 0.5, y: 0.8, w: 9,
          border: { type: "solid", pt: 0.5, color: "CCCCCC" },
        });
      }
      break;
    }

    case "stat_block": {
      const stats = Array.isArray(c.stats) ? c.stats : [];
      const title = String(c.title || "");
      if (title) {
        slide.addText(title, {
          x: 0.8, y: 0.4, w: 8.4, h: 0.8,
          fontSize: 24, fontFace: headFont, color: fg, bold: true, align: "center",
        });
      }
      const count = Math.min(stats.length, 4);
      const colW = 8.4 / Math.max(count, 1);
      stats.slice(0, 4).forEach((stat: { value?: string; label?: string }, i: number) => {
        const x = 0.8 + i * colW;
        slide.addText(String(stat.value || ""), {
          x, y: 1.8, w: colW, h: 1.2,
          fontSize: 36, fontFace: headFont, color: accent, bold: true, align: "center", valign: "bottom",
        });
        slide.addText(String(stat.label || ""), {
          x, y: 3, w: colW, h: 0.8,
          fontSize: 14, fontFace: bodyFont, color: fg, align: "center", valign: "top",
        });
      });
      break;
    }

    case "quote_block":
      slide.addText(`"${String(c.quote || "")}"`, {
        x: 1.5, y: 1.5, w: 7, h: 2,
        fontSize: 22, fontFace: headFont, color: fg, italic: true, align: "center", valign: "middle",
      });
      if (c.attribution) {
        slide.addText(`— ${String(c.attribution)}`, {
          x: 1.5, y: 3.8, w: 7, h: 0.6,
          fontSize: 14, fontFace: bodyFont, color: fg, align: "center",
        });
      }
      break;

    case "exec_summary": {
      slide.addText(String(c.title || "Executive Summary"), {
        x: 0.8, y: 0.4, w: 8.4, h: 0.8,
        fontSize: 28, fontFace: headFont, color: fg, bold: true,
      });
      slide.addText(String(c.summary || ""), {
        x: 0.8, y: 1.4, w: 8.4, h: 1.5,
        fontSize: 14, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      const kps = Array.isArray(c.keyPoints) ? c.keyPoints : [];
      if (kps.length) {
        const bullets = kps.map((kp: unknown) => ({
          text: String(kp),
          options: { bullet: true, fontSize: 13, fontFace: bodyFont, color: fg },
        }));
        slide.addText(bullets, { x: 0.8, y: 3.1, w: 8.4, h: 2 });
      }
      break;
    }

    case "section_divider":
      slide.background = { color: accent };
      slide.addText(String(c.title || c.label || ""), {
        x: 1, y: 2, w: 8, h: 1.5,
        fontSize: 36, fontFace: headFont, color: "FFFFFF", bold: true, align: "center", valign: "middle",
      });
      break;

    case "card_grid": {
      const cards = Array.isArray(c.cards) ? c.cards : [];
      const title = String(c.title || "");
      if (title) {
        slide.addText(title, {
          x: 0.8, y: 0.3, w: 8.4, h: 0.7,
          fontSize: 24, fontFace: headFont, color: fg, bold: true,
        });
      }
      const cols = Math.min(cards.length, 3);
      const cardW = 8.4 / cols - 0.2;
      cards.slice(0, 6).forEach((card: { title?: string; body?: string }, i: number) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 0.8 + col * (cardW + 0.2);
        const y = 1.2 + row * 2;
        slide.addShape(pres.ShapeType.roundRect, {
          x, y, w: cardW, h: 1.8,
          fill: { color: accent, transparency: 92 },
          line: { color: accent, width: 1, transparency: 60 },
          rectRadius: 0.1,
        });
        slide.addText(String(card.title || ""), {
          x: x + 0.15, y: y + 0.1, w: cardW - 0.3, h: 0.5,
          fontSize: 14, fontFace: headFont, color: fg, bold: true,
        });
        slide.addText(String(card.body || ""), {
          x: x + 0.15, y: y + 0.6, w: cardW - 0.3, h: 1,
          fontSize: 11, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
        });
      });
      break;
    }

    case "three_pillars": {
      const pillars = Array.isArray(c.pillars) ? c.pillars : [];
      const title = String(c.title || "");
      if (title) {
        slide.addText(title, {
          x: 0.8, y: 0.3, w: 8.4, h: 0.7,
          fontSize: 24, fontFace: headFont, color: fg, bold: true, align: "center",
        });
      }
      const count = Math.min(pillars.length, 3);
      const pw = 8.4 / count - 0.3;
      pillars.slice(0, 3).forEach((p: { title?: string; body?: string }, i: number) => {
        const x = 0.8 + i * (pw + 0.3);
        slide.addText(String(p.title || ""), {
          x, y: 1.3, w: pw, h: 0.6,
          fontSize: 16, fontFace: headFont, color: accent, bold: true, align: "center",
        });
        slide.addText(String(p.body || ""), {
          x, y: 2, w: pw, h: 2.5,
          fontSize: 12, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
        });
      });
      break;
    }

    case "cta_section":
      slide.addText(String(c.heading || ""), {
        x: 1, y: 1.5, w: 8, h: 1.5,
        fontSize: 32, fontFace: headFont, color: fg, bold: true, align: "center", valign: "middle",
      });
      if (c.body) {
        slide.addText(String(c.body), {
          x: 1.5, y: 3.2, w: 7, h: 1,
          fontSize: 16, fontFace: bodyFont, color: fg, align: "center",
        });
      }
      break;

    case "timeline_block": {
      const events = Array.isArray(c.events) ? c.events : [];
      const title = String(c.title || "");
      if (title) {
        slide.addText(title, {
          x: 0.8, y: 0.3, w: 8.4, h: 0.7,
          fontSize: 24, fontFace: headFont, color: fg, bold: true,
        });
      }
      events.slice(0, 5).forEach((ev: { date?: string; title?: string; description?: string }, i: number) => {
        const y = 1.2 + i * 0.9;
        slide.addText(String(ev.date || ""), {
          x: 0.8, y, w: 2, h: 0.7,
          fontSize: 12, fontFace: headFont, color: accent, bold: true, valign: "top",
        });
        slide.addText(String(ev.title || ""), {
          x: 3, y, w: 6.2, h: 0.35,
          fontSize: 13, fontFace: headFont, color: fg, bold: true, valign: "top",
        });
        if (ev.description) {
          slide.addText(String(ev.description), {
            x: 3, y: y + 0.35, w: 6.2, h: 0.35,
            fontSize: 11, fontFace: bodyFont, color: fg, valign: "top",
          });
        }
      });
      break;
    }

    case "comparison_table": {
      const headers = Array.isArray(c.headers) ? c.headers.map(String) : [];
      const rows = Array.isArray(c.rows) ? c.rows : [];
      const tableRows: Array<Array<{ text: string; options: Record<string, unknown> }>> = [];
      const allHeaders = ["", ...headers];
      tableRows.push(
        allHeaders.map((h: string) => ({
          text: h,
          options: { bold: true, fontSize: 11, fontFace: headFont, color: "FFFFFF", fill: { color: accent } },
        }))
      );
      for (const row of rows) {
        const r = row as { label?: string; values?: unknown[] };
        const cells = [
          { text: String(r.label || ""), options: { bold: true, fontSize: 11, fontFace: bodyFont, color: fg } },
          ...(Array.isArray(r.values) ? r.values : []).map((v: unknown) => ({
            text: typeof v === "boolean" ? (v ? "✓" : "✗") : String(v),
            options: { fontSize: 11, fontFace: bodyFont, color: fg },
          })),
        ];
        tableRows.push(cells);
      }
      if (tableRows.length) {
        slide.addTable(tableRows, {
          x: 0.5, y: 0.8, w: 9,
          border: { type: "solid", pt: 0.5, color: "CCCCCC" },
        });
      }
      break;
    }

    case "tabs_block": {
      // Represent each tab as a section on one slide
      const tabs = Array.isArray(c.tabs) ? c.tabs : [];
      const title = String(c.title || "");
      if (title) {
        slide.addText(title, {
          x: 0.8, y: 0.3, w: 8.4, h: 0.7,
          fontSize: 24, fontFace: headFont, color: fg, bold: true,
        });
      }
      tabs.slice(0, 4).forEach((tab: { label?: string; content?: string }, i: number) => {
        const y = 1.2 + i * 1.1;
        slide.addText(String(tab.label || `Tab ${i + 1}`), {
          x: 0.8, y, w: 2.5, h: 0.5,
          fontSize: 14, fontFace: headFont, color: accent, bold: true,
        });
        slide.addText(String(tab.content || ""), {
          x: 3.5, y, w: 5.7, h: 0.9,
          fontSize: 12, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
        });
      });
      break;
    }

    case "toggle_block": {
      // Show both states side by side
      const stateA = (c.stateA || {}) as { label?: string; content?: string };
      const stateB = (c.stateB || {}) as { label?: string; content?: string };
      const title = String(c.title || "");
      if (title) {
        slide.addText(title, {
          x: 0.8, y: 0.3, w: 8.4, h: 0.7,
          fontSize: 24, fontFace: headFont, color: fg, bold: true, align: "center",
        });
      }
      // State A
      slide.addText(String(stateA.label || "State A"), {
        x: 0.5, y: 1.3, w: 4.2, h: 0.6,
        fontSize: 16, fontFace: headFont, color: accent, bold: true, align: "center",
      });
      slide.addText(String(stateA.content || ""), {
        x: 0.5, y: 2, w: 4.2, h: 2.5,
        fontSize: 13, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      // State B
      slide.addText(String(stateB.label || "State B"), {
        x: 5.3, y: 1.3, w: 4.2, h: 0.6,
        fontSize: 16, fontFace: headFont, color: accent, bold: true, align: "center",
      });
      slide.addText(String(stateB.content || ""), {
        x: 5.3, y: 2, w: 4.2, h: 2.5,
        fontSize: 13, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      break;
    }

    case "decision_summary": {
      slide.addText(String(c.title || "Decision Summary"), {
        x: 0.8, y: 0.3, w: 8.4, h: 0.7,
        fontSize: 24, fontFace: headFont, color: fg, bold: true,
      });
      slide.addText(String(c.summary || ""), {
        x: 0.8, y: 1.2, w: 8.4, h: 1.5,
        fontSize: 14, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      const kps = Array.isArray(c.key_points) ? c.key_points : [];
      if (kps.length) {
        const bullets = kps.map((kp: unknown) => ({
          text: String(kp),
          options: { bullet: true, fontSize: 13, fontFace: bodyFont, color: fg },
        }));
        slide.addText(bullets, { x: 0.8, y: 2.9, w: 8.4, h: 2 });
      }
      break;
    }

    case "recommendation_panel": {
      slide.addText(String(c.title || "Recommendation"), {
        x: 0.8, y: 0.3, w: 8.4, h: 0.7,
        fontSize: 24, fontFace: headFont, color: fg, bold: true,
      });
      slide.addText(String(c.recommendation || ""), {
        x: 0.8, y: 1.2, w: 8.4, h: 2,
        fontSize: 16, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      break;
    }

    // Fallback: render any text-bearing content
    default: {
      const title =
        String(c.title || c.heading || c.headline || c.text || block.type.replace(/_/g, " "));
      slide.addText(title, {
        x: 0.8,
        y: 1.5,
        w: 8.4,
        h: 2,
        fontSize: 24,
        fontFace: headFont,
        color: fg,
        bold: true,
        align: "center",
        valign: "middle",
      });
      break;
    }
  }
}

serve(async (req) => {
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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return json(503, { error: "Service not configured" });
    }

    const { project_id } = await req.json();

    if (!project_id || typeof project_id !== "string") {
      return json(400, { error: "project_id is required" });
    }

    // Fetch project
    const projRes = await fetch(
      `${SUPABASE_URL}/rest/v1/projects?id=eq.${project_id}&select=title,brand_kit,theme`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );
    const projects = await projRes.json();
    if (!Array.isArray(projects) || projects.length === 0) {
      return json(404, { error: "Project not found" });
    }
    const project = projects[0];

    // Fetch blocks ordered
    const blocksRes = await fetch(
      `${SUPABASE_URL}/rest/v1/blocks?project_id=eq.${project_id}&order=order_index.asc&select=id,type,content,order_index`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      }
    );
    const blocks: SlideBlock[] = await blocksRes.json();
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return json(400, { error: "No blocks found for this project" });
    }

    const brand: BrandKit = (project.brand_kit as BrandKit) || {};

    // Build presentation
    const pres = new pptxgen();
    pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inches (16:9)
    pres.author = "Axora";
    pres.title = String(project.title || "Untitled Deck");

    for (const block of blocks) {
      addBlockToSlide(pres, block, brand);
    }

    // Generate buffer
    const buffer = await pres.write({ outputType: "arraybuffer" });
    const uint8 = new Uint8Array(buffer as ArrayBuffer);

    const fileName = `${(project.title || "deck").replace(/[^a-zA-Z0-9]/g, "_")}.pptx`;

    return new Response(uint8, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (e) {
    console.error("PPTX generation error:", e);
    return json(500, { error: "Failed to generate PowerPoint file" });
  }
});
