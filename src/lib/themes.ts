export type ThemeId = "classic" | "midnight" | "sand" | "graphite";

export const THEMES: Record<ThemeId, { label: string }> = {
  classic: { label: "Classic" },
  midnight: { label: "Midnight" },
  sand: { label: "Sand" },
  graphite: { label: "Graphite" },
};

export const DEFAULT_THEME: ThemeId = "classic";

// Layout presets – CSS-only density switching, no content regeneration
export type LayoutPresetId = "minimal" | "corporate" | "bold" | "data_focused";

export interface LayoutPreset {
  label: string;
  canvas: string;
  block: string;
}

export const LAYOUT_PRESETS: Record<LayoutPresetId, LayoutPreset> = {
  minimal: {
    label: "Minimal",
    canvas: "max-w-2xl mx-auto space-y-10 text-lg",
    block: "p-8 text-center",
  },
  corporate: {
    label: "Corporate",
    canvas: "max-w-3xl mx-auto space-y-4",
    block: "p-5 text-left",
  },
  bold: {
    label: "Bold",
    canvas: "max-w-3xl mx-auto space-y-6",
    block: "p-6 border-2 border-accent/20 bg-accent/5",
  },
  data_focused: {
    label: "Data-Focused",
    canvas: "max-w-4xl mx-auto space-y-3 text-sm",
    block: "p-3",
  },
};

export const DEFAULT_LAYOUT: LayoutPresetId = "corporate";
