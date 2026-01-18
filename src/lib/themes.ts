export type ThemeId = "classic" | "midnight" | "sand" | "graphite";

export const THEMES: Record<ThemeId, { label: string }> = {
  classic: { label: "Classic" },
  midnight: { label: "Midnight" },
  sand: { label: "Sand" },
  graphite: { label: "Graphite" },
};

export const DEFAULT_THEME: ThemeId = "classic";
