/**
 * Decision Summary Block
 * Displays a summary with key points and optional risks
 */

import type { DecisionSummaryPayload, VisualBlockProps } from './types';
import { FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export function DecisionSummary({ 
  payload, 
  readOnly = true, 
  className = '' 
}: VisualBlockProps<DecisionSummaryPayload>) {
  const { title, summary, key_points = [], risks = [] } = payload;

  return (
    <div className={`rounded-radius-xl border border-border bg-card p-space-6 ${className}`}>
      {/* Title */}
      <div className="flex items-center gap-space-2 mb-space-4">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-fluid-lg font-semibold text-foreground">
          {title || 'Decision Summary'}
        </h3>
      </div>

      {/* Summary */}
      <p className="text-fluid-base text-foreground mb-space-4">{summary}</p>

      {/* Key Points */}
      {key_points.length > 0 && (
        <div className="mb-space-4">
          <h4 className="text-fluid-sm font-semibold text-foreground mb-space-2 flex items-center gap-space-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Key Points
          </h4>
          <ul className="space-y-space-1">
            {key_points.map((point, index) => (
              <li 
                key={index} 
                className="text-fluid-sm text-foreground flex items-start gap-space-2"
              >
                <span className="text-success flex-shrink-0">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {risks.length > 0 && (
        <div className="p-space-3 rounded-radius-lg bg-warning/10 border border-warning/30">
          <h4 className="text-fluid-sm font-semibold text-foreground mb-space-2 flex items-center gap-space-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Risks
          </h4>
          <ul className="space-y-space-1">
            {risks.map((risk, index) => (
              <li 
                key={index} 
                className="text-fluid-sm text-foreground flex items-start gap-space-2"
              >
                <span className="text-warning flex-shrink-0">•</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
