import { Link } from "react-router-dom";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import AIChatbot from "@/components/AIChatbot";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight, Rocket } from "lucide-react";

const USE_CASES = [
  { title: "Pitch investors", desc: "Series A, B, angel, YC format. AI structures your story: problem, solution, traction, ask.", templates: "Series A Pitch, Angel Investor, YC Application" },
  { title: "Update your board", desc: "Quarterly board update with KPIs, financials, product progress, and asks. Under 12 slides.", templates: "Board Update, Executive Summary, OKRs Review" },
  { title: "Sell to enterprise", desc: "Product demo deck with case studies, pricing, and ROI calculator. Close faster.", templates: "Sales Playbook, Customer Case Study, Competitive Battlecard" },
  { title: "Rally your team", desc: "All-hands with live polls, word clouds, and anonymous Q&A. Give everyone a voice.", templates: "Company Vision, All-Hands, Change Management" },
];

export default function ForFounders() {
  return (
    <>
      <SeoHead
        title="AI Pitch Deck Generator for Founders | AXIVA"
        description="Generate investor-ready pitch decks in minutes. Series A, angel, YC formats. AI builds your story with traction metrics and financial slides. Free to start."
        canonicalPath="/for/founders"
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="container-wide text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6">
              <Rocket className="h-3.5 w-3.5" /> Built for founders
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              Your pitch deck.<br className="hidden sm:block" /> <span className="text-accent">Done in 2 minutes.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Describe your startup. AI generates a Sequoia-format pitch deck with your traction,
              market sizing, and financial slides. Export to PPTX. Send to investors today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="gap-2 px-8">
                  <Sparkles className="h-5 w-5" /> Create my pitch deck
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="gap-2 px-8">
                  See example pitch
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="container-wide">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Every deck a founder needs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {USE_CASES.map(uc => (
                <div key={uc.title} className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-3">
                  <h3 className="text-base font-bold">{uc.title}</h3>
                  <p className="text-sm text-muted-foreground">{uc.desc}</p>
                  <p className="text-[10px] text-accent font-semibold">Templates: {uc.templates}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="container-wide text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Investors see 3,000 decks a year</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Yours needs to stand out in the first 30 seconds. AXIVA uses the same structure that raised over $250M in funded pitches.</p>
            <Link to="/auth">
              <Button variant="hero" size="lg" className="gap-2 px-8">
                <Sparkles className="h-5 w-5" /> Start free, no credit card
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
