/**
 * Supply Chain KPI Dashboard — Example template seed
 * 
 * Insert into `templates` table via Supabase dashboard or seed script.
 * Then insert the blocks into `template_blocks`.
 * 
 * Uses the new block types: kpi_dashboard, chart_block (stacked_bar), stat_block
 */

export const SUPPLY_CHAIN_KPI_TEMPLATE = {
  // ── Template row (insert into `templates` table) ──
  template: {
    slug: "supply-chain-kpi-dashboard",
    title: "Supply Chain KPI Dashboard",
    description: "Quarterly supply chain performance dashboard with KPI cards, return analysis, and operational health metrics.",
    category: "Projects and Operations",
    tags: ["kpi", "dashboard", "supply chain", "operations", "metrics", "logistics"],
    is_featured: true,
    default_theme_id: "classic",
    version: 1,
  },

  // ── Template blocks (insert into `template_blocks` table) ──
  // Set template_id to the UUID of the template row after inserting it.
  blocks: [
    {
      type: "hero_header",
      order_index: 0,
      block_payload: {
        heading: "Supply Chain KPI Dashboard",
        subheading: "Quarterly Performance Review — Q4 2024",
        backgroundStyle: "gradient",
      },
      block_meta: {
        sectionIndex: 0,
        purpose: "title-slide",
      },
    },
    {
      type: "kpi_dashboard",
      order_index: 1,
      block_payload: {
        title: "Key Performance Indicators",
        cards: [
          {
            title: "Cash-to-Cash Cycle",
            value: "64.3 days",
            change: "-2.1 days",
            trend: "down",
            chartType: "area",
            chartData: [72, 70, 68, 66, 64],
            color: "#14b8a6",
          },
          {
            title: "Perfect Order Rate",
            value: "94%",
            change: "+3%",
            trend: "up",
            chartType: "donut",
            chartData: [94, 6],
            color: "#06b6d4",
          },
          {
            title: "Inventory Turnover",
            value: "6.6x",
            change: "+0.7",
            trend: "up",
            chartType: "bar",
            chartData: [5.7, 5.9, 6.2, 6.5, 6.6],
            color: "#0ea5e9",
          },
          {
            title: "Order Picking Cost",
            value: "50%",
            change: "—",
            trend: "neutral",
            chartType: "donut",
            chartData: [50, 50],
            color: "#6366f1",
          },
        ],
      },
      block_meta: {
        sectionIndex: 1,
        purpose: "kpi-overview",
      },
    },
    {
      type: "chart_block",
      order_index: 2,
      block_payload: {
        title: "Reasons for Return",
        chartType: "stacked_bar",
        data: [
          { label: "Does Not Fit", value: 41 },
          { label: "Defective", value: 28 },
          { label: "Not As Expected", value: 14 },
          { label: "Damaged", value: 7 },
          { label: "No Longer Needed", value: 6 },
          { label: "Wrong Item", value: 4 },
        ],
      },
      block_meta: {
        sectionIndex: 2,
        purpose: "return-analysis",
      },
    },
    {
      type: "stat_block",
      order_index: 3,
      block_payload: {
        title: "Supply Chain Health",
        stats: [
          { value: "8.3%", label: "Supply Chain Cost vs Sales" },
          { value: "78%", label: "On-Time Delivery Rate" },
          { value: "549", label: "Within Time Limit" },
          { value: "73", label: "Out of Time Limit" },
        ],
      },
      block_meta: {
        sectionIndex: 3,
        purpose: "health-metrics",
      },
    },
    {
      type: "chart_block",
      order_index: 4,
      block_payload: {
        title: "Supply Chain Cost Trend",
        chartType: "area",
        data: [
          { label: "Q1 '23", value: 9.1 },
          { label: "Q2 '23", value: 8.8 },
          { label: "Q3 '23", value: 8.7 },
          { label: "Q4 '23", value: 8.5 },
          { label: "Q1 '24", value: 8.6 },
          { label: "Q2 '24", value: 8.4 },
          { label: "Q3 '24", value: 8.5 },
          { label: "Q4 '24", value: 8.3 },
        ],
        xLabel: "Quarter",
        yLabel: "Cost % of Revenue",
      },
      block_meta: {
        sectionIndex: 4,
        purpose: "cost-trend",
      },
    },
    {
      type: "kpi_dashboard",
      order_index: 5,
      block_payload: {
        title: "Warehouse Operations",
        cards: [
          {
            title: "Pick Accuracy",
            value: "99.2%",
            change: "+0.3%",
            trend: "up",
            chartType: "area",
            chartData: [98.5, 98.7, 98.9, 99.0, 99.2],
            color: "#10b981",
          },
          {
            title: "Dock-to-Stock Time",
            value: "4.2 hrs",
            change: "-0.8 hrs",
            trend: "down",
            chartType: "bar",
            chartData: [6.0, 5.5, 5.0, 4.8, 4.2],
            color: "#f59e0b",
          },
          {
            title: "Capacity Utilization",
            value: "87%",
            change: "+5%",
            trend: "up",
            chartType: "donut",
            chartData: [87, 13],
            color: "#8b5cf6",
          },
          {
            title: "Cost per Order",
            value: "$3.42",
            change: "-$0.18",
            trend: "down",
            chartType: "area",
            chartData: [3.90, 3.78, 3.65, 3.55, 3.42],
            color: "#ef4444",
          },
        ],
      },
      block_meta: {
        sectionIndex: 5,
        purpose: "warehouse-kpis",
      },
    },
    {
      type: "chart_block",
      order_index: 6,
      block_payload: {
        title: "Inventory Turnover by Category",
        chartType: "bar",
        data: [
          { label: "Raw Materials", value: 8.2 },
          { label: "WIP", value: 5.4 },
          { label: "Finished Goods", value: 6.6 },
          { label: "MRO", value: 3.1 },
          { label: "Packaging", value: 11.2 },
        ],
        xLabel: "Category",
        yLabel: "Turns / Year",
      },
      block_meta: {
        sectionIndex: 6,
        purpose: "inventory-breakdown",
      },
    },
    {
      type: "chart_block",
      order_index: 7,
      block_payload: {
        title: "Delivery Performance Distribution",
        chartType: "donut",
        data: [
          { label: "On Time", value: 78 },
          { label: "1-2 Days Late", value: 12 },
          { label: "3-5 Days Late", value: 6 },
          { label: "5+ Days Late", value: 4 },
        ],
        colors: ["#14b8a6", "#f59e0b", "#f97316", "#ef4444"],
      },
      block_meta: {
        sectionIndex: 7,
        purpose: "delivery-distribution",
      },
    },
    {
      type: "cta_section",
      order_index: 8,
      block_payload: {
        heading: "Next Steps",
        subheading: "Focus areas for Q1 2025: reduce dock-to-stock time to under 4 hours, improve on-time delivery to 85%, and pilot automated returns processing.",
        primaryCta: { text: "View Full Report" },
        secondaryCta: { text: "Export Dashboard" },
      },
      block_meta: {
        sectionIndex: 8,
        purpose: "next-steps",
      },
    },
  ],
};

/**
 * SQL helper — run in Supabase SQL editor to insert this template.
 * Replace the UUIDs as needed.
 *
 * -- 1. Insert template
 * INSERT INTO templates (slug, title, description, category, tags, is_featured, default_theme_id, version)
 * VALUES (
 *   'supply-chain-kpi-dashboard',
 *   'Supply Chain KPI Dashboard',
 *   'Quarterly supply chain performance dashboard with KPI cards, return analysis, and operational health metrics.',
 *   'Projects and Operations',
 *   ARRAY['kpi', 'dashboard', 'supply chain', 'operations', 'metrics', 'logistics'],
 *   true,
 *   'classic',
 *   1
 * );
 *
 * -- 2. Get the template ID
 * -- SELECT id FROM templates WHERE slug = 'supply-chain-kpi-dashboard';
 *
 * -- 3. Insert blocks (repeat for each block, setting template_id)
 * -- INSERT INTO template_blocks (template_id, type, order_index, block_payload, block_meta)
 * -- VALUES ('<template-uuid>', 'kpi_dashboard', 1, '<json>', '<json>');
 */
