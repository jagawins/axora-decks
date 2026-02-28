

## Plan: Fix CTA Buttons Across All Block Components

### Problem
CTA buttons in block components (`CTASection`, `HeroHeader`, and potentially `CardGrid`) render as `<button>` elements but ignore the `href` field from their payload. They have no `onClick` or navigation behavior, making them completely non-functional.

### Changes

**1. `src/components/blocks/CTASection.tsx`**
- Change `primaryCta` and `secondaryCta` from `<button>` to `<a>` when `href` is present
- Add `target="_blank" rel="noopener noreferrer"` for external links
- Keep as `<button>` (visual-only) when no `href` and `readOnly` is true

**2. `src/components/blocks/HeroHeader.tsx`**
- Same fix for the `cta` button — render as `<a>` when `cta.href` exists

**3. `src/components/blocks/CardGrid.tsx`**
- Cards have a `link` field in their type definition but it's never used — render cards as `<a>` when `card.link` is present

**4. `src/components/templates/TemplatePreview.tsx`**
- The slide content is rendered inside a `transform: scale()` container. Add `pointer-events: auto` explicitly to the inner content div to ensure clicks propagate through the scaled container.

All 4 files modified in parallel. No new dependencies or database changes.

