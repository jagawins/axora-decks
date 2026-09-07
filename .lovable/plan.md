# Homepage simplification

## Scope
- Keep the existing header, skip link, semantic main area, canonical metadata, chatbot, and all brief submission behavior.
- Reduce the homepage to four focused sections: the existing interactive hero, a compact three-step strip, a compact pricing strip, and a compact footer.
- Leave the removed homepage sections and all dedicated pages available elsewhere; do not publish.

## Implementation
1. **Hero and product proof**
   - Shorten the eyebrow, supporting copy, placeholder, account note, and secondary sample link exactly as requested.
   - Keep the textarea label, validation, storage-failure gate, draft preservation, account routing, and analytics unchanged.
   - Show the character count only after input, with accurate accessible descriptions.
   - Put the primary action before starter chips so it remains prominent on small screens.
   - In compact sample mode only, remove duplicate metadata and slide selector buttons, use one “Fictional sample” badge, retain the title, readable slide surface, count, keyboard handling, and accessible previous/next controls.

2. **Compact homepage sections**
   - Replace the large three-step presentation with a short “From notes to presentation” strip and a quiet link to the existing explanation page.
   - Add a homepage-only pricing strip that reads Free and Pro prices from the existing subscription configuration and links to the full pricing page.
   - Add a compact footer option with only the wordmark, copyright, and six requested links; preserve the existing footer as the default everywhere else.

3. **Homepage composition and metadata**
   - Remove only the homepage imports/rendering for the long gallery, methodology, feature, FAQ, founder, full pricing, and repeated CTA sections.
   - Shorten homepage description and social description to reflect the focused page.

## Validation
- Run the existing regression test suite once, the application TypeScript check using `tsgo -p tsconfig.app.json`, and the production build.
- Use the actual homepage at 390×844 and 1440×900 to check overflow, CTA visibility, sample readability, and starter/sample/pricing link destinations.
- Report browser observations separately from source/test validation; do not claim an unmeasured word reduction.
