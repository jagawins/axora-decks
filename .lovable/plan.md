

# Deep Research Mode — Final Implementation Plan

All reviewer feedback incorporated. This is the build-ready spec.

## Build Order

1. **`deep-research` edge function** — highest risk, validate Gemini tool-calling output before any UI
2. **`AlignmentStep` + `FileUploadPills`** — pure UI, no dependencies
3. **`ResearchStep`** — wires to edge function, handles 8-15s latency
4. **`OutlineStep`** — dnd-kit + inline editing via reducer
5. **`GenerateStep`** — wiring existing pipeline with explicit failure states
6. **Wire into `Create.tsx`** — mode toggle + conditional render

## Database Migration

```sql
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,              -- nullable for future anonymous tracking
  session_id text,           -- client-generated UUID from sessionStorage
  event text NOT NULL,
  properties jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert own events"
  ON public.analytics_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous can insert events"
  ON public.analytics_events FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);
```

## Files to Create

### 1. `supabase/functions/deep-research/index.ts`
- Auth via `getUser()` pattern (consistent with all existing functions)
- Model: `google/gemini-2.5-flash` via Lovable AI gateway
- Tool-calling for structured output: `{ findings[], conflicts[], summary }`
- **Hallucination guardrail in system prompt**: instruct model to set `source_url: null` when uncertain, add `verify_required: true` on uncertain stats, never invent URLs
- Handle 429/402 errors and surface to client

### 2. `src/types/research-mode.ts`
Shared types:
- `AlignmentData` — goal, audience, outcome, mustIncludeFacts, fileExtracts
- `ResearchFinding` — title, detail, source_url (nullable), source_label, data_points[], verify_required
- `ResearchBrief` — findings[], conflicts[], summary
- `OutlineSlide` — id (stable UUID), title, keyPoints (max 3), dataPoint?
- `OutlineAction` — union type for reducer (reorder, edit_title, edit_points, add, delete)
- Extended `BlockMeta` — schema_version, source_url?, source_label?, research_mode?, research_session_id?

### 3. `src/components/create/ResearchModeWizard.tsx`
- 4-step container with progress bar (Step 1 of 4)
- Generates `research_session_id` (UUID) at mount
- Manages all transient state: alignment, research brief, outline, file extracts
- Step navigation preserves all state — going back never loses data

### 4. `src/components/create/AlignmentStep.tsx`
- Goal textarea (required), audience dropdown (Board/Investors/C-Suite/Sales/Team/Other), outcome textarea (required), must-include facts (optional)
- `FileUploadPills` component for context files
- "Start Research →" button fires step tracking event

### 5. `src/components/create/FileUploadPills.tsx`
- Up to 3 files (PDF/DOCX/TXT/MD), shown as pills with remove X
- Calls existing `parse-file` edge function for text extraction
- Stores extracted text in parent state

### 6. `src/components/create/ResearchStep.tsx`
- Calls `deep-research` edge function with alignment + file text
- Loading state shows: *"Synthesising research from AI knowledge (training data current to early 2025). Live web search coming soon."*
- Every finding displays: *"AI-synthesised — verify key statistics before presenting"*
- Findings with `verify_required: true` get an amber highlight
- User can add notes/edits inline
- "Build Outline →" button

### 7. `src/components/create/outlineReducer.ts`
Pure function reducer handling all outline mutations:
- `REORDER` — swap by stable `id`
- `EDIT_TITLE` / `EDIT_POINTS` — update by `id`
- `ADD` — insert with new `crypto.randomUUID()` id
- `DELETE` — remove by `id`
- Unit-testable independently

### 8. `src/components/create/OutlineStep.tsx`
- Calls existing `generate-outline` with research brief + alignment as enhanced prompt
- Maps outline sections → `OutlineSlide[]` with stable UUIDs
- `@dnd-kit/sortable` for drag reorder
- Inline editing of title/points, add/delete slides
- "Generate Full Deck →" button

### 9. `src/components/create/GenerateStep.tsx`
- Passes approved outline + research + alignment into existing `generate-blocks` pipeline as structured system context
- Writes to `block_meta`: `{ schema_version: 1, research_mode: true, research_session_id, source_url, source_label }`
- **Explicit failure states**:
  - Shows which step failed (context injection, block generation, image resolution)
  - "Try Again" button (retry with same context)
  - "Generate Without Research" button (falls back to Quick mode with prompt)
  - Outline is never lost — user can navigate back to Step 3

## Files to Modify

### `src/pages/Create.tsx`
- Add Quick/Research mode toggle above entry cards (only shown when no `activeEntry` yet or when `scratch` is selected)
- When Research Mode + "Start from scratch": render `ResearchModeWizard` instead of studio controls
- Quick mode completely untouched

### `supabase/config.toml`
- Add `[functions.deep-research]` with `verify_jwt = false`

## No Other Changes
- No modifications to existing edge functions
- No changes to existing database tables
- Template/import flows unaffected
- Quick mode generation path untouched

