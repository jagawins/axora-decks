import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check, Shield, Building2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import SeoHead from "@/components/SeoHead";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import CreatorNote from "@/components/landing/CreatorNote";

const NHS_FEATURES = [
  { icon: Shield, title: "CQC & NHS Board Governance", desc: "Generate board papers that align with Care Quality Commission inspection frameworks and NHS Improvement guidance." },
  { icon: Building2, title: "Trust-Level Reporting", desc: "Structure presentations around NHS Trust KPIs: RTT performance, A&E wait times, cancer targets, and workforce metrics." },
  { icon: FileText, title: "Integrated Care Board (ICB) Decks", desc: "Create system-level presentations for ICB governance meetings, population health reviews, and place-based partnerships." },
];

const USE_CASES = [
  "NHS Trust board meeting papers and performance packs",
  "CQC inspection readiness presentations",
  "ICB governance and system integration reports",
  "Clinical quality and patient safety dashboards",
  "Foundation Trust council of governors briefings",
  "Digital transformation and EPR programme updates",
];

export default function NHSBoardPresentationGenerator() {
  const jsonLd = {
    "@type": "SoftwareApplication",
    name: "AXIVA — NHS Board Presentation Generator",
    applicationCategory: "BusinessApplication",
    description: "AI-powered presentation generator for NHS leaders. Create CQC-aligned board papers, Trust performance packs, and ICB governance decks in minutes.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    operatingSystem: "Web",
  };

  return (
    <>
      <SeoHead
        title="NHS Board Presentation Generator | AI Deck Builder for NHS Trusts — AXIVA"
        description="Create CQC-aligned board papers, Trust performance packs, and ICB governance presentations in minutes. AI-powered for NHS executives and healthcare leaders in the UK."
        canonicalPath="/nhs-board-presentation-generator"
        keywords="NHS board presentation, NHS Trust board papers, CQC presentation generator, ICB governance deck, NHS executive presentation, healthcare board pack UK, NHS board meeting slides"
        jsonLd={jsonLd}
      />

      <MarketingHeader />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          {/* Hero */}
          <section className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Built for NHS Leadership
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 max-w-4xl mx-auto">
              AI Board Papers for{" "}
              <span className="text-gradient">NHS Trusts</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Turn Trust performance data into governance-ready board packs in minutes. 
              Aligned with CQC frameworks, NHS Improvement standards, and ICB reporting requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create">
                <Button variant="hero" size="xl" className="group w-full sm:w-auto">
                  Create NHS Board Pack <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
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
              Purpose-Built for NHS Governance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {NHS_FEATURES.map((item) => (
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

          {/* Use cases */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-4">
              Built for Every Level of NHS Leadership
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              From Trust CEOs to clinical directors — AXIVA helps NHS leaders present with clarity and confidence.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {USE_CASES.map((uc) => (
                <div key={uc} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                  <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{uc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* UK + Canada context */}
          <section className="mb-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Also Available for Canadian Health Systems</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Provincial health authorities in Canada have similar governance documentation requirements. 
              AXIVA works with any health system structure — from NHS England to Ontario Health.
            </p>
            <Link to="/create">
              <Button variant="outline" size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </section>

          {/* CTA */}
          <section className="text-center py-16 px-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Your Next Board Pack, Done in Minutes
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join NHS leaders who create governance-ready presentations with AI — not PowerPoint.
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
