import { type TemplateBlock } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { inferVisualCategory, getCategoryStyle } from './TemplateThumbnail';

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

// Curated background styles for cover slides — each produces a distinct, polished look
const COVER_STYLES = [
  // Dark corporate
  { bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', text: '#ffffff', sub: '#94a3b8' },
  // Deep teal
  { bg: 'linear-gradient(145deg, #0d1b2a 0%, #1b2838 40%, #1a3c40 100%)', text: '#ffffff', sub: '#7dd3c0' },
  // Warm charcoal
  { bg: 'linear-gradient(130deg, #1c1c1c 0%, #2d2d2d 60%, #3a3a3a 100%)', text: '#ffffff', sub: '#a1a1a1' },
  // Navy blue
  { bg: 'linear-gradient(140deg, #0a192f 0%, #112240 50%, #1d3461 100%)', text: '#e2e8f0', sub: '#64748b' },
  // Slate dark
  { bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', text: '#f1f5f9', sub: '#94a3b8' },
  // Rich burgundy
  { bg: 'linear-gradient(145deg, #1a0a0a 0%, #2d1515 50%, #4a1c2c 100%)', text: '#fce4ec', sub: '#e57373' },
  // Forest
  { bg: 'linear-gradient(140deg, #0a1a0a 0%, #1b2e1b 50%, #2e4a2e 100%)', text: '#e8f5e9', sub: '#81c784' },
  // Midnight purple
  { bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #3d2b5e 100%)', text: '#f3e8ff', sub: '#c084fc' },
  // Steel blue
  { bg: 'linear-gradient(130deg, #111827 0%, #1e3a5f 60%, #2563eb 100%)', text: '#ffffff', sub: '#93c5fd' },
  // Obsidian
  { bg: 'linear-gradient(145deg, #0c0c0c 0%, #1a1a1a 40%, #262626 100%)', text: '#ffffff', sub: '#737373' },
  // Ocean deep
  { bg: 'linear-gradient(135deg, #0a1628 0%, #0e2a4a 50%, #0c4a6e 100%)', text: '#e0f2fe', sub: '#7dd3fc' },
  // Warm dark
  { bg: 'linear-gradient(140deg, #1c1410 0%, #2c2018 50%, #44362a 100%)', text: '#fef3c7', sub: '#d97706' },
];

// Decorative patterns for visual variety
function getDecorativeElements(styleIndex: number, accent: string) {
  const patterns = [
    // Diagonal lines
    <div key="d" className="absolute inset-0 opacity-[0.04]" style={{
      backgroundImage: `repeating-linear-gradient(45deg, ${accent} 0, ${accent} 1px, transparent 0, transparent 50%)`,
      backgroundSize: '24px 24px',
    }} />,
    // Corner accent
    <><div key="c1" className="absolute top-0 right-0 w-1/3 h-full opacity-[0.08]" style={{
      background: `linear-gradient(to left, ${accent}, transparent)`,
    }} /><div key="c2" className="absolute bottom-0 left-0 w-24 h-1 rounded-full opacity-60" style={{ backgroundColor: accent }} /></>,
    // Dot grid
    <div key="dots" className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: `radial-gradient(${accent} 1px, transparent 1px)`,
      backgroundSize: '20px 20px',
    }} />,
    // Abstract shape
    <><div key="s1" className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.06]" style={{ backgroundColor: accent }} />
    <div key="s2" className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-[0.04]" style={{ backgroundColor: accent }} /></>,
    // Bottom bar
    <div key="bar" className="absolute bottom-0 left-0 right-0 h-1.5 opacity-70" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />,
    // Side stripe
    <div key="stripe" className="absolute top-0 left-0 w-1.5 h-full opacity-60" style={{ backgroundColor: accent }} />,
  ];
  return patterns[styleIndex % patterns.length];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Renders a Gamma-style cover card for template thumbnails.
 * Uses the template title on a polished dark gradient background.
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

  // Extract title from first heading block if not provided
  const displayTitle = title || extractTitle(blocks) || 'Untitled Template';
  const subtitle = extractSubtitle(blocks, displayTitle);

  // Deterministic style based on template ID
  const hash = hashString(templateId);
  const styleIndex = hash % COVER_STYLES.length;
  const coverStyle = COVER_STYLES[styleIndex];
  const visualCat = inferVisualCategory(category || '', tags);
  const catStyle = getCategoryStyle(visualCat);

  return (
    <div
      className={cn("relative aspect-video w-full overflow-hidden select-none", className)}
      style={{ background: coverStyle.bg }}
    >
      {/* Decorative elements */}
      {getDecorativeElements(hash % 6, catStyle.accent)}

      {/* Content layout */}
      <div className="absolute inset-0 flex flex-col justify-center px-[12%] py-[10%] z-10">
        {/* Category pill */}
        {category && (
          <div
            className="inline-flex self-start px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase mb-3"
            style={{
              backgroundColor: catStyle.accent + '25',
              color: catStyle.accent,
              border: `1px solid ${catStyle.accent}40`,
            }}
          >
            {catStyle.label}
          </div>
        )}

        {/* Title */}
        <h3
          className="font-bold leading-[1.15] tracking-tight"
          style={{
            color: coverStyle.text,
            fontSize: displayTitle.length > 30 ? '1.25rem' : displayTitle.length > 20 ? '1.5rem' : '1.75rem',
          }}
        >
          {displayTitle}
        </h3>

        {/* Subtitle / description */}
        {subtitle && (
          <p
            className="mt-2 text-[11px] leading-relaxed line-clamp-2 max-w-[85%]"
            style={{ color: coverStyle.sub }}
          >
            {subtitle}
          </p>
        )}

        {/* Visual accent bar */}
        <div
          className="mt-4 h-0.5 w-12 rounded-full"
          style={{ backgroundColor: catStyle.accent }}
        />
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
