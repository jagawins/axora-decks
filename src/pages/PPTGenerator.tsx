import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle, FileOutput } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";

const PPTGenerator = () => {
  const slideTypes = [
    "Problem → Insight → Recommendation slides",
    "Executive summaries",
    "Two-column frameworks",
    "5-slide and 10-slide briefings",
    "Program/Project updates"
  ];

  return (
    <div className="min-h-screen bg-background">
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
                <span>Online PPT Generator</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Online PPT Generator That{" "}
                <span className="text-gradient">Thinks Like an Executive</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                Not a design toy. AXOR builds structured slides with reasoning, clarity, 
                and decision-ready messaging.
              </p>

              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Generate Your First Deck Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Built for Business */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
              Built for Real Business Use
            </h2>
            
            <div className="max-w-2xl mx-auto">
              <div className="glass-card p-8">
                <p className="text-lg text-muted-foreground mb-6">AXOR creates:</p>
                <ul className="space-y-4">
                  {slideTypes.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Exports */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <div className="max-w-3xl mx-auto text-center">
              <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-8">
                <FileOutput className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Exports That Don't Break
              </h2>
              <p className="text-lg text-muted-foreground">
                Unlike other tools, AXOR exports clean PowerPoint files without 
                broken layers or styling artifacts.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <div className="glass-card p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Generate your first deck free
              </h2>
              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Start Now
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

export default PPTGenerator;