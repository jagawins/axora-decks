import { type TemplateBlock } from '@/lib/templates';
import { cn } from '@/lib/utils';

interface TemplatePreviewImageProps {
  templateId: string;
  templateVersion?: number;
  themeId?: string;
  previewUrl?: string | null;
  blocks: TemplateBlock[];
  className?: string;
}

// Theme-based gradient palettes for visual variety
const THEME_PALETTES: Record<string, { bg: string; accent: string; text: string; muted: string }> = {
  classic: {
    bg: 'from-slate-900 via-slate-800 to-slate-900',
    accent: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    text: 'text-white',
    muted: 'text-slate-400',
  },
  midnight: {
    bg: 'from-indigo-950 via-violet-950 to-slate-950',
    accent: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    text: 'text-white',
    muted: 'text-indigo-300/60',
  },
  sand: {
    bg: 'from-amber-50 via-orange-50 to-yellow-50',
    accent: 'bg-amber-500/15 text-amber-700 border-amber-400/30',
    text: 'text-stone-900',
    muted: 'text-stone-500',
  },
  graphite: {
    bg: 'from-neutral-800 via-zinc-800 to-neutral-900',
    accent: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    text: 'text-white',
    muted: 'text-zinc-400',
  },
  ocean: {
    bg: 'from-cyan-900 via-teal-900 to-slate-900',
    accent: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
    text: 'text-white',
    muted: 'text-teal-300/60',
  },
  rose: {
    bg: 'from-rose-50 via-pink-50 to-fuchsia-50',
    accent: 'bg-rose-500/15 text-rose-700 border-rose-400/30',
    text: 'text-rose-950',
    muted: 'text-rose-400',
  },
  forest: {
    bg: 'from-emerald-950 via-green-950 to-teal-950',
    accent: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
    text: 'text-white',
    muted: 'text-emerald-300/60',
  },
  sunset: {
    bg: 'from-orange-500 via-rose-500 to-purple-600',
    accent: 'bg-white/20 text-white border-white/30',
    text: 'text-white',
    muted: 'text-white/70',
  },
};

// Hash templateId to pick a deterministic palette when theme is generic
function pickPalette(templateId: string, themeId?: string): typeof THEME_PALETTES['classic'] {
  if (themeId && THEME_PALETTES[themeId]) return THEME_PALETTES[themeId];
  const keys = Object.keys(THEME_PALETTES);
  let hash = 0;
  for (let i = 0; i < templateId.length; i++) {
    hash = ((hash << 5) - hash + templateId.charCodeAt(i)) | 0;
  }
  return THEME_PALETTES[keys[Math.abs(hash) % keys.length]];
}

function getBlockLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function extractTitle(blocks: TemplateBlock[]): string {
  for (const b of blocks) {
    const p = (b.block_payload || {}) as Record<string, any>;
    if (p.headline) return p.headline;
    if (p.title) return p.title;
    if (b.type === 'heading' && p.text) return p.text;
  }
  return '';
}

function extractSubtitle(blocks: TemplateBlock[]): string {
  for (const b of blocks) {
    if (b.type === 'exec_summary' || b.type === 'text') {
      const p = (b.block_payload || {}) as Record<string, any>;
      if (p.text) return p.text.slice(0, 80);
    }
  }
  return '';
}

/**
 * Rich visual template preview card with themed gradient backgrounds,
 * prominent title rendering, and block structure hints.
 */
export function TemplatePreviewImage({
  templateId,
  themeId,
  previewUrl,
  blocks,
  className = '',
}: TemplatePreviewImageProps) {
  if (previewUrl) {
    return (
      <div className={cn("relative aspect-video bg-muted rounded-xl overflow-hidden", className)}>
        <img src={previewUrl} alt="Template preview" className="w-full h-full object-cover" />
      </div>
    );
  }

  const palette = pickPalette(templateId, themeId);
  const title = extractTitle(blocks);
  const subtitle = extractSubtitle(blocks);
  const blockTypes = blocks.slice(0, 6).map(b => getBlockLabel(b.type));

  return (
    <div
      className={cn(
        "relative aspect-video w-full rounded-xl overflow-hidden bg-gradient-to-br",
        palette.bg,
        className
      )}
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }} />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-5">
        {/* Title area */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          {title ? (
            <>
              <h3 className={cn("text-sm font-bold leading-tight line-clamp-2", palette.text)}>
                {title}
              </h3>
              {subtitle && (
                <p className={cn("text-[10px] mt-1.5 line-clamp-2 leading-relaxed", palette.muted)}>
                  {subtitle}
                </p>
              )}
            </>
          ) : (
            <div className={cn("text-xs", palette.muted)}>
              Empty template
            </div>
          )}
        </div>

        {/* Block type pills at bottom */}
        {blockTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {blockTypes.slice(0, 3).map((label, i) => (
              <span
                key={i}
                className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded border font-medium",
                  palette.accent
                )}
              >
                {label}
              </span>
            ))}
            {blockTypes.length > 3 && (
              <span className={cn("text-[9px] px-1.5 py-0.5", palette.muted)}>
                +{blocks.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
