## Upgrade All Templates to Modern Visual Layouts

### The Problem

Every template in the database (60+) uses the exact same 11-block formula of basic text blocks:

```text
heading -> text -> heading -> two_col -> heading -> list -> heading -> table -> callout -> heading -> list
```

Only the "Visual Blocks Showcase" demo template uses modern visual blocks. This makes every template look like a plain text document instead of a visual deck.

### Approach

Rather than hand-writing 660+ blocks in a massive JSON file, the approach is:

1. **Define 6 category-specific visual block patterns** -- one per template category, each using the right mix of visual blocks for that category's purpose
2. **Create a template upgrade edge function** that regenerates all template blocks using visual block types with content tailored to each template's slug, title, and tags
3. **Update the seed function** to support re-seeding (delete existing blocks, insert new ones)

### Category Block Patterns

Each category gets a distinct visual layout optimized for its intent:

**Strategy and Leadership** (10 templates)

- hero_header (title + subtitle)
- exec_summary (purpose + key points)
- three_pillars (strategic themes)
- stat_block (KPIs)
- comparison_table (options analysis)
- decision_next_steps (actions + owners)
- cta_section (call to action)

**Projects and Operations** (10 templates)

- hero_header
- exec_summary (project overview)
- timeline_block (milestones)
- stat_block (progress metrics)
- card_grid (workstreams or risks)
- comparison_table (status matrix)
- decision_next_steps

**Product and Technology** (10 templates)

- hero_header
- exec_summary
- timeline_block (roadmap)
- chart_block (velocity/metrics)
- card_grid (features or components)
- two_by_two_matrix (prioritization)
- cta_section

**Sales and Marketing** (10 templates)

- hero_header
- stat_block (revenue/pipeline metrics)
- chart_block (trends)
- card_grid (segments or campaigns)
- comparison_table (competitive)
- quote_block (customer voice)
- cta_section

**Startup and Fundraising** (10 templates)

- hero_header
- exec_summary (thesis)
- stat_block (traction metrics)
- chart_block (growth)
- three_pillars (moat/advantage)
- card_grid (team or milestones)
- cta_section

**AI and Data** (10 templates)

- hero_header
- exec_summary
- three_pillars (AI pillars)
- chart_block (model/data metrics)
- two_by_two_matrix (maturity or evaluation)
- card_grid (use cases)
- decision_next_steps

### Implementation Steps

#### 1. Create upgrade-templates edge function

A new edge function that:

- Reads all templates from the database
- For each template, generates 7-9 visual blocks based on category + slug
- Content is tailored per template (e.g., "Product Roadmap" gets roadmap-specific timeline labels, "Pipeline Review" gets sales-specific stat labels)
- Deletes existing template_blocks for each template
- Inserts new visual blocks
- Preserves the "Visual Blocks Showcase" demo template as-is

#### 2. Update seed-templates to support re-seeding

Modify the existing seed function to accept a `force` flag that deletes existing templates and blocks before inserting, so templates can be refreshed.

#### 3. Update the seed JSON file

Replace the 8000+ line seed JSON with a compact version where each template's blocks use visual types with meaningful placeholder content. Each template gets unique content derived from its title, description, and tags -- not the same generic "Point 1: state the insight" copy-paste.

#### 4. Template content tailoring

Each template gets content that matches its purpose:

- **Executive Summary**: exec_summary with "Business context and strategic position", stat_block with "Revenue Growth", "Market Share", "Customer NPS"
- **Product Roadmap**: timeline_block with "Discovery", "Build", "Beta", "Launch" phases, chart_block with sprint velocity data
- **Startup Pitch**: stat_block with "MRR", "Growth Rate", "CAC", "LTV", chart_block with hockey-stick growth curve
- **Pipeline Review**: stat_block with "Pipeline Value", "Win Rate", "Avg Deal Size", chart_block with pipeline by stage

### Technical Details

**Files to create:**

- `supabase/functions/upgrade-templates/index.ts` -- one-time migration function that regenerates all template blocks with visual types

**Files to modify:**

- `src/data/axora-templates.seed.json` -- complete rewrite of template_blocks section with visual block types and tailored content per template
- `supabase/functions/seed-templates/index.ts` -- add `force` mode to delete and re-insert

**Database changes:**

- Delete all existing rows from `template_blocks` table
- Insert new visual blocks
- No schema changes needed (block_payload JSONB already supports all visual types)

**Risk mitigation:**

- The "Visual Blocks Showcase" demo template is preserved unchanged
- All block payloads conform to the existing TypeScript interfaces (StatBlockPayload, ChartBlockPayload, etc.)
- Template previews cache will auto-invalidate since blocks change
- The `createDeckFromTemplate` function already handles visual block types correctly

### Scale

- 60 templates x ~8 blocks each = ~480 new visual blocks
- The seed JSON will be rewritten from scratch with tailored content
- This is a large file change (~4000-5000 lines of JSON) but each block is deterministic, not AI-generated

&nbsp;

### A real presentation player, not just a preview page

Today you already have `/preview/:id` rendering blocks. To feel like Gamma, the *frame* around those blocks must become a first class player.

**Missing player capabilities**

1. **Slide level navigation and outline**
  - Left or bottom rail showing sections and slides
  - Progress indicator and keyboard shortcuts (← / →, space, esc)
  - Deep links such as `/preview/:id?s=2&slide=5`  
  **How to wire it**
  - Treat each block or group of blocks with the same `sectionIndex` as one slide.
  - Build a `computedSlides[]` structure on the frontend.
  - Add a small “outline” component fed by `outline.sections` and `sectionIndex`.
2. **Responsive layouts and mobile reading mode**
  - Gamma is comfortable both as a deck and as a web page.
  - You want:
    - Full screen “slide” mode for presenting
    - Vertical “document” mode for reading on mobile  
    **How to wire it**
  - Provide a toggle `View as: Deck | Document`.
  - Deck mode uses your current slide layout.
  - Document mode stacks blocks vertically and uses section headings as anchors.
3. **Per slide animations and transitions**
  - Simple but consistent transitions:
    - Fade in on slide change
    - Staggered entrance of bullet items or cards  
    **How to wire it**
  - A small transition wrapper component around each slide (`framer motion` or CSS transitions).
  - Respect a deck level setting: `animations: off | subtle | full`.
4. **Presenter tooling**
  - Speaker notes per section
  - “Presenter view” with current slide, next slide, and notes  
  **How to wire it**
  - Data model: optional `notes` field on outline sections.
  - UI: `/present/:id` route showing two panes and timer.

This turns Axora from “nice generator feeding PowerPoint” into “web native deck”.

---

