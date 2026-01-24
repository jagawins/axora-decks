/**
 * Unified Block Renderer for Templates
 * Supports both read-only preview mode and editor mode.
 * Handles all block types including image blocks with src/prompt fallback.
 */

import { type TemplateBlock, type BlockPayload } from '@/lib/templates';
import { Image as ImageIcon } from 'lucide-react';

interface TemplateBlockRendererProps {
  block: TemplateBlock;
  readOnly?: boolean;
  className?: string;
}

/**
 * Get payload from block, handling both new and legacy formats
 */
function getPayload(block: TemplateBlock): BlockPayload {
  return block.block_payload || (block.content as BlockPayload) || {};
}

export function TemplateBlockRenderer({ 
  block, 
  readOnly = true,
  className = '' 
}: TemplateBlockRendererProps) {
  const payload = getPayload(block);

  switch (block.type) {
    case 'heading':
      return <HeadingBlock payload={payload} className={className} />;
    case 'text':
      return <TextBlock payload={payload} className={className} />;
    case 'list':
      return <ListBlock payload={payload} className={className} />;
    case 'callout':
      return <CalloutBlock payload={payload} className={className} />;
    case 'two_col':
      return <TwoColBlock payload={payload} className={className} />;
    case 'table':
      return <TableBlock payload={payload} className={className} />;
    case 'image':
      return <ImageBlock payload={payload} className={className} />;
    default:
      return null;
  }
}

// =============================================================================
// Block Type Components
// =============================================================================

function HeadingBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const level = payload.level || 2;
  const text = payload.text || '';
  
  const sizeClass = level === 1 
    ? 'text-7xl font-bold' 
    : level === 2 
    ? 'text-5xl font-semibold' 
    : 'text-4xl font-medium';
    
  return (
    <div className={`${sizeClass} truncate text-[var(--deck-fg,hsl(var(--foreground)))] ${className}`}>
      {text}
    </div>
  );
}

function TextBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const text = payload.text || '';
  
  return (
    <p className={`text-3xl leading-relaxed line-clamp-3 text-[var(--deck-muted,hsl(var(--muted-foreground)))] ${className}`}>
      {text}
    </p>
  );
}

function ListBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const items = payload.items || [];
  const ordered = payload.ordered || false;
  
  return (
    <ul className={`text-2xl space-y-2 ${className}`}>
      {items.slice(0, 4).map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="text-[var(--deck-accent,hsl(var(--accent)))] flex-shrink-0">
            {ordered ? `${i + 1}.` : '•'}
          </span>
          <span className="truncate text-[var(--deck-fg,hsl(var(--foreground)))]">{item}</span>
        </li>
      ))}
      {items.length > 4 && (
        <li className="text-[var(--deck-muted,hsl(var(--muted-foreground)))]">
          +{items.length - 4} more...
        </li>
      )}
    </ul>
  );
}

function CalloutBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const icon = payload.icon || 'info';
  const text = payload.text || '';
  
  const colorClass = icon === 'warning'
    ? 'border-yellow-500/50 bg-yellow-500/10'
    : icon === 'success'
    ? 'border-green-500/50 bg-green-500/10'
    : 'border-[var(--deck-accent,hsl(var(--accent)))]/50 bg-[var(--deck-accent,hsl(var(--accent)))]/10';
    
  return (
    <div className={`p-6 rounded-xl border-2 ${colorClass} ${className}`}>
      <p className="text-2xl line-clamp-2 text-[var(--deck-fg,hsl(var(--foreground)))]">{text}</p>
    </div>
  );
}

function TwoColBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const left = payload.left || '';
  const right = payload.right || '';
  
  return (
    <div className={`grid grid-cols-2 gap-12 ${className}`}>
      <div className="text-2xl line-clamp-2 text-[var(--deck-muted,hsl(var(--muted-foreground)))]">{left}</div>
      <div className="text-2xl line-clamp-2 text-[var(--deck-muted,hsl(var(--muted-foreground)))]">{right}</div>
    </div>
  );
}

function TableBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const headers = payload.headers || [];
  const rows = payload.rows || [];
  
  return (
    <div className={`w-full overflow-hidden rounded-lg border border-[var(--deck-border,hsl(var(--border)))] ${className}`}>
      <table className="w-full text-xl">
        <thead>
          <tr className="bg-[var(--deck-muted,hsl(var(--muted)))]/20">
            {headers.slice(0, 4).map((h, i) => (
              <th 
                key={i} 
                className="p-3 text-left font-semibold truncate border-r last:border-r-0 border-[var(--deck-border,hsl(var(--border)))] text-[var(--deck-fg,hsl(var(--foreground)))]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 2).map((row, ri) => (
            <tr key={ri} className="border-t border-[var(--deck-border,hsl(var(--border)))]">
              {row.slice(0, 4).map((cell, ci) => (
                <td 
                  key={ci} 
                  className="p-3 truncate border-r last:border-r-0 border-[var(--deck-border,hsl(var(--border)))] text-[var(--deck-fg,hsl(var(--foreground)))]"
                >
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

function ImageBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const src = payload.src;
  const alt = payload.alt || 'Image';
  const prompt = payload.prompt;
  const aspect = payload.aspect || '16:9';
  const fit = payload.fit || 'cover';
  
  const aspectClass = 
    aspect === '4:3' ? 'aspect-[4/3]' :
    aspect === '1:1' ? 'aspect-square' :
    'aspect-video';
  
  // If we have a src, render the actual image
  if (src) {
    return (
      <div className={`w-full ${aspectClass} overflow-hidden rounded-lg ${className}`}>
        <img 
          src={src} 
          alt={alt} 
          className={`w-full h-full object-${fit}`}
          loading="lazy"
        />
      </div>
    );
  }
  
  // Otherwise, render a placeholder with the prompt
  return (
    <div 
      className={`w-full ${aspectClass} bg-[var(--deck-muted,hsl(var(--muted)))]/20 rounded-lg flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[var(--deck-border,hsl(var(--border)))] ${className}`}
    >
      <ImageIcon className="h-12 w-12 text-[var(--deck-muted,hsl(var(--muted-foreground)))]" />
      {prompt && (
        <p className="text-lg text-[var(--deck-muted,hsl(var(--muted-foreground)))] text-center px-4 line-clamp-2">
          {prompt}
        </p>
      )}
      {!prompt && (
        <p className="text-lg text-[var(--deck-muted,hsl(var(--muted-foreground)))]">
          Image placeholder
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Export for use in preview generation
// =============================================================================

export { getPayload };
