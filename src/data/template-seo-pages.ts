/**
 * SEO Template Landing Pages — one page per template category.
 * Each targets specific search keywords executives use.
 */

export interface TemplateSEOPage {
  slug: string;           // URL path: /investor-pitch-deck-template
  title: string;          // Page title
  h1: string;             // Main headline
  description: string;    // Meta description (150-160 chars)
  keywords: string[];     // Target keywords
  heroSubline: string;    // Below headline
  category: string;       // Maps to template.category in DB
  tags: string[];         // Maps to template.tags in DB
  useCases: string[];     // "Perfect for..." bullets
  exampleSlides: string[];// Types of slides included
  ctaText: string;        // CTA button text
  faqItems: { q: string; a: string }[];
}

export const TEMPLATE_SEO_PAGES: TemplateSEOPage[] = [
  {
    slug: "investor-pitch-deck-template",
    title: "AI Investor Pitch Deck Template | AXIVA",
    h1: "AI Investor Pitch Deck Generator",
    description: "Create a professional investor pitch deck in minutes with AI. Includes traction metrics, market sizing, financial projections, and team slides. Free to try.",
    keywords: ["investor pitch deck template", "pitch deck generator", "startup pitch deck AI", "series a pitch deck"],
    heroSubline: "Generate a complete investor-ready pitch deck with market sizing, traction metrics, financial projections, and a compelling narrative — in under 2 minutes.",
    category: "Startup and Fundraising",
    tags: ["investor pitch", "pitch deck", "fundraising", "series-a"],
    useCases: [
      "Seed and Series A fundraising",
      "Angel investor presentations",
      "Demo day pitch decks",
      "Accelerator applications",
    ],
    exampleSlides: ["Hero header with tagline", "Problem & solution", "Market opportunity stats", "Traction & KPIs", "Financial projections chart", "The Ask — CTA slide"],
    ctaText: "Generate Your Pitch Deck Free",
    faqItems: [
      { q: "How many slides does the AI generate?", a: "Typically 8-12 slides covering all standard pitch deck sections: problem, solution, market, traction, team, financials, and the ask." },
      { q: "Can I export to PowerPoint?", a: "Yes. Pro users can export to PPTX and PDF. Free users can generate and preview decks with up to 3 free generations." },
      { q: "Is the content actually good for investors?", a: "AXIVA uses executive-grade AI trained on the structure of successful pitch decks. The output includes real data visualizations, not just bullet points." },
    ],
  },
  {
    slug: "board-update-template",
    title: "AI Board Update Deck Template | AXIVA",
    h1: "AI Board Update Deck Generator",
    description: "Create professional board update presentations with AI. Includes KPI dashboards, financial summaries, risk matrices, and strategic outlook slides.",
    keywords: ["board update template", "board meeting presentation", "board deck AI", "quarterly board report"],
    heroSubline: "Generate a structured board update with KPI dashboards, financial performance, risk analysis, and strategic recommendations — ready for your next board meeting.",
    category: "Board and Executive",
    tags: ["board update", "board meeting", "executive report"],
    useCases: [
      "Quarterly board meetings",
      "Annual general meetings",
      "Advisory board updates",
      "Investor updates",
    ],
    exampleSlides: ["Executive summary", "KPI dashboard with trends", "Financial performance chart", "Risk & opportunity matrix", "Strategic outlook", "Decision & next steps"],
    ctaText: "Generate Your Board Deck Free",
    faqItems: [
      { q: "Is the content confidential?", a: "Yes. Your content is processed securely and never shared. You can also add passcode protection to shared links." },
      { q: "Can I customize the metrics?", a: "Absolutely. The AI generates a starting point based on your input. You can edit every number, chart, and text block in the editor." },
      { q: "What data visualizations are included?", a: "KPI stat blocks with trend arrows, bar and donut charts, comparison tables, and timeline blocks for milestones." },
    ],
  },
  {
    slug: "quarterly-review-template",
    title: "AI Quarterly Business Review Template | AXIVA",
    h1: "AI Quarterly Review Generator",
    description: "Create structured quarterly business review decks with AI. Performance dashboards, goal tracking, team highlights, and next quarter planning.",
    keywords: ["quarterly review template", "QBR presentation", "quarterly business review deck", "Q1 Q2 Q3 Q4 review"],
    heroSubline: "Turn your quarterly numbers into a compelling narrative with AI-generated performance dashboards, goal tracking, highlights, and forward-looking slides.",
    category: "Operations and Review",
    tags: ["quarterly review", "QBR", "performance review", "operations"],
    useCases: [
      "Quarterly business reviews (QBRs)",
      "Department performance reviews",
      "Client quarterly updates",
      "Internal all-hands presentations",
    ],
    exampleSlides: ["Quarter overview stats", "Goal vs actual chart", "Team wins & highlights", "Challenges & blockers", "Pipeline or forecast", "Next quarter priorities"],
    ctaText: "Generate Your QBR Deck Free",
    faqItems: [
      { q: "How detailed are the AI-generated reviews?", a: "The AI creates structured sections with real data placeholders, charts, and narrative flow. You fill in your actual numbers and customize." },
      { q: "Can I use my company branding?", a: "Pro users can set up a Brand Kit with custom colors, fonts, and logo that apply automatically to every deck." },
      { q: "How long does generation take?", a: "Under 30 seconds for a complete 8-12 slide quarterly review deck." },
    ],
  },
  {
    slug: "strategy-deck-template",
    title: "AI Strategy Presentation Template | AXIVA",
    h1: "AI Strategy Deck Generator",
    description: "Build executive strategy presentations with AI. Includes market analysis, competitive positioning, strategic pillars, roadmaps, and implementation plans.",
    keywords: ["strategy presentation template", "strategic planning deck", "go-to-market strategy template", "corporate strategy AI"],
    heroSubline: "Create executive-grade strategy decks with market analysis, competitive positioning, strategic pillars, and implementation roadmaps — powered by AI.",
    category: "Strategy",
    tags: ["strategy", "strategic planning", "go-to-market", "competitive analysis"],
    useCases: [
      "Corporate strategy presentations",
      "Go-to-market plans",
      "Competitive analysis decks",
      "Annual planning sessions",
    ],
    exampleSlides: ["Strategic vision statement", "Market landscape analysis", "Three strategic pillars", "Competitive 2×2 matrix", "Implementation timeline", "Decision & next steps"],
    ctaText: "Generate Your Strategy Deck Free",
    faqItems: [
      { q: "What frameworks does the AI use?", a: "AXIVA generates decks using proven frameworks: three pillars, 2×2 matrices, SWOT-style comparisons, and milestone timelines." },
      { q: "Can I include market research data?", a: "Yes. Paste your research, data, or notes as input and the AI will structure them into professional slides with charts and visualizations." },
      { q: "Is this better than PowerPoint templates?", a: "Static templates give you layout. AXIVA generates the actual content, data visualizations, and narrative structure — not just formatting." },
    ],
  },
  {
    slug: "sales-deck-template",
    title: "AI Sales Deck Template | AXIVA",
    h1: "AI Sales Deck Generator",
    description: "Create compelling sales presentations with AI. Product demos, ROI calculators, customer testimonials, and pricing slides that close deals.",
    keywords: ["sales deck template", "sales presentation AI", "product demo deck", "sales pitch generator"],
    heroSubline: "Generate sales decks that actually close deals — with product positioning, ROI narratives, social proof, and clear next steps built in.",
    category: "Sales",
    tags: ["sales", "sales deck", "product demo", "proposal"],
    useCases: [
      "Product demo presentations",
      "Sales proposals",
      "Customer-facing pitch decks",
      "Partner enablement decks",
    ],
    exampleSlides: ["Value proposition hero", "Problem–solution narrative", "Product feature showcase", "ROI / impact stats", "Customer testimonials", "Pricing & next steps"],
    ctaText: "Generate Your Sales Deck Free",
    faqItems: [
      { q: "Can I customize for each prospect?", a: "Yes. Generate a base deck, then quickly edit the content for each prospect. The AI-generated structure saves you hours of formatting." },
      { q: "Does it include pricing slides?", a: "Yes. The AI generates comparison tables, pricing breakdowns, and ROI calculators as part of the deck." },
      { q: "How is this different from Gamma or Beautiful.ai?", a: "AXIVA is built specifically for executive and professional use cases — not general-purpose presentations. The output quality matches what consultancies produce." },
    ],
  },
];
