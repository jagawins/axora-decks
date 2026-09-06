/**
 * Durable creation intent.
 *
 * A visitor can type a brief on the homepage, be sent through sign-in, come back
 * (same tab, reload, or OAuth round trip) and still find their brief waiting in
 * /create. The draft is versioned, validated, bounded and expires.
 *
 * Rules:
 * - Reading NEVER clears the draft (a failed generation must not lose the brief).
 * - Only successful project persistence, or an explicit discard, clears it.
 * - All storage access is wrapped: storage can throw (private mode, quota, iframes).
 */

export const DRAFT_STORAGE_KEY = "axiva_create_draft_v1";
/** Legacy key written by older homepage builds — read for compatibility only. */
export const LEGACY_PROMPT_KEY = "axiva_prefill_prompt";

export const MAX_PROMPT_LENGTH = 4000;
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export type DraftDensity = "vibes" | "minimal" | "context" | "plenty";
export type DraftVisuals = "none" | "stock" | "ai" | "hybrid";
export type DraftOutput = "presentation" | "social";

export interface CreateDraftSettings {
  outputType?: DraftOutput;
  cardsCount?: number;
  theme?: string;
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

function normalisePrompt(raw: unknown): string {
  if (typeof raw !== "string") return "";
  // Strip control characters, collapse runaway whitespace, bound the length.
  const cleaned = raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]{3,}/g, "  ")
    .trim();
  return cleaned.slice(0, MAX_PROMPT_LENGTH);
}

function normaliseSettings(raw: unknown): CreateDraftSettings {
  if (!raw || typeof raw !== "object") return {};
  const input = raw as Record<string, unknown>;
  const out: CreateDraftSettings = {};

  if (typeof input.outputType === "string" && OUTPUTS.includes(input.outputType as DraftOutput)) {
    out.outputType = input.outputType as DraftOutput;
  }
  if (typeof input.cardsCount === "number" && Number.isFinite(input.cardsCount)) {
    const n = Math.round(input.cardsCount);
    if (n >= 3 && n <= 20) out.cardsCount = n;
  }
  if (typeof input.theme === "string" && input.theme.length > 0 && input.theme.length <= 40) {
    out.theme = input.theme;
  }
  if (typeof input.language === "string" && input.language.length > 0 && input.language.length <= 10) {
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

/** Persist the visitor's brief and current settings. Returns false if storage is unavailable. */
export function saveCreateDraft(
  prompt: string,
  settings: CreateDraftSettings = {}
): boolean {
  const cleanPrompt = normalisePrompt(prompt);
  if (!cleanPrompt) return false;
  const draft: CreateDraft = {
    version: 1,
    prompt: cleanPrompt,
    createdAt: Date.now(),
    settings: normaliseSettings(settings),
  };
  try {
    return safeWrite(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    return false;
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
  const raw = safeRead(LEGACY_PROMPT_KEY);
  const cleaned = normalisePrompt(raw);
  return cleaned || null;
}

/**
 * Validate an internal redirect target.
 * Accepts same-origin absolute paths only. Rejects external URLs,
 * protocol-relative URLs, backslash tricks and control characters.
 */
export function safeInternalPath(raw: string | null | undefined, fallback = "/create"): string {
  if (typeof raw !== "string") return fallback;
  const value = raw.trim();
  if (!value) return fallback;
  if (/[\u0000-\u001F\u007F]/.test(value)) return fallback;
  if (value.includes("\\")) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  // A second colon-scheme sneaking in via encoding
  if (/^\/+\s*[a-z][a-z0-9+.-]*:/i.test(value)) return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.includes("\\") || decoded.startsWith("//")) return fallback;
  } catch {
    return fallback;
  }
  if (value.length > 512) return fallback;
  return value;
}
