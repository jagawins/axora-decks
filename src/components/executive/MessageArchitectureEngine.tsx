/**
 * Message Architecture Engine (Phase 2)
 *
 * Guided intake that forces executives to define:
 * 1. Decision statement — what must they approve/fund/change
 * 2. Audience brief — who, what they value, what they fear
 * 3. The ask — one sentence with verb, owner, date
 * 4. Three reasons (MECE) with evidence
 * 5. Architecture choice — Decision brief / Change narrative / Crisis statement
 *
 * Output: structured JSON that feeds into deck generation
 */

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { invokeFunction } from "@/lib/supabase-function-client";
import {
  Target, Users, MessageSquare, CheckCircle, AlertTriangle,
  ArrowRight, Sparkles, Loader2, FileText, Zap, Shield
} from "lucide-react";

type Architecture = "decision-brief" | "change-narrative" | "crisis-statement";
type Step = 1 | 2 | 3 | 4 | 5;

interface MessageArchitecture {
  architecture: Architecture;
  decision: string;
  audience: { who: string; values: string; fears: string; gains: string };
  ask: string;
  reasons: { reason: string; evidence: string }[];
  // Change narrative extras
  currentReality?: string;
  desiredFuture?: string;
  // Crisis extras
  empathyStatement?: string;
  factsSoFar?: string;
}

const ARCHITECTURES: { id: Architecture; label: string; icon: React.FC<any>; desc: string; when: string }[] = [
  { id: "decision-brief", label: "Decision Brief", icon: Target, desc: "Answer first → 3 reasons → evidence → ask", when: "Board updates, strategy decisions, resource asks" },
  { id: "change-narrative", label: "Change Narrative", icon: Zap, desc: "What is → what could be → contrast loop → invitation", when: "Transformations, town halls, culture moments" },
  { id: "crisis-statement", label: "Crisis Statement", icon: Shield, desc: "Empathy → facts → next update → action", when: "Incidents, layoffs, regulatory, press" },
];

export default function MessageArchitectureEngine() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>(1);
  const [arch, setArch] = useState<Architecture>("decision-brief");
  const [decision, setDecision] = useState("");
  const [audience, setAudience] = useState({ who: "", values: "", fears: "", gains: "" });
  const [ask, setAsk] = useState("");
  const [reasons, setReasons] = useState([
    { reason: "", evidence: "" },
    { reason: "", evidence: "" },
    { reason: "", evidence: "" },
  ]);
  const [currentReality, setCurrentReality] = useState("");
  const [desiredFuture, setDesiredFuture] = useState("");
  const [empathyStatement, setEmpathyStatement] = useState("");
  const [factsSoFar, setFactsSoFar] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  const aiSuggest = useCallback(async (field: string) => {
    if (!user) { navigate("/auth"); return; }
    setAiSuggesting(true);
    try {
      const context = `Architecture: ${arch}. Decision: ${decision}. Audience: ${audience.who}. Ask: ${ask}.`;
      const res = await invokeFunction<{ blocks: { type: string; content: any }[] }>(
        "generate-data-visual",
        { prompt: `Given this executive communication context: ${context}\n\nSuggest a strong ${field}. Return ONLY the text, no JSON.`, blockType: "text" }
      );
      const text = res.data?.blocks?.[0]?.content?.text || "";
      if (text) {
        if (field === "decision") setDecision(text);
        else if (field === "ask") setAsk(text);
        else if (field === "empathy") setEmpathyStatement(text);
        toast({ title: "AI suggestion applied" });
      }
    } catch { toast({ title: "AI suggestion failed", variant: "destructive" }); }
    finally { setAiSuggesting(false); }
  }, [user, arch, decision, audience, ask, navigate, toast]);

  const generateDeck = useCallback(async () => {
    if (!user) { navigate("/auth"); return; }
    setGenerating(true);

    const archData: MessageArchitecture = {
      architecture: arch, decision, audience, ask, reasons: reasons.filter(r => r.reason),
      ...(arch === "change-narrative" ? { currentReality, desiredFuture } : {}),
      ...(arch === "crisis-statement" ? { empathyStatement, factsSoFar } : {}),
    };

    const prompt = arch === "decision-brief"
      ? `Create an executive decision deck.\n\nDECISION: ${decision}\nAUDIENCE: ${audience.who} (values: ${audience.values}, fears: ${audience.fears})\nASK: ${ask}\n\nStructure: Answer first, then 3 reasons with evidence.\nReason 1: ${reasons[0]?.reason} (Evidence: ${reasons[0]?.evidence})\nReason 2: ${reasons[1]?.reason} (Evidence: ${reasons[1]?.evidence})\nReason 3: ${reasons[2]?.reason} (Evidence: ${reasons[2]?.evidence})\n\nUse smart_layout recommendation block for the main slide. Use stat_block for metrics. End with cta_button_block for the ask.`
      : arch === "change-narrative"
      ? `Create a change narrative deck.\n\nCURRENT REALITY: ${currentReality}\nDESIRED FUTURE: ${desiredFuture}\nAUDIENCE: ${audience.who}\nASK: ${ask}\n\nStructure: What is today → What could be → Contrast loop (repeat 3x) → New reality → Invitation.\nUse hero_header for opening. Use smart_layout exec-summary for current state. Use smart_layout comparison-columns for contrast. End with cta_button_block.`
      : `Create a crisis communication deck.\n\nEMPATHY: ${empathyStatement}\nFACTS: ${factsSoFar}\nAUDIENCE: ${audience.who}\nNEXT STEPS: ${ask}\n\nStructure: Empathy first → Facts so far → What we're doing → Next update → Action items.\nKeep slides minimal and clear. Use framed_insight for key messages. Use timeline_block for response timeline.`;

    navigate(`/create?prompt=${encodeURIComponent(prompt)}`);
    setGenerating(false);
  }, [arch, decision, audience, ask, reasons, currentReality, desiredFuture, empathyStatement, factsSoFar, user, navigate]);

  const canProceed = () => {
    if (step === 1) return !!arch;
    if (step === 2) return decision.length > 10;
    if (step === 3) return audience.who.length > 3;
    if (step === 4) return reasons[0].reason.length > 5;
    return ask.length > 5;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
              s < step ? "bg-green-500 text-white" : s === step ? "bg-accent text-white" : "bg-muted/30 text-muted-foreground")}>
              {s < step ? <CheckCircle className="h-4 w-4" /> : s}
            </div>
            {s < 5 && <div className={cn("flex-1 h-0.5", s < step ? "bg-green-500" : "bg-border")} />}
          </div>
        ))}
      </div>

      {/* Step 1: Choose Architecture */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">What type of executive communication?</h3>
          <p className="text-sm text-muted-foreground">Choose the message architecture that fits your situation.</p>
          <div className="space-y-3">
            {ARCHITECTURES.map(a => (
              <button key={a.id} onClick={() => setArch(a.id)}
                className={cn("w-full text-left p-4 rounded-xl border transition-all",
                  arch === a.id ? "border-accent bg-accent/5" : "border-border/50 hover:border-accent/30")}>
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    arch === a.id ? "bg-accent text-white" : "bg-muted/30 text-muted-foreground")}>
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{a.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                    <p className="text-[10px] text-accent mt-1">{a.when}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Decision Statement */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><Target className="h-5 w-5 text-accent" /> Define the Decision</h3>
          <p className="text-sm text-muted-foreground">
            {arch === "decision-brief" ? "What exactly must they approve, fund, change, or stop?" :
             arch === "change-narrative" ? "Describe the current reality and the desired future." :
             "What happened and what's the empathy-first opening?"}
          </p>
          {arch === "decision-brief" && (
            <div className="space-y-3">
              <Textarea placeholder="e.g., We should expand to the EU market in Q2 2026 with a Berlin-first strategy" value={decision} onChange={e => setDecision(e.target.value)} className="min-h-[80px]" />
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-accent" onClick={() => aiSuggest("decision")} disabled={aiSuggesting}>
                <Sparkles className="h-3 w-3" /> AI suggest
              </Button>
            </div>
          )}
          {arch === "change-narrative" && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground">What is today (current reality)</label>
              <Textarea placeholder="e.g., Our teams spend 40% of time on manual processes..." value={currentReality} onChange={e => setCurrentReality(e.target.value)} className="min-h-[60px]" />
              <label className="text-xs font-semibold text-muted-foreground">What could be (desired future)</label>
              <Textarea placeholder="e.g., With AI automation, teams focus on strategy..." value={desiredFuture} onChange={e => setDesiredFuture(e.target.value)} className="min-h-[60px]" />
              <Textarea placeholder="One-line decision statement" value={decision} onChange={e => setDecision(e.target.value)} />
            </div>
          )}
          {arch === "crisis-statement" && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground">Empathy-first opening</label>
              <Textarea placeholder="e.g., We understand this is difficult news and we want to be transparent..." value={empathyStatement} onChange={e => setEmpathyStatement(e.target.value)} className="min-h-[60px]" />
              <label className="text-xs font-semibold text-muted-foreground">Facts so far</label>
              <Textarea placeholder="What we know right now..." value={factsSoFar} onChange={e => setFactsSoFar(e.target.value)} className="min-h-[60px]" />
              <Textarea placeholder="One-line decision/situation statement" value={decision} onChange={e => setDecision(e.target.value)} />
            </div>
          )}
        </div>
      )}

      {/* Step 3: Audience Brief */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><Users className="h-5 w-5 text-accent" /> Audience Brief</h3>
          <p className="text-sm text-muted-foreground">Who is in the room and what drives them?</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Who is the audience?</label>
              <Textarea placeholder="e.g., Board of Directors, 8 members, mix of financial and operational backgrounds" value={audience.who} onChange={e => setAudience({ ...audience, who: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">What do they value?</label>
              <Textarea placeholder="ROI, risk mitigation, growth..." value={audience.values} onChange={e => setAudience({ ...audience, values: e.target.value })} className="min-h-[60px]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">What do they fear?</label>
              <Textarea placeholder="Overextension, regulatory risk..." value={audience.fears} onChange={e => setAudience({ ...audience, fears: e.target.value })} className="min-h-[60px]" />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Three Reasons + Evidence */}
      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><MessageSquare className="h-5 w-5 text-accent" /> Three Reasons (MECE)</h3>
          <p className="text-sm text-muted-foreground">Each reason must be mutually exclusive and collectively exhaustive. No overlap, no gaps.</p>
          {reasons.map((r, i) => (
            <div key={i} className="rounded-xl border border-border/50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">{i + 1}</div>
                <span className="text-xs font-semibold text-muted-foreground">Reason {i + 1}</span>
              </div>
              <Textarea placeholder={`e.g., ${i === 0 ? "EU market is growing 34% YoY" : i === 1 ? "Berlin has 3x lower CAC than London" : "We have existing EU partnerships to leverage"}`}
                value={r.reason} onChange={e => { const n = [...reasons]; n[i].reason = e.target.value; setReasons(n); }} className="min-h-[50px]" />
              <Textarea placeholder="Evidence: metric, example, or precedent"
                value={r.evidence} onChange={e => { const n = [...reasons]; n[i].evidence = e.target.value; setReasons(n); }} className="min-h-[40px] text-xs" />
            </div>
          ))}
          {/* MECE check indicator */}
          <div className={cn("rounded-lg p-3 text-xs flex items-center gap-2",
            reasons.filter(r => r.reason).length >= 2 ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500")}>
            {reasons.filter(r => r.reason).length >= 2 ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {reasons.filter(r => r.reason).length >= 2 ? `${reasons.filter(r => r.reason).length} reasons defined — check for overlap` : "At least 2 reasons required"}
          </div>
        </div>
      )}

      {/* Step 5: The Ask + Generate */}
      {step === 5 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-accent" /> The Ask</h3>
          <p className="text-sm text-muted-foreground">One sentence. Must include a verb, an owner, and a date.</p>
          <Textarea placeholder="e.g., I need the board to approve €2M for EU expansion by March 31, with Sarah as regional lead." value={ask} onChange={e => setAsk(e.target.value)} className="min-h-[80px]" />
          <Button variant="ghost" size="sm" className="text-xs gap-1 text-accent" onClick={() => aiSuggest("ask")} disabled={aiSuggesting}>
            <Sparkles className="h-3 w-3" /> AI suggest based on context
          </Button>

          {/* Summary */}
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-2">
            <p className="text-xs font-bold text-accent uppercase tracking-wider">Summary</p>
            <p className="text-sm"><strong>Architecture:</strong> {ARCHITECTURES.find(a => a.id === arch)?.label}</p>
            <p className="text-sm"><strong>Decision:</strong> {decision}</p>
            <p className="text-sm"><strong>Audience:</strong> {audience.who}</p>
            <p className="text-sm"><strong>Reasons:</strong> {reasons.filter(r => r.reason).map(r => r.reason).join(" · ")}</p>
            <p className="text-sm"><strong>Ask:</strong> {ask}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep((step - 1) as Step)}>← Back</Button>
        ) : <div />}
        {step < 5 ? (
          <Button variant="hero" onClick={() => setStep((step + 1) as Step)} disabled={!canProceed()} className="gap-2">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="hero" onClick={generateDeck} disabled={generating || !canProceed()} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate Deck from Architecture
          </Button>
        )}
      </div>
    </div>
  );
}
