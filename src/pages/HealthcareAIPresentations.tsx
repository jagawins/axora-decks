import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check, Shield, Building2, Heart, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import SeoHead from "@/components/SeoHead";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import CreatorNote from "@/components/landing/CreatorNote";

const PAIN_POINTS = [
  { icon: Shield, title: "Joint Commission Compliance", desc: "Generate board decks that meet Joint Commission documentation standards and accreditation readiness requirements." },
  { icon: Building2, title: "CMS Reporting & Governance", desc: "Structure executive presentations around CMS quality measures, HEDIS metrics, and value-based care outcomes." },
  { icon: Heart, title: "Clinical Operations Reviews", desc: "Turn clinical performance data into boardroom-ready slide decks with AI-powered data visualization." },
  { icon: BarChart3, title: "Revenue Cycle & Financial Reporting", desc: "Present RCM metrics, payer mix analysis, and margin trends in executive-grade format." },
];

const USE_CASES = [
  "Quarterly board updates for health system leadership",
  "CMO clinical quality reviews and patient safety reports",
  "CFO financial performance presentations with payer analysis",
  "Strategic planning decks for service line expansion",
  "Investor presentations for digital health startups",
  "Department-level operational reviews and KPI dashboards",
];

const CITIES = [
  { name: "Boston", label: "Mass General Brigham, Partners HealthCare" },
  { name: "Houston", label: "Texas Medical Center, MD Anderson" },
  { name: "Nashville", label: "HCA Healthcare, Vanderbilt" },
  { name: "Minneapolis", label: "UnitedHealth, Mayo Clinic" },
  { name: "Los Angeles", label: "Cedars-Sinai, Kaiser Permanente" },
  { name: "San Francisco", label: "UCSF Health, Dignity Health" },
];

export default function HealthcareAIPresentations() {
  const jsonLd = {
    "@type": "SoftwareApplication",
    name: "AXORA — Healthcare AI Presentation Generator",
    applicationCategory: "BusinessApplication",
    description: "AI-powered presentation generator built for healthcare executives. Create Joint Commission-compliant board decks, CMS reporting presentations, and clinical operations reviews in minutes.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    operatingSystem: "Web",
  };

  return (
    <>
      <SeoHead
        title="Healthcare AI Presentation Generator | Board Decks for Health Systems — AXORA"
        description="Create Joint Commission-compliant board decks, CMS reporting presentations, and clinical operations reviews in minutes. AI-powered for healthcare executives at enterprise health systems."
        canonicalPath="/healthcare-ai-presentations"
        keywords="healthcare presentation generator, hospital board deck, Joint Commission compliance presentation, CMS reporting deck, healthcare executive presentation, clinical operations review, health system board update"
        jsonLd={jsonLd}
      />

      <MarketingHeader />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          {/* Hero */}
          <section className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Built for Healthcare Leadership
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 max-w-4xl mx-auto">
              AI Presentations for{" "}
              <span className="text-gradient">Healthcare Executives</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Turn clinical data and operational metrics into board-ready decks in minutes. 
              Compliant with Joint Commission documentation standards and built for CMS reporting workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create">
                <Button variant="hero" size="xl" className="group w-full sm:w-auto">
                  Create Healthcare Deck <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/templates">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Browse Healthcare Templates
                </Button>
              </Link>
            </div>
          </section>

          {/* Pain points */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-10">
              Built for Healthcare Governance & Compliance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PAIN_POINTS.map((item) => (
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
              Use Cases for Health System Leaders
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              AXORA is used by Chiefs of Staff, VPs of Strategy, Healthcare CMOs, and Directors of Clinical Operations across enterprise health systems.
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

          {/* Geo targeting — Healthcare hubs */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-4">
              Trusted by Leaders at Top Healthcare Hubs
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              AXORA serves healthcare executives across North America's largest health system clusters.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {CITIES.map((city) => (
                <div key={city.name} className="text-center p-4 rounded-xl border border-border bg-card">
                  <p className="font-semibold text-foreground text-sm">{city.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{city.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-16 px-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Your Next Board Deck, Done in Minutes
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join healthcare leaders who create compliance-ready executive presentations with AI — not PowerPoint.
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
