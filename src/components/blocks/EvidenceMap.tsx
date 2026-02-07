/**
 * Evidence Map Block
 * Displays evidence items with source attribution and confidence indicators
 */

import type { EvidenceMapPayload, VisualBlockProps } from './types';
import { CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

const confidenceConfig = {
  verified: { icon: CheckCircle, color: 'text-success', label: 'Verified' },
  estimated: { icon: AlertTriangle, color: 'text-warning', label: 'Estimated' },
  not_provided: { icon: HelpCircle, color: 'text-muted-foreground', label: 'Not Provided' },
};

export function EvidenceMap({ 
  payload, 
  readOnly = true, 
  className = '' 
}: VisualBlockProps<EvidenceMapPayload>) {
  const { evidenceItems = [], missingData = [], title } = payload;

  return (
    <div className={`rounded-radius-xl border border-border bg-card p-space-6 ${className}`}>
      {title && (
        <h3 className="text-fluid-lg font-semibold text-foreground mb-space-4">{title}</h3>
      )}

      {/* Evidence Items */}
      <div className="space-y-space-3">
        {evidenceItems.map((item, index) => {
          const conf = item.confidence || 'not_provided';
          const config = confidenceConfig[conf] || confidenceConfig.not_provided;
          const Icon = config.icon;

          return (
            <div 
              key={index} 
              className="flex items-start gap-space-3 p-space-3 rounded-radius-lg bg-muted/30"
            >
              <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-space-2">
                  <span className="text-fluid-sm font-medium text-foreground">{item.label}</span>
                  <span className={`text-fluid-xs ${config.color}`}>{config.label}</span>
                </div>
                <p className="text-fluid-base text-foreground mt-1">
                  {item.value || 'Not provided'}
                </p>
                {item.source && (
                  <p className="text-fluid-xs text-muted-foreground mt-1">
                    Source: {item.source}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Missing Data */}
      {missingData.length > 0 && (
        <div className="mt-space-4 p-space-3 rounded-radius-lg bg-destructive/10 border border-destructive/20">
          <p className="text-fluid-sm font-medium text-destructive mb-space-2">Missing Data:</p>
          <ul className="list-disc list-inside text-fluid-sm text-destructive/80">
            {missingData.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
