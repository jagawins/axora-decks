import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sections = [
  {
    title: "General",
    items: [
      {
        q: "What is Axora?",
        a: "Axora is an AI-powered presentation platform built for executives, founders, and professionals who need polished, boardroom-ready decks — fast. You describe what you need, and Axora generates a fully structured, beautifully designed presentation in seconds. No drag-and-drop. No template wrestling. Just professional output you can trust.",
      },
      {
        q: "How does Axora generate my deck?",
        a: "Axora uses advanced AI to analyze your input — whether that's a prompt, a document, or a rough outline — and produces a structured narrative with matching visuals, charts, and design. Our AI understands presentation logic, not just text, so it knows when to use a comparison slide vs. a data callout vs. a storytelling section.",
      },
      {
        q: "What types of presentations can Axora create?",
        a: "Investor pitch decks (Seed through Series B), board of directors updates, executive business reviews, sales decks and proposals, consulting deliverables, and marketing and product presentations.",
      },
      {
        q: "Who is Axora built for?",
        a: "Professionals who care about output quality but don't have time to spend hours in PowerPoint — startup founders preparing for fundraising, executives presenting to boards, sales leaders building proposal decks, and consultants delivering client work.",
      },
    ],
  },
  {
    title: "Features",
    items: [
      {
        q: "Can I edit slides after Axora generates them?",
        a: "Yes, fully. Axora gives you a complete, editable presentation — not a locked template. You can adjust text, swap visuals, reorder sections, change themes, and fine-tune every slide. Think of the AI output as your first draft that's already 90% of the way there.",
      },
      {
        q: "Does Axora support custom branding?",
        a: "Yes. Upload your brand kit — logo, colors, fonts — and Axora applies your brand identity across every slide. Available on Pro and Team plans.",
      },
      {
        q: "Can I import an existing presentation into Axora?",
        a: "Yes. Upload an existing PowerPoint or PDF and Axora will analyze its structure. Free plan supports 1 import per day; Pro and Team plans are unlimited.",
      },
      {
        q: "What file formats can I export?",
        a: "PNG and web link (Free). PDF and PowerPoint (.pptx) on Pro and Team plans.",
      },
      {
        q: "Does Axora support speaker notes?",
        a: "Yes. Axora generates speaker notes alongside each slide with talking points and narrative context. Fully editable.",
      },
    ],
  },
  {
    title: "Pricing",
    items: [
      {
        q: "Can I try Pro before committing?",
        a: "Yes — all paid plans include a 14-day free trial with no credit card required.",
      },
      {
        q: "What happens when my trial ends?",
        a: "If you don't upgrade, your account moves to the Free plan (3 deck generations, 10 projects, PNG & web export). You never lose access to decks you've already created.",
      },
      {
        q: "What are the plans and prices?",
        a: "Free ($0/mo) — 3 deck generations, 10 projects, PNG & web link export, 25+ block types, Deck & Document modes. Pro ($28/mo) — unlimited deck generations, AI images, all templates & premium themes, Brand Kit, interactive blocks, presenter view & slide analytics, PDF & PowerPoint export, passcode-protected sharing. Team ($78/mo/user) — everything in Pro plus shared workspaces and centralized billing.",
      },
      {
        q: "Can I switch from monthly to annual?",
        a: "Yes, anytime from your account settings. Annual plans are available at a discount.",
      },
      {
        q: "What counts as a deck generation?",
        a: "Each time you use AI to generate a new full deck from scratch counts as one generation. Editing, refining, and re-exporting existing decks does not count.",
      },
      {
        q: "Do you offer refunds?",
        a: "Yes — full refund within the first 14 days, no questions asked.",
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        q: "Is my data secure?",
        a: "Yes. All data is encrypted in transit and at rest. Your content is never shared with third parties and never used to train our AI models.",
      },
      {
        q: "Is Axora safe for sensitive business content?",
        a: "Yes. Many users regularly create highly sensitive board materials and investor documents with full confidence.",
      },
    ],
  },
  {
    title: "Getting Started",
    items: [
      {
        q: "How long does it take to generate a deck?",
        a: "Under 2 minutes on average.",
      },
      {
        q: "Do I need design skills?",
        a: "Not at all. If you can describe what you want in plain language, Axora can build it.",
      },
      {
        q: "How do I get the best results?",
        a: "Give Axora context — your audience, the purpose of the deck, and key points you want to hit. Upload existing materials if you have them (a doc, a brief, notes). The more context, the better the output.",
      },
    ],
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>FAQ — Axora</title>
        <meta name="description" content="Frequently asked questions about Axora — AI-powered presentations for executives and founders." />
        <link rel="canonical" href="https://axiva.ai/faq" />
      </Helmet>

      <MarketingHeader />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-60" />
          </div>
          <div className="container-narrow relative z-10 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Everything you need to know about Axora — from your first deck to enterprise rollout.
            </p>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="pb-24">
          <div className="container-narrow max-w-3xl mx-auto space-y-12">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                <Accordion type="multiple" className="space-y-2">
                  {section.items.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`${section.title}-${i}`}
                      className="border border-border/50 rounded-xl px-6 bg-card/50 data-[state=open]:bg-card"
                    >
                      <AccordionTrigger className="text-left font-semibold text-base hover:no-underline py-5">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}

            {/* Contact CTA */}
            <div className="text-center pt-8 border-t border-border/30">
              <p className="text-muted-foreground">
                Still have questions? Email us at{" "}
                <a href="mailto:jagawins@gmail.com" className="text-accent hover:underline font-medium">
                  jagawins@gmail.com
                </a>{" "}
                — we typically respond within a few hours.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
