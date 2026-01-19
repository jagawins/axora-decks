import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, BarChart3, Shield, Activity, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import FounderCard from "@/components/landing/FounderCard";

const ExecutiveDeckGenerator = () => {
  const qualities = [
    "Brevity",
    "Clear hierarchy",
    "Narrative discipline",
    "Predictable slide structures",
    "Tight wording"
  ];

  const slideTypes = [
    { icon: Target, label: "Executive Summary" },
    { icon: BarChart3, label: "Problem → Impact → Solution" },
    { icon: Shield, label: "Strategic Pillars" },
    { icon: Activity, label: "Risks & Mitigations" },
    { icon: BarChart3, label: "KPIs & Dashboards" },
    { icon: Activity, label: "Operating Cadences" },
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
                <span>Executive Deck Generator</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Executive Deck Generator for{" "}
                <span className="text-gradient">Strategy, Operations & Leadership</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                AXOR structures your thinking into clear, concise, high-judgment slides. 
                No fluff. No jargon.
              </p>

              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Build an Executive-Ready Deck
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* What Makes It Executive */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
              What Makes AXOR "Executive"
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {qualities.map((item, i) => (
                <div key={i} className="glass-card p-4 text-center">
                  <CheckCircle className="h-5 w-5 text-accent mx-auto mb-2" />
                  <p className="font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Slide Types */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
              Slide Types AXOR Generates
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {slideTypes.map((item, i) => (
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

        {/* Founder Card */}
        <FounderCard />

        {/* CTA */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <div className="glass-card p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Build an executive-ready deck
              </h2>
              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Get Started Free
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

export default ExecutiveDeckGenerator;