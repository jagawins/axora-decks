import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Layers, Share2, Wand2 } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Sparkles,
    title: "Describe Your Deck",
    description:
      "Enter a topic, paste a document, or describe your presentation goals. AXORA's AI analyzes your input and understands the context.",
  },
  {
    icon: Layers,
    title: "Generate Structured Slides",
    description:
      "Our AI creates a complete deck with executive-ready structure: headings, key points, tables, callouts, and visuals — all formatted for clarity.",
  },
  {
    icon: Wand2,
    title: "Refine with AI Editing",
    description:
      "Select any block and use natural language to adjust tone, add data, or restructure. The AI preserves your formatting while updating content.",
  },
  {
    icon: Share2,
    title: "Present or Export",
    description:
      "Share a live link, present directly in the browser, or export to PDF. Your deck is ready for the boardroom in minutes.",
  },
];

export default function HowItWorks() {
  const jsonLd = {
    "@type": "HowTo",
    name: "How to Create AI-Powered Executive Presentations with AXORA",
    description:
      "Learn how to create professional executive presentations using AXORA's AI deck generator in four simple steps.",
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
  };

  return (
    <>
      <SeoHead
        title="How It Works | AXORA - AI Presentation Generator"
        description="Create executive presentations in 4 steps: describe your topic, generate structured slides, refine with AI, and present. See how AXORA works."
        canonicalPath="/how-it-works"
        keywords="how to create presentations, AI presentation generator, executive deck workflow, presentation software"
        jsonLd={jsonLd}
      />

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          {/* Hero */}
          <section className="text-center mb-20">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              From Idea to Executive Deck in Minutes
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              AXORA transforms how executives create presentations. No templates to fill, no slides to design — just describe what you need.
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/create">
                Try It Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </section>

          {/* Steps */}
          <section className="mb-20">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="relative p-6 rounded-xl border border-border bg-card"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-16 px-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Build Your First Deck?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join executives who create board-ready presentations in minutes, not hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/create">Start Creating</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/templates">Browse Templates</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </>
  );
}
