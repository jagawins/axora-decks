import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check } from "lucide-react";
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

const SOCIAL_PROOF = [
  { metric: "2,400+", label: "Decks created" },
  { metric: "94%", label: "Would recommend" },
  { metric: "<2 min", label: "Avg. deck creation" },
  { metric: "50+", label: "Enterprise teams" },
];

const FRAMEWORK = [
  { num: 1, title: "The Problem", desc: "What pain are you solving, and why does it matter now?" },
  { num: 2, title: "The Solution", desc: "Your product, simply explained" },
  { num: 3, title: "Market Size", desc: "TAM, SAM, SOM with credible sources" },
  { num: 4, title: "Product", desc: "Screenshots, demo, key features" },
  { num: 5, title: "Business Model", desc: "How you make money" },
  { num: 6, title: "Traction", desc: "Revenue, users, growth, key milestones" },
  { num: 7, title: "Team", desc: "Why you and your team are the ones to win" },
  { num: 8, title: "Competition", desc: "Market map and your differentiation" },
  { num: 9, title: "Financials", desc: "3-year projections and key assumptions" },
  { num: 10, title: "The Ask", desc: "Amount, valuation, use of funds" },
];

const STEPS = [
  "Tell Axora about your startup — what you do, who you serve, your stage and traction",
  "Upload any existing materials — one-pager, product brief, financial model, website",
  "Choose your style — minimal, bold, or enterprise",
  "Axora generates your complete deck in under 60 seconds",
  "Review, edit, and refine — you control every word and slide",
  "Export to PowerPoint or share a live link",
];

const TEMPLATES = [
  { title: "Pre-Seed / Seed", desc: "Focus on founder story, problem, and vision" },
  { title: "Series A", desc: "Emphasis on traction, unit economics, and scalable GTM" },
  { title: "B2B SaaS", desc: "ARR, NRR, CAC/LTV, and enterprise pipeline" },
  { title: "Consumer", desc: "MAU, retention curves, and brand story" },
  { title: "Deep Tech / Hardware", desc: "Technical differentiation and IP moat" },
  { title: "Marketplace", desc: "Liquidity metrics and network effects" },
];

const FAQS = [
  {
    q: "Can I customize the deck after Axora generates it?",
    a: "Yes — completely. Every slide is editable. Add, remove, reorder, and rewrite anything.",
  },
  {
    q: "Will my deck look generic?",
    a: "No. Axora customizes each deck to your company, your data, and your narrative. Upload your brand kit and every deck reflects your identity.",
  },
  {
    q: "Can I export to PowerPoint?",
    a: "Yes. Pro and Team plans include full PowerPoint (.pptx) export. Start a 14-day free trial to access it — no credit card required.",
  },
];

const InvestorPitchDeck = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Investor Pitch Deck Generator | Axora</title>
        <meta name="description" content="Build a fundable investor pitch deck in minutes with Axora. AI-powered narrative structure, boardroom-ready design, and PowerPoint export. Used by 2,400+ founders." />
        <link rel="canonical" href="https://axora.lovable.app/investor-pitch-deck" />
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
              <span>AI Pitch Deck Generator</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Raise Your Round Faster with{" "}
              <span className="text-gradient">AI-Powered Pitch Decks</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Build a fundable pitch deck in minutes — not days. Axora creates investor-ready presentations that tell your story, showcase your traction, and help you close your round.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/create">
                <Button variant="hero" size="xl" className="group">
                  Build My Pitch Deck — Start Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="hero-outline" size="xl">
                  See Example Deck →
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stat Bar */}
        <section className="pb-16">
          <div className="container-narrow">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 rounded-2xl border border-border/50 bg-card/50 p-6 lg:p-8">
              {SOCIAL_PROOF.map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold text-accent mb-1">{item.metric}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Founders Waste Time */}
        <section className="py-20 border-t border-border/30">
          <div className="container-narrow max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
              Why Most Founders Waste Days on Their Pitch Deck
            </h2>
            <div className="text-lg text-muted-foreground leading-relaxed space-y-4">
              <p>
                You're building a company. You should be talking to customers, hiring your team, and closing deals — not wrestling with PowerPoint at 2am.
              </p>
              <p>
                Yet the average founder spends 15–20 hours on their initial pitch deck, and that's before the endless revision cycles from advisors and investors.
              </p>
              <p>
                The problem isn't effort. It's the wrong tool. Presentation software was built for slide designers, not founders.{" "}
                <span className="text-accent font-medium">Axora was built for you.</span>
              </p>
            </div>
          </div>
        </section>

        {/* 10-Slide Framework */}
        <section className="py-20 border-t border-border/30">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
              The 10-Slide Framework Axora Uses
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
              Axora structures investor decks around the framework that has helped thousands of startups raise successfully.
            </p>
            <div className="max-w-3xl mx-auto space-y-3">
              {FRAMEWORK.map((item) => (
                <div key={item.num} className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/50 p-5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold shrink-0">
                    {item.num}
                  </span>
                  <div>
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-muted-foreground"> — {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How Axora Builds */}
        <section className="py-20 border-t border-border/30">
          <div className="container-narrow max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              How Axora Builds Your Pitch Deck
            </h2>
            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/50 p-5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>

            {/* Callout */}
            <div className="mt-10 rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
              <p className="text-lg font-medium">
                The average Axora pitch deck takes <span className="text-accent font-bold">under 2 minutes</span> to generate — compared to the industry average of <span className="text-accent font-bold">15–20 hours</span> building from scratch.
              </p>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-20 border-t border-border/30">
          <div className="container-narrow">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Purpose-Built Templates for Every Stage
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {TEMPLATES.map((t) => (
                <div key={t.title} className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-2">{t.title}</h3>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
              ))}
            </div>
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
                Ready to Build Your Pitch Deck?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start free — 3 full deck generations on the free plan. All paid plans include a 14-day free trial with no credit card required.
              </p>
              <Link to="/create">
                <Button variant="hero" size="xl" className="group">
                  Build My Pitch Deck Free →
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

export default InvestorPitchDeck;
