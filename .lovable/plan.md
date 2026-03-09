

## Plan: Competitive Demo Strategy — Homepage Live Input + Full Deck Gallery + Enhanced How-It-Works

This is a significant conversion optimization effort across 3 pages. Here's what we'll build:

---

### 1. Homepage Hero — Live "Outline to Deck" Preview (Gamma-style)

**File: `src/components/landing/Hero.tsx`**

Add a collapsible "Try it now" section below the CTA buttons:
- A textarea with placeholder: "Paste your outline, meeting notes, or just describe your deck..."
- A "Generate Preview" button
- On click: calls the `generate-outline` edge function (no auth required) and renders a 3-slide preview card inline
- No sign-up gate — the preview is visible immediately
- After preview renders, show a "Create Full Deck →" CTA that links to `/create` (pre-filling the prompt)
- Includes a set of 3 quick-start chips ("Board update for Q4", "Series A pitch", "GTM strategy") so visitors don't need to think of input

**New component: `src/components/landing/HeroLiveDemo.tsx`**
- Manages the textarea, loading state, and preview rendering
- Calls `supabase.functions.invoke('generate-outline', { body: { topic, tone: 'executive', slideCount: 3 } })`
- Renders the outline as styled slide cards (title + bullets) with theme colors — not actual block rendering, just a clean preview
- Stores the prompt in URL params or sessionStorage so `/create` can pick it up

---

### 2. Templates Page — Full Deck Gallery (Beautiful.ai-style)

**File: `src/components/landing/ExampleDecks.tsx`**

Enhance the existing ExampleDecks component:
- Add a "Browse All Slides" button on each card that opens the existing `TemplatePreviewModal` (already wired up)
- Add a dedicated section header: "See What AXIVA Creates" with a subtitle about no sign-up needed
- This is already mostly working — the main fix is making sure the modal opens reliably and the slide previews are populated

**File: `src/pages/Templates.tsx`**
- Move the ExampleDecks section to the top with a more prominent heading: "Complete Example Decks — Browse Without Signing Up"

---

### 3. How It Works — Interactive Step-by-Step Tour (Pitch-style)

**File: `src/pages/HowItWorks.tsx`**

Replace the current static 4-card grid with an interactive scrolling walkthrough:
- Each step becomes a full-width section with a left description panel and a right "mock UI" panel
- The mock UI shows a stylized representation of each step:
  - Step 1: Animated textarea with typing effect
  - Step 2: Outline cards appearing one by one
  - Step 3: A slide preview with AI editing cursor
  - Step 4: Export format icons with a download animation
- Steps highlight as user scrolls (IntersectionObserver)
- Add a sticky "Try It Free" CTA bar at bottom

---

### 4. Homepage Trust Section Enhancement

**File: `src/components/landing/Hero.tsx`**

Replace the generic company names with a real-feeling customer quote:
- Add a testimonial-style quote above the trust logos: *"I had the board deck done in under 10 minutes — our CFO thought it was made by McKinsey."*
- Keep the company logos but make them feel earned

---

### Summary of Files

| File | Action |
|------|--------|
| `src/components/landing/HeroLiveDemo.tsx` | **New** — live outline preview widget |
| `src/components/landing/Hero.tsx` | Add HeroLiveDemo below CTAs, add testimonial quote |
| `src/pages/HowItWorks.tsx` | Rewrite with interactive scrolling walkthrough |
| `src/components/landing/ExampleDecks.tsx` | Add section header, improve gallery presentation |
| `src/pages/Templates.tsx` | Reorder — example decks first with prominent heading |

No database changes. No new edge functions (uses existing `generate-outline`). No new dependencies.

