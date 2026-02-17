/**
 * Decision + Next Steps Block
 * Shows a decision with rationale and prioritized next steps
 */

import { Card } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';
import type { VisualBlockProps } from './types';

export interface DecisionNextStepsPayload {
  title?: string;
  decision: string;
  rationale?: string;
  next_steps: Array<{
    action: string;
    owner?: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  risks?: string[];
}

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  low: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

export function DecisionNextSteps({ payload, className = '' }: VisualBlockProps<DecisionNextStepsPayload>) {
  const { title, decision, rationale, next_steps = [], risks = [] } = payload;

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-[var(--deck-fg,hsl(var(--foreground)))]">{title}</h3>
      )}

      {/* Decision card */}
      <Card className="p-5 border-primary/30 bg-primary/5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-[var(--deck-fg,hsl(var(--foreground)))]">{decision}</p>
            {rationale && (
              <p className="text-xs text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-1">{rationale}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Next steps */}
      {next_steps.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next Steps</h4>
          {next_steps.slice(0, 5).map((step, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <ArrowRight className="h-4 w-4 text-accent flex-shrink-0" />
              <span className="text-sm flex-1 text-[var(--deck-fg,hsl(var(--foreground)))]">{step.action}</span>
              {step.owner && (
                <span className="text-xs text-muted-foreground">{step.owner}</span>
              )}
              {step.priority && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${PRIORITY_STYLES[step.priority]}`}>
                  {step.priority}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Risks */}
      {risks.length > 0 && (
        <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-xs font-semibold uppercase tracking-wide text-warning">Key Risks</span>
          </div>
          <ul className="space-y-1">
            {risks.slice(0, 3).map((risk, i) => (
              <li key={i} className="text-xs text-[var(--deck-muted,hsl(var(--muted-foreground)))]">• {risk}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
