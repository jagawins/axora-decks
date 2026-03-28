import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, X, Check, Clock, Sparkles } from "lucide-react";

/**
 * Before & After — clean split comparison.
 */
export default function BeforeAfter() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">
            The Difference
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Stop formatting. Start presenting.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            What used to take hours of design work now happens in minutes.
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* BEFORE */}
          <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/40" />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono ml-2">slides_v12_FINAL.pptx</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-semibold">Before</span>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              {/* Pain points */}
              {[
                { text: "Hours spent pushing pixels", icon: Clock },
                { text: "Generic bullet-point layouts", icon: X },
                { text: "No data visualization", icon: X },
                { text: "Brand inconsistency", icon: X },
                { text: "Version chaos (v3_final_v2)", icon: X },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500/10 shrink-0">
                    <item.icon className="h-3 w-3 text-red-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </div>
              ))}

              {/* Time indicator */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-red-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-semibold">4–6 hours per deck</span>
                </div>
              </div>
            </div>
          </div>

          {/* AFTER */}
          <div className="relative rounded-2xl border border-accent/30 bg-card overflow-hidden ring-1 ring-accent/10">
            <div className="px-5 py-3 border-b border-accent/10 bg-accent/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/20" />
                </div>
                <span className="text-[10px] text-accent/70 font-mono ml-2">AXIVA, Executive Deck</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-semibold">After</span>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              {/* Benefits */}
              {[
                { text: "AI generates structure & narrative" },
                { text: "Visual blocks: KPIs, charts, timelines" },
                { text: "Auto data visualization" },
                { text: "One-click brand kit application" },
                { text: "Export to PowerPoint, PDF, or live link" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-accent/10 shrink-0">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-sm text-foreground/90">{item.text}</span>
                </div>
              ))}

              {/* Time indicator */}
              <div className="pt-4 border-t border-accent/10">
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold">Under 5 minutes per deck</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link to="/templates">
            <Button variant="hero" size="lg" className="gap-2 group">
              See Full Examples
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
