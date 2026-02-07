/**
 * Recommendation Panel Block
 * Displays recommendation with rationale, alternatives, and next steps
 */

import type { RecommendationPanelPayload, VisualBlockProps } from './types';
import { CheckSquare, ArrowRight, RefreshCw, Lightbulb } from 'lucide-react';

export function RecommendationPanel({ 
  payload, 
  readOnly = true, 
  className = '' 
}: VisualBlockProps<RecommendationPanelPayload>) {
  const { 
    title,
    recommendation, 
    rationale = [], 
    alternatives = [],
    next_steps = []
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
      </div>

      {/* Rationale */}
      {rationale.length > 0 && (
        <div className="mb-space-4">
          <h4 className="text-fluid-sm font-semibold text-foreground mb-space-2 flex items-center gap-space-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            Rationale
          </h4>
          <ul className="space-y-space-1">
            {rationale.map((item, index) => (
              <li 
                key={index} 
                className="text-fluid-sm text-foreground flex items-start gap-space-2"
              >
                <span className="text-primary flex-shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-space-4 md:grid-cols-2">
        {/* Next Steps */}
        {next_steps.length > 0 && (
          <div>
            <h4 className="text-fluid-sm font-semibold text-foreground mb-space-2 flex items-center gap-space-2">
              <ArrowRight className="h-4 w-4 text-success" />
              Next Steps
            </h4>
            <ul className="space-y-space-1">
              {next_steps.map((step, index) => (
                <li 
                  key={index} 
                  className="text-fluid-sm text-foreground flex items-start gap-space-2"
                >
                  <span className="text-success flex-shrink-0">{index + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div>
            <h4 className="text-fluid-sm font-semibold text-foreground mb-space-2 flex items-center gap-space-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              Alternatives
            </h4>
            <ul className="space-y-space-1">
              {alternatives.map((alt, index) => (
                <li 
                  key={index} 
                  className="text-fluid-sm text-muted-foreground flex items-start gap-space-2"
                >
                  <span className="flex-shrink-0">○</span>
                  {alt}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
