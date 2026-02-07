/**
 * Evidence Map Block
 * Displays claims with supporting evidence and confidence levels
 */

import type { EvidenceMapPayload, VisualBlockProps } from './types';
import { CheckCircle, AlertCircle, MinusCircle, FileSearch } from 'lucide-react';

const confidenceConfig = {
  high: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'High' },
  medium: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10', label: 'Medium' },
  low: { icon: MinusCircle, color: 'text-muted-foreground', bg: 'bg-muted/20', label: 'Low' },
};

export function EvidenceMap({ 
  payload, 
  readOnly = true, 
  className = '' 
}: VisualBlockProps<EvidenceMapPayload>) {
  const { title, claims = [] } = payload;

  return (
    <div className={`rounded-radius-xl border border-border bg-card p-space-6 ${className}`}>
      <div className="flex items-center gap-space-2 mb-space-4">
        <FileSearch className="h-5 w-5 text-primary" />
        <h3 className="text-fluid-lg font-semibold text-foreground">
          {title || 'Evidence Map'}
        </h3>
      </div>

      {/* Claims */}
      <div className="space-y-space-4">
        {claims.map((item, index) => {
          const conf = item.confidence || 'medium';
          const config = confidenceConfig[conf] || confidenceConfig.medium;
          const Icon = config.icon;

          return (
            <div 
              key={index} 
              className={`rounded-radius-lg border ${config.bg} p-space-4`}
            >
              {/* Claim Header */}
              <div className="flex items-start justify-between gap-space-2 mb-space-2">
                <p className="text-fluid-base font-medium text-foreground flex-1">
                  {item.claim}
                </p>
                <div className="flex items-center gap-space-1 flex-shrink-0">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className={`text-fluid-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </div>

              {/* Evidence List */}
              {item.evidence && item.evidence.length > 0 && (
                <ul className="space-y-space-1 mt-space-2">
                  {item.evidence.map((ev, evIndex) => (
                    <li 
                      key={evIndex} 
                      className="text-fluid-sm text-muted-foreground flex items-start gap-space-2"
                    >
                      <span className="text-primary flex-shrink-0">→</span>
                      {ev}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
