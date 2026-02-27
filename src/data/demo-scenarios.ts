/**
 * Executive Demo Scenarios — updated to showcase all AXORA features:
 * templates, themes, brand kit, interactive blocks, AI images, export.
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
    id: "revenue-cycle",
    title: "Revenue Cycle Optimization",
    subtitle: "Healthcare operations",
    icon: "💰",
    templateName: "Executive Board Deck",
    themeName: "Ocean",
    themeColors: { bg: "#0B1628", accent: "#38BDF8", fg: "#E2E8F0" },
    brandKit: { headingFont: "Space Grotesk", bodyFont: "DM Sans", logoText: "MedCorp" },
    rawNotes: `Denials increasing 18% YoY.
Too many disconnected systems.
Leadership wants measurable AI ROI.
Burnout in revenue cycle team.
Compliance risk rising.
Budget pressure from CFO.
Manual coding errors costing $2.3M annually.
Staff turnover at 34%.
Payer mix shifting to government.
Need board presentation by Friday.`,
    themes: ["Financial Impact", "Operational Risk", "Workforce", "Compliance"],
    structuredSections: [
      {
        heading: "Financial Impact",
        points: ["Denials increasing 18% YoY", "Manual coding errors costing $2.3M annually", "Budget pressure from CFO"],
        tag: "risk",
      },
      {
        heading: "Operational Challenges",
        points: ["Too many disconnected systems", "Payer mix shifting to government", "Leadership wants measurable AI ROI"],
        tag: "context",
      },
      {
        heading: "Workforce Pressure",
        points: ["Burnout in revenue cycle team", "Staff turnover at 34%"],
        tag: "insight",
      },
      {
        heading: "Compliance & Governance",
        points: ["Compliance risk rising", "Need board presentation by Friday"],
        tag: "action",
      },
    ],
    slides: [
      {
        title: "Executive Summary",
        type: "executive_summary",
        blockType: "exec_summary",
        aiImageQuery: "healthcare revenue analytics dashboard",
        bullets: [
          "Revenue cycle losses exceed $2.3M from coding errors alone",
          "18% YoY denial increase signals systemic process failure",
          "AI-driven automation can recover 60-70% within 12 months",
        ],
      },
      {
        title: "Current State Analysis",
        type: "current_state",
        blockType: "chart_block",
        aiImageQuery: "data visualization charts financial metrics",
        bullets: [
          "34% staff turnover creating knowledge gaps",
          "Disconnected systems preventing real-time visibility",
          "Payer mix shift increasing complexity",
        ],
      },
      {
        title: "Strategic Options",
        type: "strategic_options",
        blockType: "comparison_table",
        bullets: [
          "Option A: Full platform replacement ($4.2M, 18 months)",
          "Option B: AI overlay on existing systems ($1.8M, 6 months)",
          "Option C: Phased hybrid approach ($2.5M, 12 months)",
        ],
      },
      {
        title: "Recommended Path",
        type: "recommended_path",
        blockType: "decision_summary",
        bullets: [
          "Phased hybrid approach maximizes ROI while managing risk",
          "Quick wins in denial management within 90 days",
          "Full automation achievable by Q4 with 3.2x ROI",
        ],
      },
    ],
    interactiveBlocks: [
      { type: "tabs", label: "ROI by Quarter", preview: ["Q1: $800K", "Q2: $1.4M", "Q3: $2.1M", "Q4: $3.2M"] },
      { type: "toggle", label: "Before / After Automation", preview: ["Before: 34% error rate", "After: 4% error rate"] },
      { type: "reveal", label: "Implementation Timeline", preview: ["Phase 1: Assess (30 days)", "Phase 2: Deploy (60 days)", "Phase 3: Scale (90 days)"] },
    ],
  },
  {
    id: "ai-transformation",
    title: "AI Transformation Strategy",
    subtitle: "Enterprise technology",
    icon: "🧠",
    templateName: "Strategy Playbook",
    themeName: "Sunset",
    themeColors: { bg: "#1A0F0A", accent: "#F97316", fg: "#FFF7ED" },
    brandKit: { headingFont: "Clash Display", bodyFont: "Inter", logoText: "TechForge" },
    rawNotes: `CEO wants AI strategy yesterday.
No clear use cases prioritized.
Data quality is a mess.
Engineering team skeptical.
Competitors already shipping AI features.
Board asking about GenAI investment.
Privacy concerns from legal.
Talent gap in ML engineering.
Cloud costs already over budget.
Need to show quick wins.`,
    themes: ["Strategy", "Technical Debt", "Talent", "Governance"],
    structuredSections: [
      {
        heading: "Strategic Urgency",
        points: ["CEO wants AI strategy yesterday", "Competitors already shipping AI features", "Board asking about GenAI investment"],
        tag: "risk",
      },
      {
        heading: "Technical Readiness",
        points: ["Data quality is a mess", "Cloud costs already over budget", "No clear use cases prioritized"],
        tag: "context",
      },
      {
        heading: "Talent & Culture",
        points: ["Engineering team skeptical", "Talent gap in ML engineering"],
        tag: "insight",
      },
      {
        heading: "Governance & Risk",
        points: ["Privacy concerns from legal", "Need to show quick wins"],
        tag: "action",
      },
    ],
    slides: [
      {
        title: "Executive Summary",
        type: "executive_summary",
        blockType: "exec_summary",
        aiImageQuery: "artificial intelligence neural network technology",
        bullets: [
          "Competitive window for AI advantage is 12-18 months",
          "Data foundation must precede model deployment",
          "Three high-impact use cases identified for immediate action",
        ],
      },
      {
        title: "Current State Analysis",
        type: "current_state",
        blockType: "two_by_two_matrix",
        aiImageQuery: "enterprise technology infrastructure abstract",
        bullets: [
          "Data quality insufficient for production ML workloads",
          "Engineering capacity constrained by existing commitments",
          "Legal framework for AI governance not yet established",
        ],
      },
      {
        title: "Strategic Options",
        type: "strategic_options",
        blockType: "scenario_set",
        bullets: [
          "Option A: Build internal AI lab ($8M, 24 months)",
          "Option B: Partner with AI platform vendor ($3M, 9 months)",
          "Option C: Targeted pilots with measurable KPIs ($1.5M, 6 months)",
        ],
      },
      {
        title: "Recommended Path",
        type: "recommended_path",
        blockType: "recommendation_panel",
        bullets: [
          "Start with 3 targeted pilots to build confidence and data",
          "Establish AI governance framework in parallel",
          "Scale successful pilots to enterprise-wide deployment by Q3",
        ],
      },
    ],
    interactiveBlocks: [
      { type: "tabs", label: "Use Case Scorecard", preview: ["Customer Support: 9.2", "Fraud Detection: 8.7", "Forecasting: 7.4"] },
      { type: "toggle", label: "Build vs Buy", preview: ["Build: Full control, 24mo", "Buy: Fast start, 9mo"] },
      { type: "reveal", label: "Risk Mitigation Steps", preview: ["Governance framework", "Data privacy audit", "Vendor due diligence"] },
    ],
  },
  {
    id: "cost-reduction",
    title: "Cost Reduction Program",
    subtitle: "Financial operations",
    icon: "📉",
    templateName: "Financial Review",
    themeName: "Forest",
    themeColors: { bg: "#0A1A0F", accent: "#22C55E", fg: "#ECFDF5" },
    brandKit: { headingFont: "Cabinet Grotesk", bodyFont: "IBM Plex Sans", logoText: "FinOps Co" },
    rawNotes: `EBITDA margins declining.
SaaS sprawl out of control.
Headcount grew 40% but revenue only 15%.
Procurement has no visibility.
Travel expenses doubled post-COVID.
Real estate costs for half-empty offices.
Three overlapping CRM systems.
Vendor contracts auto-renewing unreviewed.
Board wants 15% cost reduction.
Need plan in 2 weeks.`,
    themes: ["Cost Drivers", "Efficiency", "Quick Wins", "Governance"],
    structuredSections: [
      {
        heading: "Cost Drivers",
        points: ["Headcount grew 40% but revenue only 15%", "EBITDA margins declining", "Travel expenses doubled post-COVID"],
        tag: "risk",
      },
      {
        heading: "Operational Inefficiency",
        points: ["SaaS sprawl out of control", "Three overlapping CRM systems", "Real estate costs for half-empty offices"],
        tag: "context",
      },
      {
        heading: "Governance Gaps",
        points: ["Procurement has no visibility", "Vendor contracts auto-renewing unreviewed"],
        tag: "insight",
      },
      {
        heading: "Board Mandate",
        points: ["Board wants 15% cost reduction", "Need plan in 2 weeks"],
        tag: "action",
      },
    ],
    slides: [
      {
        title: "Executive Summary",
        type: "executive_summary",
        blockType: "exec_summary",
        aiImageQuery: "financial cost optimization graph",
        bullets: [
          "$12M in addressable savings identified across 4 categories",
          "SaaS rationalization alone can yield $3.2M in 90 days",
          "15% target achievable without workforce reduction",
        ],
      },
      {
        title: "Current State Analysis",
        type: "current_state",
        blockType: "stat_block",
        aiImageQuery: "office building modern workplace",
        bullets: [
          "Revenue-to-headcount ratio deteriorated from 3.1x to 2.4x",
          "142 active SaaS subscriptions, 38% with <10% utilization",
          "Office utilization averaging 43% across 6 locations",
        ],
      },
      {
        title: "Strategic Options",
        type: "strategic_options",
        blockType: "three_pillars",
        bullets: [
          "Option A: Across-the-board 15% budget cuts",
          "Option B: Strategic rationalization by category",
          "Option C: Zero-based budgeting reset",
        ],
      },
      {
        title: "Recommended Path",
        type: "recommended_path",
        blockType: "decision_next_steps",
        bullets: [
          "Category-based rationalization preserves growth investments",
          "Quick wins: SaaS audit, travel policy, vendor renegotiation",
          "Structural changes: office consolidation, org design review",
        ],
      },
    ],
    interactiveBlocks: [
      { type: "tabs", label: "Savings by Category", preview: ["SaaS: $3.2M", "Real Estate: $4.1M", "Travel: $2.8M", "Vendors: $1.9M"] },
      { type: "toggle", label: "Current vs Target", preview: ["Current: $82M OpEx", "Target: $69.7M OpEx"] },
      { type: "reveal", label: "90-Day Quick Wins", preview: ["SaaS audit & consolidation", "Travel policy reset", "Vendor renegotiation blitz"] },
    ],
  },
];
