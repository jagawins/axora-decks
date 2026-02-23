

## Brand-at-Project, Presentation Player, and Export Upgrade

This plan addresses the three strategic pillars you outlined: moving brand identity from export-time to project-level, building a real presentation player, and adding structured export (including Google Slides path).

---

### Part 1: Brand Kit at the Project Level

**Current state**: The `profiles` table has a `brand_kit` JSONB column (unused). Projects have a `theme` field that maps to 4 hardcoded CSS theme classes (classic, midnight, sand, graphite). No logo, custom color, or typography settings exist per project.

**What changes**:

#### 1A. Database: Add brand columns to projects table

Add a `brand_kit` JSONB column to the `projects` table. This stores per-project brand overrides:

```text
brand_kit: {
  colors: {
    primary: "#1E3A5F",
    accent: "#FF6B35",
    background: "#FFFFFF",
    foreground: "#1A1A2E",
    muted: "#6B7280"
  },
  typography: {
    headingFont: "Inter" | "Playfair Display" | "Space Grotesk" | "DM Sans",
    bodyFont: "Inter" | "Source Sans Pro" | "IBM Plex Sans",
    scale: "compact" | "default" | "spacious"
  },
  logo: {
    url: string | null,
    placement: "top-left" | "top-right" | "none"
  }
}
```

This sits alongside the existing `theme` field. The theme provides the base palette; `brand_kit` overrides specific tokens.

#### 1B. Brand Kit Settings Panel in Editor

A new "Brand" section in the Editor toolbar (next to Theme and Layout):
- Color pickers for primary, accent, background, foreground, muted (5 tokens)
- Typography dropdown: choose from 4 curated heading font families and 3 body font families
- Typography scale toggle: compact / default / spacious
- Logo URL input with placement selector (top-left, top-right, none)
- "Save as default" button that copies the brand kit to the user's profile for reuse

#### 1C. Brand Token Application

A new utility function `resolveBrandTokens(theme, brandKit)` that:
- Starts with the theme's CSS variables (deck-bg, deck-fg, etc.)
- Overlays any brand_kit color overrides as inline CSS custom properties
- Returns a style object to apply on the deck container

This is used in:
- Editor presentation mode
- PreviewDeck
- PublicPreview
- Print page

#### 1D. Brand Guardrails

- Only the 5 defined color tokens can be customized (no arbitrary per-block colors)
- Font choices are limited to curated pairs (4 heading + 3 body options)
- Layout families stay as the existing 4 presets (minimal, corporate, bold, data_focused)

---

### Part 2: Real Presentation Player

**Current state**: `PreviewDeck` renders one block per "slide" with basic prev/next navigation. No outline, no document mode, no animations, no presenter tooling.

**What changes**:

#### 2A. Slide Computation Layer

Create `src/lib/slide-engine.ts`:
- Groups blocks by `sectionIndex` (from content) into logical slides
- Each slide gets: title (from heading block or section title), block array, index, notes
- Falls back to one-block-per-slide when sectionIndex is absent
- Exports `computeSlides(blocks): ComputedSlide[]`

#### 2B. Redesigned Player Component

Replace `PreviewDeck` with a new `DeckPlayer` component that supports two view modes:

**Deck Mode** (presenting):
- Full 16:9 slide canvas scaled to viewport (using the 1920x1080 scaling pattern)
- Left sidebar: collapsible slide outline showing section titles and slide numbers
- Bottom progress bar showing current position
- Keyboard navigation (arrow keys, space, escape for fullscreen exit)
- Deep linking via query params: `?slide=3`
- Fade-in transition on slide change (CSS transition, no heavy library)

**Document Mode** (reading):
- Vertical scroll layout, all slides stacked
- Section headings become sticky anchors
- Mobile-optimized with full-width blocks
- Toggle between modes via a button in the player header

#### 2C. Slide Transitions

Simple CSS-based transitions (no framer-motion dependency):
- Fade + slight translateY on slide entry
- Staggered entrance for list items and card grids (CSS animation-delay)
- Respect a deck-level setting: `animations: "off" | "subtle" | "full"` (stored in project JSONB or passed as prop)

#### 2D. Presenter View

A new route `/present/:id` that opens a two-pane layout:
- Left pane: current slide (large)
- Right pane: next slide preview (small) + speaker notes + elapsed timer
- Notes come from an optional `notes` field on each section in the outline
- Communication between presenter and audience views via BroadcastChannel API (same-browser only, no server needed)

#### 2E. Logo in Player

If the project has a `brand_kit.logo.url`, render it in the slide corner based on `placement`. This appears in both deck and document modes, and carries through to export.

---

### Part 3: Export Upgrades

**Current state**: Only export is "Print to PDF" which opens a new tab with basic block rendering (only 7 basic types, no visual blocks).

**What changes**:

#### 3A. Fix Print Page

The `Print.tsx` page currently only renders 7 basic block types. It needs the same `VisualBlockRenderer` integration as the Editor. This is the same pattern already applied to Editor.tsx.

#### 3B. PowerPoint Export (PPTX)

Create an edge function `generate-pptx` that:
- Receives blocks, theme, brand_kit as input
- Uses the `pptxgenjs` library (runs in Deno) to build a .pptx file
- Maps each visual block type to a PowerPoint slide layout:
  - `hero_header` -> Title slide with background
  - `stat_block` -> Stats in large text boxes
  - `chart_block` -> Native PowerPoint chart (bar/line/pie)
  - `card_grid` -> Grid of content boxes
  - `comparison_table` -> PowerPoint table
  - `timeline_block` -> SmartArt-style timeline
  - Other blocks -> Text box with formatted content
- Applies brand_kit colors and fonts to the slide master
- Returns the .pptx file as a downloadable blob
- Logo is placed on every slide per brand_kit.logo.placement

#### 3C. Google Slides Path

Short-term approach (no OAuth needed):
- "Send to Google Slides" button in the export menu
- Generates a .pptx file (using 3B above)
- Opens Google Slides import URL with instructions: "Upload this file to Google Drive, then open with Google Slides"
- Downloads the .pptx and opens `https://docs.google.com/presentation/u/0/` in a new tab

Future approach (requires Google Drive connector):
- Use the Google Drive API via a connector to upload the .pptx directly to a chosen folder
- Auto-convert to Google Slides format on upload

#### 3D. Export Menu Redesign

Replace the single "Export PDF" button in the Editor with a proper export dropdown:
- Export as PDF (existing, fixed to render visual blocks)
- Export as PowerPoint (.pptx)
- Send to Google Slides
- Copy share link (existing)

#### 3E. Slide Recipes (Power User Mode)

Add a "Slide Recipe" input in the Generate Deck modal:
- Text field where users can specify block sequences: "3 stat blocks, then a two_by_two, then decision slide"
- Parse this into a structured recipe that maps to block types
- Pass the recipe to the generate-blocks system prompt as a hard constraint
- This replaces the need for "code execution" -- users describe the structure, Axora enforces it

---

### Technical Details

**Database migration:**
- Add `brand_kit JSONB DEFAULT '{}'` to `projects` table
- Add `notes TEXT DEFAULT NULL` to `projects` table (for presenter notes, stored as JSON string of section-keyed notes)

**New files to create:**
- `src/lib/slide-engine.ts` -- slide computation from blocks
- `src/lib/brand.ts` -- brand token resolution utility
- `src/components/DeckPlayer.tsx` -- new presentation player
- `src/components/DeckPlayerOutline.tsx` -- slide outline sidebar
- `src/components/BrandKitPanel.tsx` -- brand settings UI in editor
- `src/components/ExportMenu.tsx` -- unified export dropdown
- `src/pages/Present.tsx` -- presenter view route
- `supabase/functions/generate-pptx/index.ts` -- PowerPoint generation

**Files to modify:**
- `src/pages/Editor.tsx` -- add brand kit panel, replace export button with ExportMenu, add presenter view button
- `src/pages/Preview.tsx` -- replace PreviewDeck with DeckPlayer
- `src/pages/PublicPreview.tsx` -- replace PreviewDeck with DeckPlayer
- `src/pages/Print.tsx` -- integrate VisualBlockRenderer for all block types
- `src/lib/themes.ts` -- extend ThemeConfig to include brand override support
- `src/index.css` -- add slide transition animations, font imports for brand typography options
- `src/App.tsx` -- add `/present/:id` route

**Implementation order (recommended):**
1. Database migration (brand_kit column)
2. Brand token resolution + BrandKitPanel
3. Print.tsx fix (visual blocks in export)
4. Slide engine + DeckPlayer (deck + document modes)
5. Presenter view
6. PPTX export edge function
7. Google Slides path
8. Slide recipes in generate modal

