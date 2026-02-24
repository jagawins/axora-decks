

## Wave 1: Interactive Slides, Iteration Loop, and Sharing Controls

This plan covers the highest-impact items from your six gaps, sequenced to deliver the most user-visible improvements first. It focuses on three categories: **Interaction** (click-to-reveal, tabs block, slide-to-slide links), **Iteration** (inline editing from the player), and **Sharing** (passcode, revoke links, basic view analytics).

---

### Phase 1: Interactive Block Types

Add three new first-class block types to the visual block system.

#### 1A. Tabs Block

A block that renders 2-4 tabs inside a single slide, each tab containing its own text content.

**Type definition** (added to `src/components/blocks/types.ts`):
```text
TabsBlockPayload {
  tabs: Array<{
    label: string;
    content: string;
  }>;
  defaultTab?: number;
}
```

**Component**: `src/components/blocks/TabsBlock.tsx`
- Uses the existing Radix Tabs component (`src/components/ui/tabs.tsx`)
- Renders tab labels as triggers, tab content as panels
- Supports 2-4 tabs with text content per tab
- Styled to match deck theme variables

#### 1B. Toggle Block

A block with two named states (e.g., "Current vs. Target") that the viewer can flip between.

**Type definition**:
```text
ToggleBlockPayload {
  stateA: { label: string; content: string; };
  stateB: { label: string; content: string; };
  defaultState?: 'a' | 'b';
}
```

**Component**: `src/components/blocks/ToggleBlock.tsx`
- Two buttons at the top showing each label
- Content area switches between stateA and stateB
- CSS transition on content swap

#### 1C. Click-to-Reveal (Progressive Disclosure)

Rather than a new block type, this is a **wrapper behavior** on existing list and card_grid blocks. When a block's content includes `reveal: true`, items appear one at a time on click/keypress.

**Implementation**:
- Add `reveal?: boolean` to `BaseBlockPayload` in types.ts
- Wrap list items and card_grid cards in a `RevealWrapper` component
- In deck mode, items start hidden and appear sequentially on click or spacebar
- In document mode, all items show immediately
- Track reveal index in DeckPlayer state

#### 1D. Slide-to-Slide Links

Allow any text in a block to reference another slide by index.

**Implementation**:
- In DeckPlayer, accept an `onNavigateSlide(index)` callback
- Add a `SlideLink` inline component: renders as an accent-colored link with slide number
- In the content schema, support `slideLink: number` on CTA blocks and text blocks
- Hero header and CTA section blocks already have `href` fields -- allow `#slide-3` syntax that DeckPlayer intercepts

---

### Phase 2: Iteration from the Player

#### 2A. "Edit This Slide" from DeckPlayer

Add a pencil icon on each slide in deck mode that opens a focused edit panel.

**Implementation**:
- Add an `onEditSlide?: (blockIds: string[]) => void` callback prop to DeckPlayer
- In `Preview.tsx`, when `onEditSlide` is called, open a slide-over panel with BlockRenderer for those blocks
- Save changes via the same `updateBlock` logic used in Editor
- After save, refresh the block data without full page reload

#### 2B. Per-Slide Quick Actions in Player

Add a small floating toolbar on each slide in DeckPlayer with quick AI actions:
- "Shorter" -- calls refine-block with instruction "Make this more concise"
- "More visual" -- calls refine-block with instruction "Convert to a more visual block type"
- "Decision slide" -- calls refine-block with instruction "Reframe as a decision summary"

**Implementation**:
- New component `src/components/SlideQuickActions.tsx`
- Appears on hover in DeckPlayer's DeckView
- Calls `supabase.functions.invoke("refine-block", ...)` directly
- Updates the block in state and database

---

### Phase 3: Sharing Controls and Analytics

#### 3A. Sharing Controls

Upgrade the existing share dialog in Editor.tsx with:

**Passcode protection**:
- Add `share_passcode TEXT DEFAULT NULL` column to `projects` table
- In the share dialog, add optional passcode input
- Update `get-shared-project` edge function to check passcode (sent as query param or header)
- In PublicPreview, if the function returns `{ requires_passcode: true }`, show a passcode input screen

**Link revocation**:
- Add a "Regenerate link" button in the share dialog
- Calls `UPDATE projects SET share_token = gen_random_uuid() WHERE id = ?`
- Old links immediately stop working

#### 3B. Basic View Analytics

Track views on shared decks with minimal infrastructure.

**Database**: New `deck_views` table:
```text
deck_views
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  project_id UUID NOT NULL
  viewer_hash TEXT  -- hashed IP or fingerprint for unique counting
  slide_index INTEGER
  duration_seconds INTEGER
  created_at TIMESTAMPTZ DEFAULT now()
```

RLS: Insert allowed for anon (via the share function), select allowed for project owner only.

**Implementation**:
- `get-shared-project` edge function logs a view on each request
- In DeckPlayer (public preview only), send a beacon on slide change with time spent
- New lightweight `record-view` edge function that accepts `{ project_id, slide_index, duration }`
- In Editor, add a "Views" tab in the share dialog showing: total views, unique viewers, top 3 slides by average time

---

### Phase 4: Block Type Registration

All three new block types (tabs, toggle, reveal wrapper) need to be registered across the system:

**Files to modify for each new block type**:
1. `src/components/blocks/types.ts` -- add payload interface
2. `src/components/blocks/[BlockName].tsx` -- create component
3. `src/components/blocks/index.ts` -- add export
4. `src/components/blocks/VisualBlockRenderer.tsx` -- add case
5. `src/lib/blocks.ts` -- add to `VisualBlockType` union and `VISUAL_BLOCK_TYPES` array
6. `src/lib/block-icons.ts` -- add icon mapping
7. `src/lib/block-templates.ts` -- add default content template

**Database**: The `blocks.type` and `template_blocks.type` columns use a USER-DEFINED enum. A migration is needed to add `tabs_block`, `toggle_block` to the enum.

---

### Technical Details

**New files to create**:
- `src/components/blocks/TabsBlock.tsx` -- Tabs block component
- `src/components/blocks/ToggleBlock.tsx` -- Toggle block component
- `src/components/blocks/RevealWrapper.tsx` -- Click-to-reveal wrapper
- `src/components/SlideQuickActions.tsx` -- Quick AI actions overlay for player
- `supabase/functions/record-view/index.ts` -- View analytics beacon endpoint

**Files to modify**:
- `src/components/blocks/types.ts` -- Add TabsBlockPayload, ToggleBlockPayload, reveal flag
- `src/components/blocks/VisualBlockRenderer.tsx` -- Add tabs_block, toggle_block cases
- `src/components/blocks/index.ts` -- Export new components
- `src/lib/blocks.ts` -- Add new types to unions and arrays
- `src/lib/block-icons.ts` -- Add icon mappings
- `src/components/DeckPlayer.tsx` -- Add reveal state tracking, slide links, edit callback, quick actions
- `src/pages/Preview.tsx` -- Add inline edit panel, wire onEditSlide
- `src/pages/PublicPreview.tsx` -- Add passcode gate, view tracking beacon
- `src/pages/Editor.tsx` -- Upgrade share dialog with passcode + revoke + analytics tab
- `supabase/functions/get-shared-project/index.ts` -- Add passcode check, log view

**Database migrations**:
1. Add `tabs_block` and `toggle_block` to the block_type enum
2. Add `share_passcode TEXT DEFAULT NULL` to `projects` table
3. Create `deck_views` table with RLS policies

**Implementation order**:
1. Database migrations (enum + new columns + table)
2. Tabs block + Toggle block (types, components, registration)
3. Reveal wrapper (on list and card_grid)
4. Slide-to-slide links in DeckPlayer
5. Inline edit from player
6. Quick AI actions on slides
7. Sharing controls (passcode + revoke)
8. View analytics (table + edge function + UI)

---

### What is NOT in this plan (future waves)

These items from your analysis are deferred to keep scope manageable:

- **Layout families and visual variants** (Wave 2) -- requires design system work for 2-3 visual variants per block type
- **Video and website embed blocks** (Wave 2) -- new block types with iframe/video rendering
- **Commenting and review mode** (Wave 3) -- per-slide comment threads and draft/review/final status
- **Version history** (Wave 3) -- snapshot and restore
- **Team workspaces** (Wave 3) -- shared brand kits and templates across team members
- **Poll/quick response block** (Wave 2) -- interactive audience participation
- **Menu slide with section jumps** (Wave 2) -- auto-generated table of contents slide

