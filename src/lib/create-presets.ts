/**
 * Optional configuration shortcuts for the creation form.
 *
 * A preset only sets existing builder settings (slide count, density and the
 * base defaults). It NEVER touches the visitor's brief and never introduces
 * claims, facts or example content. The brand-kit preference is deliberately
 * kept out of presets so applying one cannot override it.
 */

import { DEFAULT_THEME, type ThemeId } from "@/lib/themes";
import type { DraftDensity, DraftOutput, DraftVisuals } from "@/lib/create-draft";

export interface PresetConfig {
  outputType: DraftOutput;
  cardsCount: number;
  theme: ThemeId;
  language: string;
  density: DraftDensity;
  visualsMode: DraftVisuals;
}

export type PresetId = "executive" | "investor" | "strategy";

/** Base defaults shared by every preset: existing classic theme, English US, stock visuals, presentation. */
export const BASE_DEFAULTS: PresetConfig = {
  outputType: "presentation",
  cardsCount: 10,
  theme: DEFAULT_THEME,
  language: "en-US",
  density: "context",
  visualsMode: "stock",
};

export const CREATE_PRESETS: {
  id: PresetId;
  label: string;
  summary: string;
  recommended?: boolean;
  config: PresetConfig;
}[] = [
  {
    id: "executive",
    label: "Executive update",
    summary: "10 slides · a little context",
    recommended: true,
    config: { ...BASE_DEFAULTS, cardsCount: 10, density: "context" },
  },
  {
    id: "investor",
    label: "Investor pitch",
    summary: "10 slides · minimal text",
    config: { ...BASE_DEFAULTS, cardsCount: 10, density: "minimal" },
  },
  {
    id: "strategy",
    label: "Strategy review",
    summary: "8 slides · a little context",
    config: { ...BASE_DEFAULTS, cardsCount: 8, density: "context" },
  },
];

export const RECOMMENDED_PRESET: PresetId = "executive";

/**
 * Which preset, if any, exactly matches the current settings.
 * Returns null for a custom combination, so the UI can show "Custom".
 */
export function matchPreset(current: PresetConfig): PresetId | null {
  const found = CREATE_PRESETS.find(
    (p) =>
      p.config.outputType === current.outputType &&
      p.config.cardsCount === current.cardsCount &&
      p.config.theme === current.theme &&
      p.config.language === current.language &&
      p.config.density === current.density &&
      p.config.visualsMode === current.visualsMode
  );
  return found ? found.id : null;
}
