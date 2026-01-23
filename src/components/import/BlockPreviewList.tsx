import { Type, FileText, List, AlertCircle, Columns, Table, Image } from 'lucide-react';
import { Block, BlockType, getPreviewLabel } from '@/lib/blocks';
import { cn } from '@/lib/utils';
import type { Json } from '@/integrations/supabase/types';

interface BlockPreviewListProps {
  blocks: Block[];
  className?: string;
}

const BLOCK_ICONS: Record<BlockType, React.ElementType> = {
  heading: Type,
  text: FileText,
  list: List,
  callout: AlertCircle,
  two_col: Columns,
  table: Table,
  image: Image,
};

/**
 * Renders a list preview of blocks with icons and labels.
 * Used in the Import Content modal to preview generated blocks before inserting.
 */
export function BlockPreviewList({ blocks, className = '' }: BlockPreviewListProps) {
  if (blocks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No blocks generated yet
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {blocks.map((block, index) => (
        <BlockPreviewItem key={block.id || index} block={block} index={index} />
      ))}
    </div>
  );
}

function BlockPreviewItem({ block, index }: { block: Block; index: number }) {
  const Icon = BLOCK_ICONS[block.type] || FileText;
  const label = getPreviewLabel(block);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 transition-colors hover:bg-muted">
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-accent/10 text-accent flex-shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {block.type.replace('_', ' ')}
          </span>
        </div>
        <p className="text-sm text-foreground truncate mt-0.5">
          {label}
        </p>
      </div>
      <div className="flex-shrink-0 text-xs text-muted-foreground">
        #{index + 1}
      </div>
    </div>
  );
}

/**
 * Mini slide preview component for a single block.
 * Shows a scaled-down visual representation of the block content.
 */
export function BlockMiniPreview({ block }: { block: Block }) {
  const content = block.content as Record<string, Json>;

  switch (block.type) {
    case 'heading': {
      const level = (content.level as number) || 2;
      const text = String(content.text || '');
      return (
        <div className={cn(
          "truncate",
          level === 1 ? "text-lg font-bold" : level === 2 ? "text-base font-semibold" : "text-sm font-medium"
        )}>
          {text}
        </div>
      );
    }

    case 'text': {
      const text = String(content.text || '');
      return (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {text}
        </p>
      );
    }

    case 'list': {
      const items = (content.items as string[]) || [];
      return (
        <ul className="text-xs space-y-0.5">
          {items.slice(0, 2).map((item, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-accent">•</span>
              <span className="truncate">{item}</span>
            </li>
          ))}
          {items.length > 2 && (
            <li className="text-muted-foreground">+{items.length - 2} more</li>
          )}
        </ul>
      );
    }

    case 'callout': {
      const text = String(content.text || '');
      const icon = content.icon as string;
      return (
        <div className={cn(
          "p-2 rounded border text-xs",
          icon === 'warning' ? 'border-warning/30 bg-warning/5' :
          icon === 'success' ? 'border-success/30 bg-success/5' :
          'border-accent/30 bg-accent/5'
        )}>
          {text.slice(0, 60)}...
        </div>
      );
    }

    case 'two_col': {
      return (
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="truncate">{String(content.left || '').slice(0, 30)}</div>
          <div className="truncate">{String(content.right || '').slice(0, 30)}</div>
        </div>
      );
    }

    case 'table': {
      const headers = (content.headers as string[]) || [];
      return (
        <div className="text-xs text-muted-foreground">
          Table: {headers.slice(0, 3).join(', ')}{headers.length > 3 ? '...' : ''}
        </div>
      );
    }

    case 'image': {
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Image className="h-3 w-3" />
          <span>{String(content.alt || 'Image')}</span>
        </div>
      );
    }

    default:
      return null;
  }
}
