# Light-mode theme and sample contrast correction

## Scope
- Keep AXIVA’s existing dark mode and all authored presentation themes/exports unchanged.
- Correct the shared light-mode palette, public sample rendering, input visibility, and compact sample sizing only.
- Do not publish or change product behavior, copy, billing, authentication, or backend logic.

## Implementation
1. **Shared light-mode tokens**
   - Replace the purple light palette with the requested neutral surfaces, navy/slate text, and one deep-blue brand family.
   - Align primary, accent, ring, sidebar, block accents, gradients, and glows while retaining semantic success, warning, and destructive roles.
   - Strengthen the shared input boundary and keep the ordinary decorative border lighter; preserve a clear blue focus ring.
   - Set the native control color scheme from the active theme.

2. **Adaptive public sample surface**
   - Add scoped sample color tokens for surface, heading, body, muted notes, separators, cards, and values in light and dark modes.
   - Replace hardcoded white-alpha sample text across cover, recommendation, evidence, metrics, risks, and next-steps layouts.
   - Keep each deck’s accent in dark mode, use the accessible shared deep blue for sample values in light mode, and leave user-created deck styling untouched.
   - Confirm every `SampleSlideRenderer` call site uses the matching scoped sample surface.

3. **Compact preview sizing**
   - Make the compact hero slide content-aware with enough minimum height for the four evidence rows and footnote at phone and desktop widths.
   - Avoid an internal scrollbar in compact mode; retain bounded scrolling for the full `/demo` explorer where long content requires it.

## Validation
- Run `tsgo -p tsconfig.app.json` and the production build.
- In the actual app, use the real theme toggle and check light/dark after transitions at 390×844 and 1440×900 on `/` and `/demo`.
- Check light-mode desktop/mobile header menus and `/pricing` for token regressions.
- Measure rendered contrast for main text, muted text, placeholder, primary CTA, and sample values/notes in both themes, targeting 4.5:1 for normal text.
- Report this as focused route/control validation, not an app-wide accessibility certification; save without publishing.
