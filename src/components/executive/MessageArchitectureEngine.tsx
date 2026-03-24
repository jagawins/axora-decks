/**
 * Speech Prep — simplified from "Message Architecture Engine"
 * 
 * One page, no wizard. Executive fills in what they need, generates deck.
 * Plain language, not jargon.
 */

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Target, Users, ArrowRight, Sparkles, Loader2, Zap, Shield
} from "lucide-react";

type SpeechType = "decision" | "change" | "crisis";

export default function MessageArchitectureEngine() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [speechType, setSpeechType] = useState<SpeechType>("decision");
  const [decision, setDecision] = useState("");
  const [audience, setAudience] = useState("");
  const [ask, setAsk] = useState("");
  const [reason1, setReason1] = useState("");
  const [reason2, setReason2] = useState("");
  const [reason3, setReason3] = useState("");
  const [currentReality, setCurrentReality] = useState("");
  const [desiredFuture, setDesiredFuture] = useState("");
  const [empathy, setEmpathy] = useState("");
  const [facts, setFacts] = useState("");
  const [generating, setGenerating] = useState(false);

  const TYPES: { id: SpeechType; label: string; icon: React.FC<any>; example: string }[] = [
    { id: "decision", label: "Get a decision", icon: Target, example: "Board approval, budget sign-off, strategy vote" },
    { id: "change", label: "Drive change", icon: Zap, example: "Transformation launch, town hall, new initiative" },
    { id: "crisis", label: "Handle a crisis", icon: Shield, example: "Layoffs, incidents, regulatory, press" },
  ];

  const generateDeck = useCallback(() => {
    if (!user) { navigate("/auth"); return; }

    let prompt = "";
    if (speechType === "decision") {
      prompt = `Create an executive decision deck.

WHAT I NEED APPROVED: ${decision}
WHO I AM PRESENTING TO: ${audience}
WHAT I AM ASKING FOR: ${ask}

Structure it answer-first:
1. Start with the recommendation
2. Reason 1: ${reason1}
3. Reason 2: ${reason2}
4. Reason 3: ${reason3}
5. End with the specific ask

Use smart_layout recommendation block for the main recommendation. Use stat_block for any metrics. End with cta_button_block for the ask.`;
    } else if (speechType === "change") {
      prompt = `Create a change narrative deck.

WHERE WE ARE TODAY: ${currentReality}
WHERE WE NEED TO BE: ${desiredFuture}
WHO I AM PRESENTING TO: ${audience}
WHAT I NEED THEM TO DO: ${ask}

Structure: Show the gap between today and tomorrow. Make the audience feel the need for change before asking them to commit. End with a clear invitation to act.

Use hero_header for opening. Use smart_layout comparison-columns for today vs tomorrow. End with cta_button_block.`;
    } else {
      prompt = `Create a crisis communication deck.

OPENING (EMPATHY FIRST): ${empathy}
WHAT WE KNOW SO FAR: ${facts}
WHO THIS IS FOR: ${audience}
NEXT STEPS: ${ask}

Structure: Lead with empathy. State facts clearly. Explain what we are doing. Give the next update timeline. Keep every slide minimal and clear.

Use framed_insight for key messages. Use timeline_block for response timeline.`;
    }

    navigate(`/create?prompt=${encodeURIComponent(prompt)}`);
  }, [speechType, decision, audience, ask, reason1, reason2, reason3, currentReality, desiredFuture, empathy, facts, user, navigate]);

  const canGenerate = () => {
    if (speechType === "decision") return decision.length > 5 && ask.length > 5;
    if (speechType === "change") return currentReality.length > 5 && desiredFuture.length > 5;
    return empathy.length > 5 && facts.length > 5;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Step 1: What kind of talk? */}
      <div>
        <h3 className="text-lg font-bold mb-1">What do you need to accomplish?</h3>
        <p className="text-sm text-muted-foreground mb-4">Pick the one that fits. We will structure your deck accordingly.</p>
        <div className="grid grid-cols-3 gap-3">
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setSpeechType(t.id)}
              className={cn("text-left p-4 rounded-xl border transition-all",
                speechType === t.id ? "border-accent bg-accent/5 shadow-sm" : "border-border/50 hover:border-accent/30")}>
              <t.icon className={cn("h-5 w-5 mb-2", speechType === t.id ? "text-accent" : "text-muted-foreground")} />
              <p className="text-sm font-bold">{t.label}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t.example}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Decision flow */}
      {speechType === "decision" && (
        <div className="space-y-5">
          <Field label="What do you need approved?" placeholder="e.g., Expand to EU market in Q2 with a Berlin-first strategy" value={decision} onChange={setDecision} />
          <Field label="Who are you presenting to?" placeholder="e.g., Board of Directors — 8 members, mostly financial backgrounds" value={audience} onChange={setAudience} />
          <div>
            <p className="text-sm font-semibold mb-2">Why should they say yes? (give 3 reasons)</p>
            <div className="space-y-2">
              <Textarea placeholder="Reason 1: e.g., EU market growing 34% year over year" value={reason1} onChange={e => setReason1(e.target.value)} className="min-h-[44px]" />
              <Textarea placeholder="Reason 2: e.g., Berlin has 3x lower customer acquisition cost" value={reason2} onChange={e => setReason2(e.target.value)} className="min-h-[44px]" />
              <Textarea placeholder="Reason 3: e.g., We have existing partnerships to leverage" value={reason3} onChange={e => setReason3(e.target.value)} className="min-h-[44px]" />
            </div>
          </div>
          <Field label="What exactly are you asking for?" placeholder="e.g., Approve 2M euro for EU expansion by March 31, with Sarah as regional lead" value={ask} onChange={setAsk} />
        </div>
      )}

      {/* Change flow */}
      {speechType === "change" && (
        <div className="space-y-5">
          <Field label="Where are we today?" placeholder="e.g., Teams spend 40% of time on manual processes that could be automated" value={currentReality} onChange={setCurrentReality} />
          <Field label="Where do we need to be?" placeholder="e.g., With AI automation, teams focus on strategy and customer relationships" value={desiredFuture} onChange={setDesiredFuture} />
          <Field label="Who are you presenting to?" placeholder="e.g., All-hands meeting, 200 employees, mixed departments" value={audience} onChange={setAudience} />
          <Field label="What do you need them to do?" placeholder="e.g., Adopt the new workflow by end of Q2 and attend training sessions" value={ask} onChange={setAsk} />
        </div>
      )}

      {/* Crisis flow */}
      {speechType === "crisis" && (
        <div className="space-y-5">
          <Field label="Start with empathy — what do they need to hear first?" placeholder="e.g., We understand this is difficult news and we want to be fully transparent with you" value={empathy} onChange={setEmpathy} />
          <Field label="What do we know so far?" placeholder="e.g., 47 roles are affected across engineering and marketing. Severance includes 12 weeks plus benefits continuation." value={facts} onChange={setFacts} />
          <Field label="Who is this for?" placeholder="e.g., All employees, delivered in town hall format" value={audience} onChange={setAudience} />
          <Field label="What are the next steps?" placeholder="e.g., Affected employees notified by direct manager today. FAQ document by end of day. Follow-up town hall Friday." value={ask} onChange={setAsk} />
        </div>
      )}

      {/* ── Delivery Coaching (expert techniques) ──────────── */}
      {(decision.length > 5 || currentReality.length > 5 || empathy.length > 5) && (
        <div className="rounded-2xl border border-accent/20 bg-accent/[0.03] p-5 space-y-5">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 mb-1">
              <span className="text-lg">🎤</span> Delivery coaching
            </h3>
            <p className="text-xs text-muted-foreground">Techniques from top communication experts to help you land your message.</p>
          </div>

          {/* Vocal Delivery */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-accent">Voice — your instrument</p>
            <p className="text-sm text-muted-foreground">Your voice is an instrument with 5 foundations: rate, pitch, volume, pause, and tone. Most people only use 2-3. Use all of them.</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { tip: "Slow down for key points", detail: "Drop your pace when stating your recommendation. Speed up when building energy." },
                { tip: "Use strategic pauses", detail: "Pause for 2-3 seconds after your main point. Silence lets it land." },
                { tip: "Vary your volume", detail: "Normal at 6/10. Go quiet for intimacy ('and here is the truth...'). Loud for urgency." },
                { tip: "Smile for melody", detail: "Smiling naturally adds warmth and melody to your voice. Use it on your opening line." },
              ].map((v, i) => (
                <div key={i} className="rounded-lg bg-background/50 border border-border/30 p-3">
                  <p className="text-xs font-semibold">{v.tip}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{v.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vocal Archetypes */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-accent">Switch your mode</p>
            <p className="text-sm text-muted-foreground">Great speakers switch between 4 modes during a single talk. Match the mode to the moment.</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { mode: "Educator", when: "Sharing data or context", voice: "Steady pace, clear" },
                { mode: "Coach", when: "Giving tough feedback", voice: "Direct, warm, firm" },
                { mode: "Motivator", when: "Building energy", voice: "Fast, loud, passionate" },
                { mode: "Friend", when: "Building trust", voice: "Soft, slow, personal" },
              ].map((a, i) => (
                <div key={i} className="rounded-lg bg-background/50 border border-border/30 p-2.5 text-center">
                  <p className="text-[10px] font-bold">{a.mode}</p>
                  <p className="text-[8px] text-accent mt-0.5">{a.when}</p>
                  <p className="text-[8px] text-muted-foreground mt-0.5">{a.voice}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Story Structure */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-accent">Story structure</p>
            <p className="text-sm text-muted-foreground">Balance head (facts, data) and heart (stories, emotion). People decide with emotion and justify with logic.</p>
            <div className="space-y-1.5">
              {[
                { icon: "🧠", tip: "Head → Heart → Head", detail: "Start with a fact. Tell a short story that makes it real. Close with the data again." },
                { icon: "🔄", tip: "Use the looping technique", detail: "Open a story loop early ('Let me tell you what happened when...'). Close it later. Keeps attention." },
                { icon: "🦸", tip: "Make them the hero", detail: "Your audience is the hero. You are the guide. Show them the path, don't lecture." },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-background/50 border border-border/30">
                  <span className="text-sm shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-xs font-semibold">{s.tip}</p>
                    <p className="text-[10px] text-muted-foreground">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Body Language */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-accent">Presence</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "👁️", tip: "Eye contact", detail: "Pick 3 people in different sections. Speak to them in rotation." },
                { icon: "🧍", tip: "Stand tall, move with purpose", detail: "Plant your feet. Step forward for emphasis. Never pace aimlessly." },
                { icon: "🤝", tip: "Open with connection", detail: "Ask a question in your first 10 seconds. Make them participants, not spectators." },
              ].map((b, i) => (
                <div key={i} className="rounded-lg bg-background/50 border border-border/30 p-3 text-center">
                  <span className="text-lg">{b.icon}</span>
                  <p className="text-[10px] font-semibold mt-1">{b.tip}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{b.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Checklist — the 3Cs + expert tips */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-accent">Before you present — the 3Cs check</p>
            <p className="text-[10px] text-muted-foreground mb-1">Clarity. Conciseness. Confidence. If you can check all of these, you are ready.</p>
            {[
              { c: "Clarity", item: "Can you state your main point in one sentence?" },
              { c: "Clarity", item: "Does every slide support your one main message?" },
              { c: "Conciseness", item: "Can you deliver the whole talk in the allotted time?" },
              { c: "Conciseness", item: "Have you cut anything that does not move the audience closer to yes?" },
              { c: "Confidence", item: "Do you know your opening and closing by heart?" },
              { c: "Confidence", item: "Have you practiced out loud at least 3 times?" },
              { c: "Confidence", item: "Can you answer the 3 hardest questions you might get?" },
              { c: "Confidence", item: "Do you have one story that makes the data feel real?" },
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-[9px] font-bold text-accent w-16 shrink-0">{item.c}</span>
                <span className="text-xs">{item.item}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Generate */}
      <Button onClick={generateDeck} disabled={generating || !canGenerate()} className="w-full gap-2 py-6 text-base" variant="hero">
        {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        Generate my speech
      </Button>
    </div>
  );
}

/* ── Simple Field ──────────────────────────────────────── */
function Field({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-semibold mb-1.5 block">{label}</label>
      <Textarea placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="min-h-[56px]" />
    </div>
  );
}
