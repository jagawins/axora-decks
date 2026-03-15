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

// ── Category-specific abstract visuals (scale-friendly, no text) ────────────

function StrategyVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col gap-[8%] justify-center px-[12%]">
      {[90, 70, 50, 32].map((w, i) => (
        <div
          key={i}
          className="rounded-sm"
          style={{ width: `${w}%`, height: '14%', backgroundColor: accent, opacity: 0.75 - i * 0.12 }}
        />
      ))}
    </div>
  );
}

function FinancialVisual({ accent }: { accent: string }) {
  const bars = [38, 55, 45, 72, 60, 82];
  return (
    <div className="w-full h-full flex items-end gap-[4%] px-[10%] pb-[12%]">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${h}%`, backgroundColor: accent, opacity: 0.3 + (i / bars.length) * 0.6 }}
        />
      ))}
    </div>
  );
}

function BoardVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full grid grid-cols-2 gap-[8%] p-[12%]">
      {[0.7, 0.55, 0.45, 0.65].map((op, i) => (
        <div
          key={i}
          className="rounded-md"
          style={{ backgroundColor: accent, opacity: op, border: `1px solid ${accent}30` }}
        />
      ))}
    </div>
  );
}

function SalesVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col gap-[6%] justify-center items-center px-[8%]">
      {[100, 76, 52, 30].map((w, i) => (
        <div
          key={i}
          className="rounded-sm mx-auto"
          style={{ width: `${w}%`, height: '15%', backgroundColor: accent, opacity: 0.25 + i * 0.18 }}
        />
      ))}
    </div>
  );
}

function MarketingVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-[10%]">
      <div className="relative w-full" style={{ paddingBottom: '100%' }}>
        {[90, 62, 34].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${size}%`, height: `${size}%`,
              top: `${(100 - size) / 2}%`, left: `${(100 - size) / 2}%`,
              border: `2px solid ${accent}`,
              opacity: 0.15 + i * 0.2,
            }}
          />
        ))}
        <div
          className="absolute rounded-full"
          style={{ width: '18%', height: '18%', top: '41%', left: '41%', backgroundColor: accent, opacity: 0.7 }}
        />
      </div>
    </div>
  );
}

function OperationsVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex flex-col gap-[10%] justify-center px-[12%]">
      {[85, 60, 92].map((w, i) => (
        <div key={i} className="h-[12%] rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${w}%`, backgroundColor: accent, opacity: 0.55 + i * 0.1 }} />
        </div>
      ))}
    </div>
  );
}

function ComparisonVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full flex gap-[4%] px-[8%] py-[10%]">
      <div className="flex-1 flex flex-col gap-[8%] justify-center">
        {[70, 55, 85].map((h, i) => (
          <div key={i} className="rounded-sm" style={{ height: `${h / 4}%`, backgroundColor: accent, opacity: 0.6 }} />
        ))}
      </div>
      <div className="w-px self-stretch" style={{ backgroundColor: accent, opacity: 0.2 }} />
      <div className="flex-1 flex flex-col gap-[8%] justify-center">
        {[55, 80, 45].map((h, i) => (
          <div key={i} className="rounded-sm" style={{ height: `${h / 4}%`, backgroundColor: accent, opacity: 0.35 }} />
        ))}
      </div>
    </div>
  );
}

function GeneralVisual({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full grid grid-cols-2 gap-[8%] p-[12%]">
      {[0.2, 0.35, 0.3, 0.15].map((op, i) => (
        <div
          key={i}
          className="rounded-lg"
          style={{ backgroundColor: accent, opacity: op, border: `1px solid ${accent}20` }}
        />
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
