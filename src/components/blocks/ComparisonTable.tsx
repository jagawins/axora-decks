/**
 * Comparison Table Block Component
 * Displays feature comparisons with visual indicators
 */

import { Check, X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComparisonTablePayload, VisualBlockProps } from './types';

export function ComparisonTable({ 
  payload, 
  readOnly = true, 
  className 
}: VisualBlockProps<ComparisonTablePayload>) {
  const { title, headers = [], rows = [], highlightColumn } = payload;

  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="flex justify-center">
          <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-success" />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
            <X className="w-4 h-4 text-destructive" />
          </div>
        </div>
      );
    }
    
    if (value === '-' || value === '') {
      return (
        <div className="flex justify-center">
          <Minus className="w-4 h-4 text-muted-foreground" />
        </div>
      );
    }
    
    return <span className="text-[var(--deck-fg,hsl(var(--foreground)))]">{value}</span>;
  };

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h3 className="text-fluid-lg font-semibold text-[var(--deck-fg,hsl(var(--foreground)))] mb-space-4">
          {title}
        </h3>
      )}
      <div className="w-full overflow-x-auto rounded-radius-xl border border-[var(--deck-border,hsl(var(--border)))]">
        <table className="w-full text-fluid-sm">
          <thead>
            <tr className="bg-[var(--deck-muted,hsl(var(--muted)))]/10">
              <th className="p-space-4 text-left font-semibold text-[var(--deck-fg,hsl(var(--foreground)))] border-b border-[var(--deck-border,hsl(var(--border)))]">
                Feature
              </th>
              {headers.map((header, i) => (
                <th 
                  key={i}
                  className={cn(
                    'p-space-4 text-center font-semibold border-b border-[var(--deck-border,hsl(var(--border)))]',
                    highlightColumn === i 
                      ? 'bg-[var(--deck-accent,hsl(var(--accent)))]/10 text-[var(--deck-accent,hsl(var(--accent)))]'
                      : 'text-[var(--deck-fg,hsl(var(--foreground)))]'
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className="border-b border-[var(--deck-border,hsl(var(--border)))] last:border-b-0 hover:bg-[var(--deck-muted,hsl(var(--muted)))]/5 transition-colors"
              >
                <td className="p-space-4 font-medium text-[var(--deck-fg,hsl(var(--foreground)))]">
                  {row.label}
                </td>
                {row.values.map((value, colIndex) => (
                  <td 
                    key={colIndex}
                    className={cn(
                      'p-space-4 text-center',
                      highlightColumn === colIndex && 'bg-[var(--deck-accent,hsl(var(--accent)))]/5'
                    )}
                  >
                    {renderValue(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
