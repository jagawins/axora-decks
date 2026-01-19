import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check, Users, Briefcase, Target, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import FounderCard from "@/components/landing/FounderCard";

const AIDeckGenerator = () => {
  const blockTypes = [
    "Heading",
    "Text",
    "List",
    "Table",
    "Two-column",
    "Callout"
  ];

  const users = [
    { icon: Briefcase, label: "Executives" },
    { icon: Target, label: "Founders" },
    { icon: Users, label: "Consultants" },
    { icon: BarChart, label: "Product leaders" },
    { icon: Users, label: "Strategy teams" },
  ];

  const faqs = [
    {
      q: "What makes AXOR different from other AI deck generators?",
      a: "AXOR prioritizes structure, executive tone, and PowerPoint-ready output."
    },
    {
      q: "Can I control tone and depth?",
      a: "Yes. AXOR supports executive, analytical, persuasive, and crisp tones."
    },
    {
      q: "Is AXOR suitable for professional use?",
      a: "Yes. AXOR is designed specifically for business and leadership presentations."
    },
    {
      q: "How does AXOR compare to Gamma?",
      a: "AXOR is designed as a structured, executive-grade alternative to Gamma for business presentations.",
      link: "/gamma-alternative",
      linkText: "AXOR vs Gamma comparison"
    },
    {
      q: "Does AXOR work with PowerPoint?",
      a: "Yes. AXOR exports clean, editable PowerPoint files. Learn more about our PowerPoint integration.",
      link: "/powerpoint-ai",
      linkText: "PowerPoint AI generator"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Deck Generator: Build Structured Presentations in Minutes</title>
        <meta name="description" content="AXOR is an AI deck generator built for executives. Turn raw ideas into structured presentations in minutes." />
        <link rel="canonical" href="https://axor.verityaxis.com/ai-deck-generator" />
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
                <span>AI Deck Generator</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                AI Deck Generator for Structured Presentations
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
                Most AI deck tools generate slides. <span className="text-accent font-medium">AXOR generates thinking.</span>
              </p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
                AXOR is an AI deck generator designed for people who care about logic, flow, and executive clarity.
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

        {/* From Raw Ideas */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              From Raw Ideas to Structured Decks
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="glass-card p-8">
                <h3 className="text-xl font-bold mb-4">Input:</h3>
                <ul className="space-y-3">
                  {["A topic", "An outline", "Pasted notes"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <span className="text-accent">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-8 border-accent/20">
                <h3 className="text-xl font-bold mb-4 text-accent">AXOR outputs:</h3>
                <ul className="space-y-3">
                  {["Headings", "Sections", "Bullet logic", "Tables", "Callouts"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-accent shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-center text-lg font-medium mt-8">
              All structured. All editable.
            </p>
          </div>
        </section>

        {/* Block-Based */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
              Block-Based Deck Generation
            </h2>
            <p className="text-center text-lg text-muted-foreground mb-8">
              Every deck is built from blocks:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto mb-8">
              {blockTypes.map((item, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <p className="font-medium">{item}</p>
                </div>
              ))}
            </div>
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-muted-foreground mb-2">This allows:</p>
              <ul className="inline-flex flex-wrap justify-center gap-4">
                {["Easy refinement", "AI-assisted rewrites", "Predictable structure"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Speed and Control */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
              Built for Speed and Control
            </h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xl text-muted-foreground mb-4">
                Generate a full deck in minutes.
              </p>
              <p className="text-xl text-muted-foreground mb-8">
                Refine individual blocks in seconds.
              </p>
              <p className="text-lg font-medium text-accent">
                No regeneration. No chaos.
              </p>
            </div>
          </div>
        </section>

        {/* Who Uses */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Who Uses AXOR
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl mx-auto mb-8">
              {users.map((item, i) => (
                <div key={i} className="glass-card p-6 text-center">
                  <item.icon className="h-8 w-8 text-accent mx-auto mb-3" />
                  <p className="font-medium">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-lg text-muted-foreground">
              Anyone who presents ideas for decisions.
            </p>
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

        {/* Founder Card */}
        <FounderCard />

        {/* Internal Links */}
        <section className="py-12 border-t border-white/5">
          <div className="container-narrow">
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/gamma-alternative" className="text-accent hover:underline">
                Gamma alternative →
              </Link>
              <Link to="/powerpoint-ai" className="text-accent hover:underline">
                PowerPoint AI generator →
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
                Start generating structured decks
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

export default AIDeckGenerator;