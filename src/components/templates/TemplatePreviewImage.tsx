import { type TemplateBlock } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { inferVisualCategory, getCategoryStyle, type TemplateVisualCategory } from './TemplateThumbnail';

interface TemplatePreviewImageProps {
  templateId: string;
  templateVersion?: number;
  themeId?: string;
  previewUrl?: string | null;
  blocks: TemplateBlock[];
  title?: string;
  category?: string;
  tags?: string[];
  className?: string;
}

// Curated background styles for cover slides
const COVER_STYLES = [
  { bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', text: '#ffffff', sub: '#94a3b8' },
  { bg: 'linear-gradient(145deg, #0d1b2a 0%, #1b2838 40%, #1a3c40 100%)', text: '#ffffff', sub: '#7dd3c0' },
  { bg: 'linear-gradient(130deg, #1c1c1c 0%, #2d2d2d 60%, #3a3a3a 100%)', text: '#ffffff', sub: '#a1a1a1' },
  { bg: 'linear-gradient(140deg, #0a192f 0%, #112240 50%, #1d3461 100%)', text: '#e2e8f0', sub: '#64748b' },
  { bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', text: '#f1f5f9', sub: '#94a3b8' },
  { bg: 'linear-gradient(145deg, #1a0a0a 0%, #2d1515 50%, #4a1c2c 100%)', text: '#fce4ec', sub: '#e57373' },
  { bg: 'linear-gradient(140deg, #0a1a0a 0%, #1b2e1b 50%, #2e4a2e 100%)', text: '#e8f5e9', sub: '#81c784' },
  { bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #3d2b5e 100%)', text: '#f3e8ff', sub: '#c084fc' },
  { bg: 'linear-gradient(130deg, #111827 0%, #1e3a5f 60%, #2563eb 100%)', text: '#ffffff', sub: '#93c5fd' },
  { bg: 'linear-gradient(145deg, #0c0c0c 0%, #1a1a1a 40%, #262626 100%)', text: '#ffffff', sub: '#737373' },
  { bg: 'linear-gradient(135deg, #0a1628 0%, #0e2a4a 50%, #0c4a6e 100%)', text: '#e0f2fe', sub: '#7dd3fc' },
  { bg: 'linear-gradient(140deg, #1c1410 0%, #2c2018 50%, #44362a 100%)', text: '#fef3c7', sub: '#d97706' },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ── Category-specific visual illustrations ──────────────────────────────────

function StrategyVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col gap-2.5 justify-center px-3">
      {[
        { w: 88, label: 'Vision' },
        { w: 72, label: 'Strategy' },
        { w: 56, label: 'Execution' },
      ].map((bar, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="h-5 rounded-md flex items-center px-2 shrink-0"
            style={{
              width: `${bar.w}%`,
              backgroundColor: accent,
              opacity: 0.8 - i * 0.15,
            }}
          >
            <span className="text-[7px] font-bold text-white/90 uppercase tracking-wider whitespace-nowrap">
              {bar.label}
            </span>
          </div>
        </div>
      ))}
      <div className="flex gap-1.5 mt-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{ backgroundColor: accent, opacity: 0.2 + i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
}

function FinancialVisual({ accent }: { accent: string }) {
  const bars = [35, 52, 44, 68, 58, 78, 72, 90];
  return (
    <div className="w-full h-full flex flex-col justify-end px-3 pb-3 pt-2">
      <div className="flex items-end gap-[3px] flex-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all"
            style={{
              height: `${h}%`,
              backgroundColor: accent,
              opacity: 0.35 + (i / bars.length) * 0.55,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <div className="rounded-md px-2 py-1" style={{ backgroundColor: accent + '20' }}>
          <div className="text-[9px] font-bold" style={{ color: accent }}>$4.2M</div>
        </div>
        <div className="rounded-md px-2 py-1" style={{ backgroundColor: accent + '20' }}>
          <div className="text-[9px] font-bold" style={{ color: accent }}>↑ 24%</div>
        </div>
      </div>
    </div>
  );
}

function BoardVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col gap-2 justify-center px-3">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { val: '94%', lbl: 'On Track' },
          { val: '3/5', lbl: 'Resolved' },
          { val: '↑12%', lbl: 'Revenue' },
          { val: '4.8', lbl: 'NPS' },
        ].map((kpi, i) => (
          <div
            key={i}
            className="rounded-md p-1.5 text-center"
            style={{ backgroundColor: accent + '15', border: `1px solid ${accent}25` }}
          >
            <div className="text-[9px] font-bold" style={{ color: accent }}>{kpi.val}</div>
            <div className="text-[6px] text-white/40 uppercase tracking-wide">{kpi.lbl}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent, opacity: 0.5 + i * 0.15 }} />
            <div className="h-1 rounded bg-white/10" style={{ width: `${20 + i * 8}px` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SalesVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col justify-center px-3 gap-2">
      {/* Funnel shape */}
      {[
        { w: '100%', label: 'Leads', opacity: 0.3 },
        { w: '78%', label: 'Qualified', opacity: 0.5 },
        { w: '52%', label: 'Pipeline', opacity: 0.7 },
        { w: '30%', label: 'Closed', opacity: 0.9 },
      ].map((stage, i) => (
        <div key={i} className="flex items-center gap-2 mx-auto" style={{ width: stage.w }}>
          <div
            className="w-full h-4 rounded-sm flex items-center justify-center"
            style={{ backgroundColor: accent, opacity: stage.opacity }}
          >
            <span className="text-[6px] font-bold text-white/90 uppercase tracking-wider">{stage.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MarketingVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center px-3">
      <div className="relative w-full aspect-square max-w-[90%]">
        {/* Concentric circles */}
        {[100, 72, 44].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${size}%`,
              height: `${size}%`,
              top: `${(100 - size) / 2}%`,
              left: `${(100 - size) / 2}%`,
              border: `1.5px solid ${accent}`,
              opacity: 0.2 + i * 0.2,
            }}
          />
        ))}
        <div
          className="absolute rounded-full"
          style={{
            width: '20%',
            height: '20%',
            top: '40%',
            left: '40%',
            backgroundColor: accent,
            opacity: 0.7,
          }}
        />
        {/* Orbit dots */}
        {[0, 60, 120, 200, 290].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x = 50 + 40 * Math.cos(rad);
          const y = 50 + 40 * Math.sin(rad);
          return (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                backgroundColor: accent,
                opacity: 0.5 + i * 0.1,
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function OperationsVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col gap-2 justify-center px-3">
      {/* Process flow */}
      <div className="flex items-center gap-1">
        {['Plan', 'Build', 'Ship', 'Learn'].map((step, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className="rounded-md px-1.5 py-1 text-center"
              style={{ backgroundColor: accent, opacity: 0.4 + i * 0.15 }}
            >
              <span className="text-[6px] font-bold text-white/90 uppercase">{step}</span>
            </div>
            {i < 3 && (
              <div className="text-[8px]" style={{ color: accent, opacity: 0.5 }}>→</div>
            )}
          </div>
        ))}
      </div>
      {/* Status bars */}
      <div className="space-y-1.5 mt-1">
        {[85, 62, 94].map((pct, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-2 rounded-full bg-white/5 flex-1">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: accent, opacity: 0.6 }}
              />
            </div>
            <span className="text-[7px] font-medium" style={{ color: accent, opacity: 0.8 }}>{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex gap-2 px-3 py-3">
      <div className="flex-1 flex flex-col gap-1.5 justify-center">
        <div className="text-[7px] font-bold uppercase tracking-wider text-center" style={{ color: accent }}>Option A</div>
        {[70, 55, 85, 60].map((w, i) => (
          <div key={i} className="h-2 rounded-sm mx-auto" style={{ width: `${w}%`, backgroundColor: accent, opacity: 0.5 }} />
        ))}
      </div>
      <div className="w-px self-stretch" style={{ backgroundColor: accent, opacity: 0.2 }} />
      <div className="flex-1 flex flex-col gap-1.5 justify-center">
        <div className="text-[7px] font-bold uppercase tracking-wider text-center" style={{ color: accent, opacity: 0.6 }}>Option B</div>
        {[60, 80, 45, 75].map((w, i) => (
          <div key={i} className="h-2 rounded-sm mx-auto" style={{ width: `${w}%`, backgroundColor: accent, opacity: 0.3 }} />
        ))}
      </div>
    </div>
  );
}

function GeneralVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full grid grid-cols-2 gap-1.5 p-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-lg flex items-center justify-center"
          style={{ backgroundColor: accent + '12', border: `1px solid ${accent}18` }}
        >
          <div
            className="w-6 h-6 rounded-md"
            style={{ backgroundColor: accent, opacity: 0.15 + i * 0.08 }}
          />
        </div>
      ))}
    </div>
  );
}

const VISUAL_MAP: Record<TemplateVisualCategory, React.FC<{ accent: string }>> = {
  strategy: StrategyVisual,
  financial: FinancialVisual,
  board: BoardVisual,
  sales: SalesVisual,
  marketing: MarketingVisual,
  operations: OperationsVisual,
  comparison: ComparisonVisual,
  general: GeneralVisual,
};

/**
 * Renders a polished cover card for template thumbnails.
 * Split layout: text left, category visual right.
 */
export function TemplatePreviewImage({
  templateId,
  themeId,
  previewUrl,
  blocks,
  title,
  category,
  tags = [],
  className = '',
}: TemplatePreviewImageProps) {
  if (previewUrl) {
    return (
      <div className={cn("relative aspect-video bg-muted rounded-xl overflow-hidden", className)}>
        <img src={previewUrl} alt="Template preview" className="w-full h-full object-cover" />
      </div>
    );
  }

  const displayTitle = title || extractTitle(blocks) || 'Untitled Template';
  const subtitle = extractSubtitle(blocks, displayTitle);

  const hash = hashString(templateId);
  const styleIndex = hash % COVER_STYLES.length;
  const coverStyle = COVER_STYLES[styleIndex];
  const visualCat = inferVisualCategory(category || '', tags);
  const catStyle = getCategoryStyle(visualCat);
  const Visual = VISUAL_MAP[visualCat];

  return (
    <div
      className={cn("relative aspect-video w-full overflow-hidden select-none", className)}
      style={{ background: coverStyle.bg }}
    >
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(${catStyle.accent} 0.5px, transparent 0.5px)`,
        backgroundSize: '12px 12px',
      }} />

      {/* Split layout container */}
      <div className="absolute inset-0 flex z-10">
        {/* Left: Text content — ~58% */}
        <div className="flex-[1.4] flex flex-col justify-center px-[8%] py-[8%] min-w-0">
          {/* Category pill */}
          {category && (
            <div
              className="inline-flex self-start px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase mb-2.5"
              style={{
                backgroundColor: catStyle.accent + '22',
                color: catStyle.accent,
                border: `1px solid ${catStyle.accent}35`,
              }}
            >
              {catStyle.label}
            </div>
          )}

          {/* Title */}
          <h3
            className="font-bold leading-[1.12] tracking-tight"
            style={{
              color: coverStyle.text,
              fontSize: displayTitle.length > 35 ? '1.1rem' : displayTitle.length > 22 ? '1.3rem' : '1.5rem',
            }}
          >
            {displayTitle}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p
              className="mt-1.5 text-[10px] leading-relaxed line-clamp-2 max-w-[95%]"
              style={{ color: coverStyle.sub }}
            >
              {subtitle}
            </p>
          )}

          {/* Accent bar */}
          <div
            className="mt-3 h-0.5 w-10 rounded-full"
            style={{ backgroundColor: catStyle.accent }}
          />
        </div>

        {/* Right: Visual illustration — ~42% */}
        <div className="flex-1 relative overflow-hidden">
          {/* Glow backdrop */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              background: `radial-gradient(ellipse at center, ${catStyle.accent}, transparent 70%)`,
            }}
          />
          {/* Divider line */}
          <div
            className="absolute top-[15%] bottom-[15%] left-0 w-px"
            style={{ backgroundColor: catStyle.accent + '20' }}
          />
          <Visual accent={catStyle.accent} />
        </div>
      </div>
    </div>
  );
}

function extractTitle(blocks: TemplateBlock[]): string | null {
  for (const b of blocks) {
    const payload = b.block_payload || (b.content as any) || {};
    if (b.type === 'heading' && payload.text) return payload.text;
    if (b.type === 'hero_header' && (payload.headline || payload.title)) return payload.headline || payload.title;
    if (b.type === 'exec_summary' && payload.title) return payload.title;
  }
  return null;
}

function extractSubtitle(blocks: TemplateBlock[], titleText: string): string | null {
  for (const b of blocks) {
    const payload = b.block_payload || (b.content as any) || {};
    if (b.type === 'text' && payload.text && payload.text !== titleText) {
      return payload.text.slice(0, 120);
    }
    if (b.type === 'hero_header' && payload.subtitle) return payload.subtitle;
    if (b.type === 'exec_summary' && payload.summary) return payload.summary.slice(0, 120);
    if (b.type === 'heading' && payload.text && payload.text !== titleText) {
      return payload.text;
    }
  }
  return null;
}
