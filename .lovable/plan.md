## AXORA Fix Pack: Visual Blocks, Image Picker, Slide Count Control

### Goal

Decks must render like Gamma style slides, not text documents.

Non negotiables:

1. Deck generation must output visual blocks, not only text.
2. User must be able to select images during deck creation with source options.
3. User must be able to choose slide count 5, 10, 12, or custom.

---

# A. Fix Visual Block Generation

## A1. Add missing visual block types to the tool schema

File: `supabase/functions/generate-blocks/index.ts`

Problem: The model uses constrained tool calling. If a block type is not in the JSON schema `oneOf`, it cannot be generated. Prompts do not matter.

Action:

1. Create and add these schemas into `visualBlockSchemas`:

- `chart_block`
- `three_pillars`
- `two_by_two_matrix`
- `decision_next_steps`

Required schemas.

### chart_block schema

- `type: "chart_block"`
- `content.chartType`: enum `["bar","line"]`
- `content.title`: string optional
- `content.data`: array of objects `{ label: string, value: number }` min 2 items

### three_pillars schema

- `type: "three_pillars"`
- `content.title`: string optional
- `content.pillars`: exactly 3 items
- each pillar: `{ title: string, description?: string, icon?: string }`

### two_by_two_matrix schema

- `type: "two_by_two_matrix"`
- `content.title`: optional
- `content.xAxisLabel`: string
- `content.yAxisLabel`: string
- `content.quadrants`: 4 items with `{ title: string, description?: string }`

### decision_next_steps schema

- `type: "decision_next_steps"`
- `content.title`: optional
- `content.recommendation`: string
- `content.rationale`: array of strings (1 to 4)
- `content.nextSteps`: array of `{ owner?: string, action: string, due?: string }` (1 to 6)
- `content.risks`: optional array of strings (0 to 4)

Then:

- Add these 4 schemas into `visualBlockSchemas` array.
- Add these 4 types into `VISUAL_BLOCK_TYPES` and `ALL_BLOCK_TYPES`.

## A2. Add validation and normalization support

File: `supabase/functions/generate-blocks/index.ts`

Add new cases in:

- `validateBlockContent(type, content)` switch
- `normalizeBlockContent(type, content)` switch

Validate required fields exist exactly as defined above.

## A3. Enforce visual blocks by slide intent, not only deck ratio

File: `supabase/functions/generate-blocks/index.ts`

After `validateBlocks` passes, run per slide enforcement.

Define slide intent categories using layout or metadata (if you do not have intent yet, derive from slide title keywords).

Rules:

- Data slide must include at least one of: `chart_block` OR `stat_block` OR `comparison_table`
- Strategy slide must include at least one of: `three_pillars` OR `two_by_two_matrix`
- Decision slide must include: `decision_next_steps`
- Section divider can remain text plus image

If a slide violates this, treat as soft validation failure and retry generation with a correction prompt that explicitly lists the missing block type required for that slide.

Do not allow an all text deck to pass.

## A4. Strengthen system prompt with hard rules

File: `supabase/functions/generate-blocks/index.ts` in `buildSystemPrompt`

Add mandatory section:

VISUAL REQUIREMENTS:

- Every deck must include visuals.
- Any slide with 3 plus numeric points must use `chart_block` (not list).
- Any slide describing 3 themes must use `three_pillars` (not list).
- Any recommendation slide must use `decision_next_steps`.
- If output contains only text or list blocks on a slide that should be visual, regenerate.

---

# B. Fix Visual Layout Pass Numeric Extraction

## B1. Fix label value parsing so chart conversion works

File: `src/lib/visual-layout-pass.ts`

Replace the current numeric extraction regex with:

Match:  
`Label: $12M`  
`Label 12%`  
`Label = 45k`

Use:  
`/^(.+?)[\s:=]+(\$?[\d,]+\.?\d*)\s*([%kmbKMB]?)$/i`

Logic:

- label = group 1 trimmed, strip bullet prefixes
- value = parseFloat(group 2)
- suffix multipliers: k 1,000; m 1,000,000; b 1,000,000,000
- cap points at 8

Apply the same fix in `convertToStats` if it does label parsing.

---

# C. Add Slide Count Control 5, 10, 12, Custom

## C1. UI control in deck creation flow

File: wherever the deck creation form lives (DeckCreate or Wizard step)

Add:

- Slide count segmented control: 5, 10, 12
- Custom numeric input with bounds 3 to 20

Store as `targetSlideCount`.

## C2. Pass slide count through the entire pipeline

Ensure `targetSlideCount` is passed to:

- outline generation
- block generation
- final render

Remove any hardcoded default of 12 in:

- frontend initial state
- edge functions
- server defaults

## C3. Validate slide count on backend

After generation:

- If generated slide count != targetSlideCount, auto retry with instruction:  
“Return exactly N slides. No more, no fewer.”

---

# D. Add Gamma Style Image Selection During Deck Creation

## D1. Add “Visual Builder” step between outline and final render

Flow must become:

1. Deck Setup: topic, audience, tone, slide count, visual density
2. Outline generation: produce slide list with intents and image slots
3. Visual Builder: user selects images per slide
4. Final generation: blocks plus locked images applied

This is required. Do not skip.

## D2. Add image slots to slide model

Extend slide schema to support:

`imageSlots: [{ id, placement, imageAsset? }]`

and

`imageAsset: { source: "stock" | "web" | "ai" | "illustration" | "gif" | "upload", query?: string, url: string, thumbUrl?: string, credit?: string, license?: string, locked: boolean }`

Locking is critical. Locked images must never change on regenerate.

## D3. Build the Image Source dropdown UI exactly like Gamma

In the Visual Builder, each slide image slot must show:

- Image Source dropdown with options:
  - Stock photos
  - Web images
  - AI images
  - Illustrations
  - Animated GIFs
- Search box
- Results grid thumbnails
- Select to apply to slot
- Toggle lock

## D4. Add backend endpoints for image search and AI generation

Create Edge Functions:

1. `supabase/functions/image-search/index.ts`  
Inputs:

- `q`
- `source` in: web stock illustration gif  
Return:
- list of `{ thumbUrl, url, credit, license }`

2. `supabase/functions/image-generate/index.ts`  
Inputs:

- `prompt`
- optional style flags  
Return:
- `{ url, thumbUrl }`

Store selected images in deck state.

Important: Do not put API keys in the browser. All calls server side.

## D5. Renderer must respect selected images

Wherever slide rendering occurs:

- If a slide has `imageAsset.url`, render it in the layout.
- If locked, regeneration cannot overwrite.

## D6. Add “Visual density” control

Deck Setup must include:

- Minimal
- Balanced
- Visual

Map to:

- Minimal: 20 percent slides with images, fewer charts
- Balanced: 50 percent slides with images, charts on data slides
- Visual: image on every slide where appropriate plus charts and diagrams

This is used as a hard constraint in generation.

---

# E. Final Quality Gates

Must pass before shipping:

1. Selecting 5 slides produces exactly 5 slides.
2. At least one chart renders in any deck with numeric data.
3. Strategy slides generate three pillars or a matrix without manual edits.
4. Image picker works during creation and selected images render in the deck.
5. Locked images persist across regenerate.

---

If you want to know which files to edit beyond the two you named,  search for:

- the deck creation wizard component
- the slide model types
- the slide renderer switch or block renderer map
- any constant defaulting slide count to 12