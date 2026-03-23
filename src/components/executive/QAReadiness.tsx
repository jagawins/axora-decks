import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Shield, Clock, Target, Sparkles, Loader2, Play, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

interface QAPair { question: string; answer: string; category: string; difficulty: "easy"|"medium"|"hard" }
interface KeyMessage { message: string; supports: string[] }
type Tab = "qa-bank"|"message-map"|"crisis"|"drill";

const SAMPLE_QAS: QAPair[] = [
  { question: "What is the expected ROI and payback period?", answer: "ROI of 3.2x within 18 months. Payback period of 11 months based on conservative estimates.", category: "Financial", difficulty: "hard" },
  { question: "What are the key risks and how are they mitigated?", answer: "Three risks: execution (phased rollout), market timing (pilot validates), regulatory (legal review done).", category: "Risk", difficulty: "hard" },
  { question: "Why now? What has changed?", answer: "Market window closing Q3, competitor launched adjacent market, pilot data validates thesis.", category: "Strategy", difficulty: "medium" },
  { question: "What resources do you need?", answer: "Two million budget, 3 FTEs for 6 months, board sponsorship for regulatory.", category: "Resources", difficulty: "medium" },
  { question: "What happens if we do not act?", answer: "Competitor captures first-mover. Market share drops from 24% to 15% in 12 months.", category: "Strategy", difficulty: "medium" },
  { question: "How does this align with current strategy?", answer: "Supports Pillar 2 (international growth) from 3-year plan approved Q2 2025.", category: "Alignment", difficulty: "easy" },
  { question: "What is the milestone timeline?", answer: "Q2: Entry. Q3: First 100 customers. Q4: Unit economics breakeven.", category: "Timeline", difficulty: "easy" },
  { question: "Who is accountable?", answer: "Sarah Chen as Regional Lead, weekly reports. Advisory board with EU experience.", category: "Governance", difficulty: "easy" },
];

const CRISIS_TEMPLATES = [
  { name: "Layoff", empathy: "We understand this is deeply personal.", facts: "[Number] roles affected. Severance: [X weeks + benefits].", action: "Affected employees notified by manager today.", nextUpdate: "CEO email with details. FAQ by end of day." },
  { name: "Security Incident", empathy: "We take the security of your data seriously.", facts: "[Type] accessed. [Number] accounts affected. Patched at [time].", action: "Users notified within [X hours]. Password reset.", nextUpdate: "Status every [4 hours]. Report in [7 days]." },
  { name: "Product Outage", empathy: "We know you depend on our service.", facts: "Outage at [time] affecting [X%]. Root cause: [brief].", action: "Engineering on it. ETA: [time].", nextUpdate: "Status page every [30 min]. Post-mortem [48h]." },
  { name: "Regulatory Issue", empathy: "We are committed to full compliance.", facts: "[Body] has [action]. Relates to [scope].", action: "[Firm] retained. Review committee formed.", nextUpdate: "Board briefing [date]. Statement [date]." },
];

export default function QAReadiness() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("qa-bank");
  const [deckContext, setDeckContext] = useState("");
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [genQA, setGenQA] = useState(false);
  const [keyMessages, setKeyMessages] = useState<KeyMessage[]>(
    [0,1,2].map(() => ({ message: "", supports: ["","",""] }))
  );
  const [selCrisis, setSelCrisis] = useState<number|null>(null);
  const [crisis, setCrisis] = useState({ name:"", empathy:"", facts:"", action:"", nextUpdate:"" });
  const [drillOn, setDrillOn] = useState(false);
  const [dIdx, setDIdx] = useState(0);
  const [dTimer, setDTimer] = useState(30);
  const [dRun, setDRun] = useState(false);
  const [dShow, setDShow] = useState(false);

  useEffect(() => {
    if (!dRun || dTimer <= 0) return;
    const t = setInterval(() => setDTimer(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [dRun, dTimer]);
  useEffect(() => { if (dTimer === 0) { setDRun(false); setDShow(true); } }, [dTimer]);

  const generate = async () => {
    setGenQA(true);
    await new Promise(r => setTimeout(r, 600));
    setQaPairs(SAMPLE_QAS);
    setGenQA(false);
    toast({ title: "Generated 8 Q&A pairs" });
  };

  const TABS: {id:Tab;label:string;icon:React.FC<any>}[] = [
    { id: "qa-bank", label: "Q&A Bank", icon: MessageSquare },
    { id: "message-map", label: "Message Map", icon: Target },
    { id: "crisis", label: "Crisis Templates", icon: Shield },
    { id: "drill", label: "Timed Drill", icon: Clock },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all", tab===t.id?"bg-accent text-white":"bg-muted/30 text-muted-foreground hover:text-foreground")}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "qa-bank" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Q&A Bank Generator</h3>
          <p className="text-sm text-muted-foreground">Paste deck content or describe the topic. AI generates likely questions and recommended answers.</p>
          <Textarea placeholder="Paste deck content or describe topic..." value={deckContext} onChange={e => setDeckContext(e.target.value)} className="min-h-[100px]" />
          <Button onClick={generate} disabled={genQA} className="gap-2">{genQA?<Loader2 className="h-4 w-4 animate-spin"/>:<Sparkles className="h-4 w-4"/>} Generate Q&A Bank</Button>
          {qaPairs.length > 0 && <div className="space-y-2">{qaPairs.map((qa,i) => {
            const [open,setOpen] = useState(false);
            return (<div key={i} className="rounded-xl border border-border/50">
              <button onClick={() => setOpen(!open)} className="w-full text-left p-3 flex items-start gap-3 hover:bg-muted/10">
                <span className={cn("text-[9px] px-2 py-0.5 rounded-full shrink-0", qa.difficulty==="hard"?"bg-red-500/10 text-red-500":qa.difficulty==="medium"?"bg-amber-500/10 text-amber-500":"bg-green-500/10 text-green-500")}>{qa.difficulty}</span>
                <div className="flex-1"><p className="text-sm font-semibold">{qa.question}</p><p className="text-[10px] text-muted-foreground">{qa.category}</p></div>
                {open?<ChevronUp className="h-4 w-4 text-muted-foreground"/>:<ChevronDown className="h-4 w-4 text-muted-foreground"/>}
              </button>
              {open && <div className="px-3 pb-3 border-t border-border/30 pt-2"><p className="text-sm text-muted-foreground">{qa.answer}</p></div>}
            </div>);
          })}</div>}
        </div>
      )}

      {tab === "message-map" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Message Map</h3>
          <p className="text-sm text-muted-foreground">3 key messages with 3 supporting facts each. Each message max 9 words.</p>
          {keyMessages.map((km,i) => (
            <div key={i} className="rounded-xl border border-border/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">{i+1}</div>
                <span className="text-xs font-semibold text-muted-foreground">Key Message {i+1}</span>
                {km.message && <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full ml-auto", km.message.split(/\s+/).filter(Boolean).length<=9?"bg-green-500/10 text-green-500":"bg-red-500/10 text-red-500")}>{km.message.split(/\s+/).filter(Boolean).length}/9</span>}
              </div>
              <Textarea placeholder="Key message (max 9 words)" value={km.message} onChange={e=>{const n=[...keyMessages];n[i].message=e.target.value;setKeyMessages(n);}} className="min-h-[36px] font-semibold" />
              <div className="space-y-2 pl-8">{km.supports.map((s,j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted/30 flex items-center justify-center text-[8px] font-bold text-muted-foreground">{String.fromCharCode(65+j)}</div>
                  <Textarea placeholder={`Fact ${j+1}`} value={s} onChange={e=>{const n=[...keyMessages];n[i].supports[j]=e.target.value;setKeyMessages(n);}} className="min-h-[28px] text-xs flex-1" />
                </div>
              ))}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "crisis" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Crisis Templates</h3>
          <p className="text-sm text-muted-foreground">Pre-built for high-stress. Empathy then Facts then Action then Next Update.</p>
          <div className="grid grid-cols-2 gap-3">{CRISIS_TEMPLATES.map((ct,i) => (
            <button key={i} onClick={()=>{setSelCrisis(i);setCrisis(ct);}} className={cn("text-left p-4 rounded-xl border transition-all", selCrisis===i?"border-accent bg-accent/5":"border-border/50 hover:border-accent/30")}>
              <Shield className={cn("h-5 w-5 mb-2",selCrisis===i?"text-accent":"text-muted-foreground")} /><p className="text-sm font-bold">{ct.name}</p>
            </button>
          ))}</div>
          {selCrisis!==null && (
            <div className="space-y-3 rounded-xl border border-border/50 p-5">
              {(["empathy","facts","action","nextUpdate"] as const).map((f,i) => (
                <div key={f}><label className={cn("text-[10px] font-bold uppercase tracking-wider",i===0?"text-accent":i===1?"text-blue-500":i===2?"text-green-500":"text-amber-500")}>{i+1}. {f==="nextUpdate"?"Next update":f}</label>
                <Textarea value={crisis[f]} onChange={e=>setCrisis({...crisis,[f]:e.target.value})} className="mt-1 min-h-[50px] text-sm" /></div>
              ))}
              <Button onClick={()=>navigate(`/create?prompt=${encodeURIComponent(`Crisis deck: ${crisis.name}. Empathy: ${crisis.empathy} Facts: ${crisis.facts} Action: ${crisis.action} Next: ${crisis.nextUpdate}`)}`)} className="gap-2 w-full"><Sparkles className="h-4 w-4"/> Generate Crisis Deck</Button>
            </div>
          )}
        </div>
      )}

      {tab === "drill" && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Timed Q&A Drill</h3>
          <p className="text-sm text-muted-foreground">30 seconds per question. Practice for board meetings.</p>
          {!drillOn ? (
            <div className="text-center py-8 space-y-4">
              {qaPairs.length===0?<><p className="text-sm text-muted-foreground">Generate Q&A bank first.</p><Button variant="ghost" onClick={()=>setTab("qa-bank")}>Go to Q&A Bank</Button></>
              :<><p className="text-sm text-muted-foreground">{qaPairs.length} questions ready.</p><Button onClick={()=>{setDrillOn(true);setDIdx(0);setDTimer(30);setDRun(true);setDShow(false);}} className="gap-2"><Play className="h-4 w-4"/> Start Drill</Button></>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Q {dIdx+1}/{qaPairs.length}</span>
              <div className={cn("text-2xl font-bold tabular-nums",dTimer>10?"text-green-500":dTimer>5?"text-amber-500":"text-red-500")}>{dTimer}s</div></div>
              <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden"><div className={cn("h-full rounded-full transition-all duration-1000",dTimer>10?"bg-green-500":dTimer>5?"bg-amber-500":"bg-red-500")} style={{width:`${(dTimer/30)*100}%`}}/></div>
              <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6">
                <span className={cn("text-[9px] px-2 py-0.5 rounded-full",qaPairs[dIdx].difficulty==="hard"?"bg-red-500/10 text-red-500":qaPairs[dIdx].difficulty==="medium"?"bg-amber-500/10 text-amber-500":"bg-green-500/10 text-green-500")}>{qaPairs[dIdx].difficulty} - {qaPairs[dIdx].category}</span>
                <p className="text-lg font-bold mt-2">{qaPairs[dIdx].question}</p>
              </div>
              {dShow && <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4"><p className="text-[10px] font-bold text-green-500 uppercase mb-1">Recommended answer</p><p className="text-sm">{qaPairs[dIdx].answer}</p></div>}
              <div className="flex gap-2">
                {!dShow && <Button variant="ghost" size="sm" onClick={()=>{setDRun(false);setDShow(true);}}>Show Answer</Button>}
                <Button onClick={()=>{if(dIdx<qaPairs.length-1){setDIdx(i=>i+1);setDTimer(30);setDRun(true);setDShow(false);}else{setDrillOn(false);toast({title:"Drill complete!"});}}} className="gap-2 ml-auto">{dIdx<qaPairs.length-1?"Next":"Finish"} <ArrowRight className="h-4 w-4"/></Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
