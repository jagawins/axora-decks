

## World-Class Template System — Upgrade Plan

The current template experience has solid foundations (filtering, categories, preview modal) but lacks the polish and conversion-optimized design of top-tier template marketplaces like YouExec, Slidebean, and Canva. Here's a focused plan to elevate it.

---

### 1. Template Grid Cards — Show Real Slide Content

**Problem**: Cards currently show abstract geometric shapes (bars, circles) that all look similar and don't communicate what's actually inside the template.

**Fix**: Replace `TemplatePreviewImage` cover cards with a mini real-slide renderer that shows the first 2-3 blocks at tiny scale inside the card thumbnail — similar to how YouExec shows actual slide screenshots. Fall back to the current styled cover only when blocks aren't available.

- Render first slide's blocks inside a 1280x720 canvas scaled down to card size using CSS `transform: scale()`
- Add a subtle gradient overlay at the bottom for the title text
- Keep the category badge and hover actions overlay

---

### 2. Template Preview Modal — Cinematic Slide Viewer

**Problem**: The modal works but feels utilitarian. Slide content is sometimes poorly scaled or clipped.

**Fix**:
- Add a dark immersive backdrop (like Keynote's light table)
- Show slide count prominently: "12 Slides" with a progress bar
- Add a "What's Inside" section below the slide viewer showing block type breakdown (e.g., "3 Charts · 2 Data Tables · 1 Timeline · Executive Summary")
- Improve thumbnail strip: render actual mini-slides instead of full `TemplatePreview` components (too heavy)
- Add template metadata: estimated reading time, export formats (PPTX, PDF), category tags

---

### 3. Template Detail Page — Full Sales Page

**Problem**: `/template/:slug` is a bare two-column layout with minimal information. Not conversion-optimized.

**Fix**:
- Hero section with the template title, description, and a large 16:9 preview
- Slide gallery strip below the hero (horizontally scrollable thumbnails)
- "What's Included" section: list of all slide types with icons
- Trust signals: "Used by 500+ executives", "Export to PowerPoint", "Fully customizable with AI"
- Related templates section at the bottom
- Sticky CTA bar on mobile

---

### 4. Templates Page — Premium Gallery Hero

**Problem**: The page jumps straight into Example Decks + grid with no context or visual impact.

**Fix**:
- Add a compact hero section with headline: "60+ Executive Templates" and subline about quality
- Feature 3 "Staff Pick" templates in a larger showcase row before the grid
- Add a "New This Week" badge system for recently added templates
- Social proof bar: "Trusted by 2,000+ strategists" with category icons

---

### 5. Template Card Metadata & Quality Signals

**Problem**: Cards show category + "X Slides" + "PPTX" but lack the signals that drive clicks and conversions.

**Fix**:
- Show actual slide count from the database (not just preview_blocks length)
- Add "Popular" badge based on usage count
- Add a subtle "AI Customizable" indicator
- Show 1-2 block type icons (chart, timeline, etc.) to hint at content richness

---

### 6. Smooth Slide Transitions in Preview

**Problem**: Slide transitions use a basic opacity+translate that feels janky.

**Fix**:
- Use `framer-motion` (already likely in deps) or CSS keyframes for a smooth crossfade with slight scale
- Add a keyboard shortcut hint overlay on first open ("← → to navigate")

---

### Technical Approach

**Files to modify:**
- `src/components/templates/TemplateCard.tsx` — real slide thumbnail, metadata
- `src/components/templates/TemplatePreviewModal.tsx` — immersive viewer, "what's inside" section
- `src/components/templates/TemplatePreviewImage.tsx` — fallback only when no blocks
- `src/pages/TemplateDetail.tsx` — full sales page redesign
- `src/pages/Templates.tsx` — hero section, staff picks row
- `src/components/templates/TemplatesGrid.tsx` — quality signals, badges

**No database changes required.** All enhancements are UI/UX improvements using existing data.

