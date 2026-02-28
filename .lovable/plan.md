

## Plan: Nano Banana Pro Integration for AI Image Generation

Yes — you already have the infrastructure in place. The current `image-generate` edge function uses the standard model (`google/gemini-2.5-flash-image`). Here's the plan to add Nano Banana Pro (`google/gemini-3-pro-image-preview`) as a quality option.

### What changes

**1. Edge function: `supabase/functions/image-generate/index.ts`**
- Accept a new optional `quality` parameter: `"standard"` (default) or `"pro"`
- When `quality === "pro"`, use model `google/gemini-3-pro-image-preview` instead of `google/gemini-2.5-flash-image`
- Add an enhanced system prompt for pro mode with more detailed style instructions (infographic-ready, high-detail)

**2. Visual Builder UI: `src/components/VisualBuilder.tsx`**
- Add a quality toggle next to the "Generate" button when source is `"ai"`
- Two options: **Standard** (fast, default) and **Pro** (higher quality, slower)
- Pass `quality` in the `image-generate` function call body
- Update the loading text to indicate "Generating HD image..." for pro mode

**3. Image source options**
- Add a new source option `"ai-infographic"` with label "AI Infographic" to `IMAGE_SOURCE_OPTIONS`
- When this source is selected, auto-set quality to `"pro"` and use an infographic-specific prompt prefix (e.g., "Create a clean data infographic...")
- This gives users a one-click way to generate infographic-style visuals for data slides

### Technical details

- No new secrets needed — `LOVABLE_API_KEY` already supports both models
- No database changes required
- The `google/gemini-3-pro-image-preview` model uses the same API shape (chat completions with `modalities: ["image", "text"]`)
- Pro images will be slower (~10-15s vs ~5s) — the UI will reflect this with messaging

