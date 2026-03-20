/**
 * Smart Layout Block — Executive-Specific Layout Patterns
 *
 * Not generic "2 columns" — these are named consulting patterns:
 * - exec-summary: Title + key message + 3 supporting metrics
 * - metrics-commentary: Left = KPIs grid, Right = analysis text
 * - recommendation: Recommendation box + evidence bullets + risk note
 * - comparison-columns: 2-3 options compared side by side
 * - spotlight: Large featured item + supporting details
 * - agenda: Numbered agenda items with owners and time
 */

import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Target, TrendingUp, Clock, User } from "lucide-react";

export interface SmartLayoutItem {
  title: string;
  content?: string;
  metric?: string;
  metricLabel?: string;
  icon?: string;
  status?: "positive" | "negative" | "neutral" | "warning";
  owner?: string;
  time?: string;
}

export interface SmartLayoutPayload {
  title?: string;
  layout: "exec-summary" | "metrics-commentary" | "recommendation" | "comparison-columns" | "spotlight" | "agenda";
  items: SmartLayoutItem[];
  summary?: string;
  recommendation?: string;
  riskNote?: string;
}

interface SmartLayoutProps {
  payload: SmartLayoutPayload;
  readOnly?: boolean;
  className?: string;
}

const STATUS_STYLES = {
  positive: "text-green-500 bg-green-500/10 border-green-500/20",
  negative: "text-red-500 bg-red-500/10 border-red-500/20",
  neutral: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
};

/* ── Executive Summary Layout ──────────────────────────── */
function ExecSummaryLayout({ payload }: { payload: SmartLayoutPayload }) {
  const metrics = payload.items.slice(0, 4);
  return (
    <div className="space-y-space-6">
      {payload.title && <h3 className="text-fluid-lg font-bold text-[var(--deck-fg,hsl(var(--foreground)))]">{payload.title}</h3>}
      {payload.summary && (
        <div className="rounded-xl bg-[var(--deck-accent,hsl(var(--accent)))]/5 border border-[var(--deck-accent,hsl(var(--accent)))]/20 p-space-4">
          <p className="text-fluid-base text-[var(--deck-fg,hsl(var(--foreground)))] font-medium">{payload.summary}</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-3">
        {metrics.map((m, i) => (
          <div key={i} className={cn("rounded-xl border p-space-4 text-center", STATUS_STYLES[m.status || "neutral"])}>
            <p className="text-fluid-xl font-bold">{m.metric || m.title}</p>
            <p className="text-fluid-sm opacity-70 mt-1">{m.metricLabel || m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Metrics + Commentary Layout ───────────────────────── */
function MetricsCommentaryLayout({ payload }: { payload: SmartLayoutPayload }) {
  const metrics = payload.items.slice(0, 6);
  return (
    <div className="space-y-space-4">
      {payload.title && <h3 className="text-fluid-lg font-bold text-[var(--deck-fg,hsl(var(--foreground)))]">{payload.title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-space-4">
        {/* Left: Metrics grid */}
        <div className="md:col-span-3 grid grid-cols-2 gap-space-3">
          {metrics.map((m, i) => (
            <div key={i} className="rounded-xl border border-[var(--deck-border,hsl(var(--border)))] p-space-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className={cn("h-4 w-4", m.status === "positive" ? "text-green-500" : m.status === "negative" ? "text-red-500" : "text-blue-500")} />
                <span className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))]">{m.metricLabel || m.title}</span>
              </div>
              <p className="text-fluid-lg font-bold text-[var(--deck-fg,hsl(var(--foreground)))]">{m.metric || m.content}</p>
            </div>
          ))}
        </div>
        {/* Right: Commentary */}
        <div className="md:col-span-2 rounded-xl border border-[var(--deck-border,hsl(var(--border)))] p-space-4">
          <h4 className="text-fluid-base font-semibold text-[var(--deck-fg,hsl(var(--foreground)))] mb-space-3">Analysis</h4>
          <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))]">{payload.summary || "Key insights and commentary on the metrics."}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Recommendation Layout ─────────────────────────────── */
function RecommendationLayout({ payload }: { payload: SmartLayoutPayload }) {
  return (
    <div className="space-y-space-4">
      {payload.title && <h3 className="text-fluid-lg font-bold text-[var(--deck-fg,hsl(var(--foreground)))]">{payload.title}</h3>}
      {/* Recommendation box */}
      {payload.recommendation && (
        <div className="rounded-xl bg-[var(--deck-accent,hsl(var(--accent)))]/10 border-2 border-[var(--deck-accent,hsl(var(--accent)))]/30 p-space-5">
          <div className="flex items-start gap-3">
            <Target className="h-6 w-6 text-[var(--deck-accent,hsl(var(--accent)))] shrink-0 mt-0.5" />
            <div>
              <p className="text-fluid-sm font-bold text-[var(--deck-accent,hsl(var(--accent)))] uppercase tracking-wider mb-1">Recommendation</p>
              <p className="text-fluid-base font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">{payload.recommendation}</p>
            </div>
          </div>
        </div>
      )}
      {/* Evidence bullets */}
      <div className="space-y-space-2">
        {payload.items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg p-space-3 border border-[var(--deck-border,hsl(var(--border)))]">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-fluid-base font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">{item.title}</p>
              {item.content && <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-0.5">{item.content}</p>}
            </div>
          </div>
        ))}
      </div>
      {/* Risk note */}
      {payload.riskNote && (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-space-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-fluid-sm font-bold text-amber-500 uppercase tracking-wider mb-0.5">Risk</p>
            <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))]">{payload.riskNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Comparison Columns Layout ─────────────────────────── */
function ComparisonColumnsLayout({ payload }: { payload: SmartLayoutPayload }) {
  const COLUMN_COLORS = [
    "border-violet-500/20 bg-violet-500/5",
    "border-teal-500/20 bg-teal-500/5",
    "border-amber-500/20 bg-amber-500/5",
  ];
  return (
    <div className="space-y-space-4">
      {payload.title && <h3 className="text-fluid-lg font-bold text-[var(--deck-fg,hsl(var(--foreground)))]">{payload.title}</h3>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-3">
        {payload.items.slice(0, 3).map((item, i) => (
          <div key={i} className={cn("rounded-xl border p-space-4", COLUMN_COLORS[i % COLUMN_COLORS.length])}>
            <h4 className="text-fluid-base font-bold text-[var(--deck-fg,hsl(var(--foreground)))] mb-space-2">{item.title}</h4>
            {item.metric && <p className="text-fluid-xl font-bold text-[var(--deck-accent,hsl(var(--accent)))] mb-space-2">{item.metric}</p>}
            {item.content && <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))]">{item.content}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Spotlight Layout ──────────────────────────────────── */
function SpotlightLayout({ payload }: { payload: SmartLayoutPayload }) {
  const main = payload.items[0];
  const supporting = payload.items.slice(1, 4);
  return (
    <div className="space-y-space-4">
      {payload.title && <h3 className="text-fluid-lg font-bold text-[var(--deck-fg,hsl(var(--foreground)))]">{payload.title}</h3>}
      {/* Main spotlight */}
      {main && (
        <div className="rounded-2xl border-2 border-[var(--deck-accent,hsl(var(--accent)))]/30 bg-[var(--deck-accent,hsl(var(--accent)))]/5 p-space-6 text-center">
          {main.metric && <p className="text-fluid-2xl font-bold text-[var(--deck-accent,hsl(var(--accent)))]">{main.metric}</p>}
          <p className="text-fluid-lg font-bold text-[var(--deck-fg,hsl(var(--foreground)))] mt-1">{main.title}</p>
          {main.content && <p className="text-fluid-base text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-2 max-w-xl mx-auto">{main.content}</p>}
        </div>
      )}
      {/* Supporting items */}
      {supporting.length > 0 && (
        <div className="grid grid-cols-3 gap-space-3">
          {supporting.map((s, i) => (
            <div key={i} className="rounded-xl border border-[var(--deck-border,hsl(var(--border)))] p-space-3 text-center">
              {s.metric && <p className="text-fluid-lg font-bold text-[var(--deck-fg,hsl(var(--foreground)))]">{s.metric}</p>}
              <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))]">{s.metricLabel || s.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Agenda Layout ─────────────────────────────────────── */
function AgendaLayout({ payload }: { payload: SmartLayoutPayload }) {
  return (
    <div className="space-y-space-4">
      {payload.title && <h3 className="text-fluid-lg font-bold text-[var(--deck-fg,hsl(var(--foreground)))]">{payload.title}</h3>}
      <div className="space-y-space-2">
        {payload.items.map((item, i) => (
          <div key={i} className="flex items-center gap-space-4 rounded-xl border border-[var(--deck-border,hsl(var(--border)))] p-space-4 hover:border-[var(--deck-accent,hsl(var(--accent)))]/30 transition-colors">
            {/* Number */}
            <div className="w-10 h-10 rounded-xl bg-[var(--deck-accent,hsl(var(--accent)))]/10 flex items-center justify-center text-[var(--deck-accent,hsl(var(--accent)))] font-bold text-fluid-base shrink-0">
              {i + 1}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-fluid-base font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">{item.title}</p>
              {item.content && <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))]">{item.content}</p>}
            </div>
            {/* Owner */}
            {item.owner && (
              <div className="flex items-center gap-1.5 text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))] shrink-0">
                <User className="h-3.5 w-3.5" />
                {item.owner}
              </div>
            )}
            {/* Time */}
            {item.time && (
              <div className="flex items-center gap-1.5 text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))] shrink-0">
                <Clock className="h-3.5 w-3.5" />
                {item.time}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────── */
const LAYOUT_RENDERERS: Record<string, React.FC<{ payload: SmartLayoutPayload }>> = {
  "exec-summary": ExecSummaryLayout,
  "metrics-commentary": MetricsCommentaryLayout,
  "recommendation": RecommendationLayout,
  "comparison-columns": ComparisonColumnsLayout,
  "spotlight": SpotlightLayout,
  "agenda": AgendaLayout,
};

export function SmartLayoutBlock({ payload, readOnly = true, className }: SmartLayoutProps) {
  const Renderer = LAYOUT_RENDERERS[payload.layout] || ExecSummaryLayout;
  return (
    <div className={cn("w-full", className)}>
      <Renderer payload={payload} />
    </div>
  );
}
