import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import FounderCard from "@/components/landing/FounderCard";
import CreatorNote from "@/components/landing/CreatorNote";

const GammaAlternative = () => {
  const features = [
    { feature: "Structured block system", axor: true, gamma: "limited" },
    { feature: "Executive tone control", axor: true, gamma: "partial" },
    { feature: "PowerPoint-ready output", axor: true, gamma: "inconsistent" },
    { feature: "Business tables & layouts", axor: true, gamma: "limited" },
    { feature: "Designed for executives", axor: true, gamma: false },
    { feature: "AI refinement per block", axor: true, gamma: "limited" },
  ];

  const faqs = [
    {
      q: "Is AXOR a direct alternative to Gamma?",
      a: "Yes. AXOR is designed as a structured, executive-grade alternative to Gamma."
    },
    {
      q: "Does AXOR replace PowerPoint?",
      a: "AXOR complements PowerPoint. It creates structured decks that export cleanly into PowerPoint."
    },
    {
      q: "Is AXOR better for business presentations?",
      a: "Yes. AXOR is built specifically for business, leadership, and strategy decks."
    },
    {
      q: "Can I import content from documents?",
      a: "Yes. AXOR can generate decks from outlines, notes, or pasted content."
    },
    {
      q: "How does AXOR compare to other AI tools?",
      a: "AXOR works alongside PowerPoint and other AI tools. If you want an AI deck generator designed specifically for business communication, see our full feature overview.",
      link: "/ai-deck-generator",
      linkText: "AI deck generator"
    },
    {
      q: "What about PowerPoint integration?",
      a: "If you're comparing AXOR to Gamma, here is a full breakdown of how our PowerPoint AI generator differs.",
      link: "/powerpoint-ai",
      linkText: "PowerPoint AI generator"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AXIVA vs Gamma: AI Executive Deck Generator for Crisp Business Presentations</title>
        <meta name="description" content="Compare AXIVA vs Gamma. See why executives choose AXIVA for structured AI decks, clean PowerPoint exports, and business-ready presentations." />
        <link rel="canonical" href="https://axiva.ai/gamma-alternative" />
      </Helmet>

      <MarketingHeader />
      
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-60" />
          </div>
          
          <div className="container-narrow relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4" />
                <span>Gamma Alternative</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                AXIVA vs Gamma
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed">
                Gamma popularized AI-generated presentations. AXIVA refines them for executives.
              </p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
                If you need clarity over creativity, structure over slideshows, and business-ready decks 
                over visual experiments, AXIVA is built for you.
              </p>

              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Try AXIVA Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Different */}
        <section className="py-20 border-t border-border/40">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
              Why AXIVA Is Different from Gamma
            </h2>
            <div className="max-w-3xl mx-auto text-center mb-12">
              <p className="text-xl text-muted-foreground mb-4">
                Gamma focuses on visual storytelling.<br />
                <span className="text-accent font-medium">AXIVA focuses on executive communication.</span>
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {["Board updates", "Strategy reviews", "Investor decks", "Leadership presentations"].map((item, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <Check className="h-5 w-5 text-accent mx-auto mb-2" />
                  <p className="font-medium">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-8">
              Every deck starts with structured blocks, not free-form slides.
            </p>
          </div>
        </section>

        {/* Structured Blocks */}
        <section className="py-20 border-t border-border/40">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
              Structured Blocks, Not Guesswork
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-4">AXIVA uses a block-based system:</h3>
                  <ul className="space-y-3">
                    {[
                      "Headings with hierarchy (H1, H2, H3)",
                      "Text blocks with controlled length",
                      "Lists with clean bullet logic",
                      "Tables for comparisons and metrics",
                      "Callouts for key decisions",
                      "Two-column layouts for contrast"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-4">This ensures:</h3>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Consistent narrative flow",
                      "Predictable slide structure",
                      "Easy refinement and iteration"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-lg font-medium border-t border-border/60 pt-6">
                    Gamma emphasizes creative layouts.<br />
                    <span className="text-accent">AXIVA emphasizes clear thinking.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Executive Tone */}
        <section className="py-20 border-t border-border/40">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
              Executive Tone by Default
            </h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-muted-foreground mb-6">AXIVA generates decks with:</p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {["Professional language", "Concise phrasing", "Neutral, board-safe tone"].map((item, i) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-accent/10 text-accent font-medium">
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">You can choose: Executive, Analytical, Persuasive, or Crisp.</p>
              <p className="text-lg font-medium">But the baseline is always business-appropriate.</p>
            </div>
          </div>
        </section>

        {/* Export Ready */}
        <section className="py-20 border-t border-border/40">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
              Export-Ready for PowerPoint and PDF
            </h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-center text-lg text-muted-foreground mb-8">
                AXIVA decks are built to export cleanly.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  "PowerPoint-ready structure",
                  "No layout breakage",
                  "No hidden styling",
                  "No visual noise"
                ].map((item, i) => (
                  <div key={i} className="glass-card p-4 text-center">
                    <Check className="h-5 w-5 text-accent mx-auto mb-2" />
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-lg font-medium text-accent mt-8">
                You don't need to rebuild slides after export.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 border-t border-border/40">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              AXIVA vs Gamma: Feature Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full max-w-3xl mx-auto">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left py-4 px-4 font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-accent">AXIVA</th>
                    <th className="text-center py-4 px-4 font-semibold">Gamma</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((row, i) => (
                    <tr key={i} className="border-b border-border/40">
                      <td className="py-4 px-4 text-muted-foreground">{row.feature}</td>
                      <td className="text-center py-4 px-4">
                        {row.axor === true ? (
                          <Check className="h-5 w-5 text-accent mx-auto" />
                        ) : (
                          <span className="text-muted-foreground text-sm">{row.axor}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {row.gamma === true ? (
                          <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : row.gamma === false ? (
                          <X className="h-5 w-5 text-destructive mx-auto" />
                        ) : (
                          <span className="text-muted-foreground text-sm">{row.gamma}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* When to Choose */}
        <section className="py-20 border-t border-border/40">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              When to Choose AXIVA
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="glass-card p-8 border-accent/20">
                <h3 className="text-xl font-bold mb-4 text-accent">Choose AXIVA if you:</h3>
                <ul className="space-y-3">
                  {[
                    "Present to leadership or boards",
                    "Need structured thinking, not visuals",
                    "Want fast, repeatable decks",
                    "Export to PowerPoint regularly"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-8">
                <h3 className="text-xl font-bold mb-4">Choose Gamma if:</h3>
                <ul className="space-y-3">
                  {[
                    "Design exploration matters more than structure",
                    "Presentations are informal or creative"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5">•</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 border-t border-border/40">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">
                    {faq.a}
                    {faq.link && (
                      <>
                        {" "}
                        <Link to={faq.link} className="text-accent hover:underline">
                          {faq.linkText} →
                        </Link>
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder Card */}
        <FounderCard />

        {/* Creator Note for SEO */}
        <CreatorNote />

        {/* Internal Links */}
        <section className="py-12 border-t border-border/40">
          <div className="container-narrow">
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/powerpoint-ai" className="text-accent hover:underline">
                PowerPoint AI generator →
              </Link>
              <Link to="/ai-deck-generator" className="text-accent hover:underline">
                AI deck generator →
              </Link>
              <Link to="/" className="text-muted-foreground hover:text-accent transition-colors">
                Home →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-border/40">
          <div className="container-narrow">
            <div className="glass-card p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to switch from Gamma?
              </h2>
              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Try AXIVA Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default GammaAlternative;