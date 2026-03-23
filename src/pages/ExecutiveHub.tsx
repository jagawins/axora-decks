import { useState } from "react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import MessageArchitectureEngine from "@/components/executive/MessageArchitectureEngine";
import QAReadiness from "@/components/executive/QAReadiness";
import RehearsalPlanner from "@/components/executive/RehearsalPlanner";
import OutcomeAnalytics from "@/components/executive/OutcomeAnalytics";
import { cn } from "@/lib/utils";
import { Target, Shield, Calendar, BarChart3, Crown, Sparkles } from "lucide-react";

type TabId = "architect" | "qa-crisis" | "rehearsal" | "analytics";

export default function ExecutiveHub() {
  const [tab, setTab] = useState<TabId>("architect");

  const TABS: { id: TabId; label: string; icon: React.FC<any>; desc: string; badge?: string }[] = [
    { id: "architect", label: "Message Architecture", icon: Target, desc: "Decision-first structure" },
    { id: "qa-crisis", label: "Q&A + Crisis", icon: Shield, desc: "Message maps & drills", badge: "PRO" },
    { id: "rehearsal", label: "Rehearsal Plan", icon: Calendar, desc: "14-day prep schedule", badge: "PRO" },
    { id: "analytics", label: "Outcome Analytics", icon: BarChart3, desc: "Track decisions", badge: "PRO" },
  ];

  return (
    <>
      <SeoHead
        title="Executive Communication Hub | AXIVA"
        description="Message architecture engine, Q&A readiness, rehearsal planning, and outcome analytics. Build executive-grade presentations that win decisions."
        canonicalUrl="https://axiva.ai/executive"
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container-wide">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Executive Performance System
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Win the moment, not just the slides</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Message architecture. Q&A readiness. Rehearsal planning. Outcome tracking.
              Everything executives need to deliver high-stakes communication.
            </p>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-2 justify-center flex-wrap mb-8">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  tab === t.id ? "bg-accent text-white shadow-md" : "bg-card/50 border border-border/50 text-muted-foreground hover:text-foreground hover:border-border")}>
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(" ")[0]}</span>
                {t.badge && <span className="text-[8px] bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded-full">{t.badge}</span>}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-[500px]">
            {tab === "architect" && <MessageArchitectureEngine />}
            {tab === "qa-crisis" && <QAReadiness />}
            {tab === "rehearsal" && <RehearsalPlanner />}
            {tab === "analytics" && <OutcomeAnalytics />}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
