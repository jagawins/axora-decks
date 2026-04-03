import { Link } from "react-router-dom";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import AIChatbot from "@/components/AIChatbot";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight, Target, FileText, BarChart3, Mic } from "lucide-react";

const PAIN_POINTS = [
  { pain: "Spending Sunday nights on PowerPoint", fix: "AI generates a consulting-grade deck in under 2 minutes" },
  { pain: "Every new client means rebuilding from scratch", fix: "98 templates: strategy, QBR, board update, pitch, case study" },
  { pain: "Inconsistent formatting across the team", fix: "Brand kit locks fonts, colors, and logos across every deck" },
  { pain: "Clients want McKinsey-quality but you're a boutique", fix: "Answer-first structure, action titles, and 70% visual density by default" },
];

const TEMPLATES = [
  "Strategy Narrative", "Consulting Deck", "Board Update", "Executive Summary",
  "M&A Strategy Brief", "Transformation Roadmap", "OKRs and QBR Review",
  "Decision Memo", "Stakeholder Alignment", "Competitive Battlecard",
];

export default function ForConsultants() {
  return (
    <>
      <SeoHead
        title="AI Presentation Tool for Consultants | AXIVA"
        description="Generate consulting-grade decks in minutes. Answer-first structure, action titles, 98 templates. Used by consultants who want McKinsey-quality output without the McKinsey hours."
        canonicalPath="/for/consultants"
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="container-wide text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6">
              <Target className="h-3.5 w-3.5" /> Built for consultants
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              Stop spending Sunday nights<br className="hidden sm:block" /> <span className="text-accent">on PowerPoint</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Describe your engagement. AI builds a consulting-grade deck with answer-first structure, 
              action titles, and the visual density your clients expect. Under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="gap-2 px-8">
                  <Sparkles className="h-5 w-5" /> Try it free
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="gap-2 px-8">
                  See a demo deck
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Pain points */}
        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="container-wide max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Sound familiar?</h2>
            <div className="space-y-4">
              {PAIN_POINTS.map(p => (
                <div key={p.pain} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-border/50 bg-card/30">
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 text-lg mt-0.5">✗</span>
                    <p className="text-sm text-muted-foreground">{p.pain}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm font-medium">{p.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates */}
        <section className="py-16 sm:py-20">
          <div className="container-wide text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Templates built for consulting</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Every template uses answer-first structure. Customize with AI in seconds.</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto mb-8">
              {TEMPLATES.map(t => (
                <span key={t} className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-card/30">{t}</span>
              ))}
            </div>
            <Link to="/templates">
              <Button variant="outline" className="gap-2">See all 98 templates <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="container-wide text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Your next client deck, done in 2 minutes</h2>
            <p className="text-muted-foreground mb-8">Free to start. No credit card needed.</p>
            <Link to="/auth">
              <Button variant="hero" size="lg" className="gap-2 px-8">
                <Sparkles className="h-5 w-5" /> Start free
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
      <AIChatbot />
    </>
  );
}
