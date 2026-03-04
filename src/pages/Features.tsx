import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, FileText, MessageSquare, FileOutput, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Structured Thinking Engine",
      description: "AXIVA is engineered for logic-first slides: headings → insights → supporting detail."
    },
    {
      icon: FileText,
      title: "AI Outline → Deck Pipeline",
      description: "Upload notes, briefs, docs, or outlines. AXIVA converts them into fully structured slides."
    },
    {
      icon: MessageSquare,
      title: "Executive Language Model",
      description: "Trained for precision, crisp short sentences, analytical tone, and decision-focused messaging."
    },
    {
      icon: FileOutput,
      title: "PowerPoint Export",
      description: "PPTX that opens cleanly anywhere. No broken formatting."
    },
    {
      icon: Shield,
      title: "Enterprise Controls",
      description: "Everything stays private and secure. SOC2-ready architecture."
    }
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
                <span>Features</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Designed for Clarity.{" "}
                <span className="text-gradient">Built for Executives.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Every feature in AXIVA serves one purpose: turning your ideas into 
                clear, structured, decision-ready presentations.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 border-t border-border/40">
          <div className="container-narrow">
            <div className="grid gap-8">
              {features.map((feature, i) => (
                <div key={i} className="glass-card p-8 flex flex-col sm:flex-row items-start gap-6">
                  <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <feature.icon className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-lg text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Link */}
        <section className="py-12 border-t border-border/40">
          <div className="container-narrow text-center">
            <p className="text-muted-foreground">
              Looking for a{" "}
              <Link to="/gamma-alternative" className="text-accent hover:underline">
                structured alternative to Gamma for business decks
              </Link>
              ?
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-border/40">
          <div className="container-narrow">
            <div className="glass-card p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Experience the difference
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

export default Features;