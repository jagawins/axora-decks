import { Link } from "react-router-dom";
import { ArrowRight, Linkedin, Twitter, Mail } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";

export default function Founder() {
  const jsonLd = {
    "@type": "Person",
    name: "Jag Mariappan",
    jobTitle: "Founder & CEO",
    worksFor: {
      "@type": "Organization",
      name: "AXIVA",
      url: "https://axiva.ai",
    },
    description:
      "Jag Mariappan is the founder of AXIVA, an AI presentation platform built for executive communication.",
    url: "https://axiva.ai/founder",
    sameAs: [
      "https://linkedin.com/in/jagmariappan",
      "https://twitter.com/jagmariappan",
    ],
  };

  return (
    <>
      <SeoHead
        title="Jag Mariappan - Founder of AXIVA | AI Presentation Platform"
        description="Jag Mariappan is the founder of AXIVA, an AI-powered presentation generator built for executives. Learn about his vision for transforming executive communication."
        canonicalPath="/founder"
        keywords="Jag Mariappan, AXIVA founder, AI presentation founder, executive communication"
        ogImage="/founder-card-og.png"
        jsonLd={jsonLd}
      />

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Hero */}
          <section className="text-center mb-16">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center text-5xl font-bold text-white">
              JM
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Jag Mariappan
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Founder & CEO, AXIVA
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline" size="icon">
                <a
                  href="https://linkedin.com/in/jagmariappan"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="icon">
                <a
                  href="https://twitter.com/jagmariappan"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="icon">
                <Link to="/contact" aria-label="Email">
                  <Mail className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Bio */}
          <section className="prose prose-invert prose-lg max-w-none mb-16">
            <h2>Building the Future of Executive Communication</h2>
            <p>
              I started AXIVA after spending years creating board presentations,
              strategy decks, and executive updates. The pattern was always the
              same: complex ideas requiring clear structure, tight deadlines
              demanding speed, and audiences expecting polish.
            </p>
            <p>
              When AI presentation tools emerged, I tried them all. They produced
              beautiful slides for marketing content but struggled with the
              structured, information-dense decks that executives actually need.
              The gap was clear: AI built for consumers wasn't AI built for
              boardrooms.
            </p>
            <p>
              AXIVA is purpose-built for executive communication. The AI
              understands board deck structures, strategy frameworks, and the
              density that senior leaders expect. It's not about flashy
              animations — it's about clear thinking, well organized.
            </p>

            <h2>The Vision</h2>
            <p>
              Every executive spends too much time on presentations. Not because
              they lack ideas, but because translating strategic thinking into
              structured slides is slow work. AXIVA gives that time back.
            </p>
            <p>
              My goal is simple: let executives focus on strategy, not slides.
              When you can go from idea to board-ready deck in minutes, you spend
              your time on the thinking that matters — not the formatting that
              doesn't.
            </p>

            <h2>Background</h2>
            <p>
              Before founding AXIVA, I built products at the intersection of
              enterprise technology and user experience. I've seen firsthand how
              the best tools disappear into workflows — they amplify capability
              without adding friction.
            </p>
            <p>
              That's the standard for AXIVA: AI that feels like an extension of
              how you already think, not a new tool to learn.
            </p>
          </section>

          {/* CTA */}
          <section className="text-center py-12 px-8 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <h2 className="text-2xl font-bold mb-4">
              See What AXIVA Can Build
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Try the AI presentation generator built for executives. Create your
              first deck in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/create">
                  Start Creating <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/press">View Press Kit</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </>
  );
}
