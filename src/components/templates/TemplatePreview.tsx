import { useRef, useEffect, useState } from 'react';
import { TemplateBlock } from '@/lib/templates';
import type { Json } from '@/integrations/supabase/types';

interface TemplatePreviewProps {
  blocks: TemplateBlock[];
  className?: string;
}

// Design size for the slide (16:9 aspect ratio)
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

/**
 * Renders a scaled-down 16:9 preview of template blocks.
 * Shows first 3 blocks stacked vertically inside the slide canvas.
 */
export function TemplatePreview({ blocks, className = '' }: TemplatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);
  const previewBlocks = blocks.slice(0, 3);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setScale(containerWidth / DESIGN_WIDTH);
      }
    };

    updateScale();
    
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`aspect-[16/9] w-full rounded-xl border border-border bg-[var(--deck-bg,hsl(var(--card)))] overflow-hidden relative ${className}`}
    >
      {/* Scaled content container */}
      <div 
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: `${DESIGN_WIDTH}px`,
          height: `${DESIGN_HEIGHT}px`,
          transform: `scale(${scale})`,
        }}
      >
        <div className="w-full h-full p-16 flex flex-col justify-center gap-8 text-[var(--deck-fg,hsl(var(--foreground)))]">
          {previewBlocks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[var(--deck-muted,hsl(var(--muted-foreground)))] text-4xl">
              Empty template
            </div>
          ) : (
            previewBlocks.map((block, index) => (
              <PreviewBlock key={block.id || index} block={block} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewBlock({ block }: { block: TemplateBlock }) {
  const content = block.content as Record<string, Json>;

  switch (block.type) {
    case 'heading': {
      const level = (content.level as number) || 2;
      const text = String(content.text || '');
      const sizeClass = level === 1 
        ? 'text-7xl font-bold' 
        : level === 2 
        ? 'text-5xl font-semibold' 
        : 'text-4xl font-medium';
      return <div className={`${sizeClass} truncate`}>{text}</div>;
    }

    case 'text': {
      const text = String(content.text || '');
      return (
        <p className="text-3xl leading-relaxed line-clamp-3 text-[var(--deck-muted,hsl(var(--muted-foreground)))]">
          {text}
        </p>
      );
    }

    case 'list': {
      const items = (content.items as string[]) || [];
      const ordered = content.ordered as boolean;
      return (
        <ul className="text-2xl space-y-2">
          {items.slice(0, 3).map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-[var(--deck-accent,hsl(var(--accent)))] flex-shrink-0">
                {ordered ? `${i + 1}.` : '•'}
              </span>
              <span className="truncate">{item}</span>
            </li>
          ))}
          {items.length > 3 && (
            <li className="text-[var(--deck-muted,hsl(var(--muted-foreground)))]">
              +{items.length - 3} more...
            </li>
          )}
        </ul>
      );
    }

    case 'callout': {
      const icon = content.icon as string;
      const text = String(content.text || '');
      return (
        <div
          className={`p-6 rounded-xl border-2 ${
            icon === 'warning'
              ? 'border-yellow-500/50 bg-yellow-500/10'
              : icon === 'success'
              ? 'border-green-500/50 bg-green-500/10'
              : 'border-[var(--deck-accent,hsl(var(--accent)))]/50 bg-[var(--deck-accent,hsl(var(--accent)))]/10'
          }`}
        >
          <p className="text-2xl line-clamp-2">{text}</p>
        </div>
      );
    }

    case 'two_col': {
      const left = String(content.left || '');
      const right = String(content.right || '');
      return (
        <div className="grid grid-cols-2 gap-12">
          <div className="text-2xl line-clamp-2 text-[var(--deck-muted,hsl(var(--muted-foreground)))]">{left}</div>
          <div className="text-2xl line-clamp-2 text-[var(--deck-muted,hsl(var(--muted-foreground)))]">{right}</div>
        </div>
      );
    }

    case 'table': {
      const headers = (content.headers as string[]) || [];
      const rows = (content.rows as string[][]) || [];
      return (
        <div className="w-full overflow-hidden rounded-lg border border-[var(--deck-border,hsl(var(--border)))]">
          <table className="w-full text-xl">
            <thead>
              <tr className="bg-[var(--deck-muted,hsl(var(--muted)))]/20">
                {headers.slice(0, 4).map((h, i) => (
                  <th key={i} className="p-3 text-left font-semibold truncate border-r last:border-r-0 border-[var(--deck-border,hsl(var(--border)))]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 2).map((row, ri) => (
                <tr key={ri} className="border-t border-[var(--deck-border,hsl(var(--border)))]">
                  {row.slice(0, 4).map((cell, ci) => (
                    <td key={ci} className="p-3 truncate border-r last:border-r-0 border-[var(--deck-border,hsl(var(--border)))]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'image': {
      const src = content.src as string;
      const alt = content.alt as string;
      return src ? (
        <img src={src} alt={alt || ''} className="max-h-48 mx-auto rounded-lg" />
      ) : (
        <div className="h-32 bg-[var(--deck-muted,hsl(var(--muted)))]/20 rounded-lg flex items-center justify-center text-[var(--deck-muted,hsl(var(--muted-foreground)))] text-2xl">
          Image placeholder
        </div>
      );
    }

    default:
      return null;
  }
}
