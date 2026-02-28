/**
 * Client-side PowerPoint export using pptxgenjs.
 * Moved from edge function because pptxgenjs doesn't work reliably in Deno.
 */
import pptxgen from "pptxgenjs";

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

interface SlideBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order_index: number;
}

function safeColor(hex: string | undefined, fallback: string): string {
  if (!hex) return fallback;
  return hex.replace(/^#/, "");
}

function fontName(font: string | undefined, fallback: string): string {
  return font || fallback;
}

// Scale factor: content was authored for 10" width, slide is 13.33"
const SX = 13.33 / 10;

function sx(v: number) { return v * SX; }

function addBlockToSlide(
  pres: pptxgen,
  block: SlideBlock,
  brand: BrandKit,
  showWatermark: boolean
) {
  const slide = pres.addSlide();
  const bg = safeColor(brand.colors?.background, "FFFFFF");
  const fg = safeColor(brand.colors?.foreground, "222222");
  const accent = safeColor(brand.colors?.accent, "3B82F6");
  const headFont = fontName(brand.typography?.headingFont, "Calibri");
  const bodyFont = fontName(brand.typography?.bodyFont, "Calibri");

  slide.background = { color: bg };

  if (showWatermark) {
    slide.addText("Made with AXORA", {
      x: sx(8.5), y: 6.8, w: sx(3.5), h: 0.5,
      fontSize: 12, fontFace: "Calibri", color: "AAAAAA",
      align: "right", italic: true, transparency: 30,
    });
  }

  const c = block.content || {};

  switch (block.type) {
    case "heading":
      slide.addText(String(c.text || ""), {
        x: sx(0.8), y: 1.5, w: sx(8.4), h: 1.5,
        fontSize: 36, fontFace: headFont, color: fg, bold: true, valign: "middle",
      });
      break;

    case "text":
      slide.addText(String(c.text || ""), {
        x: sx(0.8), y: 0.8, w: sx(8.4), h: 4,
        fontSize: 16, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      break;

    case "hero_header":
      slide.addText(String(c.heading || c.title || ""), {
        x: sx(0.8), y: 1.2, w: sx(8.4), h: 1.5,
        fontSize: 40, fontFace: headFont, color: fg, bold: true, align: "center", valign: "middle",
      });
      if (c.subheading) {
        slide.addText(String(c.subheading), {
          x: sx(1.5), y: 3, w: sx(7), h: 1,
          fontSize: 18, fontFace: bodyFont, color: fg, align: "center",
        });
      }
      break;

    case "list": {
      const items = Array.isArray(c.items) ? c.items : [];
      const title = String(c.title || "");
      let yPos = 0.6;
      if (title) {
        slide.addText(title, {
          x: sx(0.8), y: yPos, w: sx(8.4), h: 0.8,
          fontSize: 24, fontFace: headFont, color: fg, bold: true,
        });
        yPos += 1;
      }
      const bullets = items.map((item: unknown) => ({
        text: String(item),
        options: { bullet: true, fontSize: 16, fontFace: bodyFont, color: fg },
      }));
      if (bullets.length) {
        slide.addText(bullets, { x: sx(0.8), y: yPos, w: sx(8.4), h: 4 - (yPos - 0.6), valign: "top" });
      }
      break;
    }

    case "callout":
      slide.addShape(pres.ShapeType.roundRect, {
        x: sx(1), y: 1.5, w: sx(8), h: 2.5,
        fill: { color: accent, transparency: 90 },
        line: { color: accent, width: 2 },
        rectRadius: 0.2,
      });
      slide.addText(String(c.text || ""), {
        x: sx(1.2), y: 1.7, w: sx(7.6), h: 2.1,
        fontSize: 18, fontFace: bodyFont, color: fg, valign: "middle", wrap: true,
      });
      break;

    case "two_col":
      slide.addText(String(c.left || ""), {
        x: sx(0.5), y: 0.8, w: sx(4.2), h: 4,
        fontSize: 14, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      slide.addText(String(c.right || ""), {
        x: sx(5.3), y: 0.8, w: sx(4.2), h: 4,
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
          x: sx(0.5), y: 0.8, w: sx(9),
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
          x: sx(0.8), y: 0.4, w: sx(8.4), h: 0.8,
          fontSize: 24, fontFace: headFont, color: fg, bold: true, align: "center",
        });
      }
      const count = Math.min(stats.length, 4);
      const colW = sx(8.4) / Math.max(count, 1);
      stats.slice(0, 4).forEach((stat: { value?: string; label?: string }, i: number) => {
        const x = sx(0.8) + i * colW;
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
        x: sx(1.5), y: 1.5, w: sx(7), h: 2,
        fontSize: 22, fontFace: headFont, color: fg, italic: true, align: "center", valign: "middle",
      });
      if (c.attribution) {
        slide.addText(`— ${String(c.attribution)}`, {
          x: sx(1.5), y: 3.8, w: sx(7), h: 0.6,
          fontSize: 14, fontFace: bodyFont, color: fg, align: "center",
        });
      }
      break;

    case "exec_summary": {
      slide.addText(String(c.title || "Executive Summary"), {
        x: sx(0.8), y: 0.4, w: sx(8.4), h: 0.8,
        fontSize: 28, fontFace: headFont, color: fg, bold: true,
      });
      slide.addText(String(c.summary || ""), {
        x: sx(0.8), y: 1.4, w: sx(8.4), h: 1.5,
        fontSize: 14, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      const kps = Array.isArray(c.keyPoints) ? c.keyPoints : [];
      if (kps.length) {
        const bullets = kps.map((kp: unknown) => ({
          text: String(kp),
          options: { bullet: true, fontSize: 13, fontFace: bodyFont, color: fg },
        }));
        slide.addText(bullets, { x: sx(0.8), y: 3.1, w: sx(8.4), h: 2 });
      }
      break;
    }

    case "section_divider":
      slide.background = { color: accent };
      slide.addText(String(c.title || c.label || ""), {
        x: sx(1), y: 2, w: sx(8), h: 1.5,
        fontSize: 36, fontFace: headFont, color: "FFFFFF", bold: true, align: "center", valign: "middle",
      });
      break;

    case "card_grid": {
      const cards = Array.isArray(c.cards) ? c.cards : [];
      const title = String(c.title || "");
      if (title) {
        slide.addText(title, {
          x: sx(0.8), y: 0.3, w: sx(8.4), h: 0.7,
          fontSize: 24, fontFace: headFont, color: fg, bold: true,
        });
      }
      const cols = Math.min(cards.length, 3);
      const cardW = sx(8.4) / cols - 0.2;
      cards.slice(0, 6).forEach((card: { title?: string; body?: string }, i: number) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = sx(0.8) + col * (cardW + 0.2);
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
          x: sx(0.8), y: 0.3, w: sx(8.4), h: 0.7,
          fontSize: 24, fontFace: headFont, color: fg, bold: true, align: "center",
        });
      }
      const pCount = Math.min(pillars.length, 3);
      const pw = sx(8.4) / pCount - 0.3;
      pillars.slice(0, 3).forEach((p: { title?: string; body?: string }, i: number) => {
        const x = sx(0.8) + i * (pw + 0.3);
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
        x: sx(1), y: 1.5, w: sx(8), h: 1.5,
        fontSize: 32, fontFace: headFont, color: fg, bold: true, align: "center", valign: "middle",
      });
      if (c.body) {
        slide.addText(String(c.body), {
          x: sx(1.5), y: 3.2, w: sx(7), h: 1,
          fontSize: 16, fontFace: bodyFont, color: fg, align: "center",
        });
      }
      break;

    case "timeline_block": {
      const events = Array.isArray(c.events) ? c.events : [];
      const title = String(c.title || "");
      if (title) {
        slide.addText(title, {
          x: sx(0.8), y: 0.3, w: sx(8.4), h: 0.7,
          fontSize: 24, fontFace: headFont, color: fg, bold: true,
        });
      }
      events.slice(0, 5).forEach((ev: { date?: string; title?: string; description?: string }, i: number) => {
        const y = 1.2 + i * 0.9;
        slide.addText(String(ev.date || ""), {
          x: sx(0.8), y, w: sx(2), h: 0.7,
          fontSize: 12, fontFace: headFont, color: accent, bold: true, valign: "top",
        });
        slide.addText(String(ev.title || ""), {
          x: sx(3), y, w: sx(6.2), h: 0.35,
          fontSize: 13, fontFace: headFont, color: fg, bold: true, valign: "top",
        });
        if (ev.description) {
          slide.addText(String(ev.description), {
            x: sx(3), y: y + 0.35, w: sx(6.2), h: 0.35,
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
          x: sx(0.5), y: 0.8, w: sx(9),
          border: { type: "solid", pt: 0.5, color: "CCCCCC" },
        });
      }
      break;
    }

    case "tabs_block": {
      const tabs = Array.isArray(c.tabs) ? c.tabs : [];
      const title = String(c.title || "");
      if (title) {
        slide.addText(title, {
          x: sx(0.8), y: 0.3, w: sx(8.4), h: 0.7,
          fontSize: 24, fontFace: headFont, color: fg, bold: true,
        });
      }
      tabs.slice(0, 4).forEach((tab: { label?: string; content?: string }, i: number) => {
        const y = 1.2 + i * 1.1;
        slide.addText(String(tab.label || `Tab ${i + 1}`), {
          x: sx(0.8), y, w: sx(2.5), h: 0.5,
          fontSize: 14, fontFace: headFont, color: accent, bold: true,
        });
        slide.addText(String(tab.content || ""), {
          x: sx(3.5), y, w: sx(5.7), h: 0.9,
          fontSize: 12, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
        });
      });
      break;
    }

    case "toggle_block": {
      const stateA = (c.stateA || {}) as { label?: string; content?: string };
      const stateB = (c.stateB || {}) as { label?: string; content?: string };
      const title = String(c.title || "");
      if (title) {
        slide.addText(title, {
          x: sx(0.8), y: 0.3, w: sx(8.4), h: 0.7,
          fontSize: 24, fontFace: headFont, color: fg, bold: true, align: "center",
        });
      }
      slide.addText(String(stateA.label || "State A"), {
        x: sx(0.5), y: 1.3, w: sx(4.2), h: 0.6,
        fontSize: 16, fontFace: headFont, color: accent, bold: true, align: "center",
      });
      slide.addText(String(stateA.content || ""), {
        x: sx(0.5), y: 2, w: sx(4.2), h: 2.5,
        fontSize: 13, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      slide.addText(String(stateB.label || "State B"), {
        x: sx(5.3), y: 1.3, w: sx(4.2), h: 0.6,
        fontSize: 16, fontFace: headFont, color: accent, bold: true, align: "center",
      });
      slide.addText(String(stateB.content || ""), {
        x: sx(5.3), y: 2, w: sx(4.2), h: 2.5,
        fontSize: 13, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      break;
    }

    case "decision_summary": {
      slide.addText(String(c.title || "Decision Summary"), {
        x: sx(0.8), y: 0.3, w: sx(8.4), h: 0.7,
        fontSize: 24, fontFace: headFont, color: fg, bold: true,
      });
      slide.addText(String(c.summary || ""), {
        x: sx(0.8), y: 1.2, w: sx(8.4), h: 1.5,
        fontSize: 14, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      const kps = Array.isArray(c.key_points) ? c.key_points : [];
      if (kps.length) {
        const bullets = kps.map((kp: unknown) => ({
          text: String(kp),
          options: { bullet: true, fontSize: 13, fontFace: bodyFont, color: fg },
        }));
        slide.addText(bullets, { x: sx(0.8), y: 2.9, w: sx(8.4), h: 2 });
      }
      break;
    }

    case "recommendation_panel":
      slide.addText(String(c.title || "Recommendation"), {
        x: sx(0.8), y: 0.3, w: sx(8.4), h: 0.7,
        fontSize: 24, fontFace: headFont, color: fg, bold: true,
      });
      slide.addText(String(c.recommendation || ""), {
        x: sx(0.8), y: 1.2, w: sx(8.4), h: 2,
        fontSize: 16, fontFace: bodyFont, color: fg, valign: "top", wrap: true,
      });
      break;

    default: {
      const title =
        String(c.title || c.heading || c.headline || c.text || block.type.replace(/_/g, " "));
      slide.addText(title, {
        x: sx(0.8), y: 1.5, w: sx(8.4), h: 2,
        fontSize: 24, fontFace: headFont, color: fg, bold: true, align: "center", valign: "middle",
      });
      break;
    }
  }
}

export interface ExportPptxOptions {
  title: string;
  blocks: SlideBlock[];
  brandKit?: BrandKit;
  showWatermark?: boolean;
}

export async function generatePptxBlob(opts: ExportPptxOptions): Promise<Blob> {
  const pres = new pptxgen();
  // Use 16x9 layout (10" x 5.625") matching our content positioning
  pres.defineLayout({ name: "AXORA_16x9", width: 13.33, height: 7.5 });
  pres.layout = "AXORA_16x9";
  pres.author = "Axora";
  pres.title = opts.title;

  const brand: BrandKit = opts.brandKit || {};

  for (const block of opts.blocks) {
    addBlockToSlide(pres, block, brand, !!opts.showWatermark);
  }

  const blob = await pres.write({ outputType: "blob" }) as Blob;
  return blob;
}
