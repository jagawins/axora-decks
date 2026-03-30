/**
 * Live Adaptive Presentation System
 *
 * During a presentation, the presenter captures audience inputs
 * (requirements, constraints, preferences). Downstream slides
 * regenerate in real-time using Claude AI to reflect those inputs.
 *
 * Example flow:
 * 1. Slide 3: Presenter asks "What's your target RPO/RTO?"
 * 2. Customer says "RPO: 1 hour, RTO: 15 minutes"
 * 3. Presenter types it into the Live Input block
 * 4. Slides 6-10 regenerate: architecture, sizing, pricing adapt
 * 5. By slide 6, the topology already reflects the customer's needs
 *
 * Components:
 * - LiveInputBlock: captures audience data during presentation
 * - LiveVariableContext: stores variables across the deck
 * - AdaptiveBlock: a block that regenerates when variables change
 */

import { useState, useCallback, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  Zap, Loader2, Check, Variable, RefreshCw, Sparkles,
  MessageSquare, ArrowRight
} from "lucide-react";

/* ── Variable Context ───────────────────────────────────── */

interface LiveVariable {
  key: string;
  label: string;
  value: string;
  type: "text" | "number" | "select";
  options?: string[];
  updatedAt: number;
}

interface LiveVariableContextType {
  variables: Record<string, LiveVariable>;
  setVariable: (key: string, value: string) => void;
  getVariable: (key: string) => string;
}

export const LiveVariableContext = createContext<LiveVariableContextType>({
  variables: {},
  setVariable: () => {},
  getVariable: () => "",
});

export function LiveVariableProvider({ children }: { children: React.ReactNode }) {
  const [variables, setVariables] = useState<Record<string, LiveVariable>>({});

  const setVariable = useCallback((key: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [key]: { ...prev[key], key, value, updatedAt: Date.now() },
    }));
  }, []);

  const getVariable = useCallback((key: string) => {
    return variables[key]?.value || "";
  }, [variables]);

  return (
    <LiveVariableContext.Provider value={{ variables, setVariable, getVariable }}>
      {children}
    </LiveVariableContext.Provider>
  );
}

/* ── Live Input Block ───────────────────────────────────── */

export interface LiveInputPayload {
  title?: string;
  description?: string;
  inputs: {
    key: string;
    label: string;
    type: "text" | "number" | "select";
    placeholder?: string;
    options?: string[];
    unit?: string;
  }[];
}

export function LiveInputBlock({ payload }: { payload: LiveInputPayload }) {
  const { title = "Live Input", description, inputs = [] } = payload;
  const { setVariable, variables } = useContext(LiveVariableContext);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full rounded-xl border-2 border-amber-500/30 bg-amber-500/[0.03] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Zap className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Live Input</span>
          <p className="text-base font-bold">{title}</p>
        </div>
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      <div className="space-y-3">
        {inputs.map(input => (
          <div key={input.key} className="space-y-1.5">
            <label className="text-sm font-semibold">{input.label}</label>
            {input.type === "select" && input.options ? (
              <div className="flex flex-wrap gap-2">
                {input.options.map(opt => (
                  <button key={opt} onClick={() => setVariable(input.key, opt)}
                    className={cn("px-3 py-2 rounded-lg border text-sm font-medium transition-all active:scale-95",
                      variables[input.key]?.value === opt ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-border/50 hover:border-amber-500/30")}>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type={input.type === "number" ? "number" : "text"}
                  placeholder={input.placeholder || ""}
                  value={variables[input.key]?.value || ""}
                  onChange={e => setVariable(input.key, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-border/50 bg-background text-sm outline-none focus:border-amber-500/50 transition-colors"
                />
                {input.unit && <span className="text-xs text-muted-foreground shrink-0">{input.unit}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button size="sm" className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white" onClick={handleSave}>
          {saved ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
          {saved ? "Saved" : "Apply to remaining slides"}
        </Button>
        <p className="text-[10px] text-muted-foreground">Downstream slides will adapt to these inputs</p>
      </div>
    </div>
  );
}

/* ── Adaptive Block ─────────────────────────────────────── */

export interface AdaptiveBlockPayload {
  title?: string;
  basePrompt: string;
  variableKeys: string[];
  generatedContent?: string;
}

export function AdaptiveBlock({ payload }: { payload: AdaptiveBlockPayload }) {
  const { title, basePrompt, variableKeys = [], generatedContent } = payload;
  const { variables, getVariable } = useContext(LiveVariableContext);
  const [content, setContent] = useState(generatedContent || "");
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(0);

  // Check if any referenced variables have been updated since last generation
  const hasUpdates = variableKeys.some(key => {
    const v = variables[key];
    return v && v.updatedAt > lastGenerated;
  });

  const regenerate = async () => {
    setGenerating(true);
    try {
      // Build context from variables
      const context = variableKeys
        .map(key => `${key}: ${getVariable(key) || "(not set)"}`)
        .join("\n");

      const { data, error } = await supabase.functions.invoke("generate-outline", {
        body: {
          topic: "Adaptive slide content",
          prompt: `Based on these live inputs from the audience:\n\n${context}\n\n${basePrompt}\n\nGenerate concise, specific content. Use actual numbers from the inputs. No placeholder text. Be direct and actionable.`,
          tone: "executive",
          cardsCount: 1,
        },
      });

      if (error) throw error;

      const outline = data?.outline;
      if (outline?.sections) {
        const text = outline.sections.map((s: any) =>
          `**${s.heading}**\n${s.bullets?.join('\n') || s.description || ''}`
        ).join('\n\n');
        setContent(text);
      }
      setLastGenerated(Date.now());
    } catch (err) {
      console.error("Adaptive block generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={cn("w-full rounded-xl border p-5 space-y-3 transition-all",
      hasUpdates ? "border-amber-500/40 bg-amber-500/[0.02]" : "border-border/50 bg-card/30")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className={cn("h-4 w-4", hasUpdates ? "text-amber-500" : "text-accent")} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {hasUpdates ? "New inputs available" : "Adaptive content"}
          </span>
        </div>
        <Button variant="ghost" size="sm" className={cn("text-xs gap-1.5", hasUpdates && "text-amber-500")}
          onClick={regenerate} disabled={generating}>
          {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {generating ? "Adapting..." : hasUpdates ? "Adapt now" : "Regenerate"}
        </Button>
      </div>

      {title && <h3 className="text-base font-bold">{title}</h3>}

      {content ? (
        <div className="space-y-2">
          {content.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="text-sm font-bold mt-3">{line.replace(/\*\*/g, '')}</p>;
            if (line.startsWith('- ') || line.startsWith('* ')) return <p key={i} className="text-sm text-muted-foreground pl-4">{line.replace(/^[-*] /, '• ')}</p>;
            if (line.trim() === '') return <div key={i} className="h-1" />;
            return <p key={i} className="text-sm">{line}</p>;
          })}
        </div>
      ) : (
        <div className="text-center py-6 space-y-2">
          <p className="text-sm text-muted-foreground">This slide adapts based on audience inputs.</p>
          <p className="text-xs text-muted-foreground">
            Waiting for: {variableKeys.map(k => <span key={k} className="font-mono text-amber-500 mx-1">{k}</span>)}
          </p>
          {variableKeys.some(k => getVariable(k)) && (
            <Button size="sm" className="gap-1.5 mt-2" onClick={regenerate}>
              <Sparkles className="h-3.5 w-3.5" /> Generate now
            </Button>
          )}
        </div>
      )}

      {/* Variable references */}
      {variableKeys.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
          {variableKeys.map(key => {
            const val = getVariable(key);
            return (
              <span key={key} className={cn("text-[9px] px-2 py-0.5 rounded-full border",
                val ? "border-amber-500/30 bg-amber-500/5 text-amber-600" : "border-border/30 text-muted-foreground")}>
                {key}: {val || "pending"}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
