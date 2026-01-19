import { Link } from "react-router-dom";
import { 
  FileText, 
  Heading, 
  Image, 
  Columns, 
  AlertCircle, 
  List,
  Wand2,
  Download,
  Palette
} from "lucide-react";

const blockTypes = [
  { icon: FileText, name: "Rich Text", description: "Beautiful typography with smart formatting" },
  { icon: Heading, name: "Headings", description: "H1, H2, H3 with auto-spacing" },
  { icon: Image, name: "Images", description: "Upload or AI-generate visuals" },
  { icon: Columns, name: "Two Column", description: "Side-by-side layouts" },
  { icon: AlertCircle, name: "Callouts", description: "Highlight key insights" },
  { icon: List, name: "Lists", description: "Bullets and numbered items" },
];

const features = [
  {
    icon: Wand2,
    title: "AI-Powered Generation",
    description: "From a single prompt, generate complete outlines, slides, and narratives tailored to your audience."
  },
  {
    icon: Download,
    title: "Multi-Format Export",
    description: "Export as PDF, PowerPoint slides, or shareable web links. Your content, any format."
  },
  {
    icon: Palette,
    title: "Brand Kit Integration",
    description: "Upload your colors, fonts, and logo once. Every export reflects your brand identity."
  }
];

const Features = () => {
  return (
    <section id="features" className="section-padding relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" />
      
      <div className="container-wide relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">
            Powerful Features
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to create
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A modular block-based editor designed for executive communication
          </p>
        </div>

        {/* Block types grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
          {blockTypes.map((block) => (
            <div
              key={block.name}
              className="group p-5 rounded-xl border border-border bg-card/50 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 text-center"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent mb-3 transition-colors">
                <block.icon className="h-5 w-5" />
              </div>
              <h4 className="font-medium text-sm mb-1">{block.name}</h4>
              <p className="text-xs text-muted-foreground">{block.description}</p>
            </div>
          ))}
        </div>

        {/* Why AXORA contextual link */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground">
            Unlike Gamma, AXORA generates structured blocks instead of free-form slides.{" "}
            <Link to="/gamma-alternative" className="text-accent hover:underline">
              See the full comparison →
            </Link>
          </p>
        </div>

        {/* Main features */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="relative p-8 rounded-2xl border border-border bg-gradient-to-b from-card to-card/50 hover:border-accent/20 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent text-accent-foreground mb-5">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Contextual SEO link */}
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
