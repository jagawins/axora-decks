import { Link } from "react-router-dom";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import AIChatbot from "@/components/AIChatbot";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, BarChart3, Mic, Zap } from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "Smart Slides for live demos", desc: "Customer shares their requirements. Your deck adapts in real-time. Pricing, architecture, and ROI slides regenerate on the spot. No 'I'll get back to you.'" },
  { icon: BarChart3, title: "Live polls during pitches", desc: "Ask 'How important is feature X to your team?' See results instantly. Use the data to pivot your pitch in real-time." },
  { icon: Mic, title: "Speech prep before big meetings", desc: "AI writes your talking points with delivery coaching. Vocal tips, objection handling, and a pre-flight checklist." },
  { icon: TrendingUp, title: "Battle cards and enablement", desc: "AI generates competitive battlecards, objection handling guides, and customer case studies from your product data." },
];

export default function ForSales() {
  return (
    <>
      <SeoHead
        title="AI Sales Deck Generator for Sales Teams | AXIVA"
        description="Generate sales decks that close deals. Smart Slides adapt pricing in real-time. Live polls gauge buyer interest. Speech prep coaches your delivery. 98 templates."
        canonicalPath="/for/sales"
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="container-wide text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6">
              <TrendingUp className="h-3.5 w-3.5" /> Built for sales teams
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              Close deals faster with<br className="hidden sm:block" /> <span className="text-accent">decks that adapt live</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Your prospect says their budget is $50K and they need SOC 2 compliance.
              By the next slide, the pricing and architecture have already adapted.
              Smart Slides turn every pitch into a live configuration session.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="gap-2 px-8">
                  <Sparkles className="h-5 w-5" /> Try Smart Slides free
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="gap-2 px-8">
                  See it in action
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="container-wide">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Why sales teams choose AXIVA</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {FEATURES.map(f => (
                <div key={f.title} className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-base font-bold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="container-wide text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Stop saying "I'll get back to you"</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Every follow-up email is a chance for the deal to stall. Close it in the meeting.</p>
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
