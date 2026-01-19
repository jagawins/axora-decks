import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[80px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-success/5 rounded-full blur-[60px]" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="container-narrow relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-8 animate-fade-in-up">
            <Sparkles className="h-4 w-4" />
            <span>AI Presentation Generator for Executives</span>
          </div>

          {/* Main headline - H1 for SEO */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in-up animation-delay-100">
            Turn raw ideas into{" "}
            <span className="text-gradient">executive-grade</span>{" "}
            PowerPoint decks in minutes
          </h1>

          {/* Subheadline with SEO internal links */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed animate-fade-in-up animation-delay-200">
            Build executive-ready presentations with structured AI.
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
            Explore our{" "}
            <Link to="/ai-deck-generator" className="text-accent hover:underline">AI deck generator</Link>
            , see{" "}
            <Link to="/gamma-alternative" className="text-accent hover:underline">why teams switch from Gamma</Link>
            , or generate{" "}
            <Link to="/powerpoint-ai" className="text-accent hover:underline">PowerPoint-ready slides</Link>
            {" "}in minutes.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
            <Link to="/auth">
              <Button variant="hero" size="xl" className="group">
                Try AXOR Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="hero-outline" size="xl" className="group">
              <Play className="h-5 w-5 mr-1" />
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-white/5 animate-fade-in-up animation-delay-400">
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by leaders at consulting firms, enterprises, and startups
            </p>
            <div className="flex items-center justify-center gap-8 opacity-40">
              <span className="text-lg font-semibold tracking-wide">McKinsey</span>
              <span className="text-lg font-semibold tracking-wide">BCG</span>
              <span className="text-lg font-semibold tracking-wide">Deloitte</span>
              <span className="text-lg font-semibold tracking-wide hidden sm:block">Goldman</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
