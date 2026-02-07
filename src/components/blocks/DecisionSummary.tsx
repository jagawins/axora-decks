/**
 * Decision Summary Block
 * Displays a decision question with recommendation and confidence level
 */

import type { DecisionSummaryPayload, VisualBlockProps } from './types';
import { HelpCircle, CheckCircle, AlertCircle, MinusCircle } from 'lucide-react';

const confidenceConfig = {
  high: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'High Confidence' },
  medium: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10', label: 'Medium Confidence' },
  low: { icon: MinusCircle, color: 'text-muted-foreground', bg: 'bg-muted/20', label: 'Low Confidence' },
};

export function DecisionSummary({ 
  payload, 
  readOnly = true, 
  className = '' 
}: VisualBlockProps<DecisionSummaryPayload>) {
  const { question, context, recommendation, confidence = 'medium', decisionDate } = payload;
  const config = confidenceConfig[confidence] || confidenceConfig.medium;
  const ConfidenceIcon = config.icon;

  return (
    <div className={`rounded-radius-xl border border-border bg-card p-space-6 ${className}`}>
      {/* Question */}
      <div className="flex items-start gap-space-3 mb-space-4">
        <HelpCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-fluid-xl font-semibold text-foreground">{question}</h3>
          {context && (
            <p className="text-fluid-sm text-muted-foreground mt-1">{context}</p>
          )}
        </div>
      </div>

      {/* Recommendation */}
      <div className={`rounded-radius-lg ${config.bg} p-space-4 mt-space-4`}>
        <div className="flex items-center gap-space-2 mb-space-2">
          <ConfidenceIcon className={`h-5 w-5 ${config.color}`} />
          <span className={`text-fluid-sm font-medium ${config.color}`}>{config.label}</span>
        </div>
        <p className="text-fluid-base font-medium text-foreground">{recommendation}</p>
      </div>

      {/* Decision Date */}
      {decisionDate && (
        <p className="text-fluid-xs text-muted-foreground mt-space-3">
          Decision date: {decisionDate}
        </p>
      )}
    </div>
  );
}
