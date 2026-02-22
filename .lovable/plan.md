

## Fix: Blocks Rendering as Raw JSON and Import Errors

### Problem Analysis

There are three issues visible in the screenshots:

**Issue 1 (Critical): Blocks display raw JSON instead of visual rendering**

The Editor page has two rendering paths -- `PresentationBlock` (read-only preview mode) and `BlockRenderer` (edit mode). Both only handle 7 basic block types: heading, text, list, callout, two_col, table, image. All visual/decision block types (hero_header, cta_section, framed_insight, card_grid, section_divider, stat_block, chart_block, etc.) fall through to a `default` case that renders `JSON.stringify(content)`.

Meanwhile, a fully working `VisualBlockRenderer` component exists and is already used in `PreviewDeck.tsx`. The Editor simply never calls it.

**Issue 2: "Failed to import content" error**

The import modal's `handleSubmit` creates a new project and inserts blocks. The `sortDecisionBlocks` call on line 442 of ImportContentModal.tsx always reorders decision blocks even in non-decision imports (same bug that was fixed in CreateDeckModal but not here). Additionally, the import flow may fail if the block insertion hits type mismatches or the edge function returns unexpected formats.

**Issue 3: "Project limit reached" toast**

Free tier allows only 3 projects. This is working as designed, but the user sees it as an error. The limit of 3 is hardcoded in `src/lib/subscription.ts`.

---

### Plan

#### 1. Wire VisualBlockRenderer into Editor.tsx PresentationBlock

In the `PresentationBlock` component (around line 1632), replace the `default` case with a call to `VisualBlockRenderer` for any non-basic block type:

- Import `VisualBlockRenderer` at the top of Editor.tsx
- In the `switch` statement, before the `default` case, add handling for visual/decision block types by delegating to `VisualBlockRenderer`
- The `default` case becomes a true fallback for genuinely unknown types

#### 2. Wire VisualBlockRenderer into Editor.tsx BlockRenderer

In the `BlockRenderer` component (around line 1885), the visual/decision block fallback currently shows raw JSON. Replace with:

- Use `VisualBlockRenderer` for read-only display of the block content
- Keep the edit controls (the block hover toolbar) around it
- This gives users a visual preview of the block even in edit mode

#### 3. Fix sortDecisionBlocks in ImportContentModal

On line 442 of ImportContentModal.tsx, `sortDecisionBlocks` is called without a `decisionMode` guard. Add the same guard used in CreateDeckModal -- only sort when `decisionMode` is true.

#### 4. Increase free tier project limit

Change the free tier project limit from 3 to a more reasonable number (e.g., 5 or 10) in `src/lib/subscription.ts`, or skip the limit check when importing content (since the user just wants to see their content, not create unlimited decks).

---

### Technical Details

**Files to modify:**

1. **src/pages/Editor.tsx**
   - Add `import { VisualBlockRenderer } from "@/components/blocks/VisualBlockRenderer"` 
   - In `PresentationBlock` (line ~1700): replace the `default` case to check if the block type is visual/decision and render via `VisualBlockRenderer` by constructing a compatible `TemplateBlock` object
   - In `BlockRenderer` (line ~1886): replace the JSON.stringify fallback with `VisualBlockRenderer` rendering

2. **src/components/ImportContentModal.tsx**
   - Line 442: gate `sortDecisionBlocks` on `decisionMode` flag

3. **src/lib/subscription.ts** (optional)
   - Increase free tier `projects` from 3 to a higher number if desired

