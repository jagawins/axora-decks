import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";

const PowerPointAI = () => {
  const useCases = [
    "Board updates",
    "Quarterly business reviews",
    "Product strategy decks",
    "Executive summaries",
    "Investment memos"
  ];

  const faqs = [
    {
      q: "Is AXOR a PowerPoint replacement?",
      a: "No. AXOR generates the content and structure. PowerPoint remains the delivery format."
    },
    {
      q: "Can I edit slides after export?",
      a: "Yes. AXOR exports editable PowerPoint files."
    },
    {
      q: "Is this better than PowerPoint Copilot?",
      a: "AXOR focuses on structure and clarity first, before design or formatting."
    },
    {
      q: "How does AXOR compare to Gamma?",
      a: "AXOR is built as a structured alternative to Gamma for executives. See our detailed comparison.",
      link: "/gamma-alternative",
      linkText: "AXOR vs Gamma"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>PowerPoint AI Generator: Create Executive Slides with AXOR</title>
        <meta name="description" content="Use AXOR as your PowerPoint AI generator. Create structured, executive-ready slides in minutes and export cleanly to PowerPoint." />
        <link rel="canonical" href="https://axor.verityaxis.com/powerpoint-ai" />
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
                <span>PowerPoint AI</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                PowerPoint AI Generator for Executive Slides
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
                PowerPoint isn't broken. The way decks are created is.
              </p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
                AXOR acts as an AI layer on top of PowerPoint thinking, helping you generate clear, 
                structured slides before design ever begins.
              </p>

              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Try AXOR Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* AI That Thinks in Slides */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
              AI That Thinks in Slides, Not Prompts
            </h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-muted-foreground mb-8">
                AXOR doesn't generate random slides. It generates:
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {["Slide hierarchy", "Logical flow", "Clear talking points"].map((item, i) => (
                  <div key={i} className="glass-card p-6">
                    <Check className="h-6 w-6 text-accent mx-auto mb-3" />
                    <p className="font-medium">{item}</p>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground mt-8">
                Each block becomes a slide or slide section.
              </p>
            </div>
          </div>
        </section>

        {/* Built for PowerPoint Export */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
              Built for PowerPoint Export
            </h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-center text-lg text-muted-foreground mb-8">
                AXOR decks export with:
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  "Clean headings",
                  "Consistent bullet logic",
                  "Tables that survive export",
                  "Layouts that don't collapse"
                ].map((item, i) => (
                  <div key={i} className="glass-card p-4 text-center">
                    <Check className="h-5 w-5 text-accent mx-auto mb-2" />
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-lg font-medium text-accent mt-8">
                No redesign required.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Typical PowerPoint Use Cases
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {useCases.map((item, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <p className="font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Improves Workflows */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              How AXOR Improves PowerPoint Workflows
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="glass-card p-8">
                <h3 className="text-xl font-bold mb-4 text-destructive/80">Instead of:</h3>
                <ul className="space-y-3">
                  {[
                    "Staring at a blank slide",
                    "Rewriting talking points",
                    "Fixing structure late"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="text-destructive">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-8 border-accent/20">
                <h3 className="text-xl font-bold mb-4 text-accent">You start with:</h3>
                <ul className="space-y-3">
                  {[
                    "A complete narrative",
                    "Slide-ready structure",
                    "AI-generated clarity"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 border-t border-white/5">
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

        {/* Internal Links */}
        <section className="py-12 border-t border-white/5">
          <div className="container-narrow">
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/gamma-alternative" className="text-accent hover:underline">
                Gamma alternative →
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
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <div className="glass-card p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Start creating PowerPoint decks with AI
              </h2>
              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Try AXOR Free
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

export default PowerPointAI;