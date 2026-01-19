import { BlockType } from "@/lib/ai-engine";

export interface BlockTemplate {
  id: string;
  name: string;
  type: BlockType;
  instruction: string;
}

// Templates organized by block type
export const BLOCK_TEMPLATES: BlockTemplate[] = [
  // Heading templates
  {
    id: "heading-executive-title",
    name: "Executive Slide Title",
    type: "heading",
    instruction: "Rewrite as a strong, action-oriented executive slide title. Use 5-8 words. Lead with outcome or impact. No punctuation at end.",
  },
  {
    id: "heading-section-divider",
    name: "Section Divider",
    type: "heading",
    instruction: "Rewrite as a clear section divider heading. Use 2-4 words. Should signal a major topic transition. Simple and bold.",
  },
  {
    id: "heading-one-line-takeaway",
    name: "One Line Takeaway",
    type: "heading",
    instruction: "Rewrite as a memorable one-line takeaway. Capture the single most important insight. Make it quotable and impactful.",
  },

  // Text templates
  {
    id: "text-executive-summary",
    name: "Executive Summary",
    type: "text",
    instruction: "Rewrite as a crisp executive summary. Lead with the key insight. Maximum 3 sentences. Use active voice. Eliminate jargon.",
  },
  {
    id: "text-problem-statement",
    name: "Problem Statement",
    type: "text",
    instruction: "Rewrite as a clear problem statement. State the core problem in the first sentence. Quantify impact if possible. Keep under 3 sentences.",
  },
  {
    id: "text-recommendation",
    name: "Recommendation",
    type: "text",
    instruction: "Rewrite as a direct recommendation. Start with 'We recommend...' or equivalent. Include one key reason. Be specific and actionable.",
  },
  {
    id: "text-risks-mitigations",
    name: "Risks and Mitigations",
    type: "text",
    instruction: "Rewrite to highlight key risks and their mitigations. Format: Risk followed by mitigation. Keep concise and balanced.",
  },
  {
    id: "text-next-steps",
    name: "Next Steps",
    type: "text",
    instruction: "Rewrite as clear next steps. Each action should be specific with owner or timeline implied. Use imperative voice.",
  },

  // List templates
  {
    id: "list-key-points",
    name: "Key Points",
    type: "list",
    instruction: "Rewrite as key points. Each item should be 5-10 words. Start each with a strong verb or noun. No sub-bullets. Maximum 5 items.",
  },
  {
    id: "list-benefits",
    name: "Benefits",
    type: "list",
    instruction: "Rewrite as a benefits list. Start each item with a quantifiable outcome or clear advantage. Focus on value to the audience. Maximum 5 items.",
  },
  {
    id: "list-requirements",
    name: "Requirements",
    type: "list",
    instruction: "Rewrite as requirements. Each item should be specific and measurable. Use 'must' or 'shall' language. Keep items brief.",
  },
  {
    id: "list-risks",
    name: "Risks",
    type: "list",
    instruction: "Rewrite as a risk list. Each item should identify a specific risk. Order by impact or likelihood. Keep each under 10 words.",
  },
  {
    id: "list-milestones",
    name: "Milestones",
    type: "list",
    instruction: "Rewrite as milestones. Each item should be a deliverable with implied timeline. Use past or future tense. Keep chronological.",
  },

  // Callout templates
  {
    id: "callout-key-insight",
    name: "Key Insight",
    type: "callout",
    instruction: "Rewrite as a key insight callout. Distill to the single most important revelation. Make it memorable. Under 20 words. Use icon: info.",
  },
  {
    id: "callout-warning",
    name: "Warning",
    type: "callout",
    instruction: "Rewrite as a warning callout. Clearly state what could go wrong. Be direct but not alarmist. Under 20 words. Use icon: warning.",
  },
  {
    id: "callout-success-metric",
    name: "Success Metric",
    type: "callout",
    instruction: "Rewrite as a success metric callout. Highlight the key number or KPI. Include target or achievement. Under 20 words. Use icon: success.",
  },

  // Two column templates
  {
    id: "two_col-pros-cons",
    name: "Pros vs Cons",
    type: "two_col",
    instruction: "Rewrite as pros vs cons format. Left column: advantages (3-4 points). Right column: disadvantages (3-4 points). Keep balanced and brief.",
  },
  {
    id: "two_col-now-next",
    name: "Now vs Next",
    type: "two_col",
    instruction: "Rewrite as now vs next comparison. Left column: current state. Right column: future state or recommendation. Show clear progression.",
  },
  {
    id: "two_col-problem-solution",
    name: "Problem vs Solution",
    type: "two_col",
    instruction: "Rewrite as problem vs solution format. Left column: the problem or pain point. Right column: the proposed solution. Keep parallel structure.",
  },

  // Table templates
  {
    id: "table-options-comparison",
    name: "Options Comparison",
    type: "table",
    instruction: "Rewrite as an options comparison table. First column: option names. Other columns: evaluation criteria. Keep cells to 1-3 words. Clear winner should emerge.",
  },
  {
    id: "table-raci",
    name: "RACI Matrix",
    type: "table",
    instruction: "Rewrite as a RACI matrix. Rows: tasks/activities. Columns: stakeholder roles. Cells contain only R, A, C, or I. Keep focused on key activities.",
  },
  {
    id: "table-timeline",
    name: "Timeline",
    type: "table",
    instruction: "Rewrite as a timeline table. Columns: Phase/Date, Activity, Owner/Status. Keep cells brief. Show clear progression of work.",
  },
];

// Get templates filtered by block type
export function getTemplatesForType(blockType: BlockType): BlockTemplate[] {
  return BLOCK_TEMPLATES.filter((t) => t.type === blockType);
}

// Get a specific template by ID
export function getTemplateById(templateId: string): BlockTemplate | undefined {
  return BLOCK_TEMPLATES.find((t) => t.id === templateId);
}
