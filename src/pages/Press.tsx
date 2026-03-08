import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, ExternalLink, Mail, Copy, Check, Newspaper } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";

/* ── Press coverage data (easy to update) ── */
const pressCoverage = [
  {
    publication: "TechCrunch",
    headline: "The AI tool that's replacing PowerPoint for board prep",
    date: "2025",
    url: "#",
  },
  {
    publication: "Forbes",
    headline: "Axiva raises the bar for executive presentation tools",
    date: "2025",
    url: "#",
  },
  {
    publication: "Product Hunt",
    headline: "#1 Product of the Day",
    date: "2025",
    url: "#",
  },
];

const SHOW_COVERAGE = false; // flip to true when real coverage exists

const companyFacts = [
  { label: "Founded", value: "2024" },
  { label: "Category", value: "AI Productivity / Executive Tools" },
  { label: "Headquarters", value: "London, UK" },
  { label: "What we do", value: "Build board-ready decks from a single prompt in under 2 minutes" },
  { label: "Founder", value: "Jag Mariappan" },
  { label: "Website", value: "axiva.ai" },
];

const boilerplate = `Axiva.ai is an AI executive deck generator that enables CFOs, founders, and executive teams to build board-ready presentations in under 2 minutes. The company is headquartered in London, UK and serves growth-stage companies, VC-backed startups, and enterprise executive teams. For more information, visit axiva.ai.`;

export default function Press() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(boilerplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsonLd = {
    "@type": "Organization",
    name: "Axiva.ai",
    url: "https://axiva.ai",
    logo: "https://axiva.ai/favicon.png",
    founder: {
      "@type": "Person",
      name: "Jag Mariappan",
      url: "https://axiva.ai/founder",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Press",
      email: "press@axiva.ai",
    },
  };

  return (
    <>
      <SeoHead
        title="Press & Media Kit — Axiva.ai"
        description="Download Axiva.ai brand assets, logos, screenshots, and boilerplate copy. For press inquiries contact press@axiva.ai."
        canonicalPath="/press"
        keywords="Axiva press kit, Axiva media, Jag Mariappan, AI presentation company, executive deck generator"
        jsonLd={jsonLd}
      />

      <Navbar />

      <main className="min-h-screen pt-24 pb-20">
        <div className="mx-auto max-w-[1100px] px-6">

          {/* ─── 1. HERO ─── */}
          <section className="text-center mb-20">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-4">
              Axiva.ai Press & Media
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-3">
              The AI executive deck generator built for CFOs, founders, and boards.
            </p>
            <p className="text-sm text-muted-foreground">
              For press inquiries:{" "}
              <a href="mailto:press@axiva.ai" className="text-accent hover:underline font-medium">
                press@axiva.ai
              </a>
            </p>
          </section>

          {/* ─── 2. COMPANY FACTS ─── */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-8 text-foreground">Company Facts</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companyFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="p-5 rounded-xl border border-border bg-card"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    {fact.label}
                  </p>
                  <p className="text-foreground font-medium">{fact.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── 3. ABOUT AXIVA ─── */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-6 text-foreground">About Axiva</h2>
            <div className="p-8 rounded-xl border border-border bg-card space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Axiva.ai is an AI-powered executive deck generator that helps CFOs, CEOs, chiefs of staff, and founding teams build polished board decks, investor updates, and QBR presentations in under 2 minutes. Unlike general AI presentation tools, Axiva is purpose-built for the executive use case — structured narrative, board-ready formatting, and investor-grade output.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Axiva competes in the fast-growing AI presentation market alongside Gamma, Beautiful.ai, and Tome — but targets a distinct segment: growth-stage companies and enterprise exec teams where presentation quality directly impacts fundraising, board confidence, and strategic credibility.
              </p>
            </div>
          </section>

          {/* ─── 4. PRESS COVERAGE ─── */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-8 text-foreground">Press Coverage</h2>
            {SHOW_COVERAGE ? (
              <div className="grid md:grid-cols-3 gap-6">
                {pressCoverage.map((item) => (
                  <a
                    key={item.publication}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-6 rounded-xl border border-border bg-card hover:border-accent/50 transition-colors"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
                      {item.publication}
                    </p>
                    <p className="text-foreground font-medium mb-3 group-hover:text-accent transition-colors">
                      "{item.headline}"
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{item.date}</span>
                      <span className="flex items-center gap-1 group-hover:text-accent transition-colors">
                        Read article <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-border bg-card/50 text-center">
                <Newspaper className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Coverage coming soon. Reach out to{" "}
                  <a href="mailto:press@axiva.ai" className="text-accent hover:underline">
                    press@axiva.ai
                  </a>{" "}
                  to be first.
                </p>
              </div>
            )}
          </section>

          {/* ─── 5. LOGO DOWNLOADS ─── */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-8 text-foreground">Logo Downloads</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Wordmark — Dark (SVG)", href: "/src/assets/axiva-wordmark-dark.svg", file: "axiva-wordmark-dark.svg" },
                { label: "Wordmark — Light (SVG)", href: "/src/assets/axiva-wordmark.svg", file: "axiva-wordmark.svg" },
                { label: "Logo (PNG)", href: "/src/assets/axora-logo.png", file: "axiva-logo.png" },
                { label: "Press Kit (ZIP)", href: "/assets/axiva-presskit.zip", file: "axiva-presskit.zip" },
              ].map((asset) => (
                <a
                  key={asset.label}
                  href={asset.href}
                  download={asset.file}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-accent/50 transition-colors"
                >
                  <Download className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-sm font-medium text-foreground">{asset.label}</span>
                </a>
              ))}
            </div>
          </section>

          {/* ─── 6. PRODUCT SCREENSHOTS ─── */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-8 text-foreground">Product Screenshots</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {[
                { label: "Prompt Input", desc: "Single-prompt deck generation" },
                { label: "Generated Deck", desc: "Board-ready output with structured blocks" },
                { label: "Editor View", desc: "Visual block editor with AI sidebar" },
              ].map((shot) => (
                <div
                  key={shot.label}
                  className="aspect-video rounded-xl border border-border bg-muted/30 flex flex-col items-center justify-center text-center p-6"
                >
                  <p className="text-sm font-semibold text-foreground mb-1">{shot.label}</p>
                  <p className="text-xs text-muted-foreground">{shot.desc}</p>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" size="sm">
              <a href="/assets/axiva-presskit.zip" download>
                <Download className="mr-2 h-4 w-4" />
                Download all screenshots (ZIP)
              </a>
            </Button>
          </section>

          {/* ─── 7. FOUNDER BIO ─── */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-8 text-foreground">Founder</h2>
            <div className="p-8 rounded-xl border border-border bg-card flex flex-col sm:flex-row gap-6">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-bold shrink-0">
                JM
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Jag Mariappan</h3>
                <p className="text-sm text-muted-foreground mb-3">Founder & CEO, Axiva.ai</p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Jag Mariappan is the founder of Axiva, an AI presentation platform for executive communication. With a background in enterprise technology and executive leadership, Jag built Axiva to solve the presentation creation challenges he experienced firsthand in boardrooms and investor meetings.
                </p>
                <div className="flex gap-3">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/founder">
                      Full Bio <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href="https://linkedin.com/in/jagmariappan" target="_blank" rel="noopener noreferrer">
                      LinkedIn <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* ─── 8. BOILERPLATE ─── */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Standard Company Boilerplate for Press Use</h2>
            <div className="p-6 rounded-xl border border-border bg-card relative">
              <p className="text-muted-foreground leading-relaxed pr-12">{boilerplate}</p>
              <button
                onClick={handleCopy}
                className="absolute top-4 right-4 p-2 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors"
                aria-label="Copy boilerplate"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </section>

          {/* ─── 9. PRESS CONTACT ─── */}
          <section className="mb-8">
            <div className="p-8 rounded-xl border border-accent/20 bg-accent/5 text-center">
              <Mail className="h-8 w-8 text-accent mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground mb-2">Media Inquiries</h2>
              <a
                href="mailto:press@axiva.ai"
                className="text-accent hover:underline font-medium text-lg"
              >
                press@axiva.ai
              </a>
              <p className="text-sm text-muted-foreground mt-2">Response time: within 24 hours</p>
            </div>
          </section>

        </div>
      </main>

      <MarketingFooter />
    </>
  );
}
