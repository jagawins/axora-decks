

# Axora Activation and Engagement Improvements

## Overview
Add seven targeted activation and retention features without redesigning the product. Each feature is a surgical addition to existing components.

## Features

### 1. Guided First Deck Flow
Show a "First Deck" modal on Dashboard when the user has zero projects. Three use-case cards (Board Update, Investor Pitch, Strategic Initiative). Clicking one auto-creates a project and calls `aiEngine.generateFromPrompt` with a pre-filled topic, audience, and tone. The user lands in the Editor with a complete draft -- zero blank-canvas friction.

- New file: `src/components/FirstDeckModal.tsx`
- Modified: `src/pages/Dashboard.tsx` (show modal when `projects.length === 0 && !loading`)
- Uses existing `CreateDeckModal` generation logic as reference, but bypasses the form

### 2. Before/After Demo Mode
Add a toggle in the Editor header: "Before AI / After AI". When toggled to "Before", display the raw bullet equivalent of each block's content (plain text, no structure). When toggled to "After", show normal rendered blocks. This is purely a view-layer toggle -- no backend calls.

- Modified: `src/pages/Editor.tsx` (add toggle state, conditional rendering in canvas)
- New utility function `extractRawText(block)` in `src/lib/blocks.ts` that flattens any block content into plain bullet lines

### 3. Inline Value Reinforcement Badges
When a block is refined via AI (hover toolbar actions or Agent Edit), show a temporary badge on that block: "Executive tone applied", "Compressed to 3 bullets", "Argument strengthened". The badge appears for 4 seconds then fades.

- Modified: `src/pages/Editor.tsx` (add `recentBadges` state map: `Record<blockId, badgeText>`)
- Modified: `src/components/editor/BlockHoverToolbar.tsx` (pass badge text based on action label)
- Badge rendered as a small styled div overlay on the block, auto-clears via `setTimeout`

### 4. Soft Gating (3 Full Deck Generations)
Track full deck generation count in `localStorage` (key: `axora_deck_gen_count`). After 3 full generations, show a modal prompting upgrade instead of generating. Block-level edits remain unlimited.

- New file: `src/components/UpgradeGateModal.tsx`
- Modified: `src/pages/Editor.tsx` (`handleCreateDeck` checks count before proceeding)
- Modified: `src/components/CreateDeckModal.tsx` (check count in standalone generation path)
- Free tier only -- skip gate if `subscription.tier !== 'free'`

### 5. Save Progress Prompt
Intercept browser `beforeunload` when `hasUnsavedChanges` is true. Also add an in-app confirmation dialog when clicking the back arrow to Dashboard with unsaved changes.

- Modified: `src/pages/Editor.tsx`
  - Add `useEffect` for `beforeunload` event tied to `hasUnsavedChanges`
  - Wrap back-button click in a confirmation check (Dialog or `window.confirm`)

### 6. Executive Stress Test Button + Clarity Score
Add a "Stress Test" button in the Editor header that opens the AI Sidebar and auto-triggers `stress_test_narrative`. Also add a small "Clarity: --" indicator in the header bar that updates after any analysis completes, showing `overallScore` from the analysis response.

- Modified: `src/pages/Editor.tsx` (add Stress Test button, clarity score state)
- Modified: `src/components/editor/AISidebar.tsx` (emit score back to parent via callback prop `onScoreUpdate`)

### 7. Social Proof Line
Add a single line of subtle social proof below the Editor canvas: "Used by strategy leaders to prepare board-level narratives." Minimal, text-only, executive tone.

- Modified: `src/pages/Editor.tsx` (add a `<p>` below the canvas area when blocks exist)

---

## Technical Details

### File Changes Summary

| File | Change |
|------|--------|
| `src/components/FirstDeckModal.tsx` | New -- use-case selector + auto-generate |
| `src/components/UpgradeGateModal.tsx` | New -- soft gate modal |
| `src/lib/blocks.ts` | Add `extractRawText()` utility |
| `src/pages/Dashboard.tsx` | Import/show FirstDeckModal |
| `src/pages/Editor.tsx` | Before/After toggle, badges, soft gate check, save prompt, stress test button, clarity score, social proof |
| `src/components/editor/BlockHoverToolbar.tsx` | Return badge text from actions |
| `src/components/editor/AISidebar.tsx` | Add `onScoreUpdate` callback prop |

### No Changes To
- Export logic
- Routing
- Design system / Tailwind config
- Backend edge functions (analyze-document already supports all needed modes)
- Database schema

### Dependencies
- No new packages required
- All features use existing UI components (Dialog, Button, Badge from shadcn/ui)
- AI calls use existing `aiEngine` and `analyze-document` edge function

