// ─── Alignment (Step 1) ─────────────────────────────────────────────
export interface AlignmentData {
  goal: string;
  audience: string;
  outcome: string;
  mustIncludeFacts: string;
  fileExtracts: FileExtract[];
}

export interface FileExtract {
  fileName: string;
  text: string;
}

export const AUDIENCE_OPTIONS = [
  "Board",
  "Investors",
  "C-Suite",
  "Sales prospect",
  "Team",
  "Other",
] as const;
export type AudienceType = (typeof AUDIENCE_OPTIONS)[number];

// ─── Research Brief (Step 2) ────────────────────────────────────────
export interface ResearchFinding {
  title: string;
  detail: string;
  source_url: string | null;
  source_label: "AI-knowledge" | "User document";
  data_points: string[];
  verify_required: boolean;
}

export interface ResearchConflict {
  topic: string;
  positions: string[];
}

export interface ResearchBrief {
  findings: ResearchFinding[];
  conflicts: ResearchConflict[];
  summary: string;
}

// ─── Outline (Step 3) ───────────────────────────────────────────────
export interface OutlineSlide {
  id: string; // stable UUID for dnd-kit
  title: string;
  keyPoints: string[]; // max 3
  dataPoint?: string; // from research brief
}

// Reducer actions
export type OutlineAction =
  | { type: "SET"; slides: OutlineSlide[] }
  | { type: "REORDER"; activeId: string; overId: string }
  | { type: "EDIT_TITLE"; id: string; title: string }
  | { type: "EDIT_POINT"; id: string; pointIndex: number; value: string }
  | { type: "ADD" }
  | { type: "DELETE"; id: string };

// ─── Block Meta Extension ───────────────────────────────────────────
export interface ResearchBlockMeta {
  schema_version: number;
  source_url?: string | null;
  source_label?: string;
  research_mode?: boolean;
  research_session_id?: string;
}

// ─── Wizard State ───────────────────────────────────────────────────
export type WizardStep = 1 | 2 | 3 | 4;

export interface WizardState {
  step: WizardStep;
  sessionId: string;
  alignment: AlignmentData;
  researchBrief: ResearchBrief | null;
  outline: OutlineSlide[];
}
