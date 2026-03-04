import { Link } from "react-router-dom";
import { Download, ExternalLink, Mail } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";

export default function Press() {
  const jsonLd = {
    "@type": "Organization",
    name: "AXIVA",
    description:
      "AXIVA is an AI-powered presentation generator built for executives who need structured, board-ready decks.",
    url: "https://axiva.ai",
    founder: {
      "@type": "Person",
      name: "Jag Mariappan",
      url: "https://axiva.ai/founder",
    },
    logo: "https://axiva.ai/favicon.png",
  };

  return (
    <>
      <SeoHead
        title="Press Kit | AXIVA - AI Presentation Generator"
        description="Download AXIVA press assets, brand guidelines, and media resources. Get information about AXIVA and founder Jag Mariappan for press coverage."
        canonicalPath="/press"
        keywords="AXIVA press kit, AXIVA media, Jag Mariappan, AI presentation company"
        jsonLd={jsonLd}
      />

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          {/* Header */}
          <section className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Press & Media
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Resources for journalists, bloggers, and media covering AXIVA and
              AI-powered executive presentations.
            </p>
          </section>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* About AXIVA */}
            <section>
              <h2 className="text-2xl font-bold mb-6">About AXIVA</h2>
              <div className="p-6 rounded-xl border border-border bg-card">
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  AXIVA is an AI-powered presentation generator built specifically
                  for executives who need structured, board-ready decks. Unlike
                  general-purpose AI tools, AXIVA is trained on executive
                  communication patterns — board presentations, strategy updates,
                  and decision frameworks.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  The platform enables senior leaders to create professional
                  presentations in minutes rather than hours, with AI that
                  understands the structure and density that boards expect.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Founded by{" "}
                  <Link to="/founder" className="text-accent hover:underline">
                    Jag Mariappan
                  </Link>
                  , AXIVA addresses the gap between generic AI presentation tools
                  and the specific needs of executive communication.
                </p>
              </div>
            </section>

            {/* Founder */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Founder</h2>
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-bold">
                    JM
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Jag Mariappan</h3>
                    <p className="text-muted-foreground">Founder & CEO</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Jag Mariappan is the founder of AXIVA, an AI presentation
                  platform for executive communication. With a background in
                  enterprise technology and executive leadership, Jag built AXIVA
                  to solve the presentation creation challenges he experienced
                  firsthand.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/founder">
                    Full Bio <ExternalLink className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </section>
          </div>

          {/* Press Kit Download */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Brand Assets</h2>
            <div className="p-8 rounded-xl border border-border bg-card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    AXIVA Press Kit
                  </h3>
                  <p className="text-muted-foreground">
                    Logos, wordmarks, brand guidelines, and approved imagery for
                    media use. Available in SVG, PNG, and PDF formats.
                  </p>
                </div>
                <Button asChild size="lg" className="w-full md:w-auto shrink-0">
                  <a href="/assets/axiva-presskit.zip" download>
                    <Download className="mr-2 h-4 w-4" />
                    Download Press Kit
                  </a>
                </Button>
              </div>
            </div>
          </section>

          {/* Media Contact */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Media Contact</h2>
            <div className="p-8 rounded-xl border border-border bg-card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Press Inquiries
                  </h3>
                  <p className="text-muted-foreground">
                    For interviews, product information, or media inquiries,
                    contact us directly.
                  </p>
                </div>
                <Button asChild variant="outline" size="lg" className="w-full md:w-auto shrink-0">
                  <Link to="/contact">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Press Team
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Key Facts */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Key Facts</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-2">Product Category</h3>
                <p className="text-muted-foreground">
                  AI-Powered Presentation Generator
                </p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-2">Target Market</h3>
                <p className="text-muted-foreground">
                  Executives, Board Directors, Senior Leaders
                </p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-2">Headquarters</h3>
                <p className="text-muted-foreground">Remote-First Company</p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-2">Founded</h3>
                <p className="text-muted-foreground">2025</p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-2">Founder</h3>
                <p className="text-muted-foreground">Jag Mariappan</p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-2">Website</h3>
                <p className="text-muted-foreground">axiva.ai</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </>
  );
}
