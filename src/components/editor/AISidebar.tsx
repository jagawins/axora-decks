import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Brain, TrendingUp, AlertTriangle, BarChart3, Shield,
  Loader2, ChevronRight, ChevronLeft, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Block } from "@/lib/blocks";

interface Finding {
  title: string;
  severity: "high" | "medium" | "low";
  detail: string;
  suggestion: string;
  blockIndex?: number;
}

interface Analysis {
  summary: string;
  findings: Finding[];
  overallScore: number;
}

interface AISidebarProps {
  open: boolean;
  onToggle: () => void;
  blocks: Block[];
}

const analysisOptions = [
  { mode: "improve_argument", label: "Improve Argument", icon: TrendingUp, description: "Strengthen logical flow & evidence" },
  { mode: "identify_weak_logic", label: "Weak Logic", icon: AlertTriangle, description: "Find gaps & unsupported claims" },
  { mode: "suggest_missing_metric", label: "Missing Metrics", icon: BarChart3, description: "Suggest data points & KPIs" },
  { mode: "stress_test_narrative", label: "Stress Test", icon: Shield, description: "Anticipate counterarguments" },
] as const;

const severityColors: Record<string, string> = {
  high: "text-destructive border-destructive/30 bg-destructive/10",
  medium: "text-amber-500 border-amber-500/30 bg-amber-500/10",
  low: "text-muted-foreground border-border bg-muted/50",
};

const AISidebar = ({ open, onToggle, blocks }: AISidebarProps) => {
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [activeMode, setActiveMode] = useState<string | null>(null);

  const handleAnalyze = async (mode: string) => {
    if (blocks.length === 0) {
      toast({ title: "No content", description: "Add blocks before analyzing.", variant: "destructive" });
      return;
    }

    setAnalyzing(true);
    setActiveMode(mode);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: {
          blocks: blocks.map((b) => ({ type: b.type, content: b.content })),
          mode,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysis(data.analysis);
    } catch (err) {
      console.error("Analysis error:", err);
      toast({
        title: "Analysis failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={onToggle}
        className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 items-center gap-1 bg-card border border-border border-r-0 rounded-l-lg px-1.5 py-3 hover:bg-muted transition-colors"
      >
        <Brain className="h-4 w-4 text-accent" />
        <ChevronLeft className="h-3 w-3 text-muted-foreground" />
      </button>
    );
  }

  return (
    <aside className="hidden md:flex w-80 border-l border-border bg-card/30 flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-accent" />
          <h3 className="font-semibold text-sm">AI Analysis</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Analysis actions */}
        <div className="space-y-2">
          {analysisOptions.map(({ mode, label, icon: Icon, description }) => (
            <Button
              key={mode}
              variant={activeMode === mode ? "secondary" : "outline"}
              className="w-full justify-start h-auto py-2.5"
              disabled={analyzing}
              onClick={() => handleAnalyze(mode)}
            >
              {analyzing && activeMode === mode ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
              )}
              <div className="text-left">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Results */}
        {analysis && (
          <div className="space-y-4 pt-4 border-t border-border">
            {/* Score */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <span className="text-sm font-medium">Quality Score</span>
              <span className={`text-lg font-bold ${analysis.overallScore >= 7 ? 'text-green-500' : analysis.overallScore >= 4 ? 'text-amber-500' : 'text-destructive'}`}>
                {analysis.overallScore}/10
              </span>
            </div>

            {/* Summary */}
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>

            {/* Findings */}
            <div className="space-y-3">
              {analysis.findings.map((finding, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${severityColors[finding.severity]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium">{finding.title}</h4>
                    <span className="text-xs uppercase font-semibold flex-shrink-0">
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-xs mt-1 opacity-80">{finding.detail}</p>
                  <p className="text-xs mt-2 font-medium">→ {finding.suggestion}</p>
                  {finding.blockIndex !== undefined && (
                    <p className="text-xs mt-1 opacity-60">Block #{finding.blockIndex + 1}</p>
                  )}
                </div>
              ))}
            </div>

            <Button variant="ghost" size="sm" className="w-full" onClick={() => setAnalysis(null)}>
              <X className="h-3 w-3 mr-1" />
              Clear Results
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AISidebar;
