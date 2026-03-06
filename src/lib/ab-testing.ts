/**
 * A/B Testing Framework
 * 
 * Assigns users to deterministic variant buckets per experiment.
 * Tracks impressions, clicks, and conversions in localStorage.
 * Designed for weekly iteration on conversion touchpoints.
 */

// ─── Types ────────────────────────────────────────────

export interface Experiment {
  id: string;
  variants: string[];
}

export interface ABEvent {
  experimentId: string;
  variant: string;
  action: "impression" | "click" | "dismiss" | "convert";
  timestamp: number;
  context?: string;
}

export interface VariantStats {
  variant: string;
  impressions: number;
  clicks: number;
  dismissals: number;
  conversions: number;
  ctr: number; // click-through rate
}

export interface ExperimentReport {
  experimentId: string;
  startDate: string;
  variants: VariantStats[];
  totalImpressions: number;
  totalClicks: number;
  winningVariant: string | null;
}

// ─── Experiments Registry ─────────────────────────────

export const EXPERIMENTS: Record<string, Experiment> = {
  usage_meter_copy: {
    id: "usage_meter_copy",
    variants: ["control", "scarcity", "value"],
  },
  post_gen_banner: {
    id: "post_gen_banner",
    variants: ["control", "executive_focus", "social_proof"],
  },
  editor_nudge: {
    id: "editor_nudge",
    variants: ["control", "boardroom", "roi"],
  },
  upgrade_gate_cta: {
    id: "upgrade_gate_cta",
    variants: ["control", "trial_emphasis", "feature_preview"],
  },
};

// ─── Storage Keys ─────────────────────────────────────

const VARIANT_KEY = "axiva_ab_variants";
const EVENTS_KEY = "axiva_ab_events";
const AB_START_KEY = "axiva_ab_start";

// ─── Variant Assignment ───────────────────────────────

function getAssignments(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(VARIANT_KEY) || "{}");
  } catch { return {}; }
}

function setAssignments(a: Record<string, string>): void {
  try { localStorage.setItem(VARIANT_KEY, JSON.stringify(a)); }
  catch { /* silent */ }
}

/** Deterministically assign user to a variant (sticky per experiment) */
export function getVariant(experimentId: string): string {
  const exp = EXPERIMENTS[experimentId];
  if (!exp) return "control";

  const assignments = getAssignments();
  if (assignments[experimentId]) return assignments[experimentId];

  // Random assignment, sticky for this user
  const idx = Math.floor(Math.random() * exp.variants.length);
  assignments[experimentId] = exp.variants[idx];
  setAssignments(assignments);

  // Record start date if first experiment
  if (!localStorage.getItem(AB_START_KEY)) {
    localStorage.setItem(AB_START_KEY, new Date().toISOString());
  }

  return assignments[experimentId];
}

// ─── Event Tracking ───────────────────────────────────

function getEvents(): ABEvent[] {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
  } catch { return []; }
}

function appendEvent(event: ABEvent): void {
  try {
    const events = getEvents();
    events.push(event);
    // Keep last 500 events to avoid localStorage bloat
    const trimmed = events.slice(-500);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
  } catch { /* silent */ }
}

export function trackABEvent(
  experimentId: string,
  action: ABEvent["action"],
  context?: string
): void {
  const variant = getVariant(experimentId);
  appendEvent({
    experimentId,
    variant,
    action,
    timestamp: Date.now(),
    context,
  });
}

// ─── Reporting ────────────────────────────────────────

export function getExperimentReport(experimentId: string): ExperimentReport {
  const exp = EXPERIMENTS[experimentId];
  if (!exp) {
    return {
      experimentId,
      startDate: "",
      variants: [],
      totalImpressions: 0,
      totalClicks: 0,
      winningVariant: null,
    };
  }

  const events = getEvents().filter(e => e.experimentId === experimentId);
  const startDate = localStorage.getItem(AB_START_KEY) || new Date().toISOString();

  const variantStats: VariantStats[] = exp.variants.map(variant => {
    const varEvents = events.filter(e => e.variant === variant);
    const impressions = varEvents.filter(e => e.action === "impression").length;
    const clicks = varEvents.filter(e => e.action === "click").length;
    const dismissals = varEvents.filter(e => e.action === "dismiss").length;
    const conversions = varEvents.filter(e => e.action === "convert").length;
    return {
      variant,
      impressions,
      clicks,
      dismissals,
      conversions,
      ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
    };
  });

  const totalImpressions = variantStats.reduce((s, v) => s + v.impressions, 0);
  const totalClicks = variantStats.reduce((s, v) => s + v.clicks, 0);

  // Determine winner by CTR (need minimum 10 impressions)
  const eligible = variantStats.filter(v => v.impressions >= 10);
  const winningVariant = eligible.length > 0
    ? eligible.sort((a, b) => b.ctr - a.ctr)[0].variant
    : null;

  return {
    experimentId,
    startDate,
    variants: variantStats,
    totalImpressions,
    totalClicks,
    winningVariant,
  };
}

export function getAllExperimentReports(): ExperimentReport[] {
  return Object.keys(EXPERIMENTS).map(getExperimentReport);
}

// ─── Conversion Funnel ────────────────────────────────

const FUNNEL_KEY = "axiva_conversion_funnel";

export interface FunnelEvent {
  step: "visit" | "signup" | "first_deck" | "second_deck" | "hit_limit" | "pricing_view" | "checkout_start" | "paid";
  timestamp: number;
}

export function trackFunnelStep(step: FunnelEvent["step"]): void {
  try {
    const events: FunnelEvent[] = JSON.parse(localStorage.getItem(FUNNEL_KEY) || "[]");
    // Don't duplicate steps
    if (!events.some(e => e.step === step)) {
      events.push({ step, timestamp: Date.now() });
      localStorage.setItem(FUNNEL_KEY, JSON.stringify(events));
    }
  } catch { /* silent */ }
}

export function getFunnelEvents(): FunnelEvent[] {
  try {
    return JSON.parse(localStorage.getItem(FUNNEL_KEY) || "[]");
  } catch { return []; }
}

export function getConversionRate(): { freeUsers: number; paidUsers: number; rate: number } {
  const events = getFunnelEvents();
  const hasSignup = events.some(e => e.step === "signup");
  const hasPaid = events.some(e => e.step === "paid");
  // This is per-user tracking; aggregate would come from the DB
  return {
    freeUsers: hasSignup ? 1 : 0,
    paidUsers: hasPaid ? 1 : 0,
    rate: hasSignup && hasPaid ? 100 : 0,
  };
}
