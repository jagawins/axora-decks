/**
 * Recommendation Panel Block
 * Displays final recommendation with next steps, risks, and ownership
 */

import type { RecommendationPanelPayload, VisualBlockProps } from './types';
import { CheckSquare, ArrowRight, AlertTriangle, User, Calendar } from 'lucide-react';

export function RecommendationPanel({ 
  payload, 
  readOnly = true, 
  className = '' 
}: VisualBlockProps<RecommendationPanelPayload>) {
  const { 
    recommendation, 
    rationale, 
    nextSteps = [], 
    risks = [], 
    owner, 
    deadline,
    title 
  } = payload;

  return (
    <div className={`rounded-radius-xl border-2 border-primary/30 bg-primary/5 p-space-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-space-2 mb-space-4">
        <CheckSquare className="h-6 w-6 text-primary" />
        <h3 className="text-fluid-xl font-bold text-foreground">
          {title || 'Recommendation'}
        </h3>
      </div>

      {/* Main Recommendation */}
      <div className="bg-card rounded-radius-lg p-space-4 mb-space-4">
        <p className="text-fluid-lg font-semibold text-foreground">{recommendation}</p>
        {rationale && (
          <p className="text-fluid-sm text-muted-foreground mt-space-2">{rationale}</p>
        )}
      </div>

      {/* Two Column Layout for Next Steps and Risks */}
      <div className="grid gap-space-4 md:grid-cols-2">
        {/* Next Steps */}
        {nextSteps.length > 0 && (
          <div>
            <h4 className="text-fluid-sm font-semibold text-foreground mb-space-2 flex items-center gap-space-2">
              <ArrowRight className="h-4 w-4 text-success" />
              Next Steps
            </h4>
            <ul className="space-y-space-1">
              {nextSteps.map((step, index) => (
                <li 
                  key={index} 
                  className="text-fluid-sm text-foreground flex items-start gap-space-2"
                >
                  <span className="text-success flex-shrink-0">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risks */}
        {risks.length > 0 && (
          <div>
            <h4 className="text-fluid-sm font-semibold text-foreground mb-space-2 flex items-center gap-space-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Risks to Consider
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

      {/* Footer: Owner and Deadline */}
      {(owner || deadline) && (
        <div className="flex items-center gap-space-4 mt-space-4 pt-space-4 border-t border-border">
          {owner && (
            <div className="flex items-center gap-space-2 text-fluid-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Owner: {owner}</span>
            </div>
          )}
          {deadline && (
            <div className="flex items-center gap-space-2 text-fluid-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Deadline: {deadline}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
