
# Speed and Polish Optimization for Axora

## Overview
Four targeted improvements focused on speed, polish, and presentation quality. No new architecture, no analytics, no animations.

## Features

### 1. Quick Polish Button
A new "Quick Polish" button in the editor header that iterates through all blocks sequentially, applying executive refinement to each one. Uses the existing `aiEngine.refineBlock` infrastructure -- no new backend needed.

**Behavior:**
- Iterates blocks one by one (sequential, not parallel, to avoid UI freezing)
- Sends each block through `aiEngine.refineBlock` with a single comprehensive instruction: tighten wording, strengthen headers, remove redundancy, apply executive tone
- Detects generic heading text ("Overview", "Summary", "Plan", "Introduction", "Conclusion") and rewrites into outcome-driven headlines
- Updates each block in place as it completes (user sees progressive improvement)
- Shows progress indicator: "Polishing block 3 of 12..."
- Shows badge on each block as it completes: "Polished"
- Disables button while running; shows "Polishing..." state

**File changes:**
- `src/pages/Editor.tsx` -- add `handleQuickPolish` async function, add button to header, add `polishing` + `polishProgress` state

### 2. Layout Preset Switching (CSS Only)
A dropdown in the header that switches visual density/layout classes on the canvas. No content regeneration -- pure CSS class swapping.

**Presets:**
- **Minimal** -- generous whitespace, larger font, centered alignment
- **Corporate** -- standard spacing, left-aligned, compact headers
- **Bold** -- large headings, high contrast borders, accent backgrounds
- **Data-Focused** -- tight spacing, smaller text, maximized content area

**Implementation:**
- `src/lib/themes.ts` -- add `LayoutPreset` type and `LAYOUT_PRESETS` config with Tailwind class overrides for each preset
- `src/pages/Editor.tsx` -- add `layoutPreset` state, add dropdown in header, apply preset classes to canvas wrapper `<div>`
- Classes affect only spacing, font sizes, and alignment on the canvas wrapper -- no content changes

### 3. Export Polish Overlay
When user clicks PDF export, show a brief polished loading overlay before opening the print window. Pure UI feedback -- no backend changes.

**Sequence:**
1. User clicks Export PDF
2. Modal/overlay appears with staged progress messages:
   - "Optimizing slide formatting..." (0-1s)
   - "Aligning spacing..." (1-2s)  
   - "Applying consistent typography..." (2-3s)
3. After ~3 seconds, overlay closes and print window opens as before

**File changes:**
- `src/pages/Editor.tsx` -- add `exportOverlayOpen` + `exportStage` state, update `exportPdf` to show overlay first, add overlay JSX

### 4. Reduce AI Sidebar Prominence
Make the AI Analysis sidebar less prominent while keeping it accessible. The Stress Test button, clarity score, and Before/After toggle are removed from the header to reduce clutter. Primary visible actions become: Quick Polish, Export, Save.

**Changes:**
- Remove the "Stress Test" button from the header (still accessible inside sidebar)
- Remove "Before/After" toggle from header (niche feature, clutters primary actions)
- Remove clarity score from header
- Keep the sidebar toggle button but make it a subtle icon-only button
- Reorder header: Generate Deck | Quick Polish | Layout | Export PDF | Share | Save

---

## Technical Details

### File Changes Summary

| File | Change |
|------|--------|
| `src/pages/Editor.tsx` | Add Quick Polish handler, layout preset state, export overlay, reorder header, remove sidebar prominence |
| `src/lib/themes.ts` | Add `LayoutPreset` type and `LAYOUT_PRESETS` with Tailwind class maps |

### Quick Polish Instruction
The single instruction sent to `aiEngine.refineBlock` for each block:
```
Tighten all wording — remove filler, redundancy, and passive voice. 
If this is a heading and it uses a generic phrase like "Overview", "Summary", 
"Plan", "Introduction", "Next Steps", or "Conclusion", rewrite it as an 
outcome-driven headline that communicates specific value (e.g., "Revenue 
Leakage Risk Identified in Q3 Operations"). Strengthen the executive tone. 
Keep content factual and concise. Do not add new information.
```

### Layout Preset Classes
Applied to the canvas wrapper div (`max-w-3xl mx-auto space-y-6`):

```typescript
export const LAYOUT_PRESETS = {
  minimal: {
    label: "Minimal",
    canvas: "max-w-2xl mx-auto space-y-10 text-lg",
    block: "p-8 text-center",
  },
  corporate: {
    label: "Corporate",
    canvas: "max-w-3xl mx-auto space-y-4",
    block: "p-5 text-left",
  },
  bold: {
    label: "Bold",
    canvas: "max-w-3xl mx-auto space-y-6",
    block: "p-6 border-2 border-accent/20 bg-accent/5",
  },
  data_focused: {
    label: "Data-Focused",
    canvas: "max-w-4xl mx-auto space-y-3 text-sm",
    block: "p-3",
  },
};
```

### Export Overlay Implementation
Simple Dialog with staged text updates via `setTimeout`:
```typescript
const exportPdf = () => {
  setExportOverlayOpen(true);
  setExportStage(0);
  setTimeout(() => setExportStage(1), 1000);
  setTimeout(() => setExportStage(2), 2000);
  setTimeout(() => {
    setExportOverlayOpen(false);
    window.open(`/print/${projectId}`, "_blank", "noopener,noreferrer");
  }, 3000);
};
```

### No Changes To
- Export logic / Print page
- Backend edge functions
- Routing
- Design system / Tailwind config (only themes.ts additions)
- Database schema
- Block rendering components

### Dependencies
- No new packages required
