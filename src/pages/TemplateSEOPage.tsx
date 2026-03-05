import { useParams, Link, useNavigate } from "react-router-dom";
import { TEMPLATE_SEO_PAGES } from "@/data/template-seo-pages";
import SeoHead from "@/components/SeoHead";
import MarketingHeader from "@/components/MarketingHeader";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check, ChevronDown, ChevronUp, Layers, Zap, Download } from "lucide-react";
import { useState } from "react";

export default function TemplateSEOPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const page = TEMPLATE_SEO_PAGES.find((p) => p.slug === slug);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Template not found</h1>
          <Link to="/templates" className="text-accent hover:underline">Browse all templates</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={page.title}
        description={page.description}
        canonicalPath={`/templates/${page.slug}`}
      />
      <MarketingHeader />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-transparent" />
        <div className="container-wide relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Template
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              {page.h1}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              {page.heroSubline}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="hero"
                size="lg"
                className="gap-2 rounded-full px-8"
                onClick={() => navigate("/auth")}
              >
                <Sparkles className="h-4 w-4" />
                {page.ctaText}
              </Button>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="gap-2 rounded-full px-8">
                  See a Live Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-4">No credit card required · 3 free decks</p>
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="py-20 border-t border-border/40">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              What the AI generates for you
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {page.exampleSlides.map((slide, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card/50"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10 text-accent text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground/80">{slide}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 border-t border-border/40">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              Perfect for
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {page.useCases.map((uc, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-sm">{uc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-border/40 bg-card/30">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-12">
              3 steps. Under 2 minutes.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Sparkles, title: "Describe your deck", desc: "Enter your topic, audience, and key points. Or paste existing content." },
                { icon: Layers, title: "AI generates slides", desc: "AXIVA creates structured slides with charts, stats, timelines, and narratives." },
                { icon: Download, title: "Export & present", desc: "Download as PowerPoint, share a link, or present directly from AXIVA." },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center relative">
                    <step.icon className="h-6 w-6 text-accent" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-border/40">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {page.faqItems.map((faq, i) => (
                <div key={i} className="border border-border/50 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-card/50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-medium text-sm pr-4">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* FAQ Schema for SEO */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: page.faqItems.map((faq) => ({
                    "@type": "Question",
                    name: faq.q,
                    acceptedAnswer: { "@type": "Answer", text: faq.a },
                  })),
                }),
              }}
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 border-t border-border/40 bg-card/30">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to create your deck?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of executives using AXIVA to build presentation-ready decks in minutes, not hours.
            </p>
            <Button
              variant="hero"
              size="lg"
              className="gap-2 rounded-full px-10"
              onClick={() => navigate("/auth")}
            >
              <Sparkles className="h-4 w-4" />
              {page.ctaText}
            </Button>
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> 3 free decks</span>
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> No credit card</span>
              <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> Export to PPTX</span>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
