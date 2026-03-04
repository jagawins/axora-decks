import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

/**
 * Before & After split-screen comparison section for the homepage.
 * Left: generic PowerPoint mockup. Right: polished AXIVA output preview.
 */
export default function BeforeAfter() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">
            The Difference
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Stop formatting. Start presenting.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See the gap between generic slides and executive-grade output.
          </p>
        </div>

        {/* Split comparison */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* BEFORE */}
          <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/50 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">presentation_v12_final_FINAL.pptx</span>
            </div>
            <div className="p-8 space-y-4 aspect-video flex flex-col justify-center bg-gradient-to-br from-muted/30 to-muted/10">
              {/* Mock PowerPoint slide */}
              <div className="text-lg font-bold text-foreground/70">Q4 Strategy Update</div>
              <div className="space-y-2.5">
                {['Key metrics overview and performance summary', 'Market analysis and competitive landscape review', 'Strategic initiatives for next quarter planning', 'Budget allocation and resource requirements', 'Risk assessment and mitigation strategies'].map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-muted-foreground/50 mt-0.5 text-sm">•</span>
                    <span className="text-sm text-muted-foreground/60">{text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-4 text-[10px] text-muted-foreground/30 text-right">
                Slide 3 of 47
              </div>
            </div>
            {/* Overlay label */}
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-semibold">
                Before
              </span>
            </div>
            <div className="p-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center italic">
                Hours spent on formatting instead of strategy
              </p>
            </div>
          </div>

          {/* Connecting arrow (desktop only) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-12 h-12 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-accent" />
            </div>
          </div>

          {/* AFTER */}
          <div className="relative rounded-2xl border border-accent/20 bg-card overflow-hidden ring-1 ring-accent/10">
            <div className="px-4 py-2 border-b border-accent/10 bg-accent/5 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent/20" />
              </div>
              <span className="text-[10px] text-accent/70 font-mono">AXIVA — Executive Deck</span>
            </div>
            <div className="p-6 aspect-video flex flex-col gap-3 bg-gradient-to-br from-accent/[0.03] to-transparent">
              {/* Mock AXIVA slide thumbnails */}
              <div className="flex-1 grid grid-rows-3 gap-2.5">
                {/* Slide 1: Executive Summary */}
                <div className="rounded-lg border border-accent/10 bg-card/80 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-accent text-xs font-bold">ES</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground">Executive Summary</div>
                    <div className="text-[10px] text-muted-foreground">4 key insights · AI-structured · sourced</div>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <div className="w-6 h-4 rounded bg-accent/20" />
                    <div className="w-6 h-4 rounded bg-success/20" />
                  </div>
                </div>

                {/* Slide 2: KPI Dashboard */}
                <div className="rounded-lg border border-accent/10 bg-card/80 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-accent text-xs font-bold">📊</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground">Performance Metrics</div>
                    <div className="text-[10px] text-muted-foreground">4 KPIs · charts · trend analysis</div>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <div className="w-10 h-4 rounded bg-accent/15">
                      <div className="w-6 h-full rounded bg-accent/40" />
                    </div>
                  </div>
                </div>

                {/* Slide 3: Decision Framework */}
                <div className="rounded-lg border border-accent/10 bg-card/80 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-accent text-xs font-bold">🎯</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground">Strategic Recommendations</div>
                    <div className="text-[10px] text-muted-foreground">Decision panel · evidence map · next steps</div>
                  </div>
                  <div className="ml-auto">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">85% confidence</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Overlay label */}
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-1 rounded-md bg-accent/10 text-accent text-xs font-semibold">
                After
              </span>
            </div>
            <div className="p-4 border-t border-accent/10">
              <p className="text-sm text-accent text-center font-medium">
                Executive-grade decks in 5 minutes
              </p>
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
