/**
 * Scenario Set Block
 * Displays multiple scenarios with assumptions, outcomes, and risks
 */

import type { ScenarioSetPayload, VisualBlockProps } from './types';
import { Layers, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

const scenarioColors: Record<string, { bg: string; border: string; accent: string }> = {
  best_case: { bg: 'bg-success/10', border: 'border-success/30', accent: 'text-success' },
  base_case: { bg: 'bg-primary/10', border: 'border-primary/30', accent: 'text-primary' },
  worst_case: { bg: 'bg-destructive/10', border: 'border-destructive/30', accent: 'text-destructive' },
};

export function ScenarioSet({ 
  payload, 
  readOnly = true, 
  className = '' 
}: VisualBlockProps<ScenarioSetPayload>) {
  const { title, scenarios = [] } = payload;

  return (
    <div className={`rounded-radius-xl border border-border bg-card p-space-6 ${className}`}>
      <div className="flex items-center gap-space-2 mb-space-4">
        <Layers className="h-5 w-5 text-primary" />
        <h3 className="text-fluid-lg font-semibold text-foreground">
          {title || 'Scenario Analysis'}
        </h3>
      </div>

      {/* Scenarios Grid */}
      <div className="grid gap-space-4">
        {scenarios.map((scenario, index) => {
          const colors = scenarioColors[scenario.name] || { bg: 'bg-muted/20', border: 'border-border', accent: 'text-foreground' };
          const displayName = scenario.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

          return (
            <div 
              key={index} 
              className={`rounded-radius-lg border ${colors.border} ${colors.bg} p-space-4`}
            >
              {/* Scenario Name */}
              <h4 className={`text-fluid-base font-semibold ${colors.accent} mb-space-3`}>
                {displayName}
              </h4>

              {/* Assumptions */}
              {scenario.assumptions && scenario.assumptions.length > 0 && (
                <div className="mb-space-3">
                  <h5 className="text-fluid-xs font-medium text-muted-foreground mb-space-1 flex items-center gap-space-1">
                    <Lightbulb className="h-3 w-3" />
                    Assumptions
                  </h5>
                  <ul className="space-y-space-1">
                    {scenario.assumptions.map((assumption, i) => (
                      <li key={i} className="text-fluid-sm text-foreground flex items-start gap-space-2">
                        <span className="text-muted-foreground flex-shrink-0">•</span>
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Outcomes */}
              {scenario.outcomes && scenario.outcomes.length > 0 && (
                <div className="mb-space-3">
                  <h5 className="text-fluid-xs font-medium text-muted-foreground mb-space-1 flex items-center gap-space-1">
                    <TrendingUp className="h-3 w-3" />
                    Outcomes
                  </h5>
                  <ul className="space-y-space-1">
                    {scenario.outcomes.map((outcome, i) => (
                      <li key={i} className="text-fluid-sm text-foreground flex items-start gap-space-2">
                        <span className={`${colors.accent} flex-shrink-0`}>→</span>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risks */}
              {scenario.risks && scenario.risks.length > 0 && (
                <div>
                  <h5 className="text-fluid-xs font-medium text-muted-foreground mb-space-1 flex items-center gap-space-1">
                    <AlertTriangle className="h-3 w-3" />
                    Risks
                  </h5>
                  <ul className="space-y-space-1">
                    {scenario.risks.map((risk, i) => (
                      <li key={i} className="text-fluid-sm text-foreground flex items-start gap-space-2">
                        <span className="text-warning flex-shrink-0">!</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
