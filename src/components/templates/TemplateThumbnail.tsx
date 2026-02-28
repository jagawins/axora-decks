import { cn } from '@/lib/utils';

// ── Category → visual style mapping ──────────────────────────────────────────

export type TemplateVisualCategory =
  | 'strategy'
  | 'financial'
  | 'board'
  | 'sales'
  | 'marketing'
  | 'operations'
  | 'comparison'
  | 'general';

interface CategoryStyle {
  accent: string;        // hex
  label: string;         // human label
  bgFrom: string;        // tailwind-safe gradient start
  bgTo: string;
}

const CATEGORY_STYLES: Record<TemplateVisualCategory, CategoryStyle> = {
  strategy:   { accent: '#7C3AED', label: 'Strategy',   bgFrom: 'rgba(124,58,237,0.12)', bgTo: 'rgba(124,58,237,0.04)' },
  financial:  { accent: '#0369A1', label: 'Financial',   bgFrom: 'rgba(3,105,161,0.12)',  bgTo: 'rgba(3,105,161,0.04)' },
  board:      { accent: '#0F766E', label: 'Board',       bgFrom: 'rgba(15,118,110,0.12)', bgTo: 'rgba(15,118,110,0.04)' },
  sales:      { accent: '#B45309', label: 'Sales',       bgFrom: 'rgba(180,83,9,0.12)',   bgTo: 'rgba(180,83,9,0.04)' },
  marketing:  { accent: '#BE185D', label: 'Marketing',   bgFrom: 'rgba(190,24,93,0.12)',  bgTo: 'rgba(190,24,93,0.04)' },
  operations: { accent: '#15803D', label: 'Operations',  bgFrom: 'rgba(21,128,61,0.12)',  bgTo: 'rgba(21,128,61,0.04)' },
  comparison: { accent: '#DC2626', label: 'Comparison',  bgFrom: 'rgba(220,38,38,0.12)',  bgTo: 'rgba(220,38,38,0.04)' },
  general:    { accent: '#4B5563', label: 'General',     bgFrom: 'rgba(75,85,99,0.12)',   bgTo: 'rgba(75,85,99,0.04)' },
};

// Tag-based classification
const TAG_MAP: Record<string, TemplateVisualCategory> = {
  strategy: 'strategy', roadmap: 'strategy', planning: 'strategy', okr: 'strategy',
  transformation: 'strategy', narrative: 'strategy', aop: 'strategy',
  financial: 'financial', revenue: 'financial', metrics: 'financial', budget: 'financial',
  forecast: 'financial', economics: 'financial', pricing: 'financial',
  tam: 'financial', sam: 'financial', som: 'financial', traction: 'financial',
  board: 'board', executive: 'board', governance: 'board', leadership: 'board',
  steering: 'board', summary: 'board',
  sales: 'sales', pitch: 'sales', investor: 'sales', fundraising: 'sales',
  startup: 'sales', pipeline: 'sales', playbook: 'sales', renewal: 'sales',
  raise: 'sales', memo: 'sales',
  marketing: 'marketing', brand: 'marketing', campaign: 'marketing', launch: 'marketing',
  gtm: 'marketing', persona: 'marketing',
  operations: 'operations', hr: 'operations', hiring: 'operations', process: 'operations',
  team: 'operations', implementation: 'operations', kickoff: 'operations', raci: 'operations',
  program: 'operations', project: 'operations', risk: 'operations', raid: 'operations',
  postmortem: 'operations', status: 'operations', charter: 'operations',
  comparison: 'comparison', alternative: 'comparison', vs: 'comparison', competitive: 'comparison',
  battlecard: 'comparison', gamma: 'comparison',
  // Product & Tech keywords
  architecture: 'board', engineering: 'operations', qbr: 'financial',
  prioritization: 'strategy', backlog: 'strategy', integration: 'operations',
  mvp: 'strategy', scope: 'strategy', requirements: 'strategy',
  platform: 'board', api: 'board', design: 'board', technical: 'board',
  security: 'operations', release: 'marketing',
  // AI & Data keywords
  ai: 'board', genai: 'board', rag: 'board', model: 'financial',
  evaluation: 'financial', benchmarks: 'financial', maturity: 'strategy',
  assessment: 'strategy', powerpoint: 'board', ppt: 'board',
  slides: 'board', workflow: 'operations', capability: 'strategy',
  // Demo
  demo: 'general', showcase: 'general',
};

// Category string → visual category (fallback if no tags match)
const CATEGORY_STRING_MAP: Record<string, TemplateVisualCategory> = {
  'Strategy and Leadership': 'strategy',
  'Projects and Operations': 'operations',
  'Product and Technology': 'board',
  'Sales and Marketing': 'marketing',
  'Startup and Fundraising': 'sales',
  'AI and Data': 'board',
  'Demo': 'general',
};

export function inferVisualCategory(category: string, tags: string[]): TemplateVisualCategory {
  // First try tags
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    for (const [keyword, cat] of Object.entries(TAG_MAP)) {
      if (lower.includes(keyword)) return cat;
    }
  }
  // Then try category string
  return CATEGORY_STRING_MAP[category] || 'general';
}

export function getCategoryStyle(cat: TemplateVisualCategory): CategoryStyle {
  return CATEGORY_STYLES[cat];
}

// ── Layout renderers (pure divs, no SVG needed) ─────────────────────────────

function StrategyLayout({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 h-full justify-center">
      {[80, 60, 45].map((w, i) => (
        <div key={i} className="space-y-1">
          <div className="h-3 rounded-full" style={{ width: `${w}%`, backgroundColor: accent, opacity: 0.7 - i * 0.15 }} />
          <div className="h-2 rounded bg-foreground/10" style={{ width: `${w - 15}%` }} />
        </div>
      ))}
    </div>
  );
}

function FinancialLayout({ accent }: { accent: string }) {
  return (
    <div className="flex gap-3 p-4 h-full items-end">
      <div className="flex-1 flex items-end gap-1 h-full pt-4">
        {[40, 60, 50, 75, 65, 85].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${h}%`, backgroundColor: accent, opacity: 0.5 + (i % 2) * 0.3 }}
          />
        ))}
      </div>
      <div className="flex flex-col gap-2 w-[40%]">
        <div className="rounded-lg border p-2 text-center" style={{ borderColor: accent + '40' }}>
          <div className="text-xs font-bold" style={{ color: accent }}>$2.4M</div>
          <div className="text-[8px] text-muted-foreground">Revenue</div>
        </div>
        <div className="rounded-lg border p-2 text-center" style={{ borderColor: accent + '40' }}>
          <div className="text-xs font-bold" style={{ color: accent }}>+18%</div>
          <div className="text-[8px] text-muted-foreground">Growth</div>
        </div>
      </div>
    </div>
  );
}

function BoardLayout({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col gap-2.5 p-4 h-full justify-center">
      <div className="h-4 rounded" style={{ width: '75%', backgroundColor: accent, opacity: 0.8 }} />
      <div className="space-y-1.5 mt-1">
        {[85, 70, 60].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
            <div className="h-2 rounded bg-foreground/10" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SalesLayout({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 h-full justify-center">
      <div className="h-3.5 rounded" style={{ width: '65%', backgroundColor: accent, opacity: 0.8 }} />
      <div className="grid grid-cols-2 gap-2 mt-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-md border p-1.5"
            style={{ borderColor: accent + '30' }}
          >
            <div className="h-1.5 rounded bg-foreground/10 mb-1" style={{ width: '80%' }} />
            <div className="h-1.5 rounded bg-foreground/5" style={{ width: '60%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketingLayout({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 h-full justify-center">
      <div
        className="flex-1 rounded-lg min-h-[50%] flex items-center justify-center"
        style={{ backgroundColor: accent + '18' }}
      >
        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: accent + '30' }} />
      </div>
      <div className="flex gap-2">
        <div className="h-2 rounded bg-foreground/10 flex-1" />
        <div className="h-2 rounded bg-foreground/5 flex-[0.6]" />
      </div>
    </div>
  );
}

function OperationsLayout({ accent }: { accent: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 p-4 h-full">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-lg flex items-center justify-center"
          style={{ backgroundColor: accent + '12' }}
        >
          <div className="w-5 h-5 rounded" style={{ backgroundColor: accent + '30' }} />
        </div>
      ))}
    </div>
  );
}

function ComparisonLayout({ accent }: { accent: string }) {
  return (
    <div className="flex gap-0 p-4 h-full">
      <div className="flex-1 flex flex-col gap-1.5 pr-3 justify-center">
        {[70, 55, 80].map((w, i) => (
          <div key={i} className="h-2 rounded bg-foreground/10" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="w-px self-stretch" style={{ backgroundColor: accent + '40' }} />
      <div className="flex-1 flex flex-col gap-1.5 pl-3 justify-center">
        {[60, 75, 50].map((w, i) => (
          <div key={i} className="h-2 rounded ml-auto" style={{ width: `${w}%`, backgroundColor: accent + '25' }} />
        ))}
      </div>
    </div>
  );
}

function GeneralLayout({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 h-full justify-center">
      <div className="h-3.5 rounded" style={{ width: '55%', backgroundColor: accent, opacity: 0.7 }} />
      <div className="grid grid-cols-3 gap-1.5 mt-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-md aspect-[4/3]"
            style={{ backgroundColor: accent + '15' }}
          />
        ))}
      </div>
    </div>
  );
}

const LAYOUT_MAP: Record<TemplateVisualCategory, React.FC<{ accent: string }>> = {
  strategy: StrategyLayout,
  financial: FinancialLayout,
  board: BoardLayout,
  sales: SalesLayout,
  marketing: MarketingLayout,
  operations: OperationsLayout,
  comparison: ComparisonLayout,
  general: GeneralLayout,
};

// ── Main component ──────────────────────────────────────────────────────────

interface TemplateThumbnailProps {
  category: string;
  tags: string[];
  title: string;
  className?: string;
}

export function TemplateThumbnail({ category, tags, title, className }: TemplateThumbnailProps) {
  const visualCat = inferVisualCategory(category, tags);
  const style = getCategoryStyle(visualCat);
  const Layout = LAYOUT_MAP[visualCat];

  return (
    <div
      className={cn('w-[240px] h-[160px] rounded-xl overflow-hidden relative', className)}
      style={{
        background: `linear-gradient(135deg, ${style.bgFrom}, ${style.bgTo})`,
      }}
      title={title}
    >
      {/* Category badge */}
      <div
        className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
        style={{ backgroundColor: style.accent }}
      >
        {style.label}
      </div>

      <Layout accent={style.accent} />
    </div>
  );
}
