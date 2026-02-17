

# Visual Enrichment Layer

## Overview
Add three capabilities to the post-generation pipeline: (1) a new `chart_block` type that renders Recharts bar/line charts from numeric data, (2) an AI-generated hero image block (max 1 per deck, using the existing `resolve-images` edge function in AI mode), and (3) an enhanced intent-classification system in the visual layout pass that maps slide themes to structured layouts.

No routing, export, or UI redesign changes.

---

## Features

### 1. Chart Block (Recharts)
A new block type `chart_block` that renders `BarChart` or `LineChart` from Recharts (already installed). The layout pass detects numeric comparison or time-series data and converts text/list blocks into chart blocks instead of just stat_blocks.

**Detection rules in layout pass:**
- If block has 3+ numeric data points with time-based labels (Q1, 2024, Jan, etc.) --> `LineChart`
- If block has 2+ numeric data points with categorical labels --> `BarChart`
- Falls back to `stat_block` if fewer than 3 data points

**Component:** `src/components/blocks/ChartBlock.tsx`
- Accepts payload: `{ chartType: "bar" | "line", data: Array<{label: string, value: number, series?: string}>, title?: string, xLabel?: string, yLabel?: string }`
- Renders using Recharts `BarChart` / `LineChart` with `ResponsiveContainer`
- Uses deck theme CSS variables for colors
- Clean, minimal styling -- no decorative elements

### 2. AI Hero Image (Max 1 Per Deck)
After generation, the layout pass identifies the first `hero_header` block. If the heading is abstract/conceptual (not a proper noun or specific metric), it generates an image prompt and calls the existing `resolve-images` edge function in `ai` mode.

**Rules:**
- Maximum 1 AI image per deck (hero only)
- Style: "minimalist corporate illustration, no text, clean background"
- Prompt derived from hero heading: strips specifics, keeps concept
- Image inserted as a child property of the hero_header block (`image.src`, `image.prompt`, `image.alt`) -- the HeroHeader component already supports this via `BaseBlockPayload.image`
- This is async -- runs after blocks are set, updates the hero block in place

**Implementation:** New function `enrichHeroImage` in `src/lib/visual-layout-pass.ts` that:
1. Finds the first `hero_header` block
2. Generates a prompt from the heading
3. Calls `invokeFunction("resolve-images", { images: [...], mode: "ai" })`
4. Updates the hero block's content with the returned image URL
5. Called from `Editor.tsx` after `runVisualLayoutPass` completes

### 3. Enhanced Intent Classification + Layout Mapping
Upgrade the layout pass with a slide intent classifier that maps blocks to structured layouts more intelligently than keyword matching alone.

**Intent categories and mappings:**

| Intent | Detection | Target Layout |
|--------|-----------|---------------|
| Hero | First block, or heading level 1 | `hero_header` (already handled) |
| Strategy | Keywords: strategy, approach, framework, pillars | `three_pillars` |
| Metrics | 3+ numbers with labels | `chart_block` (new) or `stat_block` |
| Timeline | Phase, quarter, milestone, roadmap | `timeline_block` (already handled) |
| Comparison | vs, compare, advantages, options | `comparison_table` or `two_col` |
| Decision | Decide, recommend, next steps | `decision_next_steps` |
| Problem | Risk, challenge, issue, gap | `framed_insight` (type: warning) |

**New conversions in layout pass:**
- `convertToChart(block)` -- extracts numeric data points and creates a `chart_block`
- `convertToThreePillars(block)` -- extracts 3 key points from strategy content
- `convertToDecisionBlock(block)` -- wraps decision content in `decision_next_steps`
- `indicatesStrategy(block)` -- new detector for strategy/framework content
- `indicatesComparison(block)` -- new detector for comparison content
- `indicatesDecision(block)` -- new detector for decision content

**40% visual enforcement** remains, with chart_block and three_pillars now counting as visual types.

---

## Technical Details

### File Changes

| File | Change |
|------|--------|
| `src/components/blocks/ChartBlock.tsx` | New -- Recharts bar/line chart component |
| `src/components/blocks/types.ts` | Add `ChartBlockPayload` interface |
| `src/components/blocks/index.ts` | Export `ChartBlock` |
| `src/components/blocks/VisualBlockRenderer.tsx` | Add `chart_block` case |
| `src/lib/blocks.ts` | Add `chart_block` to `VisualBlockType`, `VISUAL_BLOCK_TYPES`, `isVisualBlockType`, `getDefaultContent`, `BLOCK_LABELS` |
| `src/lib/ai-engine.ts` | Add `chart_block` to `VisualBlockType` |
| `src/lib/templates.ts` | Add `chart_block` to `VisualBlockType` |
| `src/lib/block-icons.ts` | Add `chart_block` icon mapping |
| `src/lib/block-intelligence.ts` | Add `chart_block` to purpose map |
| `src/lib/visual-layout-pass.ts` | Add intent classification, chart conversion, strategy/comparison/decision detectors, hero image enrichment function |
| `src/pages/Editor.tsx` | Call `enrichHeroImage` after layout pass in generation flow |
| `supabase/functions/generate-blocks/index.ts` | Add `chart_block` to allowed types, add schema, add to visual block rules in system prompt |

### ChartBlock Component Structure

```typescript
// Payload shape
interface ChartBlockPayload extends BaseBlockPayload {
  chartType: "bar" | "line";
  data: Array<{ label: string; value: number; series?: string }>;
  xLabel?: string;
  yLabel?: string;
}
```

Uses `ResponsiveContainer`, `BarChart`/`LineChart`, `XAxis`, `YAxis`, `Tooltip`, `Bar`/`Line` from recharts (already installed).

### Enhanced Layout Pass Flow

```text
For each block:
  1. Skip if already visual
  2. Classify intent (hero/strategy/metrics/timeline/comparison/decision/problem)
  3. Apply best conversion based on intent:
     - metrics with 3+ points --> chart_block
     - metrics with 2 points --> stat_block
     - strategy --> three_pillars
     - comparison --> comparison_table
     - decision --> decision_next_steps
     - problem --> framed_insight
     - timeline --> timeline_block
     - >70 words text --> card_grid
     - >6 bullets --> compress to 3 + callout
  4. Enforce 40% visual minimum
  5. Re-index
```

### Hero Image Enrichment (Async)

```typescript
export async function enrichHeroImage(blocks: Block[]): Promise<Block[]> {
  const heroIndex = blocks.findIndex(b => b.type === 'hero_header');
  if (heroIndex === -1) return blocks;
  
  const hero = blocks[heroIndex];
  const heading = (hero.content.heading as string) || '';
  if (!heading || heading.length < 5) return blocks;
  
  const prompt = `Minimalist corporate illustration representing "${heading}". Clean, abstract, no text, white background, professional.`;
  
  const response = await invokeFunction("resolve-images", {
    images: [{ blockIndex: 0, query: prompt, alt: heading }],
    mode: "ai",
  });
  
  if (response.data?.images?.[0]?.src) {
    const updated = [...blocks];
    updated[heroIndex] = {
      ...hero,
      content: {
        ...hero.content,
        image: { src: response.data.images[0].src, prompt, alt: heading },
      },
    };
    return updated;
  }
  return blocks;
}
```

Called from Editor.tsx after generation -- non-blocking, updates state when complete.

### Edge Function Updates
Add `chart_block` to `VISUAL_BLOCK_TYPES` array and `ALL_BLOCK_TYPES`. Add validation for `chart_block` content. Add `chart_block` format to the visual block rules in the system prompt so the AI can generate charts directly.

### No Changes To
- Routing
- Export/Print logic
- Database schema
- Design system / Tailwind config
- Authentication

### Dependencies
- No new packages (recharts already installed)

