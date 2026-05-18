# Roadmap: Closing the Deckster Gap

Start with **P0 today**. P1–P3 are scheduled in sequence so each ships as a self-contained release.

---

## P0 — Ship now (this loop)

Goal: neutralize Deckster's three loudest claims — "fully editable native exports," "lock what matters," "version history."

### 1. Native editable PPTX charts (no more rendered images)
- Extend `src/lib/pptx-export.ts` so `chart_block`, `kpi_dashboard`, and any block with numeric data emit real `pptx.addChart()` objects (bar / line / donut / area / stacked_bar) instead of rasterised SVGs.
- Map our `ChartBlockPayload.data` and `colors` directly into PptxGenJS chart options.
- Keep the existing image fallback only for `flow_diagram` / `relationship_matrix` (no native equivalent).
- Add a small chart-mapping helper + unit test in `src/test/`.

### 2. Google Slides export
- New edge function `supabase/functions/export-google-slides/index.ts` that:
  - Accepts a `projectId`, loads blocks, builds a Slides API `batchUpdate` request.
  - Uses the `google_slides` connector gateway (`https://connector-gateway.lovable.dev/google_slides/v1`).
  - Returns the new presentation URL.
- Add "Export to Google Slides" item in `src/components/ExportMenu.tsx` (gated to Pro, same as PPTX).
- First version covers text, headings, two-col, stats, quotes, and native charts. Complex visual blocks export as images (acceptable v1).

### 3. Per-slide lock
- DB: add `is_locked boolean default false` to `public.blocks` (slide-level — applied to the first block of each slide group, or a new `slide_locks` table keyed by `project_id + slide_index`). Going with **`slide_locks` table** — cleaner because slides are derived from `chunkTemplateBlocks`, not 1:1 with blocks.
- Migration creates `slide_locks (project_id, slide_index, locked_by, created_at)` with RLS via `auth.uid() = locked_by` and project ownership check.
- UI: add lock toggle in `src/components/SlideQuickActions.tsx` + lock badge on slide thumbnails in the editor sidebar.
- Generation guard: in `generate-blocks` and `refine-block` edge functions, skip any slide whose index is in `slide_locks` for that project. Return a `skipped_slides` array so the UI can show "3 slides locked, not regenerated."

### 4. Version history
- DB: new `project_versions (id, project_id, user_id, label, snapshot jsonb, created_at)`. `snapshot` stores full blocks array + theme.
- Auto-snapshot triggers: on every AI regeneration run, before applying changes, snapshot current state with auto-label ("Before regenerate · 18:42").
- Manual snapshot button in editor toolbar ("Save version").
- Sidebar drawer `src/components/editor/VersionHistory.tsx` listing versions with: timestamp, label, slide count, **Preview** and **Restore** actions.
- Restore = transactional: snapshot current state first (so restore is itself undoable), then replace blocks.
- Retention: keep last 30 versions per project, prune oldest via cron.

### Technical notes for P0
- Stripped block schema rule still applies: merge `block_meta` into `content` before inserting (per project memory).
- All new edge functions: CORS + JWT validation + Zod input validation.
- RLS on both new tables compares `auth.uid()` directly to ownership chain through `projects.user_id`.
- Add `EXPORT_VERSION = 2` constant in `pptx-export.ts` so cached previews invalidate.

---

## Scheduled releases

### P1 — Day 2–3
1. **Pre-draft clarifying questions step** in `src/pages/Create.tsx`: after upload/prompt, before outline, fire one Claude call to detect audience + presentation type and ask 2–3 targeted gaps. Cache answers in the create flow state.
2. **Downloadable real .pptx samples on landing**: render 3 hero example decks server-side once, upload to `brand-logos` bucket (or new `sample-decks` bucket), link from `src/components/landing/ExampleDecks.tsx`.
3. **Pricing copy refresh**: kill credit language on `src/components/landing/Pricing.tsx` and `src/pages/Pricing.tsx`. Lead with "Unlimited decks, unlimited iterations, unlimited AI."

### P2 — Day 4–5
1. **Theme Builder UI**: new page `src/pages/ThemeBuilder.tsx` extending Brand Kit — visual editors for typography pair, spacing scale, accent + neutral palette, slide background style. Saves to `brand_kits` JSONB and maps to existing CSS variables.
2. **Audience Feedback Simulator**: extend `src/components/executive/QAReadiness.tsx` → new `FeedbackSimulator.tsx`. Claude call that, given the deck + audience persona, returns: likely objections, confusion points, "stop the slide" moments, and a clarity score per slide. Shown in Executive Hub.

### P3 — Day 6
1. **Consultancy logo marquee**: replace `SocialProof.tsx` strip with infinite-scrolling marquee on hero + pricing. Need user to supply 8–12 logos (or use neutral placeholders + "Used by teams at" copy until real logos arrive).

---

## What to confirm before I build P0

1. **Google Slides connector** isn't connected yet — I'll wire the code but will need you to click "Connect Google Slides" in Connectors before the export button works. OK?
2. **Slide lock model**: separate `slide_locks` table (my pick) vs. column on first block of slide group. I'll go with the table unless you object.
3. **Version retention**: keep last 30 versions per project, prune older. OK?

If you're good with the defaults above, approve and I'll start P0 immediately.