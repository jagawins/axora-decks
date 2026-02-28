## Analysis: What Already Exists vs What's Needed

**Already built:**

- `TemplatesGrid` with category pill filters (8 visual categories) and search
- `TemplateCard` with `TemplateThumbnail` (abstract SVG-like pattern, not real content)
- `TemplatePreviewImage` using `MiniSlidePreview` (renders actual blocks at 0.25x scale) — but NOT used on the grid
- `TemplateDetail` page at `/template/:slug` with a single slide preview and "Use This Template" CTA
- `TemplatePreview` component that renders blocks in a 16:9 canvas
- 61 templates in DB across 7 categories, each with `preview_blocks` already fetched

**Key gaps:**

1. Grid cards show abstract pattern thumbnails (`TemplateThumbnail`) instead of real block content (`TemplatePreviewImage`)
2. No industry/audience filter dimensions — only visual-category pills exist
3. No sort options (popular/newest/alphabetical)
4. No preview modal — clicking goes straight to "Use Template" action
5. No URL query param sync for filters
6. No "Request This Template" empty state
7. TemplateDetail page exists but is a full page, not a modal

---

## Implementation Plan

### Task 1: Replace abstract thumbnails with real block previews

In `TemplateCard.tsx`, swap `TemplateThumbnail` for `TemplatePreviewImage`, passing the template's `preview_blocks`. This requires threading `preview_blocks` through `TemplateCard` props.

- Add `previewBlocks` prop to `TemplateCard`
- Replace `<TemplateThumbnail>` with `<TemplatePreviewImage blocks={previewBlocks}>` inside the card
- Keep the category badge overlay and hover "Use Template" button
- Wrap each TemplatePreviewImage in an IntersectionObserver-based lazy loader (or use loading="lazy" equivalent for React components). Only render block content when the card enters the viewport. Show a lightweight skeleton placeholder until then.

### Task 2: Add multi-dimensional filters with URL sync

Extend `TemplatesGrid` with three filter dimensions:

**Deck Type** (derived from DB `category`):
All, Investor Pitch, Board Update, Executive Brief, GTM Strategy, Quarterly Review, Policy Update, Sales Deck

**Industry** (new tag-based classification — no DB change needed, just client-side tag matching):
All, Healthcare, Finance, Technology, Government, Consulting, SaaS/Startups

**Audience** (tag-based):
All, C-Suite/Board, Investors/VCs, Internal Teams, External Clients

Implementation:

- Use `useSearchParams` from react-router-dom to sync filters to URL query params (`?type=...&industry=...&audience=...`)
- Render Deck Type as primary pill row, Industry and Audience as secondary dropdown or pill group
- Show active filters as removable chips above the grid
- When no results match, show "Request This Template" CTA with a mailto or form link
- Add a sort dropdown: Popular (featured first), Newest, A–Z
- Create a templateTaxonomy.ts file that exports a static mapping object: { [templateSlug]: { industry: string[], audience: string[] } }. This is the single source of truth for all filter matching. Do NOT derive industry/audience dynamically from template names or descriptions — use explicit slug-to-tag assignments to avoid misclassification.

### Task 3: Build preview modal with slide carousel

Create `TemplatePreviewModal.tsx`:

- Full-screen dialog overlay opened when clicking "Preview" on a card
- Fetches ALL blocks for the template (not just preview 3) via `fetchTemplateBlocks(templateId)`
- Groups blocks into logical slides (by `sectionIndex` or chunks of ~3 blocks)
- Renders each "slide" in a `TemplatePreview` component inside a carousel
- Left/right arrow navigation + slide counter ("Slide 2 of 6")
- Header: template name + category badge + description
- Footer: "Use This Template" primary CTA + "Back to Templates" secondary
- Mobile: swipeable, full-screen
- URL updates to `/templates?preview=<slug>` (not a separate route — preserves filter state)
- If Brand Kit exists in localStorage, show "Preview with My Brand" toggle (applies brand CSS vars to preview)
- Prioritize grouping by sectionIndex if that field exists and is populated. Only fall back to fixed chunks of 3 if sectionIndex is null/missing. Add a console warning in dev mode if a template has no sectionIndex values so it can be flagged for data cleanup.

### Task 4: Wire everything together in `Templates.tsx` and `TemplatesGrid`

- Pass `preview_blocks` from fetched templates into `TemplateCard`
- Add "Preview" button to card hover overlay alongside "Use Template"
- Clicking "Preview" opens the modal; clicking "Use Template" directly creates deck
- On modal "Use This Template" click, create deck and navigate to editor

### Technical Details

- **No database changes needed** — all filter dimensions are derived from existing `category` and `tags` columns
- Industry/audience classification is done client-side via keyword mapping (same pattern as `inferVisualCategory`)
- Sort by popularity uses `is_featured` flag + alphabetical tiebreak (no new popularity score column needed for v1)
- `fetchTemplateBlocks` already exists for full block fetch
- The modal carousel reuses `TemplatePreview` component with blocks chunked into groups of 3

### Files to create/modify


| File                                                | Action                                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/components/templates/TemplateCard.tsx`         | Modify — accept `previewBlocks`, render `TemplatePreviewImage`, add "Preview" hover button |
| `src/components/templates/TemplatesGrid.tsx`        | Major rewrite — multi-dimensional filters, URL sync, sort, "Request Template" empty state  |
| `src/components/templates/TemplatePreviewModal.tsx` | **New** — carousel modal with slide navigation                                             |
| `src/pages/Templates.tsx`                           | Minor — pass blocks data through                                                           |
| `src/lib/templates.ts`                              | Minor — add industry/audience inference helpers                                            |
