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

// Scale factors: content was authored for 10" × 5.625", slide is 13.33" × 7.5"
const SX = 13.33 / 10;
const SY = 7.5 / 5.625;

function sx(v: number) { return v * SX; }
function sy(v: number) { return v * SY; }

function addBlockToSlide(
  pres: pptxgen,
  block: SlideBlock,
  brand: BrandKit,
  showWatermark: boolean,
  slideIndex: number,
  totalSlides: number,
  deckTitle: string
) {
  const slide = pres.addSlide();
  const bg = safeColor(brand.colors?.background, "FFFFFF");
  const fg = safeColor(brand.colors?.foreground, "222222");
  const accent = safeColor(brand.colors?.accent, "3B82F6");
  const headFont = fontName(brand.typography?.headingFont, "Calibri");
  const bodyFont = fontName(brand.typography?.bodyFont, "Calibri");

  slide.background = { color: bg };

  // Slide number — bottom-right
  slide.addText(`${slideIndex + 1}`, {
    x: sx(9.2), y: sy(5.15), w: sx(0.6), h: sy(0.35),
    fontSize: 9, fontFace: bodyFont, color: "999999", align: "right",
  });

  // Branded footer bar — bottom
  slide.addText(deckTitle, {
    x: sx(0.5), y: sy(5.15), w: sx(6), h: sy(0.35),
    fontSize: 8, fontFace: bodyFont, color: "AAAAAA",
  });

  if (showWatermark) {
    slide.addText("Made with AXIVA", {
      x: sx(8.5), y: sy(6.8), w: sx(3.5), h: sy(0.5),
      fontSize: 12, fontFace: "Calibri", color: "AAAAAA",
      align: "right", italic: true, transparency: 30,
    });
  }

  const c = block.content || {};

  switch (block.type) {
    case "heading":
      slide.addText(String(c.text || ""), {
        x: sx(0.8), y: sy(1.5), w: sx(8.4), h: sy(1.5),
        fontSize: 36, fontFace: headFont, color: fg, bold: true, valign: "middle",
      });
      break;

    case "text":
      slide.addText(String(c.text || ""), {
        x: sx(0.8), y: sy(0.8), w: sx(8.4), h: sy(4),
        fontSize: 16, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true,
      });
      break;

    case "hero_header":
      slide.addText(String(c.heading || c.title || ""), {
        x: sx(0.8), y: sy(1.2), w: sx(8.4), h: sy(1.5),
        fontSize: 40, fontFace: headFont, color: fg, bold: true, align: "center", valign: "middle",
      });
      if (c.subheading) {
        slide.addText(String(c.subheading), {
          x: sx(1.5), y: sy(3), w: sx(7), h: sy(1),
          fontSize: 18, fontFace: bodyFont, color: fg, align: "center",
        });
      }
      break;

    case "list": {
      const items = Array.isArray(c.items) ? c.items : [];
      const title = String(c.title || "");
      let yPos = sy(0.6);
      if (title) {
        slide.addText(title, {
          x: sx(0.8), y: yPos, w: sx(8.4), h: sy(0.8),
          fontSize: 24, fontFace: headFont, color: fg, bold: true,
        });
        yPos += sy(1);
      }
      const bullets = items.map((item: unknown) => ({
        text: String(item),
        options: { bullet: true, fontSize: 16, fontFace: bodyFont, color: fg },
      }));
      if (bullets.length) {
        slide.addText(bullets, { x: sx(0.8), y: yPos, w: sx(8.4), h: sy(4) - (yPos - sy(0.6)), valign: "top", autoFit: true });
      }
      break;
    }

    case "callout":
      slide.addShape(pres.ShapeType.roundRect, {
        x: sx(1), y: sy(1.5), w: sx(8), h: sy(2.5),
        fill: { color: accent, transparency: 90 },
        line: { color: accent, width: 2 },
        rectRadius: 0.2,
      });
      slide.addText(String(c.text || ""), {
        x: sx(1.2), y: sy(1.7), w: sx(7.6), h: sy(2.1),
        fontSize: 18, fontFace: bodyFont, color: fg, valign: "middle", wrap: true, shrinkText: true,
      });
      break;

    case "two_col":
      slide.addText(String(c.left || ""), {
        x: sx(0.5), y: sy(0.8), w: sx(4.2), h: sy(4),
        fontSize: 14, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true,
      });
      slide.addText(String(c.right || ""), {
        x: sx(5.3), y: sy(0.8), w: sx(4.2), h: sy(4),
        fontSize: 14, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true,
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
          x: sx(0.5), y: sy(0.8), w: sx(9),
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
          x: sx(0.8), y: sy(0.4), w: sx(8.4), h: sy(0.8),
          fontSize: 24, fontFace: headFont, color: fg, bold: true, align: "center",
        });
      }
      const count = Math.min(stats.length, 4);
      const colW = sx(8.4) / Math.max(count, 1);
      stats.slice(0, 4).forEach((stat: { value?: string; label?: string }, i: number) => {
        const x = sx(0.8) + i * colW;
        slide.addText(String(stat.value || ""), {
          x, y: sy(1.8), w: colW, h: sy(1.2),
          fontSize: 36, fontFace: headFont, color: accent, bold: true, align: "center", valign: "bottom",
        });
        slide.addText(String(stat.label || ""), {
          x, y: sy(3), w: colW, h: sy(0.8),
          fontSize: 14, fontFace: bodyFont, color: fg, align: "center", valign: "top", autoFit: true,
        });
      });
      break;
    }

    case "quote_block":
      slide.addText(`"${String(c.quote || "")}"`, {
        x: sx(1.5), y: sy(1.5), w: sx(7), h: sy(2),
        fontSize: 22, fontFace: headFont, color: fg, italic: true, align: "center", valign: "middle",
      });
      if (c.attribution) {
        slide.addText(`— ${String(c.attribution)}`, {
          x: sx(1.5), y: sy(3.8), w: sx(7), h: sy(0.6),
          fontSize: 14, fontFace: bodyFont, color: fg, align: "center",
        });
      }
      break;

    case "exec_summary": {
      slide.addText(String(c.title || "Executive Summary"), {
        x: sx(0.8), y: sy(0.4), w: sx(8.4), h: sy(0.8),
        fontSize: 28, fontFace: headFont, color: fg, bold: true,
      });
      slide.addText(String(c.summary || ""), {
        x: sx(0.8), y: sy(1.4), w: sx(8.4), h: sy(1.5),
        fontSize: 14, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true,
      });
      const kps = Array.isArray(c.keyPoints) ? c.keyPoints : [];
      if (kps.length) {
        const bullets = kps.map((kp: unknown) => ({
          text: String(kp),
          options: { bullet: true, fontSize: 13, fontFace: bodyFont, color: fg },
        }));
        slide.addText(bullets, { x: sx(0.8), y: sy(3.1), w: sx(8.4), h: 2 });
      }
      break;
    }

    case "section_divider":
      slide.background = { color: accent };
      slide.addText(String(c.title || c.label || ""), {
        x: sx(1), y: sy(2), w: sx(8), h: sy(1.5),
        fontSize: 36, fontFace: headFont, color: "FFFFFF", bold: true, align: "center", valign: "middle",
      });
      break;

    case "card_grid": {
      const cards = Array.isArray(c.cards) ? c.cards : [];
      const title = String(c.title || "");
      if (title) {
        slide.addText(title, {
          x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.7),
          fontSize: 24, fontFace: headFont, color: fg, bold: true,
        });
      }
      const cols = Math.min(cards.length, 3);
      const cardW = sx(8.4) / cols - 0.2;
      cards.slice(0, 6).forEach((card: { title?: string; body?: string }, i: number) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = sx(0.8) + col * (cardW + 0.2);
        const y = sy(1.2) + row * sy(2);
        slide.addShape(pres.ShapeType.roundRect, {
          x, y, w: cardW, h: sy(1.8),
          fill: { color: accent, transparency: 92 },
          line: { color: accent, width: 1, transparency: 60 },
          rectRadius: 0.1,
        });
        slide.addText(String(card.title || ""), {
          x: x + 0.15, y: y + 0.1, w: cardW - 0.3, h: sy(0.5),
          fontSize: 14, fontFace: headFont, color: fg, bold: true,
        });
        slide.addText(String(card.body || ""), {
          x: x + 0.15, y: y + 0.6, w: cardW - 0.3, h: sy(1),
          fontSize: 11, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true,
        });
      });
      break;
    }

    case "three_pillars": {
      const pillars = Array.isArray(c.pillars) ? c.pillars : [];
      const title = String(c.title || "");
      if (title) {
        slide.addText(title, {
          x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.7),
          fontSize: 24, fontFace: headFont, color: fg, bold: true, align: "center",
        });
      }
      const pCount = Math.min(pillars.length, 3);
      const pw = sx(8.4) / pCount - 0.3;
      pillars.slice(0, 3).forEach((p: { title?: string; body?: string }, i: number) => {
        const x = sx(0.8) + i * (pw + 0.3);
        slide.addText(String(p.title || ""), {
          x, y: sy(1.3), w: pw, h: sy(0.6),
          fontSize: 16, fontFace: headFont, color: accent, bold: true, align: "center",
        });
        slide.addText(String(p.body || ""), {
          x, y: sy(2), w: pw, h: sy(2.5),
          fontSize: 12, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true,
        });
      });
      break;
    }

    case "cta_section":
      slide.addText(String(c.heading || ""), {
        x: sx(1), y: sy(1.5), w: sx(8), h: sy(1.5),
        fontSize: 32, fontFace: headFont, color: fg, bold: true, align: "center", valign: "middle",
      });
      if (c.body) {
        slide.addText(String(c.body), {
          x: sx(1.5), y: sy(3.2), w: sx(7), h: sy(1),
          fontSize: 16, fontFace: bodyFont, color: fg, align: "center",
        });
      }
      break;

    case "timeline_block": {
      const events = Array.isArray(c.events) ? c.events : [];
      const title = String(c.title || "");
      if (title) {
        slide.addText(title, {
          x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.7),
          fontSize: 24, fontFace: headFont, color: fg, bold: true,
        });
      }
      events.slice(0, 5).forEach((ev: { date?: string; title?: string; description?: string }, i: number) => {
        const y = sy(1.2) + i * sy(0.9);
        slide.addText(String(ev.date || ""), {
          x: sx(0.8), y, w: sx(2), h: sy(0.7),
          fontSize: 12, fontFace: headFont, color: accent, bold: true, valign: "top", autoFit: true,
        });
        slide.addText(String(ev.title || ""), {
          x: sx(3), y, w: sx(6.2), h: sy(0.35),
          fontSize: 13, fontFace: headFont, color: fg, bold: true, valign: "top", autoFit: true,
        });
        if (ev.description) {
          slide.addText(String(ev.description), {
            x: sx(3), y: y + 0.35, w: sx(6.2), h: sy(0.35),
            fontSize: 11, fontFace: bodyFont, color: fg, valign: "top", autoFit: true,
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
          x: sx(0.5), y: sy(0.8), w: sx(9),
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
          x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.7),
          fontSize: 24, fontFace: headFont, color: fg, bold: true,
        });
      }
      tabs.slice(0, 4).forEach((tab: { label?: string; content?: string }, i: number) => {
        const y = sy(1.2) + i * sy(1.1);
        slide.addText(String(tab.label || `Tab ${i + 1}`), {
          x: sx(0.8), y, w: sx(2.5), h: sy(0.5),
          fontSize: 14, fontFace: headFont, color: accent, bold: true,
        });
        slide.addText(String(tab.content || ""), {
          x: sx(3.5), y, w: sx(5.7), h: sy(0.9),
          fontSize: 12, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true,
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
          x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.7),
          fontSize: 24, fontFace: headFont, color: fg, bold: true, align: "center",
        });
      }
      slide.addText(String(stateA.label || "State A"), {
        x: sx(0.5), y: sy(1.3), w: sx(4.2), h: sy(0.6),
        fontSize: 16, fontFace: headFont, color: accent, bold: true, align: "center",
      });
      slide.addText(String(stateA.content || ""), {
        x: sx(0.5), y: sy(2), w: sx(4.2), h: sy(2.5),
        fontSize: 13, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true,
      });
      slide.addText(String(stateB.label || "State B"), {
        x: sx(5.3), y: sy(1.3), w: sx(4.2), h: sy(0.6),
        fontSize: 16, fontFace: headFont, color: accent, bold: true, align: "center",
      });
      slide.addText(String(stateB.content || ""), {
        x: sx(5.3), y: sy(2), w: sx(4.2), h: sy(2.5),
        fontSize: 13, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true,
      });
      break;
    }

    case "decision_summary": {
      slide.addText(String(c.title || "Decision Summary"), {
        x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.7),
        fontSize: 24, fontFace: headFont, color: fg, bold: true,
      });
      slide.addText(String(c.summary || ""), {
        x: sx(0.8), y: sy(1.2), w: sx(8.4), h: sy(1.5),
        fontSize: 14, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true,
      });
      const kps = Array.isArray(c.key_points) ? c.key_points : [];
      if (kps.length) {
        const bullets = kps.map((kp: unknown) => ({
          text: String(kp),
          options: { bullet: true, fontSize: 13, fontFace: bodyFont, color: fg },
        }));
        slide.addText(bullets, { x: sx(0.8), y: sy(2.9), w: sx(8.4), h: 2 });
      }
      break;
    }

    case "recommendation_panel":
      slide.addText(String(c.title || "Recommendation"), {
        x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.7),
        fontSize: 24, fontFace: headFont, color: fg, bold: true,
      });
      slide.addText(String(c.recommendation || ""), {
        x: sx(0.8), y: sy(1.2), w: sx(8.4), h: sy(2),
        fontSize: 16, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true,
      });
      break;

    case "chart_block": {
      const title = String(c.title || "");
      const chartType = String(c.chartType || "bar");
      const data = Array.isArray(c.data) ? c.data : [];
      const xAxisLabel = String(c.xAxisLabel || "");
      const yAxisLabel = String(c.yAxisLabel || "");
      if (title) {
        slide.addText(title, { x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.7), fontSize: 24, fontFace: headFont, color: fg, bold: true });
      }
      if (!data.length) break;
      // Standardized 6-color exec palette
      const EXEC_PALETTE = ["0F766E", "0369A1", "4338CA", "7C3AED", "BE185D", "B45309"];
      if (chartType === "donut") {
        const chartData = [{ name: "Data", labels: data.map((d: any) => String(d.label || "")), values: data.map((d: any) => Number(d.value) || 0) }];
        slide.addChart((pres as any).charts.DOUGHNUT, chartData, { x: sx(2), y: sy(1.3), w: sx(6), h: sy(4.5), showLegend: true, legendPos: "b", legendFontSize: 10, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelColor: fg, chartColors: ["14B8A6", "06B6D4", "0EA5E9", "6366F1", "8B5CF6"] });
      } else if (chartType === "area") {
        const chartData = [{ name: "Value", labels: data.map((d: any) => String(d.label || "")), values: data.map((d: any) => Number(d.value) || 0) }];
        slide.addChart((pres as any).charts.AREA, chartData, { x: sx(0.8), y: sy(1.3), w: sx(8.4), h: sy(4.5), showLegend: false, chartColors: ["14B8A6"], lineSize: 2 });
      } else if (chartType === "stacked_bar") {
        const total = data.reduce((s: number, d: any) => s + (Number(d.value) || 0), 0);
        const colors = ["14B8A6", "06B6D4", "0EA5E9", "6366F1", "8B5CF6", "A855F7"];
        let xOff = sx(0.8);
        const barW = sx(8.4);
        data.forEach((d: any, i: number) => {
          const pct = total > 0 ? (Number(d.value) || 0) / total : 0;
          const w = barW * pct;
          slide.addShape(pres.ShapeType.rect, { x: xOff, y: sy(1.8), w, h: sy(0.6), fill: { color: colors[i % colors.length] } });
          if (pct > 0.06) slide.addText(`${Math.round(pct * 100)}%`, { x: xOff, y: sy(1.8), w, h: sy(0.6), fontSize: 10, fontFace: bodyFont, color: "FFFFFF", bold: true, align: "center", valign: "middle" });
          xOff += w;
        });
        const legendY = sy(2.8);
        const cols = Math.min(data.length, 3);
        const legendColW = sx(8.4) / cols;
        data.forEach((d: any, i: number) => {
          const col = i % cols; const row = Math.floor(i / cols);
          const x = sx(0.8) + col * legendColW; const y = legendY + row * sy(0.5);
          const pct = total > 0 ? Math.round(((Number(d.value) || 0) / total) * 100) : 0;
          slide.addShape(pres.ShapeType.rect, { x, y: y + 0.05, w: 0.15, h: 0.15, fill: { color: colors[i % colors.length] }, rectRadius: 0.02 });
          slide.addText(`${String(d.label || "")} (${pct}%)`, { x: x + 0.25, y, w: legendColW - 0.3, h: sy(0.3), fontSize: 10, fontFace: bodyFont, color: fg });
        });
      } else if (chartType === "line") {
        const chartData = [{ name: "Value", labels: data.map((d: any) => String(d.label || "")), values: data.map((d: any) => Number(d.value) || 0) }];
        slide.addChart((pres as any).charts.LINE, chartData, { x: sx(0.8), y: sy(1.3), w: sx(8.4), h: sy(4.5), showLegend: false, chartColors: [accent], lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 6 });
      } else {
        const chartData = [{ name: "Value", labels: data.map((d: any) => String(d.label || "")), values: data.map((d: any) => Number(d.value) || 0) }];
        slide.addChart((pres as any).charts.BAR, chartData, { x: sx(0.8), y: sy(1.3), w: sx(8.4), h: sy(4.5), showLegend: false, barDir: "col", chartColors: [accent] });
      }
      break;
    }

    case "kpi_dashboard": {
      const cards = Array.isArray(c.cards) ? c.cards : [];
      const title = String(c.title || "");
      const kpiColors = ["14B8A6", "06B6D4", "0EA5E9", "6366F1"];
      if (title) slide.addText(title, { x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.6), fontSize: 22, fontFace: headFont, color: fg, bold: true });
      const cardW = sx(4) - 0.2; const cardH = sy(2.4);
      cards.slice(0, 4).forEach((card: any, i: number) => {
        const col = i % 2; const row = Math.floor(i / 2);
        const x = sx(0.8) + col * (cardW + 0.4); const y = sy(1.1) + row * (cardH + sy(0.3));
        const kpiColor = safeColor(card.color, kpiColors[i % kpiColors.length]);
        slide.addShape(pres.ShapeType.roundRect, { x, y, w: cardW, h: cardH, fill: { color: bg }, line: { color: "CCCCCC", width: 1 }, rectRadius: 0.1 });
        slide.addText(String(card.title || "").toUpperCase(), { x: x + 0.2, y: y + 0.15, w: cardW - 0.4, h: sy(0.35), fontSize: 9, fontFace: bodyFont, color: "888888", bold: true });
        slide.addText(String(card.value || ""), { x: x + 0.2, y: y + 0.5, w: cardW * 0.55, h: sy(0.8), fontSize: 28, fontFace: headFont, color: kpiColor, bold: true, valign: "top", autoFit: true });
        if (card.change) {
          const trendArrow = card.trend === "up" ? "▲ " : card.trend === "down" ? "▼ " : "";
          const trendColor = card.trend === "up" ? "10B981" : card.trend === "down" ? "EF4444" : "888888";
          slide.addText(`${trendArrow}${String(card.change)}`, { x: x + 0.2, y: y + 1.3, w: cardW * 0.55, h: sy(0.35), fontSize: 10, fontFace: bodyFont, color: trendColor, bold: true });
        }
        if (Array.isArray(card.chartData) && card.chartData.length > 0) {
          const chartLabel = card.chartType === "donut" ? "●" : card.chartType === "area" ? "📈" : "📊";
          slide.addText(chartLabel, { x: x + cardW * 0.6, y: y + 0.5, w: cardW * 0.35, h: sy(1.4), fontSize: 32, align: "center", valign: "middle", color: kpiColor });
        }
      });
      break;
    }

    case "relationship_matrix": {
      const labels = Array.isArray(c.labels) ? c.labels.map(String) : [];
      const rels = Array.isArray(c.relationships) ? c.relationships : [];
      const title = String(c.title || "");
      if (title) slide.addText(title, { x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.7), fontSize: 24, fontFace: headFont, color: fg, bold: true });
      if (labels.length < 2) break;
      const n = labels.length;
      const relMap = new Map<string, string>();
      rels.forEach((r: any) => relMap.set(`${r.row}-${r.col}`, String(r.type)));
      const tableRows: Array<Array<{ text: string; options: Record<string, unknown> }>> = [];
      tableRows.push([{ text: "", options: { fontSize: 9 } }, ...labels.slice(1).map((l: string) => ({ text: l, options: { fontSize: 9, fontFace: headFont, color: fg, bold: true, align: "center" } }))]);
      labels.slice(0, -1).forEach((rowLabel: string, ri: number) => {
        const row = [{ text: rowLabel, options: { fontSize: 9, fontFace: headFont, color: fg, bold: true } },
          ...labels.slice(1).map((_: string, ci: number) => {
            if (ci < ri) return { text: "", options: { fontSize: 9 } };
            const relType = relMap.get(`${ri}-${ci + 1}`) || relMap.get(`${ci + 1}-${ri}`);
            const marker = relType === "confirmed" ? "●" : relType === "suspected" ? "○" : relType === "key" ? "+" : "";
            return { text: marker, options: { fontSize: 12, fontFace: bodyFont, color: accent, align: "center" } };
          })];
        tableRows.push(row);
      });
      if (tableRows.length) slide.addTable(tableRows, { x: sx(0.8), y: sy(1.2), w: sx(8.4), border: { type: "solid", pt: 0.5, color: "DDDDDD" }, colW: Array(n).fill(sx(8.4) / n), rowH: Array(n).fill(0.45) });
      slide.addText("●  Confirmed     ○  Suspected     +  Key Individual", { x: sx(0.8), y: sy(5.8), w: sx(8.4), h: sy(0.4), fontSize: 10, fontFace: bodyFont, color: "888888" });
      break;
    }

    case "flow_diagram": {
      const columns = Array.isArray(c.columns) ? c.columns : [];
      const title = String(c.title || "");
      const flowColors = ["059669", "2563EB", "0D9488", "7C3AED", "DC2626"];
      if (title) slide.addText(title, { x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.6), fontSize: 22, fontFace: headFont, color: fg, bold: true });
      const colCount = Math.min(columns.length, 5);
      const totalW = sx(8.4); const colGap = 0.3; const colW = (totalW - colGap * (colCount - 1)) / colCount;
      columns.slice(0, colCount).forEach((col: any, i: number) => {
        const x = sx(0.8) + i * (colW + colGap);
        const colColor = safeColor(col.color, flowColors[i % flowColors.length]);
        slide.addShape(pres.ShapeType.roundRect, { x, y: sy(1.1), w: colW, h: sy(0.55), fill: { color: colColor }, rectRadius: 0.05 });
        slide.addText(String(col.title || "").toUpperCase(), { x, y: sy(1.1), w: colW, h: sy(0.55), fontSize: 11, fontFace: headFont, color: "FFFFFF", bold: true, align: "center", valign: "middle" });
        const items = Array.isArray(col.items) ? col.items : [];
        items.slice(0, 5).forEach((item: any, j: number) => {
          const itemY = sy(1.8) + j * sy(0.85);
          slide.addShape(pres.ShapeType.roundRect, { x: x + 0.05, y: itemY, w: colW - 0.1, h: sy(0.75), fill: { color: colColor, transparency: 90 }, line: { color: colColor, width: 0.5, transparency: 60 }, rectRadius: 0.05 });
          slide.addText(String(item.title || ""), { x: x + 0.15, y: itemY + 0.05, w: colW - 0.3, h: sy(0.35), fontSize: 10, fontFace: headFont, color: fg, bold: true });
          if (item.subtitle) slide.addText(String(item.subtitle), { x: x + 0.15, y: itemY + 0.38, w: colW - 0.3, h: sy(0.32), fontSize: 8, fontFace: bodyFont, color: "888888", wrap: true, shrinkText: true });
        });
        if (i < colCount - 1) slide.addText("→", { x: x + colW + colGap * 0.15, y: sy(1.1) + sy(0.55) / 2 - sy(0.15), w: colGap * 0.7, h: sy(0.3), fontSize: 16, color: "AAAAAA", align: "center", valign: "middle" });
      });
      break;
    }

    case "evidence_map": {
      slide.addText(String(c.title || "Evidence Map"), { x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.7), fontSize: 24, fontFace: headFont, color: fg, bold: true });
      const categories = Array.isArray(c.categories) ? c.categories : [];
      let yPos = sy(1.2);
      categories.slice(0, 3).forEach((cat: any) => {
        slide.addText(String(cat.name || ""), { x: sx(0.8), y: yPos, w: sx(8.4), h: sy(0.45), fontSize: 14, fontFace: headFont, color: accent, bold: true });
        yPos += sy(0.5);
        const items = Array.isArray(cat.items) ? cat.items : [];
        items.slice(0, 3).forEach((item: any) => {
          const conf = String(item.confidence || item.impact || "");
          slide.addText(`• ${String(item.claim || "")}${conf ? ` [${conf}]` : ""}`, { x: sx(1.2), y: yPos, w: sx(7.6), h: sy(0.4), fontSize: 11, fontFace: bodyFont, color: fg, wrap: true, shrinkText: true });
          yPos += sy(0.42);
        });
        yPos += sy(0.15);
      });
      break;
    }

    case "scenario_set": {
      slide.addText(String(c.title || "Scenarios"), { x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.7), fontSize: 24, fontFace: headFont, color: fg, bold: true });
      const scenarios = Array.isArray(c.scenarios) ? c.scenarios : [];
      const sCount = Math.min(scenarios.length, 3); const sColW = sx(8.4) / sCount - 0.2;
      scenarios.slice(0, 3).forEach((sc: any, i: number) => {
        const x = sx(0.8) + i * (sColW + 0.2);
        slide.addText(String(sc.name || "").replace(/_/g, " "), { x, y: sy(1.2), w: sColW, h: sy(0.5), fontSize: 14, fontFace: headFont, color: accent, bold: true, align: "center" });
        const outcomes = Array.isArray(sc.outcomes) ? sc.outcomes : [];
        slide.addText(outcomes.map((o: unknown) => `• ${String(o)}`).join("\n"), { x, y: sy(1.8), w: sColW, h: sy(3), fontSize: 11, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true });
      });
      break;
    }

    case "icon_text_block": {
      const title = String(c.title || "");
      if (title) slide.addText(title, { x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.7), fontSize: 24, fontFace: headFont, color: fg, bold: true });
      const iconItems = Array.isArray(c.items) ? c.items : [];
      iconItems.slice(0, 4).forEach((item: any, i: number) => {
        const y = sy(1.2) + i * sy(1.1);
        slide.addText(String(item.icon || "▸"), { x: sx(0.8), y, w: sx(0.6), h: sy(0.5), fontSize: 18, color: accent, align: "center" });
        slide.addText(String(item.title || ""), { x: sx(1.5), y, w: sx(7.7), h: sy(0.4), fontSize: 14, fontFace: headFont, color: fg, bold: true });
        if (item.description) slide.addText(String(item.description), { x: sx(1.5), y: y + 0.4, w: sx(7.7), h: sy(0.55), fontSize: 11, fontFace: bodyFont, color: fg, wrap: true, shrinkText: true });
      });
      break;
    }

    case "framed_insight": {
      const insightType = String(c.type || "insight");
      const borderColor = insightType === "warning" ? "EAB308" : insightType === "tip" ? "10B981" : accent;
      slide.addShape(pres.ShapeType.roundRect, { x: sx(1), y: sy(1.2), w: sx(8), h: sy(3.5), fill: { color: borderColor, transparency: 92 }, line: { color: borderColor, width: 2 }, rectRadius: 0.1 });
      slide.addText(String(c.title || insightType.toUpperCase()), { x: sx(1.3), y: sy(1.4), w: sx(7.4), h: sy(0.6), fontSize: 16, fontFace: headFont, color: borderColor, bold: true });
      slide.addText(String(c.insight || ""), { x: sx(1.3), y: sy(2.1), w: sx(7.4), h: sy(1.5), fontSize: 14, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true });
      if (c.source) slide.addText(`Source: ${String(c.source)}`, { x: sx(1.3), y: sy(3.8), w: sx(7.4), h: sy(0.4), fontSize: 10, fontFace: bodyFont, color: "888888", italic: true });
      break;
    }

    case "two_by_two_matrix": {
      const title = String(c.title || "");
      if (title) slide.addText(title, { x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.6), fontSize: 22, fontFace: headFont, color: fg, bold: true, align: "center" });
      const quadrants = Array.isArray(c.quadrants) ? c.quadrants : [];
      const positions: Record<string, [number, number]> = { "top-left": [sx(0.8), 1.1], "top-right": [sx(5.1), 1.1], "bottom-left": [sx(0.8), 3.9], "bottom-right": [sx(5.1), 3.9] };
      const qW = sx(4.1); const qH = sy(2.5);
      quadrants.slice(0, 4).forEach((q: any) => {
        const [x, y] = positions[q.position] || [sx(0.8), 1.1];
        slide.addShape(pres.ShapeType.roundRect, { x, y, w: qW, h: qH, fill: { color: accent, transparency: 92 }, line: { color: accent, width: 0.5, transparency: 60 }, rectRadius: 0.08 });
        slide.addText(String(q.label || ""), { x: x + 0.15, y: y + 0.1, w: qW - 0.3, h: sy(0.45), fontSize: 13, fontFace: headFont, color: accent, bold: true });
        const items = Array.isArray(q.items) ? q.items : [];
        slide.addText(items.map((it: unknown) => `• ${String(it)}`).join("\n"), { x: x + 0.15, y: y + 0.55, w: qW - 0.3, h: qH - 0.7, fontSize: 10, fontFace: bodyFont, color: fg, valign: "top", wrap: true, shrinkText: true });
      });
      if (c.xAxis) slide.addText(String(c.xAxis), { x: sx(0.8), y: sy(6.6), w: sx(8.4), h: sy(0.35), fontSize: 10, fontFace: bodyFont, color: "888888", align: "center" });
      break;
    }

    case "decision_next_steps": {
      slide.addText(String(c.title || "Decision & Next Steps"), { x: sx(0.8), y: sy(0.3), w: sx(8.4), h: sy(0.6), fontSize: 22, fontFace: headFont, color: fg, bold: true });
      if (c.decision) slide.addText(String(c.decision), { x: sx(0.8), y: sy(1.1), w: sx(8.4), h: sy(0.8), fontSize: 16, fontFace: headFont, color: accent, bold: true, valign: "top", wrap: true, shrinkText: true });
      if (c.rationale) slide.addText(String(c.rationale), { x: sx(0.8), y: sy(2), w: sx(8.4), h: sy(0.7), fontSize: 12, fontFace: bodyFont, color: fg, italic: true, wrap: true, shrinkText: true });
      const steps = Array.isArray(c.next_steps) ? c.next_steps : [];
      steps.slice(0, 5).forEach((step: any, i: number) => {
        const owner = step.owner ? ` (${String(step.owner)})` : "";
        slide.addText(`${i + 1}. ${String(step.action || "")}${owner}`, { x: sx(1), y: sy(2.9) + i * sy(0.7), w: sx(7.8), h: sy(0.55), fontSize: 12, fontFace: bodyFont, color: fg, wrap: true, shrinkText: true });
      });
      break;
    }

    default: {
      const title =
        String(c.title || c.heading || c.headline || c.text || block.type.replace(/_/g, " "));
      slide.addText(title, {
        x: sx(0.8), y: sy(1.5), w: sx(8.4), h: sy(2),
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
  pres.defineLayout({ name: "AXIVA_16x9", width: 13.33, height: 7.5 });
  pres.layout = "AXIVA_16x9";
  pres.author = "Axiva";
  pres.title = opts.title;

  const brand: BrandKit = opts.brandKit || {};

  for (const block of opts.blocks) {
    addBlockToSlide(pres, block, brand, !!opts.showWatermark);
  }

  const blob = await pres.write({ outputType: "blob" }) as Blob;
  return blob;
}
