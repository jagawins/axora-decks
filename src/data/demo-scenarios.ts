/**
 * Executive Demo Scenarios — aligned with the Example Decks showcase
 * to create a consistent narrative across landing page and demo.
 */

export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  rawNotes: string;
  themes: string[];
  structuredSections: DemoSection[];
  slides: DemoSlide[];
  /** Template picked during demo */
  templateName: string;
  /** Theme applied during demo */
  themeName: string;
  themeColors: { bg: string; accent: string; fg: string };
  /** Brand kit preview */
  brandKit: { headingFont: string; bodyFont: string; logoText: string };
  /** Interactive block previews */
  interactiveBlocks: DemoInteractiveBlock[];
}

export interface DemoSection {
  heading: string;
  points: string[];
  tag: string;
}

export interface DemoSlide {
  title: string;
  type: "executive_summary" | "current_state" | "strategic_options" | "recommended_path";
  bullets: string[];
  /** Block type used in the slide */
  blockType?: string;
  /** AI image query for this slide */
  aiImageQuery?: string;
}

export interface DemoInteractiveBlock {
  type: "tabs" | "toggle" | "reveal";
  label: string;
  preview: string[];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "investor-pitch",
    title: "Series A Investor Pitch",
    subtitle: "Healthcare SaaS · Startup & Fundraising",
    icon: "🚀",
    templateName: "Investor Pitch Deck",
    themeName: "Ocean",
    themeColors: { bg: "#0B1628", accent: "#38BDF8", fg: "#E2E8F0" },
    brandKit: { headingFont: "Space Grotesk", bodyFont: "DM Sans", logoText: "MediFlow AI" },
    rawNotes: `Clinicians spend 49% of time on documentation.
EHR systems create $150B in administrative waste.
78% of physicians report burnout from paperwork.
Current solutions automate forms — not clinical reasoning.
Our AI scribe achieves 98.7% accuracy in real-time.
Automated prior auth cuts approval from 14 days to 2 hours.
127 active clinics, $2.4M ARR, 340% YoY growth.
94% net retention rate.
Raising $15M Series A.
Need board-ready deck by Friday.`,
    themes: ["Problem", "Solution", "Traction", "The Ask"],
    structuredSections: [
      {
        heading: "The Problem",
        points: ["Clinicians spend 49% of time on documentation", "EHR systems create $150B in annual administrative waste", "78% of physicians report burnout from paperwork"],
        tag: "risk",
      },
      {
        heading: "Our Solution",
        points: ["AI scribe with 98.7% accuracy in real-time", "Prior auth cut from 14 days to 2 hours", "Population health analytics surfacing care gaps"],
        tag: "context",
      },
      {
        heading: "Traction & Metrics",
        points: ["127 active clinics, $2.4M ARR", "340% YoY growth", "94% net retention rate"],
        tag: "insight",
      },
      {
        heading: "The Ask",
        points: ["Raising $15M Series A", "Accelerate enterprise sales and expand engineering"],
        tag: "action",
      },
    ],
    slides: [
      {
        title: "Executive Summary",
        type: "executive_summary",
        blockType: "exec_summary",
        aiImageQuery: "healthcare AI clinical workflow automation",
        bullets: [
          "Healthcare admin waste exceeds $150B — clinicians lose half their day to paperwork",
          "MediFlow AI automates clinical reasoning, not just forms",
          "98.7% accuracy, 127 clinics live, $2.4M ARR growing 340% YoY",
        ],
      },
      {
        title: "Market & Traction",
        type: "current_state",
        blockType: "stat_block",
        aiImageQuery: "healthcare technology market growth chart",
        bullets: [
          "$340B Healthcare IT market growing at 23% CAGR",
          "6,000+ US health systems in addressable market",
          "94% net retention proves product-market fit",
        ],
      },
      {
        title: "Competitive Positioning",
        type: "strategic_options",
        blockType: "comparison_table",
        bullets: [
          "MediFlow: Real-time AI note generation vs template-based legacy",
          "Prior auth: 2hr automated vs 14+ days manual",
          "Predictive analytics vs retrospective reporting",
        ],
      },
      {
        title: "The Ask — $15M Series A",
        type: "recommended_path",
        blockType: "decision_summary",
        bullets: [
          "Enterprise sales expansion — 5 health system partnerships in Q1",
          "Epic and Cerner marketplace integration in Q2",
          "Specialty modules (cardiology, oncology) by Q3",
        ],
      },
    ],
    interactiveBlocks: [
      { type: "tabs", label: "ARR Projections", preview: ["2024: $2.4M", "2025: $8.2M", "2026: $22M", "2027: $48M"] },
      { type: "toggle", label: "Before / After MediFlow", preview: ["Before: 49% time on docs", "After: 12% time on docs"] },
      { type: "reveal", label: "Go-to-Market Phases", preview: ["Phase 1: Enterprise pilots", "Phase 2: Channel partnerships", "Phase 3: Specialty expansion"] },
    ],
  },
  {
    id: "board-update",
    title: "Q4 Board Update",
    subtitle: "Financial Services · Strategy & Leadership",
    icon: "📊",
    templateName: "Board Update Deck",
    themeName: "Executive",
    themeColors: { bg: "#1A1A2E", accent: "#A78BFA", fg: "#E5E7EB" },
    brandKit: { headingFont: "Clash Display", bodyFont: "Inter", logoText: "FinTech Capital" },
    rawNotes: `Revenue grew 18% QoQ to $34.2M, exceeding target by 7%.
Three portfolio companies achieved profitability.
Risk exposure reduced by 22% through hedging refinement.
Board approval sought for Series C co-investment.
Fund II MOIC at 2.3x.
12 active portfolio companies.
Interest rate volatility — Fed signaling 2 rate cuts.
Talent retention at 92%.
Fund III final close at $250M in January.
Annual LP meeting in March.`,
    themes: ["Performance", "Portfolio", "Risk", "Roadmap"],
    structuredSections: [
      {
        heading: "Q4 Performance",
        points: ["Revenue grew 18% QoQ to $34.2M", "EBITDA up 24% to $8.1M", "Fund II MOIC at 2.3x"],
        tag: "insight",
      },
      {
        heading: "Portfolio Health",
        points: ["Three portfolio companies achieved profitability", "12 active portfolio companies", "Risk exposure reduced 22%"],
        tag: "context",
      },
      {
        heading: "Risk Assessment",
        points: ["Interest rate volatility — Fed signaling rate cuts", "Talent retention holding at 92%"],
        tag: "risk",
      },
      {
        heading: "Q1 2025 Roadmap",
        points: ["Fund III final close at $250M", "NeoBank co-investment due diligence", "Annual LP meeting in March"],
        tag: "action",
      },
    ],
    slides: [
      {
        title: "Executive Summary",
        type: "executive_summary",
        blockType: "exec_summary",
        aiImageQuery: "financial services executive boardroom",
        bullets: [
          "Revenue beat target by 7% — $34.2M with 18% QoQ growth",
          "Three portfolio companies reached profitability milestone",
          "Board approval sought for $45M Q1 investment pipeline",
        ],
      },
      {
        title: "Financial Performance",
        type: "current_state",
        blockType: "chart_block",
        aiImageQuery: "financial performance revenue trend chart",
        bullets: [
          "Consistent revenue acceleration from $18.5M to $34.2M over 8 quarters",
          "EBITDA margin expanded to 23.7%",
          "Fund II delivering 2.3x MOIC",
        ],
      },
      {
        title: "Strategic Initiatives",
        type: "strategic_options",
        blockType: "decision_summary",
        bullets: [
          "Phase 2 digital lending expansion — Phase 1 delivered 3.2x ROI",
          "Regulatory uncertainty in EU as manageable risk",
          "85% confidence in proceeding recommendation",
        ],
      },
      {
        title: "Board Resolutions",
        type: "recommended_path",
        blockType: "decision_next_steps",
        bullets: [
          "Approve Q1 investment pipeline ($45M allocation)",
          "Adopt updated risk framework for 2025",
          "Confirm Fund III close timeline and LP communications",
        ],
      },
    ],
    interactiveBlocks: [
      { type: "tabs", label: "Revenue by Quarter", preview: ["Q1-24: $26.2M", "Q2-24: $28.9M", "Q3-24: $29.0M", "Q4-24: $34.2M"] },
      { type: "toggle", label: "Risk Before / After Hedging", preview: ["Before: High exposure", "After: 22% reduction"] },
      { type: "reveal", label: "Q1 2025 Milestones", preview: ["Fund III close ($250M)", "NeoBank due diligence", "Annual LP meeting"] },
    ],
  },
  {
    id: "gtm-strategy",
    title: "GTM Strategy Launch",
    subtitle: "B2B SaaS · Sales & Marketing",
    icon: "🎯",
    templateName: "GTM Playbook",
    themeName: "Midnight",
    themeColors: { bg: "#0F172A", accent: "#6366F1", fg: "#E2E8F0" },
    brandKit: { headingFont: "Cabinet Grotesk", bodyFont: "IBM Plex Sans", logoText: "CloudSync" },
    rawNotes: `$12.4B data integration market growing 19% annually.
Target: 200-2,000 employee companies in healthcare, fintech, e-commerce.
200+ pre-built connectors, 2-week setup vs 3-month competitor average.
Zero-code pipeline builder for business analysts.
SOC 2 Type II and HIPAA compliant.
Competitive pricing at $2K/mo vs $4K-$15K for alternatives.
Direct sales team of 8 AEs targeting $500K+ ACV.
Partner channel with Accenture and Deloitte.
Product-led growth: free tier driving 30% pipeline by Q3.
$5.7M budget across sales, marketing, partners, and PLG.`,
    themes: ["Market", "Positioning", "Channels", "Budget"],
    structuredSections: [
      {
        heading: "Market Opportunity",
        points: ["$12.4B data integration market at 19% CAGR", "45K target companies in the $2.1B addressable segment", "$50M-$500M revenue mid-market sweet spot"],
        tag: "context",
      },
      {
        heading: "Value Proposition",
        points: ["10x faster setup: 2 weeks vs 3 months", "Zero-code pipelines for business analysts", "Enterprise security: SOC 2 Type II, HIPAA"],
        tag: "insight",
      },
      {
        heading: "Channel Strategy",
        points: ["Direct sales: 8 AEs targeting $500K+ ACV", "SI partnerships with Accenture, Deloitte", "PLG free tier → 30% pipeline by Q3"],
        tag: "action",
      },
      {
        heading: "Budget & Timeline",
        points: ["$5.7M total GTM budget", "Brand launch Q1, content engine Q2, event circuit Q3"],
        tag: "risk",
      },
    ],
    slides: [
      {
        title: "Executive Summary",
        type: "executive_summary",
        blockType: "exec_summary",
        aiImageQuery: "B2B SaaS go to market strategy",
        bullets: [
          "$12.4B market growing 19% — CloudSync targets the underserved mid-market",
          "10x faster setup and 60% lower cost than incumbent solutions",
          "Three-channel strategy: direct sales, partners, and product-led growth",
        ],
      },
      {
        title: "Competitive Positioning",
        type: "current_state",
        blockType: "comparison_table",
        aiImageQuery: "competitive analysis business strategy",
        bullets: [
          "2-week setup vs 4 weeks (Fivetran) and 3+ months (Informatica)",
          "$2K/mo pricing vs $4K-$15K alternatives",
          "Full no-code capability vs limited or dev-only competitors",
        ],
      },
      {
        title: "Channel Strategy",
        type: "strategic_options",
        blockType: "three_pillars",
        bullets: [
          "Direct Sales: 8 AEs focused on healthcare and fintech verticals",
          "Partner Channel: SI partnerships for enterprise credibility",
          "Product-Led Growth: free tier converting to 30% of pipeline",
        ],
      },
      {
        title: "Budget & Milestones",
        type: "recommended_path",
        blockType: "timeline_block",
        bullets: [
          "Q1: Brand launch, website relaunch, analyst briefings",
          "Q2: Content engine — 12 case studies, 6 webinars",
          "Q3: Event circuit — AWS re:Invent, industry conferences",
        ],
      },
    ],
    interactiveBlocks: [
      { type: "tabs", label: "Budget Allocation", preview: ["Sales: $2.4M", "Marketing: $1.8M", "Partners: $600K", "PLG: $900K"] },
      { type: "toggle", label: "CloudSync vs Legacy", preview: ["CloudSync: 2 weeks, $2K/mo", "Legacy: 3 months, $15K/mo"] },
      { type: "reveal", label: "GTM Milestones", preview: ["Q1: Brand launch", "Q2: Content engine", "Q3: Event circuit"] },
    ],
  },
];
