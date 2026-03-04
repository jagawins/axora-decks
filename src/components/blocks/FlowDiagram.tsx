/**
 * Flow Diagram Block
 * Deloitte-style horizontal flow: Strategy → Operating Model → Execution
 * Supports bridge, arrow, and line connectors between columns
 */

import type { VisualBlockProps } from './types';
import type { FlowDiagramPayload } from './types';

const DEFAULT_COLORS = ['#059669', '#2563eb', '#0d9488'];

function BridgeConnector({ columns, totalW, colW }: { columns: number; totalW: number; colW: number }) {
  if (columns < 2) return null;
  const h = 40;
  const gap = 12;

  return (
    <svg viewBox={`0 0 ${totalW} ${h}`} className="w-full" style={{ height: h }}>
      {Array.from({ length: columns - 1 }).map((_, i) => {
        const x1 = (i + 1) * colW - gap / 2;
        const x2 = (i + 1) * colW + gap / 2;
        const midX = (x1 + x2) / 2;
        return (
          <g key={i}>
            {/* Arch path */}
            <path
              d={`M ${x1 - 20} ${h} Q ${midX} ${0} ${x2 + 20} ${h}`}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
            {/* Arrow head */}
            <polygon
              points={`${x2 + 16},${h - 4} ${x2 + 24},${h} ${x2 + 16},${h + 4}`}
              fill="hsl(var(--muted-foreground))"
            />
          </g>
        );
      })}
    </svg>
  );
}

function ArrowConnector({ columns, totalW, colW }: { columns: number; totalW: number; colW: number }) {
  if (columns < 2) return null;

  return (
    <div className="flex items-center justify-center" style={{ height: 32 }}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex items-center" style={{ width: colW }}>
          {i < columns - 1 && (
            <div className="ml-auto mr-0 flex items-center text-[hsl(var(--muted-foreground))]">
              <div className="w-8 h-px bg-current" />
              <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0 -ml-px">
                <path d="M2 1 L10 6 L2 11" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function FlowDiagram({ payload, className = '' }: VisualBlockProps<FlowDiagramPayload>) {
  const { columns = [], title, connector = 'arrows' } = payload;
  if (!columns.length) return null;

  const colCount = Math.min(columns.length, 5);
  const totalW = 600;
  const colW = totalW / colCount;

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-fluid-xl font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">
          {title}
        </h3>
      )}

      {/* Connector above */}
      {connector === 'bridge' && (
        <BridgeConnector columns={colCount} totalW={totalW} colW={colW} />
      )}

      {/* Column bands */}
      <div className="flex gap-3">
        {columns.slice(0, colCount).map((col, i) => {
          const color = col.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <div key={i} className="flex-1 min-w-0 flex flex-col gap-0 rounded-xl overflow-hidden border border-[hsl(var(--border))]/50">
              {/* Header band */}
              <div
                className="px-4 py-3 text-center"
                style={{ backgroundColor: color }}
              >
                <h4 className="text-sm font-bold text-white tracking-wide uppercase">
                  {col.title}
                </h4>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-1 p-3 bg-[var(--deck-muted,hsl(var(--muted)))]/5 flex-1">
                {(col.items || []).map((item, j) => (
                  <div
                    key={j}
                    className="rounded-lg px-3 py-2 border border-[hsl(var(--border))]/30"
                    style={{ backgroundColor: color + '10' }}
                  >
                    <p className="text-xs font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-[10px] text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-0.5 line-clamp-2">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrow connector below columns */}
      {connector === 'arrows' && (
        <ArrowConnector columns={colCount} totalW={totalW} colW={colW} />
      )}

      {/* Line connector */}
      {connector === 'line' && colCount > 1 && (
        <div className="flex items-center px-4">
          <div className="flex-1 h-px bg-[hsl(var(--border))]" />
          <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0 text-[hsl(var(--muted-foreground))]">
            <path d="M1 1 L8 5 L1 9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </div>
  );
}
