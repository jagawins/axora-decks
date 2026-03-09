import { useEffect, useState } from "react";
import { Loader2, ArrowRight, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { invokeFunction } from "@/lib/supabase-function-client";
import { useToast } from "@/hooks/use-toast";
import type { AlignmentData, ResearchBrief, ResearchFinding } from "@/types/research-mode";

interface ResearchStepProps {
  alignment: AlignmentData;
  brief: ResearchBrief | null;
  onBriefReady: (brief: ResearchBrief) => void;
  onNext: () => void;
  onBack: () => void;
}

function FindingCard({
  finding,
  index,
}: {
  finding: ResearchFinding;
  index: number;
}) {
  const [expanded, setExpanded] = useState(index < 3);

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        finding.verify_required
          ? "border-warning/50 bg-warning/5"
          : "border-border/50 bg-card/50"
      }`}
    >
      <button
        type="button"
        className="w-full flex items-start justify-between gap-2 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-foreground text-sm">
              {finding.title}
            </h4>
            {finding.verify_required && (
              <Badge
                variant="outline"
                className="text-[10px] border-warning/50 text-warning"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Verify
              </Badge>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-muted-foreground">{finding.detail}</p>

          {finding.data_points.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {finding.data_points.map((dp, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {dp}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground/70 italic">
            Source: {finding.source_label}
            {finding.source_url ? ` — ${finding.source_url}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ResearchStep({
  alignment,
  brief,
  onBriefReady,
  onNext,
  onBack,
}: ResearchStepProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(!brief);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (brief) return; // Already have results

    let cancelled = false;

    async function runResearch() {
      setLoading(true);
      setError(null);

      const res = await invokeFunction<{ brief: ResearchBrief }>(
        "deep-research",
        {
          alignment: {
            goal: alignment.goal,
            audience: alignment.audience,
            outcome: alignment.outcome,
            mustIncludeFacts: alignment.mustIncludeFacts || undefined,
            fileExtracts: alignment.fileExtracts.length
              ? alignment.fileExtracts.map((f) => f.text)
              : undefined,
          },
        }
      );

      if (cancelled) return;

      if (res.error || !res.data?.brief) {
        const msg = res.error || "Research failed";
        setError(msg);
        toast({ title: "Research failed", description: msg, variant: "destructive" });
      } else {
        onBriefReady(res.data.brief);
      }
      setLoading(false);
    }

    runResearch();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Researching your topic…
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Synthesising research from AI knowledge (training data current to
            early 2025). Live web search coming soon.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Research failed
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack}>
            Go back
          </Button>
          <Button
            variant="hero"
            onClick={() => {
              setError(null);
              setLoading(true);
              // Re-trigger by clearing brief reference — the effect won't re-run
              // so we manually call it
              (async () => {
                const res = await invokeFunction<{ brief: ResearchBrief }>(
                  "deep-research",
                  {
                    alignment: {
                      goal: alignment.goal,
                      audience: alignment.audience,
                      outcome: alignment.outcome,
                      mustIncludeFacts: alignment.mustIncludeFacts || undefined,
                      fileExtracts: alignment.fileExtracts.length
                        ? alignment.fileExtracts.map((f) => f.text)
                        : undefined,
                    },
                  }
                );
                if (res.error || !res.data?.brief) {
                  setError(res.error || "Research failed");
                  toast({
                    title: "Research failed",
                    description: res.error || "Please try again",
                    variant: "destructive",
                  });
                } else {
                  onBriefReady(res.data.brief);
                }
                setLoading(false);
              })();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!brief) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Research Brief
        </h2>
        <p className="text-xs text-muted-foreground italic">
          AI-synthesised — verify key statistics before presenting
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
        <p className="text-sm text-foreground">{brief.summary}</p>
      </div>

      {/* Findings */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">
          Findings ({brief.findings.length})
        </h3>
        {brief.findings.map((f, i) => (
          <FindingCard key={i} finding={f} index={i} />
        ))}
      </div>

      {/* Conflicts */}
      {brief.conflicts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            Conflicting viewpoints
          </h3>
          {brief.conflicts.map((c, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-border/50 bg-card/50 space-y-1"
            >
              <p className="text-sm font-medium text-foreground">{c.topic}</p>
              <ul className="space-y-1">
                {c.positions.map((p, j) => (
                  <li key={j} className="text-xs text-muted-foreground">
                    • {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="hero" size="lg" className="flex-1" onClick={onNext}>
          Build Outline
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
