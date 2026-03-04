/**
 * Usage Gates — Gamma-inspired conversion strategy
 *
 * Conversion philosophy (from competitor research):
 * - Gamma: Credit-based. 400 free credits, every AI action costs credits.
 *   70M users → 600K paying ($102M ARR). Watermark on free exports.
 * - Beautiful.ai: No free plan. 14-day trial forces decision.
 * - Tome: Gave too much free → 25M users, only $3.5M ARR. Cautionary tale.
 *
 * AXIVA strategy: "Reverse trial" hybrid
 * 1. Let users create 3 decks free (experience the magic)
 * 2. Gate premium features with preview-then-pay
 * 3. Watermark free exports
 * 4. Show usage meters everywhere to create awareness
 * 5. Time-limited access to premium features (first 24h)
 */

// ─── Constants ────────────────────────────────────────
export const FREE_LIMITS = {
  maxDecks: 3,
  maxAiGenerations: 5,       // AI generate/regenerate actions
  maxAiImageGenerations: 1,  // AI images — premium tease
  maxSlidesPerDeck: 8,       // Soft cap (paid = unlimited)
  maxExportFormats: ["png"],  // Free = PNG only
  premiumTrialHours: 24,     // First 24h = full access (reverse trial)
  maxThemes: 2,              // Free = 2 themes
  maxTemplates: 3,           // Free = 3 templates
} as const;

const STORAGE_KEYS = {
  deckGenCount: "axiva_deck_gen_count",
  aiGenCount: "axiva_ai_gen_count",
  aiImageCount: "axiva_ai_image_count",
  signupTimestamp: "axiva_signup_ts",
  lastResetDate: "axiva_usage_reset_date",
  dismissedUpgradeBanner: "axiva_dismissed_upgrade_banner",
  seenFeatureGates: "axiva_seen_gates",  // track which gates user has seen
} as const;

// ─── Usage Tracking ───────────────────────────────────

function getStorageInt(key: string): number {
  try { return parseInt(localStorage.getItem(key) || "0", 10); }
  catch { return 0; }
}

function setStorageInt(key: string, val: number): void {
  try { localStorage.setItem(key, String(val)); }
  catch { /* silent */ }
}

function getStorageString(key: string): string | null {
  try { return localStorage.getItem(key); }
  catch { return null; }
}

function setStorageString(key: string, val: string): void {
  try { localStorage.setItem(key, val); }
  catch { /* silent */ }
}

/** Reset daily counters if day changed */
function maybeResetDaily(): void {
  const today = new Date().toISOString().slice(0, 10);
  const lastReset = getStorageString(STORAGE_KEYS.lastResetDate);
  if (lastReset !== today) {
    setStorageInt(STORAGE_KEYS.aiGenCount, 0);
    setStorageInt(STORAGE_KEYS.aiImageCount, 0);
    setStorageString(STORAGE_KEYS.lastResetDate, today);
  }
}

// ─── Deck Generation ──────────────────────────────────

export function getDeckGenCount(): number {
  return getStorageInt(STORAGE_KEYS.deckGenCount);
}

export function incrementDeckGenCount(): number {
  const count = getDeckGenCount() + 1;
  setStorageInt(STORAGE_KEYS.deckGenCount, count);
  return count;
}

export function canGenerateDeck(tier: string): boolean {
  if (tier !== "free") return true;
  return getDeckGenCount() < FREE_LIMITS.maxDecks;
}

export function getDecksRemaining(tier: string): number {
  if (tier !== "free") return -1; // unlimited
  return Math.max(0, FREE_LIMITS.maxDecks - getDeckGenCount());
}

// ─── AI Generation (regenerate, expand, rewrite) ──────

export function getAiGenCount(): number {
  maybeResetDaily();
  return getStorageInt(STORAGE_KEYS.aiGenCount);
}

export function incrementAiGenCount(): number {
  maybeResetDaily();
  const count = getAiGenCount() + 1;
  setStorageInt(STORAGE_KEYS.aiGenCount, count);
  return count;
}

export function canUseAiGen(tier: string): boolean {
  if (tier !== "free") return true;
  return getAiGenCount() < FREE_LIMITS.maxAiGenerations;
}

export function getAiGensRemaining(tier: string): number {
  if (tier !== "free") return -1;
  return Math.max(0, FREE_LIMITS.maxAiGenerations - getAiGenCount());
}

// ─── AI Image Generation ──────────────────────────────

export function getAiImageCount(): number {
  maybeResetDaily();
  return getStorageInt(STORAGE_KEYS.aiImageCount);
}

export function incrementAiImageCount(): number {
  maybeResetDaily();
  const count = getAiImageCount() + 1;
  setStorageInt(STORAGE_KEYS.aiImageCount, count);
  return count;
}

export function canGenerateAiImage(tier: string): boolean {
  if (tier !== "free") return true;
  return getAiImageCount() < FREE_LIMITS.maxAiImageGenerations;
}

// ─── Reverse Trial (first 24h full access) ────────────

export function recordSignup(): void {
  if (!getStorageString(STORAGE_KEYS.signupTimestamp)) {
    setStorageString(STORAGE_KEYS.signupTimestamp, new Date().toISOString());
  }
}

export function isInReverseTrial(): boolean {
  const ts = getStorageString(STORAGE_KEYS.signupTimestamp);
  if (!ts) return false;
  const elapsed = Date.now() - new Date(ts).getTime();
  return elapsed < FREE_LIMITS.premiumTrialHours * 60 * 60 * 1000;
}

export function getReverseTrialHoursLeft(): number {
  const ts = getStorageString(STORAGE_KEYS.signupTimestamp);
  if (!ts) return 0;
  const elapsed = Date.now() - new Date(ts).getTime();
  const remaining = (FREE_LIMITS.premiumTrialHours * 60 * 60 * 1000) - elapsed;
  return Math.max(0, Math.ceil(remaining / (60 * 60 * 1000)));
}

// ─── Feature Gate Tracking ────────────────────────────

export function hasSeenGate(feature: string): boolean {
  try {
    const seen = JSON.parse(getStorageString(STORAGE_KEYS.seenFeatureGates) || "[]");
    return seen.includes(feature);
  } catch { return false; }
}

export function markGateSeen(feature: string): void {
  try {
    const seen = JSON.parse(getStorageString(STORAGE_KEYS.seenFeatureGates) || "[]");
    if (!seen.includes(feature)) {
      seen.push(feature);
      setStorageString(STORAGE_KEYS.seenFeatureGates, JSON.stringify(seen));
    }
  } catch { /* silent */ }
}

// ─── Export Gating ────────────────────────────────────

export function canExportFormat(tier: string, format: "png" | "pdf" | "pptx" | "docx"): boolean {
  if (tier !== "free") return true;
  return FREE_LIMITS.maxExportFormats.includes(format as "png");
}

export function shouldShowWatermark(tier: string): boolean {
  return tier === "free";
}

// ─── Template & Theme Gating ──────────────────────────

export function canAccessTemplate(tier: string, templateIndex: number): boolean {
  if (tier !== "free") return true;
  return templateIndex < FREE_LIMITS.maxTemplates;
}

export function canAccessTheme(tier: string, themeIndex: number): boolean {
  if (tier !== "free") return true;
  return themeIndex < FREE_LIMITS.maxThemes;
}

// ─── Upgrade Banner Dismissal ─────────────────────────

export function isDismissedUpgradeBanner(): boolean {
  const dismissed = getStorageString(STORAGE_KEYS.dismissedUpgradeBanner);
  if (!dismissed) return false;
  // Re-show after 3 days
  const elapsed = Date.now() - new Date(dismissed).getTime();
  return elapsed < 3 * 24 * 60 * 60 * 1000;
}

export function dismissUpgradeBanner(): void {
  setStorageString(STORAGE_KEYS.dismissedUpgradeBanner, new Date().toISOString());
}

// ─── Usage Summary (for dashboard meter) ──────────────

export interface UsageSummary {
  decks: { used: number; limit: number; unlimited: boolean };
  aiGens: { used: number; limit: number; unlimited: boolean };
  aiImages: { used: number; limit: number; unlimited: boolean };
  tier: string;
  inReverseTrial: boolean;
  reverseTrialHoursLeft: number;
}

export function getUsageSummary(tier: string): UsageSummary {
  const unlimited = tier !== "free";
  return {
    decks: { used: getDeckGenCount(), limit: FREE_LIMITS.maxDecks, unlimited },
    aiGens: { used: getAiGenCount(), limit: FREE_LIMITS.maxAiGenerations, unlimited },
    aiImages: { used: getAiImageCount(), limit: FREE_LIMITS.maxAiImageGenerations, unlimited },
    tier,
    inReverseTrial: isInReverseTrial(),
    reverseTrialHoursLeft: getReverseTrialHoursLeft(),
  };
}
