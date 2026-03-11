import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, Sparkles, Minus, Zap, Shield, FileDown, Target, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import FounderCard from "@/components/landing/FounderCard";

const GensparkAlternative = () => {
  const comparisonRows = [
    { feature: "Built specifically for executive decks", axiva: true, genspark: false },
    { feature: "Board update & investor pitch templates", axiva: true, genspark: "generic" },
    { feature: "KPI dashboards & decision matrices", axiva: true, genspark: "limited" },
    { feature: "Native editable PowerPoint export", axiva: true, genspark: "images" },
    { feature: "Simple pricing (no credit system)", axiva: true, genspark: false },
    { feature: "Generate a deck in under 2 minutes", axiva: true, genspark: true },
    { feature: "All-in-one workspace (docs, sheets, video)", axiva: false, genspark: true },
    { feature: "Built-in fact-checking", axiva: false, genspark: true },
    { feature: "Deep web research for content", axiva: false, genspark: true },
    { feature: "30+ AI model orchestration", axiva: false, genspark: true },
  ];

  const faqs = [
    {
      q: "Is AXIVA a GenSpark alternative?",
      a: "AXIVA is a focused alternative for anyone who primarily needs executive-grade presentations. GenSpark is a broad AI workspace covering slides, docs, sheets, video, and more. If presentations are your main use case, AXIVA delivers better quality with less complexity."
    },
    {
      q: "How does AXIVA's PowerPoint export compare to GenSpark?",
      a: "AXIVA exports native, editable PowerPoint elements — text boxes, charts, and tables you can modify in PowerPoint. GenSpark converts complex elements to images during export, so they're not editable in PowerPoint."
    },
    {
      q: "Does AXIVA have a credit system like GenSpark?",
      a: "No. AXIVA gives you 3 free deck generations with no credits to track. GenSpark uses a credit-based model where different actions consume different amounts of credits, which many users find confusing."
    },
    {
      q: "What does GenSpark do better than AXIVA?",
      a: "GenSpark excels at multi-format workflows — if you need slides, spreadsheets, documents, and videos from one prompt, GenSpark's all-in-one workspace is stronger. GenSpark also has built-in web research and fact-checking that AXIVA doesn't offer."
    },
    {
      q: "Who should use AXIVA instead of GenSpark?",
      a: "Executives, founders, and consultants who need polished board decks, investor pitches, and strategy presentations. If you want a deck that looks like it came from McKinsey — not a generic AI tool — AXIVA is purpose-built for that."
    },
    {
      q: "Can I switch from GenSpark to AXIVA?",
      a: "Yes. AXIVA is free to try with 3 deck generations. You can test it alongside GenSpark and see which produces better presentations for your use case."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AXIVA vs GenSpark: Executive Deck Generator Alternative | AXIVA</title>
        <meta name="description" content="Compare AXIVA vs GenSpark for AI presentations. AXIVA is purpose-built for executive decks with native PowerPoint export. No confusing credits. Try free." />
        <link rel="canonical" href="https://axiva.ai/genspark-alternative" />
        <meta property="og:title" content="AXIVA vs GenSpark — AI Executive Deck Generator" />
        <meta property="og:description" content="GenSpark is a powerful all-in-one AI workspace. AXIVA is purpose-built for executive presentations. Compare features, pricing, and output quality." />
      </Helmet>

      <MarketingHeader />

      {/* Hero */}
      <section className="pt-32 pb-20">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs sm:text-sm font-medium mb-8">
              <Target className="h-3.5 w-3.5" />
              GenSpark Alternative
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
              GenSpark does everything.
              <br />
              <span className="text-accent">AXIVA does executive decks</span>
              <br />
              better.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              GenSpark is a powerful all-in-one AI workspace — slides, docs, sheets, video, research, and more. 
              But if what you actually need is a polished board deck or investor pitch, a focused tool beats a Swiss Army knife.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="gap-2 rounded-full px-8">
                  <Sparkles className="h-4 w-4" />
                  Try AXIVA Free
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="gap-2 rounded-full px-8">
                  See Live Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-4">3 free decks · No credits · No credit card</p>
          </div>
        </div>
      </section>

      {/* Key differentiators */}
      <section className="py-20 border-t border-border/40">
        <div className="container-wide">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Why executives choose AXIVA over GenSpark</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-14">
            Different tools for different jobs. Here's where AXIVA wins for executive presentations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Target,
                title: "Purpose-built for executives",
                desc: "KPI dashboards, decision matrices, scenario analysis, evidence maps — the exact slide types boardrooms need. GenSpark generates generic slides for everyone.",
              },
              {
                icon: Clock,
                title: "Simple & fast",
                desc: "3 free decks. No credits to count. No surprise charges. Describe your deck and get it in under 2 minutes. GenSpark's credit system frustrates users.",
              },
              {
                icon: FileDown,
                title: "Native PowerPoint export",
                desc: "Every element exports as editable PowerPoint — text boxes, charts, tables. GenSpark converts complex elements to images, so you can't edit them in PPT.",
              },
              {
                icon: Shield,
                title: "No complexity tax",
                desc: "AXIVA does one thing exceptionally well. No 30+ AI models to configure, no workspace to learn. Just paste your topic and get a polished deck.",
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border/50 bg-card/50">
                <div className="p-3 rounded-xl bg-accent/10 w-fit mb-4">
                  <item.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 border-t border-border/40 bg-card/30">
        <div className="container-wide">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Feature-by-feature comparison</h2>
          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Feature</th>
                  <th className="text-center py-3 px-4 font-bold text-accent">AXIVA</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">GenSpark</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="py-3 px-4">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {row.axiva === true ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : row.axiva === false ? (
                        <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                      ) : (
                        <span className="text-xs text-muted-foreground">{String(row.axiva)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.genspark === true ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : row.genspark === false ? (
                        <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                      ) : (
                        <span className="text-xs text-amber-500">{String(row.genspark)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto">
            GenSpark excels as an all-in-one workspace. AXIVA excels at the one thing executives actually need: polished, structured presentations ready for the boardroom.
          </p>
        </div>
      </section>

      {/* Who is this for */}
      <section className="py-20 border-t border-border/40">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Choose the right tool for your need</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border-2 border-accent/30 bg-accent/5">
                <h3 className="font-bold text-lg mb-3">Choose AXIVA if you need...</h3>
                <div className="space-y-3">
                  {[
                    "Board updates & investor pitches",
                    "Quarterly business reviews",
                    "Strategy & GTM presentations",
                    "Editable PowerPoint exports",
                    "Simple pricing without credits",
                    "Executive-grade visual blocks",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-2xl border border-border/50 bg-card/50">
                <h3 className="font-bold text-lg mb-3">Choose GenSpark if you need...</h3>
                <div className="space-y-3">
                  {[
                    "Slides + docs + sheets + video in one tool",
                    "Deep web research with citations",
                    "Built-in fact-checking for content",
                    "Podcast and media generation",
                    "Multi-model AI orchestration",
                    "A general-purpose AI workspace",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ with schema */}
      <section className="py-20 border-t border-border/40 bg-card/30">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
            <div className="space-y-4">
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

            {/* FAQ Schema for SEO */}
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
      <section className="py-20 border-t border-border/40">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to try the executive deck generator?
            </h2>
            <p className="text-muted-foreground mb-8">
              3 free decks. No credits. No credit card. See why executives choose AXIVA for board-ready presentations.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="lg" className="gap-2 rounded-full px-10">
                <Sparkles className="h-4 w-4" />
                Generate Your First Deck Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <FounderCard />
      <Footer />
    </div>
  );
};

export default GensparkAlternative;
