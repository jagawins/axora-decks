import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent" />
      
      <div className="container-narrow relative">
        <div className="text-center glass-card p-12 md:p-16 lg:p-20">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent text-accent-foreground mb-8 animate-pulse-glow">
            <Zap className="h-8 w-8" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to transform how you
            <br className="hidden sm:block" />
            <span className="text-gradient"> communicate ideas?</span>
          </h2>

          {/* Subtext */}
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Join thousands of executives and strategists who create 
            presentation-ready documents in minutes, not hours.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button variant="hero" size="xl" className="group">
                Try AXORA Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="glass" size="xl">
              Schedule Demo
            </Button>
          </div>

          {/* Trust note */}
          <p className="text-sm text-muted-foreground mt-8">
            No credit card required • Free tier forever
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
