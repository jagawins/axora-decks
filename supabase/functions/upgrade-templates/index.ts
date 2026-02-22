import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Category Block Generators ─────────────────────────────────────────────

interface Template {
  id: string;
  slug: string;
  title: string;
  category: string;
  tags: string[] | null;
  description: string | null;
}

interface GeneratedBlock {
  template_id: string;
  type: string;
  content: Record<string, unknown>;
  block_payload: Record<string, unknown>;
  block_meta: Record<string, unknown>;
  order_index: number;
}

function makeHero(t: Template, idx: number): GeneratedBlock {
  return {
    template_id: t.id,
    type: "hero_header",
    content: {
      heading: t.title,
      subheading: t.description || `A structured framework for ${t.title.toLowerCase()}`,
      backgroundStyle: "gradient",
    },
    block_payload: {
      heading: t.title,
      subheading: t.description || `A structured framework for ${t.title.toLowerCase()}`,
      backgroundStyle: "gradient",
    },
    block_meta: { schema_version: 1 },
    order_index: idx,
  };
}

// ─── Content generators per category ────────────────────────────────────────

function strategyBlocks(t: Template): GeneratedBlock[] {
  const blocks: GeneratedBlock[] = [];
  let idx = 0;

  blocks.push(makeHero(t, idx++));

  blocks.push({
    template_id: t.id, type: "exec_summary", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      summary: `This ${t.title.toLowerCase()} outlines the strategic direction, key priorities, and measurable outcomes for stakeholders.`,
      keyPoints: [
        "Align leadership around a shared vision and measurable goals",
        "Identify strategic levers that drive competitive advantage",
        "Define accountability structures and decision-making frameworks",
        "Establish KPIs to track progress and course-correct"
      ],
      bottomLine: "A clear strategy turns ambiguity into aligned action."
    },
    block_payload: {
      summary: `This ${t.title.toLowerCase()} outlines the strategic direction, key priorities, and measurable outcomes for stakeholders.`,
      keyPoints: [
        "Align leadership around a shared vision and measurable goals",
        "Identify strategic levers that drive competitive advantage",
        "Define accountability structures and decision-making frameworks",
        "Establish KPIs to track progress and course-correct"
      ],
      bottomLine: "A clear strategy turns ambiguity into aligned action."
    },
  });

  // Tailor three_pillars by slug
  const pillarMap: Record<string, Array<{ title: string; description: string; icon: string }>> = {
    "board-update": [
      { title: "Financial Performance", description: "Revenue growth, margin expansion, and capital efficiency", icon: "TrendingUp" },
      { title: "Strategic Milestones", description: "Key initiatives delivered and upcoming priorities", icon: "Target" },
      { title: "Risk & Governance", description: "Material risks, compliance status, and board actions", icon: "Shield" },
    ],
    "company-strategy": [
      { title: "Market Position", description: "Competitive landscape and differentiation strategy", icon: "Globe" },
      { title: "Growth Engine", description: "Revenue drivers, expansion vectors, and investment thesis", icon: "Rocket" },
      { title: "Operational Excellence", description: "Efficiency gains, talent, and scalable processes", icon: "Settings" },
    ],
    "executive-summary": [
      { title: "Context", description: "Business environment and market dynamics shaping decisions", icon: "Eye" },
      { title: "Key Findings", description: "Critical insights from analysis and stakeholder input", icon: "Lightbulb" },
      { title: "Recommendations", description: "Prioritized actions with expected impact and ownership", icon: "CheckCircle" },
    ],
    "investor-update": [
      { title: "Traction", description: "Revenue, user growth, and key engagement metrics", icon: "TrendingUp" },
      { title: "Product Velocity", description: "Shipping cadence, roadmap progress, and customer feedback", icon: "Zap" },
      { title: "Capital & Runway", description: "Burn rate, runway, and fundraising outlook", icon: "DollarSign" },
    ],
    "okr-review": [
      { title: "Objective Alignment", description: "How OKRs cascade from company to team level", icon: "Target" },
      { title: "Key Results Progress", description: "Quantified progress against measurable outcomes", icon: "BarChart" },
      { title: "Learnings & Pivots", description: "What we learned and how we're adjusting", icon: "RefreshCw" },
    ],
  };
  const defaultPillars = [
    { title: "Vision & Direction", description: "Where we're going and why it matters", icon: "Compass" },
    { title: "Execution Priorities", description: "What we're doing and how we'll measure success", icon: "Target" },
    { title: "Enablers & Resources", description: "What we need to succeed", icon: "Users" },
  ];

  blocks.push({
    template_id: t.id, type: "three_pillars", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: { title: "Strategic Pillars", pillars: pillarMap[t.slug] || defaultPillars },
    block_payload: { title: "Strategic Pillars", pillars: pillarMap[t.slug] || defaultPillars },
  });

  // Stat block tailored
  const statMap: Record<string, Array<{ value: string; label: string; change: string; trend: string }>> = {
    "board-update": [
      { value: "$42M", label: "Quarterly Revenue", change: "+12% YoY", trend: "up" },
      { value: "68%", label: "Gross Margin", change: "+3pp", trend: "up" },
      { value: "4.2", label: "Customer NPS", change: "+0.4", trend: "up" },
      { value: "92%", label: "Employee Retention", change: "-1%", trend: "down" },
    ],
    "investor-update": [
      { value: "$1.2M", label: "MRR", change: "+18% MoM", trend: "up" },
      { value: "34K", label: "Active Users", change: "+22%", trend: "up" },
      { value: "$48", label: "CAC", change: "-15%", trend: "up" },
      { value: "14mo", label: "Runway", change: "", trend: "neutral" },
    ],
    "okr-review": [
      { value: "78%", label: "OKR Attainment", change: "+5pp vs Q3", trend: "up" },
      { value: "12/15", label: "KRs On Track", change: "", trend: "neutral" },
      { value: "3", label: "Objectives at Risk", change: "-2", trend: "up" },
      { value: "91%", label: "Team Alignment Score", change: "+4%", trend: "up" },
    ],
  };
  const defaultStats = [
    { value: "24%", label: "Growth Rate", change: "+6pp YoY", trend: "up" },
    { value: "$8.5M", label: "Revenue", change: "+18%", trend: "up" },
    { value: "89", label: "NPS Score", change: "+12", trend: "up" },
    { value: "96%", label: "Delivery Rate", change: "+2%", trend: "up" },
  ];

  blocks.push({
    template_id: t.id, type: "stat_block", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: { title: "Key Metrics", stats: statMap[t.slug] || defaultStats, layout: "row" },
    block_payload: { title: "Key Metrics", stats: statMap[t.slug] || defaultStats, layout: "row" },
  });

  blocks.push({
    template_id: t.id, type: "comparison_table", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Options Analysis",
      headers: ["Criteria", "Option A", "Option B", "Option C"],
      rows: [
        { label: "Strategic Fit", values: ["High", "Medium", "Low"] },
        { label: "Investment Required", values: ["$2M", "$800K", "$3.5M"] },
        { label: "Time to Impact", values: ["6 months", "3 months", "12 months"] },
        { label: "Risk Level", values: ["Medium", "Low", "High"] },
      ],
      highlightColumn: 1,
    },
    block_payload: {
      title: "Options Analysis",
      headers: ["Criteria", "Option A", "Option B", "Option C"],
      rows: [
        { label: "Strategic Fit", values: ["High", "Medium", "Low"] },
        { label: "Investment Required", values: ["$2M", "$800K", "$3.5M"] },
        { label: "Time to Impact", values: ["6 months", "3 months", "12 months"] },
        { label: "Risk Level", values: ["Medium", "Low", "High"] },
      ],
      highlightColumn: 1,
    },
  });

  blocks.push({
    template_id: t.id, type: "decision_next_steps", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Decisions & Next Steps",
      decision: `Proceed with the recommended approach for ${t.title.toLowerCase()}`,
      rationale: "Balances strategic impact with execution feasibility and resource constraints",
      next_steps: [
        { action: "Finalize detailed implementation plan", owner: "Strategy Lead", priority: "high" },
        { action: "Secure budget approval from steering committee", owner: "CFO", priority: "high" },
        { action: "Communicate strategy to all teams", owner: "Communications", priority: "medium" },
        { action: "Set up progress tracking dashboard", owner: "PMO", priority: "medium" },
      ],
      risks: ["Competing priorities may delay execution", "Market conditions could shift assumptions"],
    },
    block_payload: {
      title: "Decisions & Next Steps",
      decision: `Proceed with the recommended approach for ${t.title.toLowerCase()}`,
      rationale: "Balances strategic impact with execution feasibility and resource constraints",
      next_steps: [
        { action: "Finalize detailed implementation plan", owner: "Strategy Lead", priority: "high" },
        { action: "Secure budget approval from steering committee", owner: "CFO", priority: "high" },
        { action: "Communicate strategy to all teams", owner: "Communications", priority: "medium" },
        { action: "Set up progress tracking dashboard", owner: "PMO", priority: "medium" },
      ],
      risks: ["Competing priorities may delay execution", "Market conditions could shift assumptions"],
    },
  });

  blocks.push({
    template_id: t.id, type: "cta_section", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      heading: "Ready to Align?",
      subheading: "Let's move from strategy to execution with clear ownership and timelines.",
      primaryCta: { text: "Schedule Review", href: "#" },
      secondaryCta: { text: "Download Full Report", href: "#" },
    },
    block_payload: {
      heading: "Ready to Align?",
      subheading: "Let's move from strategy to execution with clear ownership and timelines.",
      primaryCta: { text: "Schedule Review", href: "#" },
      secondaryCta: { text: "Download Full Report", href: "#" },
    },
  });

  return blocks;
}

function projectsBlocks(t: Template): GeneratedBlock[] {
  const blocks: GeneratedBlock[] = [];
  let idx = 0;

  blocks.push(makeHero(t, idx++));

  blocks.push({
    template_id: t.id, type: "exec_summary", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      summary: `This ${t.title.toLowerCase()} provides a comprehensive view of project status, milestones, and risks requiring attention.`,
      keyPoints: [
        "Track delivery against planned milestones and timelines",
        "Surface blockers and risks before they become issues",
        "Maintain stakeholder alignment on scope and priorities",
        "Drive accountability through clear ownership"
      ],
      bottomLine: "Transparency in execution builds trust and accelerates delivery."
    },
    block_payload: {
      summary: `This ${t.title.toLowerCase()} provides a comprehensive view of project status, milestones, and risks requiring attention.`,
      keyPoints: [
        "Track delivery against planned milestones and timelines",
        "Surface blockers and risks before they become issues",
        "Maintain stakeholder alignment on scope and priorities",
        "Drive accountability through clear ownership"
      ],
      bottomLine: "Transparency in execution builds trust and accelerates delivery."
    },
  });

  // Timeline tailored by slug
  const timelineMap: Record<string, Array<{ date: string; title: string; description: string; status: string }>> = {
    "project-kickoff": [
      { date: "Week 1", title: "Charter & Alignment", description: "Define scope, goals, and stakeholders", status: "completed" },
      { date: "Week 2-3", title: "Planning & Resourcing", description: "Build WBS, assign teams, set up tools", status: "current" },
      { date: "Week 4-8", title: "Execution Phase 1", description: "Deliver first milestone and gather feedback", status: "upcoming" },
      { date: "Week 9-12", title: "Delivery & Handoff", description: "Complete deliverables and transition to BAU", status: "upcoming" },
    ],
    "implementation-plan": [
      { date: "Phase 1", title: "Discovery & Design", description: "Requirements gathering and solution design", status: "completed" },
      { date: "Phase 2", title: "Build & Configure", description: "Development, configuration, and integration", status: "current" },
      { date: "Phase 3", title: "Test & Validate", description: "UAT, performance testing, and sign-off", status: "upcoming" },
      { date: "Phase 4", title: "Deploy & Stabilize", description: "Go-live, monitoring, and hypercare", status: "upcoming" },
    ],
  };
  const defaultTimeline = [
    { date: "Milestone 1", title: "Foundation", description: "Set up project infrastructure and team alignment", status: "completed" },
    { date: "Milestone 2", title: "Core Delivery", description: "Build and deliver primary workstreams", status: "current" },
    { date: "Milestone 3", title: "Integration", description: "Connect components and validate end-to-end", status: "upcoming" },
    { date: "Milestone 4", title: "Launch", description: "Go-live with monitoring and support plan", status: "upcoming" },
  ];

  blocks.push({
    template_id: t.id, type: "timeline_block", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: { title: "Project Timeline", events: timelineMap[t.slug] || defaultTimeline },
    block_payload: { title: "Project Timeline", events: timelineMap[t.slug] || defaultTimeline },
  });

  blocks.push({
    template_id: t.id, type: "stat_block", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Progress Metrics",
      stats: [
        { value: "72%", label: "Tasks Complete", change: "+8% this week", trend: "up" },
        { value: "3", label: "Open Blockers", change: "-2", trend: "up" },
        { value: "On Track", label: "Schedule Status", change: "", trend: "neutral" },
        { value: "87%", label: "Budget Utilization", change: "", trend: "neutral" },
      ],
      layout: "row",
    },
    block_payload: {
      title: "Progress Metrics",
      stats: [
        { value: "72%", label: "Tasks Complete", change: "+8% this week", trend: "up" },
        { value: "3", label: "Open Blockers", change: "-2", trend: "up" },
        { value: "On Track", label: "Schedule Status", change: "", trend: "neutral" },
        { value: "87%", label: "Budget Utilization", change: "", trend: "neutral" },
      ],
      layout: "row",
    },
  });

  blocks.push({
    template_id: t.id, type: "card_grid", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Workstreams & Risks",
      columns: 3,
      cards: [
        { title: "Workstream A", description: "Core platform development — on track", icon: "Code" },
        { title: "Workstream B", description: "Data migration — at risk due to schema changes", icon: "Database" },
        { title: "Workstream C", description: "User training — not started", icon: "Users" },
        { title: "Risk: Timeline", description: "Dependency on external vendor delivery", icon: "AlertTriangle" },
        { title: "Risk: Resources", description: "Two key roles still unfilled", icon: "UserMinus" },
        { title: "Risk: Scope", description: "Potential scope creep from stakeholder requests", icon: "Maximize" },
      ],
    },
    block_payload: {
      title: "Workstreams & Risks",
      columns: 3,
      cards: [
        { title: "Workstream A", description: "Core platform development — on track", icon: "Code" },
        { title: "Workstream B", description: "Data migration — at risk due to schema changes", icon: "Database" },
        { title: "Workstream C", description: "User training — not started", icon: "Users" },
        { title: "Risk: Timeline", description: "Dependency on external vendor delivery", icon: "AlertTriangle" },
        { title: "Risk: Resources", description: "Two key roles still unfilled", icon: "UserMinus" },
        { title: "Risk: Scope", description: "Potential scope creep from stakeholder requests", icon: "Maximize" },
      ],
    },
  });

  blocks.push({
    template_id: t.id, type: "comparison_table", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Status Matrix",
      headers: ["Workstream", "Status", "Owner", "Due Date"],
      rows: [
        { label: "Platform Dev", values: ["🟢 On Track", "Engineering Lead", "Mar 15"] },
        { label: "Data Migration", values: ["🟡 At Risk", "Data Team", "Mar 30"] },
        { label: "Training", values: ["⚪ Not Started", "L&D Manager", "Apr 15"] },
        { label: "Go-Live Prep", values: ["🟢 On Track", "PMO", "Apr 30"] },
      ],
    },
    block_payload: {
      title: "Status Matrix",
      headers: ["Workstream", "Status", "Owner", "Due Date"],
      rows: [
        { label: "Platform Dev", values: ["🟢 On Track", "Engineering Lead", "Mar 15"] },
        { label: "Data Migration", values: ["🟡 At Risk", "Data Team", "Mar 30"] },
        { label: "Training", values: ["⚪ Not Started", "L&D Manager", "Apr 15"] },
        { label: "Go-Live Prep", values: ["🟢 On Track", "PMO", "Apr 30"] },
      ],
    },
  });

  blocks.push({
    template_id: t.id, type: "decision_next_steps", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Actions & Owners",
      decision: "Continue execution with focus on unblocking at-risk workstreams",
      next_steps: [
        { action: "Escalate vendor dependency to procurement", owner: "PM", priority: "high" },
        { action: "Backfill open roles by end of week", owner: "HR", priority: "high" },
        { action: "Conduct scope review with sponsors", owner: "Product Owner", priority: "medium" },
        { action: "Update risk register and share with SteerCo", owner: "PMO", priority: "low" },
      ],
    },
    block_payload: {
      title: "Actions & Owners",
      decision: "Continue execution with focus on unblocking at-risk workstreams",
      next_steps: [
        { action: "Escalate vendor dependency to procurement", owner: "PM", priority: "high" },
        { action: "Backfill open roles by end of week", owner: "HR", priority: "high" },
        { action: "Conduct scope review with sponsors", owner: "Product Owner", priority: "medium" },
        { action: "Update risk register and share with SteerCo", owner: "PMO", priority: "low" },
      ],
    },
  });

  return blocks;
}

function productBlocks(t: Template): GeneratedBlock[] {
  const blocks: GeneratedBlock[] = [];
  let idx = 0;

  blocks.push(makeHero(t, idx++));

  blocks.push({
    template_id: t.id, type: "exec_summary", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      summary: `${t.title} — a comprehensive view of product direction, technical architecture, and delivery velocity.`,
      keyPoints: [
        "Define product vision and connect it to business outcomes",
        "Prioritize features using data-driven frameworks",
        "Track engineering velocity and quality metrics",
        "Align cross-functional teams on roadmap and dependencies"
      ],
      bottomLine: "Ship what matters, measure what counts."
    },
    block_payload: {
      summary: `${t.title} — a comprehensive view of product direction, technical architecture, and delivery velocity.`,
      keyPoints: [
        "Define product vision and connect it to business outcomes",
        "Prioritize features using data-driven frameworks",
        "Track engineering velocity and quality metrics",
        "Align cross-functional teams on roadmap and dependencies"
      ],
      bottomLine: "Ship what matters, measure what counts."
    },
  });

  const roadmapMap: Record<string, Array<{ date: string; title: string; description: string; status: string }>> = {
    "product-roadmap": [
      { date: "Q1", title: "Discovery & Research", description: "User interviews, competitive analysis, opportunity sizing", status: "completed" },
      { date: "Q2", title: "Build Core Features", description: "MVP development, alpha testing with design partners", status: "current" },
      { date: "Q3", title: "Beta & Iteration", description: "Public beta, feedback loops, performance optimization", status: "upcoming" },
      { date: "Q4", title: "GA Launch", description: "General availability, marketing push, scale infrastructure", status: "upcoming" },
    ],
    "release-notes": [
      { date: "v2.1", title: "Performance Boost", description: "50% faster load times, reduced memory usage", status: "completed" },
      { date: "v2.2", title: "New Dashboard", description: "Redesigned analytics with real-time charts", status: "completed" },
      { date: "v2.3", title: "API v2", description: "RESTful API with webhook support and rate limiting", status: "current" },
      { date: "v3.0", title: "Platform Overhaul", description: "New architecture, plugin system, multi-tenancy", status: "upcoming" },
    ],
  };
  const defaultRoadmap = [
    { date: "Phase 1", title: "Foundation", description: "Core architecture and key integrations", status: "completed" },
    { date: "Phase 2", title: "Feature Build", description: "Primary feature set development and testing", status: "current" },
    { date: "Phase 3", title: "Polish & Scale", description: "Performance optimization and scalability", status: "upcoming" },
    { date: "Phase 4", title: "Launch", description: "Release, monitoring, and iteration", status: "upcoming" },
  ];

  blocks.push({
    template_id: t.id, type: "timeline_block", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: { title: "Roadmap", events: roadmapMap[t.slug] || defaultRoadmap },
    block_payload: { title: "Roadmap", events: roadmapMap[t.slug] || defaultRoadmap },
  });

  blocks.push({
    template_id: t.id, type: "chart_block", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Engineering Velocity",
      chartType: "bar",
      data: [
        { label: "Sprint 1", value: 34 },
        { label: "Sprint 2", value: 42 },
        { label: "Sprint 3", value: 38 },
        { label: "Sprint 4", value: 51 },
        { label: "Sprint 5", value: 47 },
        { label: "Sprint 6", value: 55 },
      ],
      xLabel: "Sprint",
      yLabel: "Story Points",
    },
    block_payload: {
      title: "Engineering Velocity",
      chartType: "bar",
      data: [
        { label: "Sprint 1", value: 34 },
        { label: "Sprint 2", value: 42 },
        { label: "Sprint 3", value: 38 },
        { label: "Sprint 4", value: 51 },
        { label: "Sprint 5", value: 47 },
        { label: "Sprint 6", value: 55 },
      ],
      xLabel: "Sprint",
      yLabel: "Story Points",
    },
  });

  blocks.push({
    template_id: t.id, type: "card_grid", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Features & Components",
      columns: 3,
      cards: [
        { title: "Authentication", description: "SSO, MFA, and role-based access control", icon: "Lock" },
        { title: "Analytics Engine", description: "Real-time dashboards and custom reports", icon: "BarChart" },
        { title: "API Gateway", description: "Rate limiting, versioning, and webhook management", icon: "Globe" },
        { title: "Notification System", description: "Multi-channel alerts with preference management", icon: "Bell" },
        { title: "Data Pipeline", description: "ETL workflows with monitoring and retry logic", icon: "GitBranch" },
        { title: "Admin Console", description: "User management, billing, and configuration", icon: "Settings" },
      ],
    },
    block_payload: {
      title: "Features & Components",
      columns: 3,
      cards: [
        { title: "Authentication", description: "SSO, MFA, and role-based access control", icon: "Lock" },
        { title: "Analytics Engine", description: "Real-time dashboards and custom reports", icon: "BarChart" },
        { title: "API Gateway", description: "Rate limiting, versioning, and webhook management", icon: "Globe" },
        { title: "Notification System", description: "Multi-channel alerts with preference management", icon: "Bell" },
        { title: "Data Pipeline", description: "ETL workflows with monitoring and retry logic", icon: "GitBranch" },
        { title: "Admin Console", description: "User management, billing, and configuration", icon: "Settings" },
      ],
    },
  });

  blocks.push({
    template_id: t.id, type: "two_by_two_matrix", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Feature Prioritization",
      xAxis: "Effort",
      yAxis: "Impact",
      quadrants: [
        { label: "Quick Wins", position: "top-left", items: ["Onboarding wizard", "Email templates", "Bulk export"] },
        { label: "Strategic Bets", position: "top-right", items: ["AI recommendations", "Platform marketplace"] },
        { label: "Fill-ins", position: "bottom-left", items: ["Dark mode", "Keyboard shortcuts"] },
        { label: "Deprioritize", position: "bottom-right", items: ["Custom themes", "Legacy API support"] },
      ],
    },
    block_payload: {
      title: "Feature Prioritization",
      xAxis: "Effort",
      yAxis: "Impact",
      quadrants: [
        { label: "Quick Wins", position: "top-left", items: ["Onboarding wizard", "Email templates", "Bulk export"] },
        { label: "Strategic Bets", position: "top-right", items: ["AI recommendations", "Platform marketplace"] },
        { label: "Fill-ins", position: "bottom-left", items: ["Dark mode", "Keyboard shortcuts"] },
        { label: "Deprioritize", position: "bottom-right", items: ["Custom themes", "Legacy API support"] },
      ],
    },
  });

  blocks.push({
    template_id: t.id, type: "cta_section", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      heading: "Let's Ship It",
      subheading: "Review the roadmap, align on priorities, and commit to the next sprint.",
      primaryCta: { text: "View Backlog", href: "#" },
      secondaryCta: { text: "Request Feature", href: "#" },
    },
    block_payload: {
      heading: "Let's Ship It",
      subheading: "Review the roadmap, align on priorities, and commit to the next sprint.",
      primaryCta: { text: "View Backlog", href: "#" },
      secondaryCta: { text: "Request Feature", href: "#" },
    },
  });

  return blocks;
}

function salesBlocks(t: Template): GeneratedBlock[] {
  const blocks: GeneratedBlock[] = [];
  let idx = 0;

  blocks.push(makeHero(t, idx++));

  const statMap: Record<string, Array<{ value: string; label: string; change: string; trend: string }>> = {
    "pipeline-review": [
      { value: "$4.2M", label: "Pipeline Value", change: "+22% QoQ", trend: "up" },
      { value: "31%", label: "Win Rate", change: "+4pp", trend: "up" },
      { value: "$68K", label: "Avg Deal Size", change: "+12%", trend: "up" },
      { value: "42 days", label: "Sales Cycle", change: "-5 days", trend: "up" },
    ],
    "campaign-report": [
      { value: "2.4M", label: "Impressions", change: "+35%", trend: "up" },
      { value: "4.8%", label: "CTR", change: "+1.2pp", trend: "up" },
      { value: "$12", label: "CPL", change: "-18%", trend: "up" },
      { value: "340", label: "MQLs Generated", change: "+28%", trend: "up" },
    ],
    "renewal-qbr": [
      { value: "94%", label: "Renewal Rate", change: "+2pp", trend: "up" },
      { value: "$1.8M", label: "ARR Renewed", change: "+15%", trend: "up" },
      { value: "112%", label: "Net Revenue Retention", change: "+8pp", trend: "up" },
      { value: "8.4", label: "Avg Health Score", change: "+0.6", trend: "up" },
    ],
  };
  const defaultSalesStats = [
    { value: "$3.1M", label: "Revenue", change: "+19% YoY", trend: "up" },
    { value: "28%", label: "Conversion Rate", change: "+3pp", trend: "up" },
    { value: "156", label: "New Deals", change: "+24%", trend: "up" },
    { value: "$52K", label: "ACV", change: "+8%", trend: "up" },
  ];

  blocks.push({
    template_id: t.id, type: "stat_block", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: { title: "Performance Metrics", stats: statMap[t.slug] || defaultSalesStats, layout: "row" },
    block_payload: { title: "Performance Metrics", stats: statMap[t.slug] || defaultSalesStats, layout: "row" },
  });

  blocks.push({
    template_id: t.id, type: "chart_block", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Revenue Trend",
      chartType: "line",
      data: [
        { label: "Jan", value: 420 },
        { label: "Feb", value: 480 },
        { label: "Mar", value: 510 },
        { label: "Apr", value: 560 },
        { label: "May", value: 620 },
        { label: "Jun", value: 710 },
      ],
      xLabel: "Month",
      yLabel: "Revenue ($K)",
    },
    block_payload: {
      title: "Revenue Trend",
      chartType: "line",
      data: [
        { label: "Jan", value: 420 },
        { label: "Feb", value: 480 },
        { label: "Mar", value: 510 },
        { label: "Apr", value: 560 },
        { label: "May", value: 620 },
        { label: "Jun", value: 710 },
      ],
      xLabel: "Month",
      yLabel: "Revenue ($K)",
    },
  });

  blocks.push({
    template_id: t.id, type: "card_grid", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Key Segments",
      columns: 3,
      cards: [
        { title: "Enterprise", description: "Large accounts with $100K+ ACV and multi-year contracts", icon: "Building" },
        { title: "Mid-Market", description: "Growth companies with $25-100K ACV and rapid expansion", icon: "TrendingUp" },
        { title: "SMB", description: "Self-serve and low-touch accounts driving volume", icon: "Users" },
        { title: "Channel Partners", description: "Resellers and integrators extending market reach", icon: "Handshake" },
        { title: "Strategic Accounts", description: "Named accounts with dedicated success teams", icon: "Star" },
        { title: "New Markets", description: "Emerging verticals and geographic expansion", icon: "Globe" },
      ],
    },
    block_payload: {
      title: "Key Segments",
      columns: 3,
      cards: [
        { title: "Enterprise", description: "Large accounts with $100K+ ACV and multi-year contracts", icon: "Building" },
        { title: "Mid-Market", description: "Growth companies with $25-100K ACV and rapid expansion", icon: "TrendingUp" },
        { title: "SMB", description: "Self-serve and low-touch accounts driving volume", icon: "Users" },
        { title: "Channel Partners", description: "Resellers and integrators extending market reach", icon: "Handshake" },
        { title: "Strategic Accounts", description: "Named accounts with dedicated success teams", icon: "Star" },
        { title: "New Markets", description: "Emerging verticals and geographic expansion", icon: "Globe" },
      ],
    },
  });

  blocks.push({
    template_id: t.id, type: "comparison_table", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Competitive Landscape",
      headers: ["Capability", "Us", "Competitor A", "Competitor B"],
      rows: [
        { label: "AI-Powered Insights", values: [true, false, true] },
        { label: "Enterprise SSO", values: [true, true, false] },
        { label: "Custom Integrations", values: [true, true, true] },
        { label: "Real-time Collaboration", values: [true, false, false] },
        { label: "White-label Support", values: [true, false, true] },
      ],
      highlightColumn: 1,
    },
    block_payload: {
      title: "Competitive Landscape",
      headers: ["Capability", "Us", "Competitor A", "Competitor B"],
      rows: [
        { label: "AI-Powered Insights", values: [true, false, true] },
        { label: "Enterprise SSO", values: [true, true, false] },
        { label: "Custom Integrations", values: [true, true, true] },
        { label: "Real-time Collaboration", values: [true, false, false] },
        { label: "White-label Support", values: [true, false, true] },
      ],
      highlightColumn: 1,
    },
  });

  blocks.push({
    template_id: t.id, type: "quote_block", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      quote: "This platform transformed how our team communicates strategy. We went from 3-hour meetings to 30-minute aligned reviews.",
      author: "Sarah Chen",
      role: "VP of Operations",
      company: "TechScale Inc.",
    },
    block_payload: {
      quote: "This platform transformed how our team communicates strategy. We went from 3-hour meetings to 30-minute aligned reviews.",
      author: "Sarah Chen",
      role: "VP of Operations",
      company: "TechScale Inc.",
    },
  });

  blocks.push({
    template_id: t.id, type: "cta_section", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      heading: "Close More Deals",
      subheading: "Equip your team with the insights and tools to accelerate pipeline velocity.",
      primaryCta: { text: "Book a Demo", href: "#" },
      secondaryCta: { text: "See Pricing", href: "#" },
    },
    block_payload: {
      heading: "Close More Deals",
      subheading: "Equip your team with the insights and tools to accelerate pipeline velocity.",
      primaryCta: { text: "Book a Demo", href: "#" },
      secondaryCta: { text: "See Pricing", href: "#" },
    },
  });

  return blocks;
}

function startupBlocks(t: Template): GeneratedBlock[] {
  const blocks: GeneratedBlock[] = [];
  let idx = 0;

  blocks.push(makeHero(t, idx++));

  blocks.push({
    template_id: t.id, type: "exec_summary", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      summary: `${t.title} — presenting the vision, traction, and opportunity for investors and stakeholders.`,
      keyPoints: [
        "Massive market opportunity with clear wedge and expansion strategy",
        "Strong early traction validating product-market fit",
        "Experienced team with domain expertise and execution track record",
        "Capital-efficient growth model with clear path to profitability"
      ],
      bottomLine: "We're building the category leader — and we're just getting started."
    },
    block_payload: {
      summary: `${t.title} — presenting the vision, traction, and opportunity for investors and stakeholders.`,
      keyPoints: [
        "Massive market opportunity with clear wedge and expansion strategy",
        "Strong early traction validating product-market fit",
        "Experienced team with domain expertise and execution track record",
        "Capital-efficient growth model with clear path to profitability"
      ],
      bottomLine: "We're building the category leader — and we're just getting started."
    },
  });

  const statMap: Record<string, Array<{ value: string; label: string; change: string; trend: string }>> = {
    "startup-pitch": [
      { value: "$120K", label: "MRR", change: "+22% MoM", trend: "up" },
      { value: "3.2x", label: "Growth Rate", change: "YoY", trend: "up" },
      { value: "$38", label: "CAC", change: "-25%", trend: "up" },
      { value: "$4,200", label: "LTV", change: "+18%", trend: "up" },
    ],
    "fundraising-memo": [
      { value: "$5M", label: "Raising", change: "Series A", trend: "neutral" },
      { value: "$85K", label: "MRR", change: "+30% MoM", trend: "up" },
      { value: "18mo", label: "Runway", change: "Post-raise", trend: "neutral" },
      { value: "110%", label: "NRR", change: "+8pp", trend: "up" },
    ],
    "seed-deck": [
      { value: "2,400", label: "Active Users", change: "+45% MoM", trend: "up" },
      { value: "$18K", label: "MRR", change: "+35%", trend: "up" },
      { value: "72%", label: "D30 Retention", change: "+12pp", trend: "up" },
      { value: "$1.5M", label: "Raising", change: "Seed Round", trend: "neutral" },
    ],
  };
  const defaultStartupStats = [
    { value: "$95K", label: "MRR", change: "+20% MoM", trend: "up" },
    { value: "4,800", label: "Active Users", change: "+35%", trend: "up" },
    { value: "<6mo", label: "Payback Period", change: "-2mo", trend: "up" },
    { value: "68%", label: "Gross Margin", change: "+5pp", trend: "up" },
  ];

  blocks.push({
    template_id: t.id, type: "stat_block", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: { title: "Traction Metrics", stats: statMap[t.slug] || defaultStartupStats, layout: "row" },
    block_payload: { title: "Traction Metrics", stats: statMap[t.slug] || defaultStartupStats, layout: "row" },
  });

  blocks.push({
    template_id: t.id, type: "chart_block", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Growth Trajectory",
      chartType: "line",
      data: [
        { label: "M1", value: 12 },
        { label: "M2", value: 18 },
        { label: "M3", value: 28 },
        { label: "M4", value: 42 },
        { label: "M5", value: 65 },
        { label: "M6", value: 95 },
      ],
      xLabel: "Month",
      yLabel: "MRR ($K)",
    },
    block_payload: {
      title: "Growth Trajectory",
      chartType: "line",
      data: [
        { label: "M1", value: 12 },
        { label: "M2", value: 18 },
        { label: "M3", value: 28 },
        { label: "M4", value: 42 },
        { label: "M5", value: 65 },
        { label: "M6", value: 95 },
      ],
      xLabel: "Month",
      yLabel: "MRR ($K)",
    },
  });

  blocks.push({
    template_id: t.id, type: "three_pillars", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Competitive Moat",
      pillars: [
        { title: "Proprietary Data", description: "Unique dataset that improves with every customer interaction", icon: "Database" },
        { title: "Network Effects", description: "Each new user makes the platform more valuable for everyone", icon: "Share2" },
        { title: "Switching Costs", description: "Deep workflow integration that becomes mission-critical", icon: "Lock" },
      ],
    },
    block_payload: {
      title: "Competitive Moat",
      pillars: [
        { title: "Proprietary Data", description: "Unique dataset that improves with every customer interaction", icon: "Database" },
        { title: "Network Effects", description: "Each new user makes the platform more valuable for everyone", icon: "Share2" },
        { title: "Switching Costs", description: "Deep workflow integration that becomes mission-critical", icon: "Lock" },
      ],
    },
  });

  blocks.push({
    template_id: t.id, type: "card_grid", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Team & Milestones",
      columns: 3,
      cards: [
        { title: "CEO / Co-founder", description: "Ex-Stripe, 10yr fintech experience, Stanford MBA", icon: "User" },
        { title: "CTO / Co-founder", description: "Ex-Google, built systems at 100M+ scale", icon: "Code" },
        { title: "VP Product", description: "Ex-Notion, led 0→1 product launches", icon: "Layout" },
        { title: "Product-Market Fit", description: "Validated with 50+ paying customers", icon: "CheckCircle" },
        { title: "Revenue Milestone", description: "$100K ARR achieved in 8 months", icon: "DollarSign" },
        { title: "Next Goal", description: "$1M ARR by end of year", icon: "Target" },
      ],
    },
    block_payload: {
      title: "Team & Milestones",
      columns: 3,
      cards: [
        { title: "CEO / Co-founder", description: "Ex-Stripe, 10yr fintech experience, Stanford MBA", icon: "User" },
        { title: "CTO / Co-founder", description: "Ex-Google, built systems at 100M+ scale", icon: "Code" },
        { title: "VP Product", description: "Ex-Notion, led 0→1 product launches", icon: "Layout" },
        { title: "Product-Market Fit", description: "Validated with 50+ paying customers", icon: "CheckCircle" },
        { title: "Revenue Milestone", description: "$100K ARR achieved in 8 months", icon: "DollarSign" },
        { title: "Next Goal", description: "$1M ARR by end of year", icon: "Target" },
      ],
    },
  });

  blocks.push({
    template_id: t.id, type: "cta_section", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      heading: "Join Us",
      subheading: "We're raising our next round to accelerate growth. Let's talk.",
      primaryCta: { text: "Schedule Meeting", href: "#" },
      secondaryCta: { text: "View Data Room", href: "#" },
    },
    block_payload: {
      heading: "Join Us",
      subheading: "We're raising our next round to accelerate growth. Let's talk.",
      primaryCta: { text: "Schedule Meeting", href: "#" },
      secondaryCta: { text: "View Data Room", href: "#" },
    },
  });

  return blocks;
}

function aiDataBlocks(t: Template): GeneratedBlock[] {
  const blocks: GeneratedBlock[] = [];
  let idx = 0;

  blocks.push(makeHero(t, idx++));

  blocks.push({
    template_id: t.id, type: "exec_summary", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      summary: `${t.title} — exploring AI capabilities, data architecture, and implementation strategies for enterprise impact.`,
      keyPoints: [
        "Assess AI maturity and identify highest-impact use cases",
        "Design scalable data infrastructure for model training and inference",
        "Establish governance frameworks for responsible AI deployment",
        "Measure ROI through clear metrics tied to business outcomes"
      ],
      bottomLine: "AI is a capability multiplier — when applied to the right problems."
    },
    block_payload: {
      summary: `${t.title} — exploring AI capabilities, data architecture, and implementation strategies for enterprise impact.`,
      keyPoints: [
        "Assess AI maturity and identify highest-impact use cases",
        "Design scalable data infrastructure for model training and inference",
        "Establish governance frameworks for responsible AI deployment",
        "Measure ROI through clear metrics tied to business outcomes"
      ],
      bottomLine: "AI is a capability multiplier — when applied to the right problems."
    },
  });

  blocks.push({
    template_id: t.id, type: "three_pillars", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "AI Strategy Pillars",
      pillars: [
        { title: "Data Foundation", description: "Clean, governed, accessible data as the fuel for AI initiatives", icon: "Database" },
        { title: "Model Operations", description: "MLOps pipeline from experimentation to production deployment", icon: "GitBranch" },
        { title: "Responsible AI", description: "Bias detection, explainability, and compliance frameworks", icon: "Shield" },
      ],
    },
    block_payload: {
      title: "AI Strategy Pillars",
      pillars: [
        { title: "Data Foundation", description: "Clean, governed, accessible data as the fuel for AI initiatives", icon: "Database" },
        { title: "Model Operations", description: "MLOps pipeline from experimentation to production deployment", icon: "GitBranch" },
        { title: "Responsible AI", description: "Bias detection, explainability, and compliance frameworks", icon: "Shield" },
      ],
    },
  });

  blocks.push({
    template_id: t.id, type: "chart_block", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Model Performance",
      chartType: "bar",
      data: [
        { label: "Accuracy", value: 94 },
        { label: "Precision", value: 91 },
        { label: "Recall", value: 88 },
        { label: "F1 Score", value: 89 },
        { label: "Latency (ms)", value: 45 },
      ],
      xLabel: "Metric",
      yLabel: "Score / Value",
    },
    block_payload: {
      title: "Model Performance",
      chartType: "bar",
      data: [
        { label: "Accuracy", value: 94 },
        { label: "Precision", value: 91 },
        { label: "Recall", value: 88 },
        { label: "F1 Score", value: 89 },
        { label: "Latency (ms)", value: 45 },
      ],
      xLabel: "Metric",
      yLabel: "Score / Value",
    },
  });

  blocks.push({
    template_id: t.id, type: "two_by_two_matrix", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "AI Maturity Assessment",
      xAxis: "Technical Readiness",
      yAxis: "Business Impact",
      quadrants: [
        { label: "Quick Wins", position: "top-left", items: ["Chatbot automation", "Document classification", "Sentiment analysis"] },
        { label: "Strategic Investments", position: "top-right", items: ["Predictive analytics", "Recommendation engine"] },
        { label: "Experiments", position: "bottom-left", items: ["Image generation", "Code assistance"] },
        { label: "Future Bets", position: "bottom-right", items: ["Autonomous agents", "Multi-modal reasoning"] },
      ],
    },
    block_payload: {
      title: "AI Maturity Assessment",
      xAxis: "Technical Readiness",
      yAxis: "Business Impact",
      quadrants: [
        { label: "Quick Wins", position: "top-left", items: ["Chatbot automation", "Document classification", "Sentiment analysis"] },
        { label: "Strategic Investments", position: "top-right", items: ["Predictive analytics", "Recommendation engine"] },
        { label: "Experiments", position: "bottom-left", items: ["Image generation", "Code assistance"] },
        { label: "Future Bets", position: "bottom-right", items: ["Autonomous agents", "Multi-modal reasoning"] },
      ],
    },
  });

  blocks.push({
    template_id: t.id, type: "card_grid", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Use Cases",
      columns: 3,
      cards: [
        { title: "Customer Support AI", description: "Automated ticket routing and response generation", icon: "MessageSquare" },
        { title: "Predictive Maintenance", description: "ML models forecasting equipment failures before they occur", icon: "Activity" },
        { title: "Document Intelligence", description: "Automated extraction and classification of unstructured data", icon: "FileText" },
        { title: "Demand Forecasting", description: "Time-series models optimizing inventory and supply chain", icon: "TrendingUp" },
        { title: "Fraud Detection", description: "Real-time anomaly detection across transaction streams", icon: "AlertTriangle" },
        { title: "Content Generation", description: "AI-assisted creation of marketing and product content", icon: "PenTool" },
      ],
    },
    block_payload: {
      title: "Use Cases",
      columns: 3,
      cards: [
        { title: "Customer Support AI", description: "Automated ticket routing and response generation", icon: "MessageSquare" },
        { title: "Predictive Maintenance", description: "ML models forecasting equipment failures before they occur", icon: "Activity" },
        { title: "Document Intelligence", description: "Automated extraction and classification of unstructured data", icon: "FileText" },
        { title: "Demand Forecasting", description: "Time-series models optimizing inventory and supply chain", icon: "TrendingUp" },
        { title: "Fraud Detection", description: "Real-time anomaly detection across transaction streams", icon: "AlertTriangle" },
        { title: "Content Generation", description: "AI-assisted creation of marketing and product content", icon: "PenTool" },
      ],
    },
  });

  blocks.push({
    template_id: t.id, type: "decision_next_steps", order_index: idx++,
    block_meta: { schema_version: 1 },
    content: {
      title: "Implementation Roadmap",
      decision: "Prioritize high-impact, low-complexity AI use cases for immediate deployment",
      rationale: "Quick wins build organizational confidence and fund more ambitious AI initiatives",
      next_steps: [
        { action: "Stand up ML platform and data pipeline infrastructure", owner: "Data Engineering", priority: "high" },
        { action: "Launch pilot for top 2 use cases with success metrics", owner: "AI/ML Team", priority: "high" },
        { action: "Establish AI governance committee and review process", owner: "CTO Office", priority: "medium" },
        { action: "Develop AI literacy training for business stakeholders", owner: "L&D", priority: "medium" },
      ],
      risks: ["Data quality gaps may delay model training", "Talent acquisition in competitive AI market"],
    },
    block_payload: {
      title: "Implementation Roadmap",
      decision: "Prioritize high-impact, low-complexity AI use cases for immediate deployment",
      rationale: "Quick wins build organizational confidence and fund more ambitious AI initiatives",
      next_steps: [
        { action: "Stand up ML platform and data pipeline infrastructure", owner: "Data Engineering", priority: "high" },
        { action: "Launch pilot for top 2 use cases with success metrics", owner: "AI/ML Team", priority: "high" },
        { action: "Establish AI governance committee and review process", owner: "CTO Office", priority: "medium" },
        { action: "Develop AI literacy training for business stakeholders", owner: "L&D", priority: "medium" },
      ],
      risks: ["Data quality gaps may delay model training", "Talent acquisition in competitive AI market"],
    },
  });

  return blocks;
}

// ─── Main generator dispatcher ──────────────────────────────────────────────

function generateBlocksForTemplate(t: Template): GeneratedBlock[] {
  const cat = t.category;
  if (cat === "Strategy and Leadership") return strategyBlocks(t);
  if (cat === "Projects and Operations") return projectsBlocks(t);
  if (cat === "Product and Technology") return productBlocks(t);
  if (cat === "Sales and Marketing") return salesBlocks(t);
  if (cat === "Startup and Fundraising") return startupBlocks(t);
  if (cat === "AI and Data") return aiDataBlocks(t);
  // Fallback: use strategy pattern
  return strategyBlocks(t);
}

// ─── HTTP handler ───────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all templates
    const { data: templates, error: fetchError } = await supabase
      .from("templates")
      .select("id, slug, title, category, tags, description")
      .order("category", { ascending: true });

    if (fetchError) throw new Error(`Failed to fetch templates: ${fetchError.message}`);
    if (!templates || templates.length === 0) throw new Error("No templates found in database");

    console.log(`Found ${templates.length} templates to upgrade`);

    let totalBlocks = 0;
    let upgradedCount = 0;
    const skipped: string[] = [];

    for (const t of templates) {
      // Skip the Visual Blocks Showcase demo
      if (t.slug === "visual-blocks-showcase") {
        skipped.push(t.slug);
        console.log(`Skipping demo template: ${t.slug}`);
        continue;
      }

      // Delete existing blocks for this template
      const { error: deleteError } = await supabase
        .from("template_blocks")
        .delete()
        .eq("template_id", t.id);

      if (deleteError) {
        console.error(`Failed to delete blocks for ${t.slug}:`, deleteError);
        continue;
      }

      // Generate new visual blocks
      const newBlocks = generateBlocksForTemplate(t as Template);

      // Insert new blocks
      const { error: insertError } = await supabase
        .from("template_blocks")
        .insert(newBlocks);

      if (insertError) {
        console.error(`Failed to insert blocks for ${t.slug}:`, insertError);
        continue;
      }

      totalBlocks += newBlocks.length;
      upgradedCount++;
      console.log(`✅ ${t.slug}: ${newBlocks.length} visual blocks`);
    }

    // Clear template preview cache since blocks changed
    const { error: cacheError } = await supabase
      .from("template_previews")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all

    if (cacheError) {
      console.warn("Failed to clear preview cache:", cacheError);
    } else {
      console.log("Cleared template preview cache");
    }

    // Bump template versions to invalidate client caches
    const { error: versionError } = await supabase
      .from("templates")
      .update({ version: 2, updated_at: new Date().toISOString() })
      .neq("slug", "visual-blocks-showcase");

    if (versionError) {
      console.warn("Failed to bump template versions:", versionError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Upgraded ${upgradedCount} templates with ${totalBlocks} visual blocks`,
        upgraded: upgradedCount,
        totalBlocks,
        skipped,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Upgrade error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
