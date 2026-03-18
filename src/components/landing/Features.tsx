import { Link } from "react-router-dom";
import {
  Wand2, Download, Palette, BarChart3, Columns, Target,
  Image, ToggleLeft, Timer, Layers, FileText
} from "lucide-react";

/* ── Visual block showcase (YouExec-inspired grid) ─────────── */
const blockTypes = [
  { icon: BarChart3, name: "KPI Cards", description: "Auto-formatted metrics", color: "#3B82F6" },
  { icon: Columns, name: "Two Column", description: "Side-by-side layouts", color: "#8B5CF6" },
  { icon: Target, name: "Decision Panel", description: "Recommendations + next steps", color: "#EF4444" },
  { icon: Image, name: "AI Images", description: "Generate or search visuals", color: "#EC4899" },
  { icon: ToggleLeft, name: "Interactive Tabs", description: "Tabbed & toggle content", color: "#F59E0B" },
  { icon: Timer, name: "23 Timeline Styles", description: "Gantt, roadmap, scenario branching & more", color: "#10B981" },
];

/* ── Main feature cards (Beautiful.ai style) ───────────────── */
const features = [
  {
    icon: Wand2,
    title: "AI-Powered Generation",
    description: "Generate complete decks from a prompt. Refine any block with contextual AI actions — rewrite, expand, add data, or change tone.",
    color: "#3B82F6",
    highlights: ["One-prompt generation", "Block-level AI editing", "Context-aware refinements"],
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description: "PowerPoint, PDF, or shareable web links. Present live with our built-in deck player. Works with your existing workflow.",
    color: "#10B981",
    highlights: ["PowerPoint export", "PDF download", "Live presenter mode"],
  },
  {
    icon: Palette,
    title: "Brand Kit & Themes",
    description: "Apply your brand colors, fonts, and logo with one click. Choose from 12+ themes or create your own custom theme.",
    color: "#8B5CF6",
    highlights: ["Custom color palettes", "Font management", "Logo placement"],
  },
];

const Features = () => {
  return (
    <section id="features" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" />

      <div className="container-wide relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">
            Powerful Features
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Built for executive communication
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Not just slides — structured visual blocks that make complex ideas clear.
          </p>
        </div>

        {/* Visual blocks grid — YouExec-style compact showcase */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-20">
          {blockTypes.map((block) => (
            <div
              key={block.name}
              className="group relative p-4 rounded-xl border border-border/50 bg-card/40 hover:bg-card/80 hover:border-border transition-all duration-300 text-center overflow-hidden"
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 50% 0%, ${block.color}08, transparent 70%)` }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 transition-transform group-hover:scale-110 duration-300"
                  style={{ background: `${block.color}15` }}
                >
                  <block.icon className="h-5 w-5" style={{ color: block.color }} />
                </div>
                <h4 className="font-medium text-sm mb-0.5">{block.name}</h4>
                <p className="text-[11px] text-muted-foreground">{block.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison link */}
        <div className="text-center mb-14">
          <p className="text-muted-foreground">
            Unlike Gamma, AXIVA generates structured blocks — not free-form slides.{" "}
            <Link to="/gamma-alternative" className="text-accent hover:underline">
              See the full comparison →
            </Link>
          </p>
        </div>

        {/* Feature cards — Beautiful.ai-style with highlights */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/60 hover:border-border transition-all duration-300 overflow-hidden"
            >
              {/* Top glow */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(to right, transparent, ${feature.color}40, transparent)` }}
              />

              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 transition-transform group-hover:scale-110 duration-300"
                style={{ background: `${feature.color}15` }}
              >
                <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
              </div>

              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-5">{feature.description}</p>

              {/* Highlights */}
              <div className="space-y-2">
                {feature.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: feature.color }} />
                    <span className="text-foreground/80">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* SEO link */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Generate board-ready PowerPoint decks using AI.{" "}
            <Link to="/powerpoint-ai" className="text-accent hover:underline">
              Learn about PowerPoint AI →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
