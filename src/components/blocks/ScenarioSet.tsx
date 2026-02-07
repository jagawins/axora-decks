/**
 * Scenario Set Block
 * Displays multiple scenarios with outcomes and risk levels
 */

import type { ScenarioSetPayload, VisualBlockProps } from './types';
import { Layers, TrendingUp, AlertTriangle, Shield } from 'lucide-react';

const riskConfig = {
  low: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', label: 'Low Risk' },
  medium: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', label: 'Medium Risk' },
  high: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: 'High Risk' },
};

export function ScenarioSet({ 
  payload, 
  readOnly = true, 
  className = '' 
}: VisualBlockProps<ScenarioSetPayload>) {
  const { scenarios = [], baselineScenario, title } = payload;

  return (
    <div className={`rounded-radius-xl border border-border bg-card p-space-6 ${className}`}>
      <div className="flex items-center gap-space-2 mb-space-4">
        <Layers className="h-5 w-5 text-primary" />
        <h3 className="text-fluid-lg font-semibold text-foreground">
          {title || 'Scenario Analysis'}
        </h3>
      </div>

      {baselineScenario && (
        <p className="text-fluid-sm text-muted-foreground mb-space-4">
          Baseline: {baselineScenario}
        </p>
      )}

      {/* Scenarios Grid */}
      <div className="grid gap-space-3 md:grid-cols-2">
        {scenarios.map((scenario, index) => {
          const risk = scenario.risk || 'medium';
          const config = riskConfig[risk] || riskConfig.medium;

          return (
            <div 
              key={index} 
              className={`rounded-radius-lg border ${config.border} ${config.bg} p-space-4`}
            >
              <div className="flex items-center justify-between mb-space-2">
                <h4 className="text-fluid-base font-semibold text-foreground">{scenario.name}</h4>
                <span className={`text-fluid-xs font-medium ${config.color}`}>
                  {config.label}
                </span>
              </div>
              
              {scenario.description && (
                <p className="text-fluid-sm text-muted-foreground mb-space-2">
                  {scenario.description}
                </p>
              )}
              
              {scenario.outcome && (
                <div className="flex items-start gap-space-2 mt-space-2">
                  <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-fluid-sm text-foreground">
                    {scenario.outcome}
                  </p>
                </div>
              )}

              {scenario.probability && (
                <p className="text-fluid-xs text-muted-foreground mt-space-2">
                  Probability: {scenario.probability}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
