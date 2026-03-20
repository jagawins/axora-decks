import { Link } from "react-router-dom";
import {
  Wand2, Download, Palette, BarChart3, Columns, Target,
  Image, ToggleLeft, Timer, Layers, FileText, ExternalLink,
  MousePointerClick, LayoutGrid, Calendar, GitBranch, TrendingUp
} from "lucide-react";

/* ── Visual block showcase (YouExec-inspired grid) ─────────── */
const blockTypes = [
  { icon: BarChart3, name: "KPI Dashboards", description: "Auto-formatted metrics", color: "#3B82F6" },
  { icon: LayoutGrid, name: "Smart Layouts", description: "6 executive patterns", color: "#8B5CF6" },
  { icon: Timer, name: "23 Timelines", description: "Gantt, scenarios, S-curve", color: "#10B981" },
  { icon: ExternalLink, name: "Live Embeds", description: "PowerBI, Sheets, Figma", color: "#F59E0B" },
  { icon: MousePointerClick, name: "CTA Buttons", description: "Calendly, approve, book", color: "#EF4444" },
  { icon: Target, name: "Decision Panels", description: "Recommendations + risks", color: "#EC4899" },
  { icon: Columns, name: "Comparison Tables", description: "Side-by-side analysis", color: "#06B6D4" },
  { icon: GitBranch, name: "Scenario Branching", description: "Multiple futures", color: "#7C3AED" },
  { icon: TrendingUp, name: "Chart Blocks", description: "Line, bar, donut, area", color: "#F97316" },
];

/* ── Main feature cards ────────────────────────────────────── */
const features = [
  {
    icon: Wand2,
    title: "AI-Powered Generation",
    description: "Describe your deck in one sentence. AI builds the full structure, narrative, and visuals using BCG & McKinsey consulting methodology.",
    color: "#3B82F6",
    highlights: ["One-prompt generation", "Pyramid Principle structure", "70% visual density"],
  },
  {
    icon: LayoutGrid,
    title: "Executive Smart Layouts",
    description: "Not generic columns — named consulting patterns. Executive Summary, Metrics + Commentary, Recommendation + Evidence, Spotlight, and Agenda layouts.",
    color: "#8B5CF6",
    highlights: ["6 executive layout patterns", "Recommendation + risk boxes", "Agenda with owners & time"],
  },
  {
    icon: Timer,
    title: "23 Timeline Styles",
    description: "The most advanced timeline generator. Scenario branching, cause-effect chains, three-horizon models, impact magnitude — plus 5 viral styles for shareable content.",
    color: "#10B981",
    highlights: ["One dataset → multiple narratives", "Scenario branching (multiple futures)", "Import CSV, JPG, PPTX, PDF"],
  },
  {
    icon: ExternalLink,
    title: "Live Dashboard Embeds",
    description: "Embed Google Sheets, PowerBI, Tableau, Figma, Miro, or any URL directly in your deck. Auto-detects provider and transforms URLs.",
    color: "#F59E0B",
    highlights: ["Google Sheets → live KPIs", "PowerBI dashboards", "Figma prototypes"],
  },
  {
    icon: MousePointerClick,
    title: "CTA Action Buttons",
    description: "Add 'Approve This', 'Schedule Follow-up', or 'Book a Demo' buttons to shared decks. Card layout with descriptions, 10 icons, 4 styles.",
    color: "#EF4444",
    highlights: ["Calendly integration", "Approval workflows", "Card layout with descriptions"],
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description: "Native PowerPoint export with proper scaling. PDF for email. PNG for social. Shareable web links with live presenter mode.",
    color: "#06B6D4",
    highlights: ["PowerPoint (.pptx)", "PDF download", "Shareable web links"],
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
            Executive-Grade Features
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Everything executives need, nothing they don't
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Live dashboard embeds. Smart consulting layouts. 23 timeline styles.
            CTA buttons for approvals. Not just slides — a decision-making platform.
          </p>
        </div>

        {/* Visual blocks grid — 9-item showcase */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-3 mb-20">
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

        {/* Feature cards — 2x3 grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
