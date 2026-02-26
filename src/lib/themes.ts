export type ThemeId = "classic" | "midnight" | "sand" | "graphite" | "ocean" | "rose" | "forest" | "sunset";

export const THEMES: Record<ThemeId, { label: string; preview: string }> = {
  classic: { label: "Classic", preview: "from-slate-900 to-slate-800" },
  midnight: { label: "Midnight", preview: "from-indigo-950 to-violet-950" },
  sand: { label: "Sand", preview: "from-amber-50 to-orange-50" },
  graphite: { label: "Graphite", preview: "from-neutral-800 to-zinc-900" },
  ocean: { label: "Ocean", preview: "from-cyan-900 to-teal-900" },
  rose: { label: "Rose", preview: "from-rose-50 to-pink-50" },
  forest: { label: "Forest", preview: "from-emerald-950 to-green-950" },
  sunset: { label: "Sunset", preview: "from-orange-500 to-purple-600" },
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
