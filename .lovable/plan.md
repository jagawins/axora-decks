

## Analysis: Current State

**Demo page** (`/demo`): Rich 8-phase interactive walkthrough (choose scenario → typing → structuring → template → branding → structured output → slides → interactive blocks → export → CTA). Uses 3 hardcoded demo scenarios with simulated slide generation. No actual rendered slides — just styled bullet lists with themed backgrounds.

**Templates page** (`/templates`): Full filter system (deck type, industry, audience, sort, search) with real block preview thumbnails and a preview modal with slide carousel. Already has "Use This Template" CTA.

**Homepage** (`/`): Hero → ValueTriplet → Features → FounderCard → Pricing → CTA. No output showcase, no before/after, no example decks.

**Key gaps**: No "Example Decks" showcase, no before/after visual, no way to browse finished output without signing up.

---

## Implementation Plan

### Part 1: "See What You Can Build" — Example Decks Showcase

**Approach**: Create 4 example deck records in the `templates` table tagged with a new `is_example` flag (or a category like `"Example Decks"`), each with full `template_blocks` containing realistic placeholder content. This reuses the existing `TemplatePreviewModal` carousel for viewing.

**Files**:
- `src/components/landing/ExampleDecks.tsx` — New section component with 4 horizontal cards showing deck thumbnail, title, industry/type badges, slide count, "View Full Deck" button
- `src/pages/Templates.tsx` — Add `ExampleDecks` section above the template grid
- `src/pages/Index.tsx` — Add `ExampleDecks` section between Features and FounderCard
- Database: Seed 4 example templates with `is_featured = true` and a distinguishing tag (e.g., `example-deck`) so they can be queried separately

**Example deck content** (seeded via edge function or migration):
1. "MediFlow AI — Investor Pitch" (Healthcare SaaS, 10 slides)
2. "FinTech Capital — Board Update" (Finance, 8 slides)
3. "CloudSync — GTM Strategy" (B2B SaaS, 12 slides)
4. "City Innovation Lab — Quarterly Review" (Government, 9 slides)

Each card renders `TemplatePreviewImage` for the thumbnail and opens `TemplatePreviewModal` on click.

### Part 2: "Before & After" Section on Homepage

**File**: `src/components/landing/BeforeAfter.tsx` — New component

- Split-screen layout: left "Before" (mock PowerPoint screenshot with overlay text), right "After" (3 stacked AXORA slide thumbnails from example decks)
- Mobile: stacks vertically
- CTA: "See Full Examples →" linking to `/templates?type=example`
- Uses static inline SVG or CSS for the "Before" side (generic bullet-point slide mockup)
- Uses `MiniSlidePreview` with real example deck blocks for the "After" side

**Add to**: `src/pages/Index.tsx` between `Features` and `FounderCard`

### Part 3: Seed Example Deck Data

**File**: `supabase/functions/seed-templates/index.ts` — Extend existing seed function (or create a new `seed-example-decks` function) to insert 4 example templates with full block content

Each example deck uses existing block types (exec_summary, chart_block, comparison_table, stat_block, three_pillars, decision_summary, timeline_block, recommendation_panel) with realistic placeholder data matching the fictional companies.

Add a `"example-deck"` tag to distinguish from regular templates. Add a disclaimer watermark field in block_meta.

### Part 4: Wire Example Decks into Existing Modal

The `TemplatePreviewModal` already supports:
- Slide carousel with keyboard nav
- Brand Kit toggle
- "Use This Template" CTA
- Mobile swipe dots

No changes needed to the modal — just pass example deck templates through the same flow.

### Summary of Files

| File | Action |
|------|--------|
| `src/components/landing/ExampleDecks.tsx` | **New** — showcase section with 4 deck cards |
| `src/components/landing/BeforeAfter.tsx` | **New** — split-screen before/after comparison |
| `src/pages/Index.tsx` | Add ExampleDecks + BeforeAfter sections |
| `src/pages/Templates.tsx` | Add ExampleDecks section above grid |
| `src/data/example-decks.seed.ts` | **New** — static seed data for 4 example decks |
| `supabase/functions/seed-templates/index.ts` | Extend to seed example decks |
| `src/lib/templates.ts` | Add `fetchExampleDecks()` helper (filter by tag) |

Parts 4 (Instagram content) and 5 (interactive demo widget) from the original plan are non-code tasks or optional — Part 5 would be a separate follow-up.

