import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const COMPARISON = [
  { feature: "AI Deck Generation from Prompt", beautiful: "Limited", axiva: "Full generation" },
  { feature: "Narrative & Story Structure", beautiful: "Manual", axiva: "AI-powered" },
  { feature: "Custom Branding", beautiful: true, axiva: true },
  { feature: "Smart Slide Layouts", beautiful: true, axiva: true },
  { feature: "Import Existing Decks", beautiful: true, axiva: true },
  { feature: "Export to PowerPoint", beautiful: "Yes (paid)", axiva: "Yes (Pro)" },
  { feature: "Executive / Board Deck Templates", beautiful: "Generic", axiva: "Purpose-built" },
  { feature: "Investor Pitch Deck AI", beautiful: false, axiva: true },
  { feature: "Speaker Notes Generation", beautiful: false, axiva: true },
  { feature: "Data Visualization from Text", beautiful: false, axiva: true },
  { feature: "Free Plan", beautiful: true, axiva: "Yes (3 decks)" },
  { feature: "Starting Price", beautiful: "$12/mo", axiva: "$28/mo" },
];

const SHORTCOMINGS = [
  {
    title: "You still do all the thinking",
    body: "Beautiful.ai automates the layout. You still have to decide what goes on each slide, how to frame your argument, what data to include, and how to build to a conclusion. For executives who need a first draft fast, it's still hours of work.",
  },
  {
    title: "Templates feel templated",
    body: "After a while, Beautiful.ai decks start to look like Beautiful.ai decks. The layouts are smart but predictable. If you're presenting to sophisticated audiences — investors, boards, enterprise clients — that template familiarity can undermine your credibility.",
  },
  {
    title: "No narrative intelligence",
    body: "Beautiful.ai doesn't know that a Series A investor pitch should lead with traction, not product. It doesn't know that a board update needs a clear exec summary on slide one. Axiva does. The AI understands presentation logic by context, not just by format.",
  },
];

const MIGRATION_STEPS = [
  "Export your Beautiful.ai deck as PowerPoint (.pptx)",
  "Upload it to Axiva — it will analyze the structure and content",
  "Tell Axiva what you want to improve or rebuild",
  "Axiva regenerates the sections you need with enhanced narrative and design",
  "Export back to PowerPoint or present directly from Axiva",
];

const FAQS = [
  {
    q: "Can I import my Beautiful.ai decks into Axiva?",
    a: "Yes. Export from Beautiful.ai as PowerPoint and upload directly to Axiva. We'll preserve your content and let you choose which sections to enhance or regenerate.",
  },
  {
    q: "Is Axiva more expensive than Beautiful.ai?",
    a: "Axiva Pro is $28/mo vs Beautiful.ai Pro at $12/mo. The difference is narrative AI — Axiva doesn't just format your content, it structures your argument. For high-stakes decks (investor meetings, board presentations, enterprise sales), that's worth the premium. Try it free for 14 days.",
  },
];

const renderVal = (val: boolean | string) => {
  if (val === true) return <Check className="h-5 w-5 text-accent mx-auto" />;
  if (val === false) return <X className="h-5 w-5 text-destructive mx-auto" />;
  return <span className="text-sm">{val}</span>;
};

const BeautifulAiAlternative = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Beautiful.ai Alternative for Executives | Axiva</title>
        <meta name="description" content="Looking for a Beautiful.ai alternative? Axiva builds the full deck narrative, not just the layout. Compare features, pricing, and output quality." />
        <link rel="canonical" href="https://axiva.ai/beautiful-ai-alternative" />
      </Helmet>

      <MarketingHeader />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-60" />
          </div>
          <div className="container-narrow relative z-10 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              <span>Beautiful.ai Alternative</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              The Beautiful.ai Alternative{" "}
              <span className="text-gradient">Built for Professionals</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Beautiful.ai is great for templates. Axiva is built for outcomes. If you need boardroom-ready decks that tell a compelling story, not just pretty slides — it's time to make the switch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Start Free — No Credit Card
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="#comparison">
                <Button variant="hero-outline" size="xl">
                  See Feature Comparison ↓
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Core Difference */}
        <section className="py-20 border-t border-border/30">
          <div className="container-narrow max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
              The Core Difference
            </h2>
            <div className="text-lg text-muted-foreground leading-relaxed space-y-4">
              <p>
                Beautiful.ai made presentation design easier. <span className="text-accent font-medium">Axiva makes presentation thinking easier.</span>
              </p>
              <p>
                Beautiful.ai gives you smarter templates and auto-adjusting layouts — you still decide what goes on each slide, how to structure your narrative, and how to visualize your data. The design work gets easier, but the hard work stays with you.
              </p>
              <p>
                Axiva starts from your goal and builds the entire deck: structure, narrative, data slides, and design. You review and refine. The thinking and the doing happen together.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section id="comparison" className="py-20 border-t border-border/30 scroll-mt-20">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Feature Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full max-w-4xl mx-auto">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold w-[40%]">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold w-[30%]">Beautiful.ai</th>
                    <th className="text-center py-4 px-4 font-semibold text-accent w-[30%]">Axiva</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-accent/[0.02] transition-colors">
                      <td className="py-4 px-4 text-muted-foreground">{row.feature}</td>
                      <td className="text-center py-4 px-4">{renderVal(row.beautiful)}</td>
                      <td className="text-center py-4 px-4 bg-accent/[0.02]">{renderVal(row.axiva)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Where Beautiful.ai Falls Short */}
        <section className="py-20 border-t border-border/30">
          <div className="container-narrow max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Where Beautiful.ai Falls Short for Executives
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {SHORTCOMINGS.map((item) => (
                <div key={item.title} className="glass-card p-8">
                  <h3 className="text-lg font-bold mb-3">"{item.title}"</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Migration Steps */}
        <section className="py-20 border-t border-border/30">
          <div className="container-narrow max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              How to Switch from Beautiful.ai to Axiva
            </h2>
            <div className="space-y-3">
              {MIGRATION_STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/50 p-5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-8">
              Migration takes less than 10 minutes.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 border-t border-border/30">
          <div className="container-narrow max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <Accordion type="multiple" className="space-y-2">
              {FAQS.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-border/50 rounded-xl px-6 bg-card/50 data-[state=open]:bg-card"
                >
                  <AccordionTrigger className="text-left font-semibold text-base hover:no-underline py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 border-t border-border/30">
          <div className="container-narrow">
            <div className="glass-card p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Switch from Beautiful.ai?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start free — 3 full deck generations. All paid plans include a 14-day free trial with no credit card required.
              </p>
              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Start Free — No Credit Card
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BeautifulAiAlternative;
