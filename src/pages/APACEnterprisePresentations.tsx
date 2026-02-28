import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check, Globe2, Building2, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import SeoHead from "@/components/SeoHead";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import CreatorNote from "@/components/landing/CreatorNote";

const APAC_FEATURES = [
  { icon: Globe2, title: "Multi-Market Enterprise Decks", desc: "Generate presentations for cross-border teams spanning Singapore, Australia, Hong Kong, and Japan with consistent executive formatting." },
  { icon: Building2, title: "Board Governance Standards", desc: "Align with APAC corporate governance codes — from Singapore's SGX requirements to Australia's ASX Corporate Governance Principles." },
  { icon: BarChart3, title: "Regional Market Analysis", desc: "Present TAM/SAM data, competitive landscapes, and growth projections tailored to Asia-Pacific market dynamics." },
];

const MARKETS = [
  { name: "Singapore", desc: "SGX governance, MAS regulatory decks, ASEAN market entry" },
  { name: "Australia", desc: "ASX board packs, APRA compliance, healthcare governance" },
  { name: "Hong Kong", desc: "HKEX reporting, Greater Bay Area strategy, investor decks" },
  { name: "Japan", desc: "Enterprise partnerships, market entry, bilingual exec summaries" },
  { name: "India", desc: "Startup pitch decks, SEBI compliance, growth market presentations" },
  { name: "New Zealand", desc: "Public sector governance, health system reporting, board updates" },
];

const USE_CASES = [
  "Cross-border enterprise strategy presentations",
  "SGX / ASX board governance packs",
  "APAC market entry and expansion decks",
  "Regional healthcare and public sector reviews",
  "Investor presentations for APAC-based startups",
  "Quarterly business reviews for multinational teams",
];

export default function SingaporeEnterprisePresentations() {
  const jsonLd = {
    "@type": "SoftwareApplication",
    name: "AXORA — Asia-Pacific Enterprise Presentation Generator",
    applicationCategory: "BusinessApplication",
    description: "AI-powered presentation generator for Asia-Pacific enterprises. Create SGX-compliant board decks, APAC market analysis, and cross-border executive presentations in minutes.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    operatingSystem: "Web",
  };

  return (
    <>
      <SeoHead
        title="AI Presentation Generator for Asia-Pacific | Enterprise Decks for APAC — AXORA"
        description="Create SGX-compliant board decks, APAC market analysis presentations, and cross-border executive slides in minutes. AI-powered for enterprise teams in Singapore, Australia, and Asia-Pacific."
        canonicalPath="/asia-pacific-enterprise-presentations"
        keywords="AI presentation generator Asia-Pacific, Singapore enterprise deck, APAC board presentation, Australia executive presentation, SGX board pack, Asia-Pacific business presentation, enterprise AI slides APAC"
        jsonLd={jsonLd}
      />

      <MarketingHeader />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          {/* Hero */}
          <section className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Built for Asia-Pacific Enterprise
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 max-w-4xl mx-auto">
              AI Presentations for{" "}
              <span className="text-gradient">Asia-Pacific Leaders</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Turn regional data into executive-grade decks in minutes. 
              Built for SGX governance, ASX compliance, and cross-border enterprise strategy across APAC.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create">
                <Button variant="hero" size="xl" className="group w-full sm:w-auto">
                  Create Enterprise Deck <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/templates">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Browse Templates
                </Button>
              </Link>
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-10">
              Purpose-Built for APAC Enterprise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {APAC_FEATURES.map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Markets */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-4">
              Key Markets We Serve
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              From Singapore's financial hub to Australia's enterprise sector — AXORA supports executive presentation needs across APAC.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {MARKETS.map((m) => (
                <div key={m.name} className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="font-semibold text-foreground text-sm mb-1">{m.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Use cases */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-10">
              Common Use Cases
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {USE_CASES.map((uc) => (
                <div key={uc} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                  <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{uc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-16 px-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Executive Decks for APAC, Built in Minutes
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join enterprise leaders across Asia-Pacific who create board-ready presentations with AI.
            </p>
            <Link to="/create">
              <Button size="lg" className="gap-2">
                Start Creating <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </section>

          <CreatorNote />
        </div>
      </main>

      <Footer />
    </>
  );
}
