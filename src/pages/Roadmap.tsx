import { Link } from "react-router-dom";
import { CheckCircle, Clock, Sparkles } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";

type RoadmapStatus = "shipped" | "in-progress" | "planned";

interface RoadmapItem {
  title: string;
  description: string;
  status: RoadmapStatus;
  quarter?: string;
}

const roadmapItems: RoadmapItem[] = [
  {
    title: "AI Deck Generation",
    description:
      "Generate complete presentation decks from natural language prompts with executive-ready structure.",
    status: "shipped",
  },
  {
    title: "Template Gallery",
    description:
      "60+ professionally designed templates for board decks, strategy presentations, and executive updates.",
    status: "shipped",
  },
  {
    title: "Block-Level AI Editing",
    description:
      "Select any block and refine content with AI while preserving formatting and structure.",
    status: "shipped",
  },
  {
    title: "PDF Export",
    description:
      "Export presentation-ready PDFs optimized for printing and sharing.",
    status: "shipped",
  },
  {
    title: "Stock Image Integration",
    description:
      "Automatic image resolution from Pexels and Unsplash with proper attribution.",
    status: "shipped",
  },
  {
    title: "AI Image Generation",
    description:
      "Generate custom images for slides when stock photos don't fit your needs.",
    status: "in-progress",
    quarter: "Q1 2025",
  },
  {
    title: "PowerPoint Export",
    description:
      "Export directly to .pptx format for editing in Microsoft PowerPoint.",
    status: "in-progress",
    quarter: "Q1 2025",
  },
  {
    title: "Team Workspaces",
    description:
      "Shared workspaces for teams with collaborative editing and brand kit management.",
    status: "planned",
    quarter: "Q2 2025",
  },
  {
    title: "Presentation Mode",
    description:
      "Full-screen presentation mode with speaker notes and navigation controls.",
    status: "planned",
    quarter: "Q2 2025",
  },
  {
    title: "Version History",
    description:
      "Track changes and restore previous versions of your presentations.",
    status: "planned",
    quarter: "Q2 2025",
  },
  {
    title: "Custom Brand Kits",
    description:
      "Upload logos, define colors, and set typography to match your brand guidelines.",
    status: "planned",
    quarter: "Q3 2025",
  },
  {
    title: "Analytics Dashboard",
    description:
      "Track views, engagement, and sharing metrics for published presentations.",
    status: "planned",
    quarter: "Q3 2025",
  },
];

const statusConfig = {
  shipped: {
    label: "Shipped",
    icon: CheckCircle,
    className: "text-green-500",
  },
  "in-progress": {
    label: "In Progress",
    icon: Clock,
    className: "text-accent",
  },
  planned: {
    label: "Planned",
    icon: Sparkles,
    className: "text-muted-foreground",
  },
};

export default function Roadmap() {
  return (
    <>
      <SeoHead
        title="Product Roadmap | AXORA - AI Presentation Generator"
        description="See what's shipped, in progress, and planned for AXORA. Our roadmap for building the best AI presentation generator for executives."
        canonicalPath="/roadmap"
        keywords="AXORA roadmap, AI presentation features, product updates, upcoming features"
      />

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          {/* Header */}
          <section className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Product Roadmap
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Building the future of executive presentations. Here's what we've
              shipped, what we're working on, and what's coming next.
            </p>
          </section>

          {/* Status Legend */}
          <section className="flex flex-wrap justify-center gap-6 mb-12">
            {Object.entries(statusConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <config.icon className={`h-4 w-4 ${config.className}`} />
                <span className="text-sm text-muted-foreground">
                  {config.label}
                </span>
              </div>
            ))}
          </section>

          {/* Roadmap Items */}
          <section className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {roadmapItems.map((item) => {
                const config = statusConfig[item.status];
                return (
                  <div
                    key={item.title}
                    className="p-6 rounded-xl border border-border bg-card"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <config.icon
                            className={`h-5 w-5 ${config.className}`}
                          />
                          <h3 className="font-semibold">{item.title}</h3>
                          {item.quarter && (
                            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                              {item.quarter}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground ml-8">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 text-center py-12 px-8 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <h2 className="text-2xl font-bold mb-4">
              Have a Feature Request?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              We build based on what executives actually need. Tell us what
              would make AXORA more valuable for your workflow.
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/contact">Share Your Ideas</Link>
            </Button>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </>
  );
}
