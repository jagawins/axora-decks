import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import { Sparkles, ArrowRight, Check, Zap, BarChart3, FileDown, Clock, Layers, Shield, Users } from "lucide-react";

const AIPresentationMaker = () => {
  const features = [
    { icon: Zap, title: "Prompt to deck in 2 minutes", desc: "Describe your topic and AXIVA generates a complete, structured presentation with charts, KPIs, and narratives." },
    { icon: BarChart3, title: "Executive-grade visualizations", desc: "KPI dashboards, comparison tables, timeline blocks, decision matrices, and chart blocks, not just bullet points." },
    { icon: FileDown, title: "Native PowerPoint export", desc: "Every element exports as editable PowerPoint objects. Text boxes, charts, and tables you can modify in PPT." },
    { icon: Layers, title: "25+ slide block types", desc: "Stat blocks, card grids, three pillars, two-by-two matrices, evidence maps, scenario analysis, and more." },
    { icon: Shield, title: "No credits to track", desc: "3 free decks. No credit system, no surprise charges, no complexity. Just generate and go." },
    { icon: Users, title: "Built for executives", desc: "Board updates, investor pitches, quarterly reviews, strategy decks. The use cases that matter most." },
  ];

  const useCases = [
    { title: "Investor Pitch Decks", desc: "10-slide structure with market sizing, traction, financials, and the ask.", link: "/templates/investor-pitch-deck-template" },
    { title: "Board Updates", desc: "KPI dashboards, financial summaries, risk matrices, and strategic outlook.", link: "/templates/board-update-template" },
    { title: "Quarterly Reviews", desc: "Goal tracking, team highlights, pipeline forecasts, and next quarter priorities.", link: "/templates/quarterly-review-template" },
    { title: "Strategy Presentations", desc: "Market analysis, competitive positioning, strategic pillars, and roadmaps.", link: "/templates/strategy-deck-template" },
  ];

  const faqs = [
    { q: "What is an AI presentation maker?", a: "An AI presentation maker is a tool that generates complete slide decks from a text description. You describe what you need, and the AI creates the structure, content, data visualizations, and design automatically. AXIVA specializes in executive presentations like board decks and investor pitches." },
    { q: "How is AXIVA different from other AI presentation makers?", a: "AXIVA is built specifically for executive use cases — board meetings, investor pitches, quarterly reviews. While tools like Gamma and Canva serve everyone, AXIVA generates specialized slide types like KPI dashboards, decision matrices, and evidence maps that boardrooms actually need." },
    { q: "Can I export AI-generated presentations to PowerPoint?", a: "Yes. AXIVA exports native, editable PowerPoint files. Every element — text, charts, tables — is a real PowerPoint object you can modify. This matters because many AI tools export complex elements as images that cannot be edited." },
    { q: "Is AXIVA free to use?", a: "AXIVA offers 3 free deck generations with no credit card required. There is no credit system — you get 3 complete decks, not a pool of credits that depletes with every action. Pro plans start at $28 per month for unlimited generations and PowerPoint export." },
    { q: "How long does it take to generate a presentation?", a: "Under 2 minutes for a complete 8 to 15 slide presentation. The AI generates the outline in seconds, then builds each slide with appropriate visualizations, narratives, and formatting." },
    { q: "What types of presentations can I create?", a: "Investor pitch decks, board updates, quarterly business reviews, strategy presentations, sales decks, go-to-market plans, and any executive communication that requires structured, data-driven slides." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Presentation Maker | Executive-Grade Decks in Minutes | AXIVA</title>
        <meta name="description" content="Create professional AI presentations in under 2 minutes. KPI dashboards, investor pitches, board decks with native PowerPoint export. 3 free decks, no credit card." />
        <link rel="canonical" href="https://axiva.ai/ai-presentation-maker" />
        <meta property="og:title" content="AI Presentation Maker for Executives | AXIVA" />
        <meta property="og:description" content="Generate executive-grade presentations with AI. Board decks, investor pitches, strategy presentations. Native PowerPoint export. Try free." />
        <meta name="keywords" content="AI presentation maker, AI presentation generator, AI slide maker, AI deck generator, executive presentation tool, board deck generator, investor pitch deck AI" />
      </Helmet>

      <MarketingHeader />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-transparent" />
        <div className="container-wide relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs sm:text-sm font-medium mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              AI Presentation Maker
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
              The AI presentation maker
              <br />
              <span className="text-accent">executives actually trust</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Generate board-ready presentations from a single prompt. KPI dashboards, decision matrices, 
              comparison tables, and timeline visualizations — the slide types boardrooms need, built by AI in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="gap-2 rounded-full px-8">
                  <Sparkles className="h-4 w-4" />
                  Generate Your First Deck Free
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="gap-2 rounded-full px-8">
                  See Live Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-4">3 free decks · No credits · No credit card required</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border/40">
        <div className="container-wide">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Not another generic slide generator</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-14">
            AXIVA generates the exact slide types that executives use in board meetings, investor calls, and strategy sessions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border/50 bg-card/50">
                <div className="p-3 rounded-xl bg-accent/10 w-fit mb-4">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 border-t border-border/40 bg-card/30">
        <div className="container-wide">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-14">What can you build?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((uc, i) => (
              <Link key={i} to={uc.link} className="group p-6 rounded-2xl border border-border/50 bg-background hover:border-accent/40 transition-all">
                <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">{uc.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{uc.desc}</p>
                <span className="text-xs text-accent font-medium flex items-center gap-1">
                  See template <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-border/40">
        <div className="container-wide">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-14">From idea to deck in 3 steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { num: "1", title: "Describe your deck", desc: "Type what you need: 'Q4 board update for SaaS company, ARR $8M, 34% growth.' Or paste existing notes and documents." },
              { num: "2", title: "AI builds the slides", desc: "AXIVA generates structured slides with KPI blocks, charts, timelines, comparisons, not just text and bullets." },
              { num: "3", title: "Export and present", desc: "Download as native, editable PowerPoint. Share a link. Or present directly from AXIVA with presenter notes." },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 text-accent font-bold text-lg">
                  {step.num}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison callout */}
      <section className="py-20 border-t border-border/40 bg-card/30">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">How AXIVA compares</h2>
            <p className="text-muted-foreground mb-8">
              We are honest about where we fit. AXIVA is the best choice for executive presentations. For general-purpose slides, other tools may be better.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/gamma-alternative">
                <Button variant="outline" size="sm" className="rounded-full">AXIVA vs Gamma</Button>
              </Link>
              <Link to="/genspark-alternative">
                <Button variant="outline" size="sm" className="rounded-full">AXIVA vs GenSpark</Button>
              </Link>
              <Link to="/beautiful-ai-alternative">
                <Button variant="outline" size="sm" className="rounded-full">AXIVA vs Beautiful.ai</Button>
              </Link>
              <Link to="/blog/axiva-vs-gamma-vs-genspark-vs-beautiful-ai-2026">
                <Button variant="outline" size="sm" className="rounded-full">Full 2026 Comparison</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-border/40">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group border border-border/50 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-card/50 transition-colors font-medium text-sm">
                    {faq.q}
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqs.map((faq) => ({
                    "@type": "Question",
                    name: faq.q,
                    acceptedAnswer: { "@type": "Answer", text: faq.a },
                  })),
                }),
              }}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/40 bg-card/30">
        <div className="container-wide text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to build your next deck?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join executives who use AXIVA to create presentation-ready decks in minutes, not hours.
          </p>
          <Link to="/auth">
            <Button variant="hero" size="lg" className="gap-2 rounded-full px-10">
              <Sparkles className="h-4 w-4" />
              Generate Your First Deck Free
            </Button>
          </Link>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> 3 free decks</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> No credit card</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> PowerPoint export</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIPresentationMaker;
