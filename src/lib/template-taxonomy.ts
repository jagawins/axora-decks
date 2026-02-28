/**
 * Static taxonomy mapping for template filtering.
 * Single source of truth — do NOT derive industry/audience dynamically.
 */

export type Industry = 'healthcare' | 'finance' | 'technology' | 'government' | 'consulting' | 'saas';
export type Audience = 'c-suite' | 'investors' | 'internal' | 'external';

interface TaxonomyEntry {
  industry: Industry[];
  audience: Audience[];
}

// Explicit slug-to-classification mapping
export const TEMPLATE_TAXONOMY: Record<string, TaxonomyEntry> = {
  // Strategy and Leadership
  'executive-summary': { industry: ['consulting', 'technology', 'finance'], audience: ['c-suite'] },
  'board-update': { industry: ['finance', 'technology', 'healthcare'], audience: ['c-suite'] },
  'okrs-qbr': { industry: ['technology', 'saas'], audience: ['c-suite', 'internal'] },
  'strategy-narrative': { industry: ['consulting', 'technology'], audience: ['c-suite', 'investors'] },
  'annual-operating-plan': { industry: ['finance', 'consulting'], audience: ['c-suite'] },
  'change-management': { industry: ['consulting', 'healthcare', 'government'], audience: ['c-suite', 'internal'] },
  'operating-model': { industry: ['consulting', 'finance'], audience: ['c-suite'] },
  'm-and-a-brief': { industry: ['finance', 'consulting'], audience: ['c-suite', 'investors'] },
  'stakeholder-alignment': { industry: ['consulting', 'government'], audience: ['c-suite', 'internal'] },
  'transformation-roadmap': { industry: ['consulting', 'technology'], audience: ['c-suite'] },

  // Sales and Marketing
  'gtm-strategy': { industry: ['saas', 'technology'], audience: ['c-suite', 'internal'] },
  'sales-playbook': { industry: ['saas', 'technology'], audience: ['internal'] },
  'pipeline-review': { industry: ['saas', 'finance'], audience: ['c-suite', 'internal'] },
  'competitive-battlecard': { industry: ['saas', 'technology'], audience: ['internal'] },
  'campaign-report': { industry: ['saas', 'technology'], audience: ['c-suite', 'internal'] },
  'case-study': { industry: ['consulting', 'saas'], audience: ['external'] },
  'persona-brief': { industry: ['saas', 'technology'], audience: ['internal'] },
  'pricing-packaging': { industry: ['saas', 'technology'], audience: ['c-suite', 'internal'] },
  'quarterly-marketing': { industry: ['saas', 'technology'], audience: ['c-suite', 'internal'] },
  'renewal-qbr': { industry: ['saas', 'finance'], audience: ['external', 'c-suite'] },

  // Startup and Fundraising
  'startup-pitch-12': { industry: ['saas', 'technology'], audience: ['investors'] },
  'investor-update': { industry: ['saas', 'technology'], audience: ['investors'] },
  'market-sizing': { industry: ['saas', 'technology', 'finance'], audience: ['investors', 'c-suite'] },
  'fundraising-memo': { industry: ['saas', 'finance'], audience: ['investors'] },
  'problem-solution': { industry: ['saas', 'technology'], audience: ['investors', 'external'] },
  'launch-plan': { industry: ['saas', 'technology'], audience: ['internal'] },
  'partnership-strategy': { industry: ['saas', 'technology'], audience: ['c-suite', 'external'] },
  'unit-economics': { industry: ['saas', 'finance'], audience: ['investors', 'c-suite'] },
  'traction-deck': { industry: ['saas', 'technology'], audience: ['investors'] },

  // Product and Technology
  'product-roadmap': { industry: ['technology', 'saas'], audience: ['c-suite', 'internal'] },
  'architecture-overview': { industry: ['technology'], audience: ['internal'] },
  'feature-prioritization': { industry: ['technology', 'saas'], audience: ['internal'] },
  'engineering-qbr': { industry: ['technology'], audience: ['c-suite', 'internal'] },
  'mvp-definition': { industry: ['saas', 'technology'], audience: ['internal'] },
  'release-notes': { industry: ['technology', 'saas'], audience: ['external', 'internal'] },
  'security-review': { industry: ['technology', 'finance', 'healthcare'], audience: ['c-suite', 'internal'] },
  'api-platform-overview': { industry: ['technology'], audience: ['external', 'internal'] },
  'integration-plan': { industry: ['technology'], audience: ['internal'] },
  'technical-due-diligence': { industry: ['technology', 'finance'], audience: ['investors', 'c-suite'] },

  // Projects and Operations
  'project-kickoff': { industry: ['consulting', 'technology'], audience: ['internal'] },
  'implementation-plan': { industry: ['consulting', 'technology'], audience: ['internal', 'external'] },
  'risk-register': { industry: ['finance', 'government', 'consulting'], audience: ['c-suite', 'internal'] },
  'postmortem': { industry: ['technology', 'saas'], audience: ['internal'] },
  'steering-committee': { industry: ['consulting', 'government'], audience: ['c-suite'] },
  'raid-log': { industry: ['consulting', 'technology'], audience: ['internal'] },
  'decision-memo': { industry: ['consulting', 'finance'], audience: ['c-suite'] },
  'process-improvement': { industry: ['consulting', 'healthcare'], audience: ['internal'] },
  'program-charter': { industry: ['consulting', 'government'], audience: ['c-suite', 'internal'] },
  'team-structure': { industry: ['technology', 'consulting'], audience: ['internal'] },
  'weekly-status': { industry: ['technology', 'consulting'], audience: ['internal'] },

  // AI and Data
  'ai-strategy': { industry: ['technology', 'consulting'], audience: ['c-suite'] },
  'ai-governance': { industry: ['technology', 'government', 'finance'], audience: ['c-suite'] },
  'ai-maturity': { industry: ['technology', 'consulting'], audience: ['c-suite', 'internal'] },
  'genai-use-cases': { industry: ['technology', 'consulting'], audience: ['c-suite', 'internal'] },
  'rag-architecture': { industry: ['technology'], audience: ['internal'] },
  'model-evaluation': { industry: ['technology'], audience: ['internal'] },
  'data-strategy': { industry: ['technology', 'finance'], audience: ['c-suite'] },
  'ai-deck-generator': { industry: ['technology', 'saas'], audience: ['internal', 'external'] },
  'powerpoint-ai': { industry: ['technology', 'consulting'], audience: ['internal', 'external'] },
  'gamma-alternative': { industry: ['technology', 'saas'], audience: ['external'] },
};

// ── Filter dimension definitions ─────────────────────────────────────────────

export const DECK_TYPE_FILTERS = [
  { id: 'all', label: 'All Templates' },
  { id: 'Strategy and Leadership', label: 'Strategy & Leadership' },
  { id: 'Sales and Marketing', label: 'Sales & Marketing' },
  { id: 'Startup and Fundraising', label: 'Startup & Fundraising' },
  { id: 'Product and Technology', label: 'Product & Technology' },
  { id: 'Projects and Operations', label: 'Projects & Operations' },
  { id: 'AI and Data', label: 'AI & Data' },
] as const;

export const INDUSTRY_FILTERS: { id: Industry | 'all'; label: string }[] = [
  { id: 'all', label: 'All Industries' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'finance', label: 'Finance & Banking' },
  { id: 'technology', label: 'Technology' },
  { id: 'government', label: 'Government' },
  { id: 'consulting', label: 'Consulting' },
  { id: 'saas', label: 'SaaS / Startups' },
];

export const AUDIENCE_FILTERS: { id: Audience | 'all'; label: string }[] = [
  { id: 'all', label: 'All Audiences' },
  { id: 'c-suite', label: 'C-Suite / Board' },
  { id: 'investors', label: 'Investors / VCs' },
  { id: 'internal', label: 'Internal Teams' },
  { id: 'external', label: 'External Clients' },
];

export const SORT_OPTIONS = [
  { id: 'popular', label: 'Popular' },
  { id: 'newest', label: 'Newest' },
  { id: 'az', label: 'A → Z' },
] as const;

export type SortOption = typeof SORT_OPTIONS[number]['id'];

/**
 * Get taxonomy for a template slug. Returns a default if not mapped.
 */
export function getTemplateTaxonomy(slug: string): TaxonomyEntry {
  return TEMPLATE_TAXONOMY[slug] || { industry: [], audience: [] };
}
