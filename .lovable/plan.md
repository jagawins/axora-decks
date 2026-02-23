

## Brand-at-Project, Presentation Player, and Export Upgrade

### ✅ Completed

1. **Database migration** – `brand_kit` (JSONB) and `notes` (JSONB) columns added to `projects` table
2. **Brand token system** – `src/lib/brand.ts` with `resolveBrandStyles()`, font configs, guardrails
3. **BrandKitPanel** – `src/components/BrandKitPanel.tsx` with color pickers, typography dropdowns, logo settings
4. **Slide engine** – `src/lib/slide-engine.ts` with `computeSlides()` grouping + decision block ordering
5. **DeckPlayer** – `src/components/DeckPlayer.tsx` with deck/document modes, outline sidebar, keyboard nav, progress bar, CSS transitions, deep linking
6. **DeckPlayerOutline** – `src/components/DeckPlayerOutline.tsx` collapsible slide outline
7. **ExportMenu** – `src/components/ExportMenu.tsx` unified export dropdown
8. **Presenter view** – `src/pages/Present.tsx` with dual-pane layout, timer, BroadcastChannel sync
9. **Preview upgraded** – `src/pages/Preview.tsx` now uses DeckPlayer with brand kit support
10. **PublicPreview upgraded** – `src/pages/PublicPreview.tsx` now uses DeckPlayer
11. **Print fixed** – `src/pages/Print.tsx` now uses VisualBlockRenderer for ALL block types + brand styles
12. **CSS transitions** – `deck-slide-enter` and `deck-slide-enter-full` animations added to `index.css`
13. **Font imports** – All brand fonts (Playfair Display, Space Grotesk, DM Sans, Source Sans Pro, IBM Plex Sans) imported
14. **Route added** – `/present/:id` route in `App.tsx`

### 🔲 Remaining

- **Editor integration** – Wire BrandKitPanel and ExportMenu into Editor.tsx toolbar
- **PPTX export** – `generate-pptx` edge function with pptxgenjs
- **Google Slides path** – Download + redirect flow
- **Slide recipes** – Power user mode in generate modal
