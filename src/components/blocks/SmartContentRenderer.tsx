/**
 * SmartContentRenderer
 * Detects Mermaid diagram syntax or numeric data patterns in raw text
 * and renders the appropriate visual instead of showing raw code/text.
 */

import { MermaidRenderer } from './MermaidRenderer';
import { ChartBlock } from './ChartBlock';
import type { ChartBlockPayload } from './types';

// Mermaid keywords that indicate diagram syntax
const MERMAID_KEYWORDS = /^\s*(flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|graph\s+(TD|TB|BT|RL|LR)|journey|gitGraph|mindmap|timeline|quadrantChart|xychart-beta|block-beta)/m;
const ARROW_SYNTAX = /-->/;

// Numeric line pattern: "Label: 123" or "Label 123" etc.
const NUMERIC_LINE_RE = /^(.+?)\s*[:=]\s*(\$?[\d,]+\.?\d*)\s*([%kmbKMB]?)$/;
const TIME_LABEL_RE = /\b(Q[1-4]|20\d{2}|19\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i;

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function detectMermaid(text: string): boolean {
  return MERMAID_KEYWORDS.test(text) || (ARROW_SYNTAX.test(text) && /^\s*(graph|flowchart|subgraph|end)\b/m.test(text));
}

interface DataPoint {
  label: string;
  value: number;
}

function extractNumericLines(text: string): DataPoint[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const points: DataPoint[] = [];

  for (const line of lines) {
    const match = line.match(NUMERIC_LINE_RE);
    if (match) {
      let value = parseFloat(match[2].replace(/,/g, ''));
      const suffix = (match[3] || '').toLowerCase();
      if (suffix === 'k') value *= 1000;
      else if (suffix === 'm') value *= 1000000;
      else if (suffix === 'b') value *= 1000000000;
      points.push({ label: match[1].replace(/^[-•*]\s*/, '').trim(), value });
    }
  }
  return points;
}

interface SmartContentRendererProps {
  text: string;
  className?: string;
  /** Fallback renderer if content is not a diagram or chart */
  fallback: (decodedText: string) => React.ReactNode;
}

export function SmartContentRenderer({ text, className = '', fallback }: SmartContentRendererProps) {
  const decoded = decodeHtmlEntities(text);

  // 1. Mermaid detection
  if (detectMermaid(decoded)) {
    return <MermaidRenderer code={decoded} className={className} />;
  }

  // 2. Numeric data detection (need 2+ data points)
  const dataPoints = extractNumericLines(decoded);
  if (dataPoints.length >= 2) {
    const hasTime = dataPoints.some(d => TIME_LABEL_RE.test(d.label));
    const chartPayload: ChartBlockPayload = {
      chartType: hasTime ? 'line' : 'bar',
      data: dataPoints.map(d => ({ label: d.label, value: d.value })),
      title: undefined,
    };
    return <ChartBlock payload={chartPayload} className={className} />;
  }

  // 3. Fallback to normal rendering
  return <>{fallback(decoded)}</>;
}
