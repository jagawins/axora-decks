/**
 * Non-sensitive product telemetry.
 *
 * Reuses the analytics provider already loaded by index.html (gtag). No new
 * provider, no network client. Never pass prompt text, brief content, emails,
 * project identifiers or raw error messages into these events — names and
 * enum-like labels only.
 */

export type ProductEvent =
  | "brief_started"
  | "brief_submitted"
  | "sample_opened"
  | "sample_slide_viewed"
  | "create_intent_stored"
  | "create_draft_restored"
  | "auth_return_with_draft"
  | "create_viewed"
  | "configuration_selected"
  | "generation_started"
  | "generation_succeeded"
  | "generation_failed"
  | "edit_export_opened";

type SafeValue = string | number | boolean;

/** Only enum-like labels and numbers may be attached to an event. */
const ALLOWED_KEYS = new Set([
  "deck_id",
  "slide_index",
  "source",
  "signed_in",
  "prompt_length",
  "starter",
  "preset",
  "slide_count",
  "density",
  "visuals",
  "output_type",
  "theme",
  "stage",
  "block_count",
  "duration_seconds",
]);

/** Failure stages are an enum: never a raw error string. */
export type GenerationFailureStage =
  | "validation"
  | "project"
  | "generation"
  | "empty_output"
  | "persist"
  | "unknown";

export function trackProductEvent(
  event: ProductEvent,
  params: Record<string, SafeValue> = {}
): void {
  const safe: Record<string, SafeValue> = {};
  for (const [key, value] of Object.entries(params)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    if (typeof value === "string") {
      // Enum-like values only: short, no free text.
      if (value.length > 48) continue;
      safe[key] = value;
    } else {
      safe[key] = value;
    }
  }
  try {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === "function") gtag("event", event, safe);
  } catch {
    /* telemetry must never break the page */
  }
}
