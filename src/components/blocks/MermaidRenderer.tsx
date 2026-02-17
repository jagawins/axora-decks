/**
 * MermaidRenderer
 * Renders Mermaid diagram syntax as SVG visuals.
 * Falls back to a collapsible "View Code" panel on error.
 */

import { useEffect, useRef, useState, useId } from 'react';
import mermaid from 'mermaid';
import { ChevronDown, ChevronRight } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

interface MermaidRendererProps {
  code: string;
  className?: string;
}

export function MermaidRenderer({ code, className = '' }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const uniqueId = useId().replace(/:/g, '_');

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!containerRef.current) return;
      try {
        const { svg } = await mermaid.render(`mermaid_${uniqueId}`, code);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Diagram render failed');
        }
      }
    }
    render();
    return () => { cancelled = true; };
  }, [code, uniqueId]);

  if (error) {
    return (
      <div className={`rounded-radius-lg border border-[var(--deck-border,hsl(var(--border)))] overflow-hidden ${className}`}>
        <button
          onClick={() => setShowSource(!showSource)}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-[var(--deck-muted,hsl(var(--muted-foreground)))] bg-[var(--deck-muted,hsl(var(--muted)))]/10 hover:bg-[var(--deck-muted,hsl(var(--muted)))]/20 transition-colors"
        >
          {showSource ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          View Code
        </button>
        {showSource && (
          <pre className="p-4 text-xs overflow-auto max-h-48 bg-[var(--deck-bg,hsl(var(--background)))] text-[var(--deck-fg,hsl(var(--foreground)))]">
            <code>{code}</code>
          </pre>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center [&_svg]:max-w-full ${className}`}
    />
  );
}
