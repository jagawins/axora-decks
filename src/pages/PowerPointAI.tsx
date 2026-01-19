import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, FileText, BarChart, Users, Building, Heart, Landmark } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";

const PowerPointAI = () => {
  const useCases = [
    { icon: FileText, label: "Strategy decks" },
    { icon: BarChart, label: "Investor updates" },
    { icon: Users, label: "Operating reviews" },
    { icon: Building, label: "Transformation plans" },
    { icon: Landmark, label: "Board presentations" },
    { icon: Heart, label: "Healthcare, finance & enterprise" },
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
                <span>AI PowerPoint Generator</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                AI PowerPoint Generator for{" "}
                <span className="text-gradient">Leaders Who Need Clarity</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                Turn rough notes into structured, executive-grade PowerPoint decks in minutes.
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

        {/* Core Message */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-2xl sm:text-3xl font-medium leading-relaxed mb-6">
                AI design tools create slides.<br />
                <span className="text-accent">AXOR creates structured thinking.</span>
              </p>
              <p className="text-lg text-muted-foreground">
                This is the difference. AXOR converts ideas into argument-driven narratives, 
                not template-driven visuals.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
              What You Can Create
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((item, i) => (
                <div key={i} className="glass-card p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-lg font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Better */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
              Why It Outperforms PowerPoint Copilot & Gamma
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {[
                "Sharper arguments",
                "Cleaner hierarchy",
                "Consistent slide logic",
                "PPT-native exports"
              ].map((item, i) => (
                <div key={i} className="glass-card p-6 text-center">
                  <p className="text-lg font-semibold text-accent">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <div className="glass-card p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to create executive-grade decks?
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