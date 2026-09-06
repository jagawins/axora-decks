import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-accent/[0.03] to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/8 rounded-full blur-[120px]" />

      <div className="container-narrow relative">
        <div className="text-center max-w-3xl mx-auto">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-8">
            <Sparkles className="h-7 w-7 text-accent" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to build your next
            <br className="hidden sm:block" />
            <span className="text-accent"> board-ready deck?</span>
          </h2>

          {/* Subtext */}
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Write your brief, get a structured recommendation, and walk into the room prepared.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/create">
              <Button variant="hero" size="xl" className="group gap-2 shadow-lg shadow-accent/20">
                Start Creating Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="glass" size="xl">
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Trust notes */}
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required · Free plan: 10 decks and 10 AI generations a month · PowerPoint and PDF export on Pro
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
