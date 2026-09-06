/**
 * Durable creation intent.
 *
 * A visitor can type a brief on the homepage, be sent through sign-in, come back
 * (same tab, reload, or OAuth round trip) and still find their brief waiting in
 * /create. The draft is versioned, validated, bounded and expires.
 *
 * Rules:
 * - Reading NEVER clears the draft (a failed generation must not lose the brief).
 * - Only successful project + block persistence, or an explicit discard, clears it.
 * - Valid brief text is preserved EXACTLY, including blank lines and indentation.
 * - Over-limit briefs are rejected, never silently truncated.
 * - All storage access is wrapped: storage can throw (private mode, quota, iframes).
 * - Storage is per-tab (sessionStorage): restoration is same-tab only, never
 *   cross-device.
 */

import { THEMES, type ThemeId } from "@/lib/themes";

export const DRAFT_STORAGE_KEY = "axiva_create_draft_v1";
/** Legacy key written by older homepage builds — read for compatibility only. */
export const LEGACY_PROMPT_KEY = "axiva_prefill_prompt";

/** Single shared bound for Hero, Create and storage. */
export const MAX_PROMPT_LENGTH = 12000;
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** The only card counts the builder offers. */
export const CARD_COUNT_OPTIONS = [5, 8, 10, 12, 15, 20] as const;

/** The only languages the builder offers. */
export const LANGUAGE_OPTIONS = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
] as const;

export type DraftDensity = "vibes" | "minimal" | "context" | "plenty";
export type DraftVisuals = "none" | "stock" | "ai" | "hybrid";
export type DraftOutput = "presentation" | "social";

export interface CreateDraftSettings {
  outputType?: DraftOutput;
  cardsCount?: number;
  theme?: ThemeId;
  language?: string;
  density?: DraftDensity;
  visualsMode?: DraftVisuals;
  useBrandKit?: boolean;
}

export interface CreateDraft {
  version: 1;
  prompt: string;
  createdAt: number;
  settings: CreateDraftSettings;
}

export type SaveDraftResult =
  | { ok: true }
  | { ok: false; reason: "empty" | "too_long" | "storage" };

const DENSITIES: DraftDensity[] = ["vibes", "minimal", "context", "plenty"];
const VISUALS: DraftVisuals[] = ["none", "stock", "ai", "hybrid"];
const OUTPUTS: DraftOutput[] = ["presentation", "social"];

/* ── storage helpers (never throw) ─────────────────────────────── */

function getStore(): Storage | null {
  try {
    const s = window.sessionStorage;
    // Touch it: some browsers only throw on access.
    const probe = "__axiva_probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/** True when the brief can actually be retained across a navigation. */
export function isDraftStorageAvailable(): boolean {
  return getStore() !== null;
}

function safeRead(key: string): string | null {
  const store = getStore();
  if (!store) return null;
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string): boolean {
  const store = getStore();
  if (!store) return false;
  try {
    store.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(key: string): void {
  const store = getStore();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}

/* ── validation ────────────────────────────────────────────────── */

/**
 * Remove only genuinely unsafe control characters. Newlines, carriage returns
 * and tabs are legitimate formatting and are preserved verbatim, as are runs of
 * spaces — an indented brief must survive a round trip unchanged.
 */
export function cleanPromptText(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

/** Length used for validation and for the visible counter. */
export function promptLength(raw: string): number {
  return cleanPromptText(raw).trim().length;
}

export function isPromptWithinLimit(raw: string): boolean {
  return promptLength(raw) <= MAX_PROMPT_LENGTH;
}

function normalisePrompt(raw: unknown): string | null {
  const cleaned = cleanPromptText(raw).trim();
  if (!cleaned) return null;
  if (cleaned.length > MAX_PROMPT_LENGTH) return null; // reject, never truncate
  return cleaned;
}

export function normaliseSettings(raw: unknown): CreateDraftSettings {
  if (!raw || typeof raw !== "object") return {};
  const input = raw as Record<string, unknown>;
  const out: CreateDraftSettings = {};

  if (typeof input.outputType === "string" && OUTPUTS.includes(input.outputType as DraftOutput)) {
    out.outputType = input.outputType as DraftOutput;
  }
  if (typeof input.cardsCount === "number" && Number.isFinite(input.cardsCount)) {
    const n = Math.round(input.cardsCount);
    if ((CARD_COUNT_OPTIONS as readonly number[]).includes(n)) out.cardsCount = n;
  }
  if (typeof input.theme === "string" && Object.prototype.hasOwnProperty.call(THEMES, input.theme)) {
    out.theme = input.theme as ThemeId;
  }
  if (
    typeof input.language === "string" &&
    LANGUAGE_OPTIONS.some((l) => l.value === input.language)
  ) {
    out.language = input.language;
  }
  if (typeof input.density === "string" && DENSITIES.includes(input.density as DraftDensity)) {
    out.density = input.density as DraftDensity;
  }
  if (typeof input.visualsMode === "string" && VISUALS.includes(input.visualsMode as DraftVisuals)) {
    out.visualsMode = input.visualsMode as DraftVisuals;
  }
  if (typeof input.useBrandKit === "boolean") {
    out.useBrandKit = input.useBrandKit;
  }
  return out;
}

/* ── public API ────────────────────────────────────────────────── */

/**
 * Persist the visitor's brief and current settings.
 * Returns a result so callers can tell an over-long brief and an unusable
 * storage apart — neither may be reported to the visitor as success.
 */
export function saveCreateDraft(
  prompt: string,
  settings: CreateDraftSettings = {}
): SaveDraftResult {
  const cleaned = cleanPromptText(prompt);
  if (!cleaned.trim()) return { ok: false, reason: "empty" };
  if (cleaned.trim().length > MAX_PROMPT_LENGTH) return { ok: false, reason: "too_long" };
  const draft: CreateDraft = {
    version: 1,
    prompt: cleaned,
    createdAt: Date.now(),
    settings: normaliseSettings(settings),
  };
  try {
    return safeWrite(DRAFT_STORAGE_KEY, JSON.stringify(draft))
      ? { ok: true }
      : { ok: false, reason: "storage" };
  } catch {
    return { ok: false, reason: "storage" };
  }
}

/** Read the draft. Returns null when missing, malformed, wrong version, or expired. Never mutates storage. */
export function readCreateDraft(now: number = Date.now()): CreateDraft | null {
  const raw = safeRead(DRAFT_STORAGE_KEY);
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  if (obj.version !== 1) return null;

  const prompt = normalisePrompt(obj.prompt);
  if (!prompt) return null;

  const createdAt = typeof obj.createdAt === "number" && Number.isFinite(obj.createdAt) ? obj.createdAt : 0;
  if (!createdAt || now - createdAt > DRAFT_TTL_MS || createdAt > now + 60_000) return null;

  return { version: 1, prompt, createdAt, settings: normaliseSettings(obj.settings) };
}

/** Clear the draft. Call only after successful persistence or explicit discard. */
export function clearCreateDraft(): void {
  safeRemove(DRAFT_STORAGE_KEY);
  safeRemove(LEGACY_PROMPT_KEY);
}

/** Compatibility: older builds stored only a bare prompt string. */
export function readLegacyPrompt(): string | null {
  const value = normalisePrompt(safeRead(LEGACY_PROMPT_KEY));
  return value ? value.trim() : null;
}

/**
 * Validate an internal redirect target.
 * Accepts same-origin absolute paths only. Rejects external URLs,
 * protocol-relative URLs, backslash tricks and control characters —
 * including ones hidden behind percent-encoding.
 */
export function safeInternalPath(raw: string | null | undefined, fallback = "/create"): string {
  if (typeof raw !== "string") return fallback;
  const value = raw.trim();
  if (!value) return fallback;
  if (value.length > 512) return fallback;

  const suspicious = (candidate: string): boolean =>
    /[\u0000-\u001F\u007F]/.test(candidate) ||
    candidate.includes("\\") ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    /^\/+\s*[a-z][a-z0-9+.-]*:/i.test(candidate);

  if (suspicious(value)) return fallback;

  // Decode repeatedly: an attacker can double-encode a control character.
  let decoded = value;
  for (let i = 0; i < 3; i++) {
    let next: string;
    try {
      next = decodeURIComponent(decoded);
    } catch {
      return fallback;
    }
    if (next === decoded) break;
    decoded = next;
    if (suspicious(decoded)) return fallback;
  }
  return value;
}
