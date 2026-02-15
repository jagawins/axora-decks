/**
 * Executive Demo Scenarios — prefilled messy notes
 * that Axora transforms into structured output.
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
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "revenue-cycle",
    title: "Revenue Cycle Optimization",
    subtitle: "Healthcare operations",
    icon: "💰",
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
        bullets: [
          "Revenue cycle losses exceed $2.3M from coding errors alone",
          "18% YoY denial increase signals systemic process failure",
          "AI-driven automation can recover 60-70% within 12 months",
        ],
      },
      {
        title: "Current State Analysis",
        type: "current_state",
        bullets: [
          "34% staff turnover creating knowledge gaps",
          "Disconnected systems preventing real-time visibility",
          "Payer mix shift increasing complexity",
        ],
      },
      {
        title: "Strategic Options",
        type: "strategic_options",
        bullets: [
          "Option A: Full platform replacement ($4.2M, 18 months)",
          "Option B: AI overlay on existing systems ($1.8M, 6 months)",
          "Option C: Phased hybrid approach ($2.5M, 12 months)",
        ],
      },
      {
        title: "Recommended Path",
        type: "recommended_path",
        bullets: [
          "Phased hybrid approach maximizes ROI while managing risk",
          "Quick wins in denial management within 90 days",
          "Full automation achievable by Q4 with 3.2x ROI",
        ],
      },
    ],
  },
  {
    id: "ai-transformation",
    title: "AI Transformation Strategy",
    subtitle: "Enterprise technology",
    icon: "🧠",
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
        bullets: [
          "Competitive window for AI advantage is 12-18 months",
          "Data foundation must precede model deployment",
          "Three high-impact use cases identified for immediate action",
        ],
      },
      {
        title: "Current State Analysis",
        type: "current_state",
        bullets: [
          "Data quality insufficient for production ML workloads",
          "Engineering capacity constrained by existing commitments",
          "Legal framework for AI governance not yet established",
        ],
      },
      {
        title: "Strategic Options",
        type: "strategic_options",
        bullets: [
          "Option A: Build internal AI lab ($8M, 24 months)",
          "Option B: Partner with AI platform vendor ($3M, 9 months)",
          "Option C: Targeted pilots with measurable KPIs ($1.5M, 6 months)",
        ],
      },
      {
        title: "Recommended Path",
        type: "recommended_path",
        bullets: [
          "Start with 3 targeted pilots to build confidence and data",
          "Establish AI governance framework in parallel",
          "Scale successful pilots to enterprise-wide deployment by Q3",
        ],
      },
    ],
  },
  {
    id: "cost-reduction",
    title: "Cost Reduction Program",
    subtitle: "Financial operations",
    icon: "📉",
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
        bullets: [
          "$12M in addressable savings identified across 4 categories",
          "SaaS rationalization alone can yield $3.2M in 90 days",
          "15% target achievable without workforce reduction",
        ],
      },
      {
        title: "Current State Analysis",
        type: "current_state",
        bullets: [
          "Revenue-to-headcount ratio deteriorated from 3.1x to 2.4x",
          "142 active SaaS subscriptions, 38% with <10% utilization",
          "Office utilization averaging 43% across 6 locations",
        ],
      },
      {
        title: "Strategic Options",
        type: "strategic_options",
        bullets: [
          "Option A: Across-the-board 15% budget cuts",
          "Option B: Strategic rationalization by category",
          "Option C: Zero-based budgeting reset",
        ],
      },
      {
        title: "Recommended Path",
        type: "recommended_path",
        bullets: [
          "Category-based rationalization preserves growth investments",
          "Quick wins: SaaS audit, travel policy, vendor renegotiation",
          "Structural changes: office consolidation, org design review",
        ],
      },
    ],
  },
];
