

# Press Page Redesign — Gamma/Beautiful.ai Quality

Complete rewrite of `src/pages/Press.tsx` with 8 sections, dark professional design matching the existing AXIVA design system.

## Sections

1. **Hero** — Bold "Axiva.ai Press & Media" headline, one-line description, press email
2. **Company Facts** — Clean stat grid (Founded 2024, Category, HQ, What we do)
3. **About Axiva** — Two paragraphs: executive positioning + competitive landscape
4. **Press Coverage** — Data-driven card row with 3 placeholder entries (TechCrunch, Forbes, Product Hunt). Empty state fallback. Array at top of file for easy updates.
5. **Logo Downloads** — Row of download buttons (SVG dark, PNG light, PNG dark, Brand guidelines PDF). Links to existing assets in `/assets/` and `/src/assets/`.
6. **Product Screenshots** — 3-column grid with placeholder images for prompt screen, generated deck, editor view. "Download all (ZIP)" button.
7. **Founder Bio** — Card with circular avatar placeholder, name, title, 2-sentence bio, LinkedIn link
8. **Boilerplate** — Copyable text block with "Copy" button using `navigator.clipboard`
9. **Press Contact** — Clean card with press@axiva.ai and response time

## SEO

Update SeoHead with:
- Title: "Press & Media Kit — Axiva.ai"
- Description: "Download Axiva.ai brand assets, logos, screenshots, and boilerplate copy. For press inquiries contact press@axiva.ai."
- JSON-LD Organization schema with contactPoint for Press

## Design

- Full-width layout, max-w-[1100px] centered
- Uses existing dark theme (already dark navy/near-black bg from CSS vars)
- Accent color (electric blue) for CTAs and highlights
- No sidebar, clean vertical scroll
- Consistent with existing card/border patterns

## File Changes

- **Rewrite**: `src/pages/Press.tsx` — complete replacement with all 9 sections

