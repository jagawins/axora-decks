/**
 * Relationship Matrix Block
 * Triangular matrix diagram showing relationships between entities
 */

import type { RelationshipMatrixPayload } from './types';
import type { VisualBlockProps } from './types';

const REL_STYLES: Record<string, { render: (x: number, y: number) => JSX.Element; label: string }> = {
  confirmed: {
    label: 'Confirmed',
    render: (cx, cy) => <circle cx={cx} cy={cy} r={6} fill="hsl(var(--primary))" />,
  },
  suspected: {
    label: 'Suspected',
    render: (cx, cy) => <circle cx={cx} cy={cy} r={6} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />,
  },
  key: {
    label: 'Key Individual',
    render: (cx, cy) => (
      <g>
        <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke="hsl(var(--primary))" strokeWidth={2} />
        <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke="hsl(var(--primary))" strokeWidth={2} />
      </g>
    ),
  },
};

export function RelationshipMatrix({ payload, className = '' }: VisualBlockProps<RelationshipMatrixPayload>) {
  const { labels = [], relationships = [], title } = payload;
  if (labels.length < 2) return null;

  const n = labels.length;
  const cell = 36;
  const pad = 100;
  const w = pad + (n - 1) * cell + 20;
  const h = pad + (n - 1) * cell + 20;

  // Build lookup
  const relMap = new Map<string, string>();
  relationships.forEach((r) => relMap.set(`${r.row}-${r.col}`, r.type));

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <h3 className="text-fluid-xl font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">{title}</h3>
      )}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg" style={{ minWidth: 280 }}>
          {/* Column headers (top, rotated) */}
          {labels.slice(1).map((label, ci) => (
            <text
              key={`ch-${ci}`}
              x={pad + ci * cell}
              y={pad - 10}
              textAnchor="start"
              fontSize={11}
              fill="hsl(var(--muted-foreground))"
              transform={`rotate(-45, ${pad + ci * cell}, ${pad - 10})`}
            >
              {label}
            </text>
          ))}

          {/* Row headers (left) */}
          {labels.slice(0, -1).map((label, ri) => (
            <text
              key={`rh-${ri}`}
              x={pad - 8}
              y={pad + ri * cell + 4}
              textAnchor="end"
              fontSize={11}
              fill="hsl(var(--muted-foreground))"
            >
              {label}
            </text>
          ))}

          {/* Grid lines & intersection markers */}
          {labels.slice(0, -1).map((_, ri) =>
            labels.slice(1).map((_, ci) => {
              // Only show lower triangle: col index (ci) must be >= ri for triangular
              if (ci < ri) return null;
              const cx = pad + ci * cell;
              const cy = pad + ri * cell;
              const relType = relMap.get(`${ri}-${ci + 1}`) || relMap.get(`${ci + 1}-${ri}`);

              return (
                <g key={`${ri}-${ci}`}>
                  {/* Background dot */}
                  <circle cx={cx} cy={cy} r={2} fill="hsl(var(--border))" />
                  {/* Relationship marker */}
                  {relType && REL_STYLES[relType]?.render(cx, cy)}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-[var(--deck-muted,hsl(var(--muted-foreground)))]">
        {Object.entries(REL_STYLES).map(([key, { label, render }]) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <svg width={16} height={16} viewBox="0 0 16 16">
              {render(8, 8)}
            </svg>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
