/**
 * Static seed data for 4 example decks showcasing AXORA output quality.
 * These are inserted into templates table with "example-deck" tag.
 */

export interface ExampleDeckSeed {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  default_theme_id: string;
  blocks: Array<{
    type: string;
    order_index: number;
    content: Record<string, unknown>;
    block_meta: Record<string, unknown>;
  }>;
}

export const EXAMPLE_DECKS: ExampleDeckSeed[] = [
  // ── 1. MediFlow AI — Investor Pitch (Healthcare SaaS, 10 slides) ───
  {
    slug: 'example-mediflow-investor-pitch',
    title: 'MediFlow AI — Investor Pitch',
    description: 'Series A pitch deck for a healthcare SaaS startup. 10 slides with market data, traction metrics, and financial projections.',
    category: 'Startup and Fundraising',
    tags: ['example-deck', 'investor pitch', 'healthcare', 'saas', 'series-a'],
    is_featured: true,
    default_theme_id: 'ocean',
    blocks: [
      { type: 'hero_header', order_index: 0, content: { title: 'MediFlow AI', subtitle: 'AI-Powered Clinical Workflow Automation', tagline: 'Reducing administrative burden by 60% for healthcare providers' }, block_meta: { sectionIndex: 0, purpose: 'title-slide' } },
      { type: 'exec_summary', order_index: 1, content: { title: 'The Problem', points: ['Clinicians spend 49% of time on documentation, not patients', 'EHR systems create $150B in annual administrative waste', '78% of physicians report burnout from paperwork', 'Current solutions automate forms — not clinical reasoning'] }, block_meta: { sectionIndex: 1, purpose: 'problem' } },
      { type: 'three_pillars', order_index: 2, content: { title: 'Our Solution', pillars: [{ heading: 'AI Scribe', description: 'Real-time clinical note generation from patient conversations with 98.7% accuracy' }, { heading: 'Smart Routing', description: 'Automated prior authorization and referral workflows that cut approval time from 14 days to 2 hours' }, { heading: 'Insight Engine', description: 'Population health analytics surfacing care gaps and risk stratification across patient panels' }] }, block_meta: { sectionIndex: 2, purpose: 'solution' } },
      { type: 'stat_block', order_index: 3, content: { title: 'Market Opportunity', stats: [{ value: '$340B', label: 'Healthcare IT Market (2027)' }, { value: '23%', label: 'CAGR for Clinical AI' }, { value: '6,000+', label: 'US Health Systems' }, { value: '$86B', label: 'Addressable Market' }] }, block_meta: { sectionIndex: 3, purpose: 'market' } },
      { type: 'comparison_table', order_index: 4, content: { title: 'Product Overview', headers: ['Feature', 'MediFlow AI', 'Legacy EHR Add-ons', 'Manual Process'], rows: [['Note Generation', '✅ Real-time AI', '⚠️ Template-based', '❌ Manual typing'], ['Prior Auth', '✅ Automated 2hr', '⚠️ Semi-auto 3 days', '❌ 14+ days'], ['Analytics', '✅ Predictive', '⚠️ Retrospective', '❌ None'], ['Integration', '✅ Any EHR via FHIR', '⚠️ Vendor lock-in', '❌ N/A']] }, block_meta: { sectionIndex: 4, purpose: 'product' } },
      { type: 'stat_block', order_index: 5, content: { title: 'Traction', stats: [{ value: '127', label: 'Active Clinics' }, { value: '$2.4M', label: 'ARR' }, { value: '340%', label: 'YoY Growth' }, { value: '94%', label: 'Net Retention' }] }, block_meta: { sectionIndex: 5, purpose: 'traction' } },
      { type: 'timeline_block', order_index: 6, content: { title: 'Go-to-Market Strategy', items: [{ date: 'Q1 2025', title: 'Enterprise Pilot Program', description: 'Launch with 5 health system partnerships' }, { date: 'Q2 2025', title: 'Channel Partnerships', description: 'EHR marketplace integrations (Epic, Cerner)' }, { date: 'Q3 2025', title: 'Specialty Expansion', description: 'Cardiology and oncology-specific modules' }, { date: 'Q4 2025', title: 'International', description: 'UK NHS and Canadian market entry' }] }, block_meta: { sectionIndex: 6, purpose: 'gtm' } },
      { type: 'card_grid', order_index: 7, content: { title: 'Leadership Team', cards: [{ title: 'Dr. Sarah Chen', description: 'CEO — Former VP Product at Epic Systems. MD/MBA Stanford.' }, { title: 'James Rodriguez', description: 'CTO — Ex-Google Health, 15 yrs ML in healthcare.' }, { title: 'Priya Patel', description: 'COO — Scaled Veeva from $50M to $500M ARR.' }, { title: 'Dr. Michael Torres', description: 'CMO — Chief of Medicine, Mount Sinai. Clinical AI researcher.' }] }, block_meta: { sectionIndex: 7, purpose: 'team' } },
      { type: 'chart_block', order_index: 8, content: { title: 'Financial Projections', chartType: 'bar', data: [{ name: '2024', value: 2400 }, { name: '2025', value: 8200 }, { name: '2026', value: 22000 }, { name: '2027', value: 48000 }], xLabel: 'Year', yLabel: 'ARR ($K)' }, block_meta: { sectionIndex: 8, purpose: 'financials' } },
      { type: 'cta_section', order_index: 9, content: { title: 'The Ask', description: 'Raising $15M Series A to accelerate enterprise sales, expand engineering, and enter 3 new specialties.', primaryCta: 'Schedule Deep Dive', secondaryCta: 'Download Data Room' }, block_meta: { sectionIndex: 9, purpose: 'ask' } },
    ],
  },

  // ── 2. FinTech Capital — Board Update (Finance, 8 slides) ───
  {
    slug: 'example-fintech-board-update',
    title: 'FinTech Capital Partners — Board Update',
    description: 'Q4 board report for a fintech holding company. 8 slides covering performance, risks, and strategic outlook.',
    category: 'Strategy and Leadership',
    tags: ['example-deck', 'board update', 'finance', 'quarterly'],
    is_featured: true,
    default_theme_id: 'executive',
    blocks: [
      { type: 'hero_header', order_index: 0, content: { title: 'FinTech Capital Partners', subtitle: 'Q4 2024 Board Update', tagline: 'Confidential — Board Members Only' }, block_meta: { sectionIndex: 0, purpose: 'title-slide' } },
      { type: 'exec_summary', order_index: 1, content: { title: 'Executive Summary', points: ['Revenue grew 18% QoQ to $34.2M, exceeding target by 7%', 'Three portfolio companies achieved profitability milestone', 'Risk exposure reduced by 22% through hedging strategy refinement', 'Board approval sought for Series C co-investment in NeoBank platform'] }, block_meta: { sectionIndex: 1, purpose: 'summary' } },
      { type: 'stat_block', order_index: 2, content: { title: 'Q4 Performance Highlights', stats: [{ value: '$34.2M', label: 'Revenue (+18% QoQ)' }, { value: '$8.1M', label: 'EBITDA (+24%)' }, { value: '2.3x', label: 'MOIC (Fund II)' }, { value: '12', label: 'Active Portfolio Cos' }] }, block_meta: { sectionIndex: 2, purpose: 'kpis' } },
      { type: 'chart_block', order_index: 3, content: { title: 'Revenue Trend — Last 8 Quarters', chartType: 'line', data: [{ name: 'Q1-23', value: 18500 }, { name: 'Q2-23', value: 20100 }, { name: 'Q3-23', value: 22400 }, { name: 'Q4-23', value: 24800 }, { name: 'Q1-24', value: 26200 }, { name: 'Q2-24', value: 28900 }, { name: 'Q3-24', value: 29000 }, { name: 'Q4-24', value: 34200 }], xLabel: 'Quarter', yLabel: 'Revenue ($K)' }, block_meta: { sectionIndex: 3, purpose: 'performance' } },
      { type: 'decision_summary', order_index: 4, content: { title: 'Strategic Initiatives Update', recommendation: 'Proceed with Phase 2 of digital lending platform expansion', rationale: 'Phase 1 delivered 3.2x ROI within 6 months. Market conditions favorable for accelerated deployment.', risks: ['Regulatory uncertainty in EU markets', 'Key hire dependency for compliance team'], confidence: 85 }, block_meta: { sectionIndex: 4, purpose: 'strategic-initiatives' } },
      { type: 'evidence_map', order_index: 5, content: { title: 'Risk Assessment', categories: [{ name: 'Market Risk', items: [{ claim: 'Interest rate volatility', evidence: 'Fed signaling 2 rate cuts in 2025', impact: 'medium' }, { claim: 'Crypto market correlation', evidence: '15% portfolio exposure to digital assets', impact: 'high' }] }, { name: 'Operational Risk', items: [{ claim: 'Talent retention', evidence: '92% retention rate, above industry avg', impact: 'low' }, { claim: 'Vendor concentration', evidence: '3 critical vendors, 2 with alternatives', impact: 'medium' }] }] }, block_meta: { sectionIndex: 5, purpose: 'risks' } },
      { type: 'timeline_block', order_index: 6, content: { title: 'Q1 2025 Roadmap', items: [{ date: 'Jan', title: 'Fund III Close', description: 'Target: $250M final close' }, { date: 'Feb', title: 'NeoBank Co-Investment', description: 'Due diligence completion and term sheet' }, { date: 'Mar', title: 'Annual LP Meeting', description: 'Portfolio review and strategy presentation' }] }, block_meta: { sectionIndex: 6, purpose: 'forward-look' } },
      { type: 'cta_section', order_index: 7, content: { title: 'Board Resolutions Required', description: 'Approval of Q1 investment pipeline ($45M committed capital) and updated risk framework.', primaryCta: 'Approve Resolutions', secondaryCta: 'Request Additional Data' }, block_meta: { sectionIndex: 7, purpose: 'next-steps' } },
    ],
  },

  // ── 3. CloudSync — GTM Strategy (B2B SaaS, 12 slides) ───
  {
    slug: 'example-cloudsync-gtm-strategy',
    title: 'CloudSync Enterprise — GTM Strategy',
    description: 'Go-to-market plan for a B2B SaaS data integration platform. 12 slides from ICP definition to budget allocation.',
    category: 'Sales and Marketing',
    tags: ['example-deck', 'gtm strategy', 'b2b saas', 'sales'],
    is_featured: true,
    default_theme_id: 'midnight',
    blocks: [
      { type: 'hero_header', order_index: 0, content: { title: 'CloudSync Enterprise', subtitle: '2025 Go-to-Market Strategy', tagline: 'Winning the mid-market data integration space' }, block_meta: { sectionIndex: 0 } },
      { type: 'stat_block', order_index: 1, content: { title: 'Market Opportunity', stats: [{ value: '$12.4B', label: 'Data Integration Market' }, { value: '19%', label: 'Annual Growth Rate' }, { value: '45K', label: 'Target Companies (US)' }, { value: '$2.1B', label: 'Our Addressable Segment' }] }, block_meta: { sectionIndex: 1 } },
      { type: 'card_grid', order_index: 2, content: { title: 'Ideal Customer Profile', cards: [{ title: 'Company Size', description: '200–2,000 employees. $50M–$500M revenue. Growing data complexity.' }, { title: 'Industry Focus', description: 'Healthcare, Financial Services, E-commerce. Data-heavy verticals.' }, { title: 'Tech Stack', description: 'Multi-cloud (AWS + Azure). 5+ SaaS tools. Legacy data warehouse.' }, { title: 'Buying Trigger', description: 'Failed migration, compliance audit, or new CTO mandate for data modernization.' }] }, block_meta: { sectionIndex: 2 } },
      { type: 'three_pillars', order_index: 3, content: { title: 'Value Proposition', pillars: [{ heading: '10x Faster Setup', description: 'Pre-built connectors for 200+ data sources. Average deployment: 2 weeks vs 3 months.' }, { heading: 'Zero-Code Pipelines', description: 'Visual pipeline builder that business analysts can use. No engineering bottleneck.' }, { heading: 'Enterprise Security', description: 'SOC 2 Type II, HIPAA compliant, end-to-end encryption. No data leaves your VPC.' }] }, block_meta: { sectionIndex: 3 } },
      { type: 'comparison_table', order_index: 4, content: { title: 'Competitive Positioning', headers: ['Capability', 'CloudSync', 'Fivetran', 'Informatica'], rows: [['Setup Time', '2 weeks', '4 weeks', '3+ months'], ['Price (Mid-Market)', '$2K/mo', '$4K/mo', '$15K/mo'], ['No-Code Builder', '✅ Full', '⚠️ Limited', '❌ Developer-only'], ['On-Prem Support', '✅ Hybrid', '❌ Cloud-only', '✅ Full'], ['Real-time Sync', '✅ Sub-second', '✅ 5-min intervals', '✅ Near-real-time']] }, block_meta: { sectionIndex: 4 } },
      { type: 'two_by_two_matrix', order_index: 5, content: { title: 'Pricing Strategy', xAxis: 'Deployment Complexity', yAxis: 'Data Volume', quadrants: [{ label: 'Starter', position: 'bottom-left', description: '$999/mo — Up to 50 connectors, 10M rows/mo' }, { label: 'Professional', position: 'bottom-right', description: '$2,499/mo — Unlimited connectors, 100M rows/mo' }, { label: 'Enterprise', position: 'top-right', description: 'Custom — Dedicated infrastructure, SLA guarantees' }, { label: 'Self-Serve', position: 'top-left', description: '$499/mo — 10 connectors, 1M rows/mo, community support' }] }, block_meta: { sectionIndex: 5 } },
      { type: 'decision_next_steps', order_index: 6, content: { title: 'Channel Strategy', decisions: [{ action: 'Direct Sales Team', detail: '8 AEs targeting healthcare and fintech verticals. $500K+ ACV deals.' }, { action: 'Partner Channel', detail: 'SI partnerships with Accenture, Deloitte for enterprise co-sell.' }, { action: 'Product-Led Growth', detail: 'Free tier → self-serve upgrade. Target: 30% of pipeline from PLG by Q3.' }, { action: 'Content Marketing', detail: 'SEO, case studies, webinars. Target: 5K MQLs/quarter.' }] }, block_meta: { sectionIndex: 6 } },
      { type: 'exec_summary', order_index: 7, content: { title: 'Sales Playbook Highlights', points: ['Discovery call framework: 3 qualifying questions in first 10 minutes', 'Technical POC: 14-day guided trial with dedicated SE', 'Champion enablement: ROI calculator + internal pitch deck for buyers', 'Close timeline: 45-day average for mid-market, 90 days for enterprise'] }, block_meta: { sectionIndex: 7 } },
      { type: 'timeline_block', order_index: 8, content: { title: 'Marketing Milestones', items: [{ date: 'Q1', title: 'Brand Launch', description: 'Website relaunch, analyst briefings, launch event' }, { date: 'Q2', title: 'Content Engine', description: '12 case studies, 6 webinars, SEO foundation' }, { date: 'Q3', title: 'Event Circuit', description: 'Snowflake Summit, AWS re:Invent, industry conferences' }, { date: 'Q4', title: 'Customer Summit', description: 'First annual CloudSync Connect user conference' }] }, block_meta: { sectionIndex: 8 } },
      { type: 'chart_block', order_index: 9, content: { title: 'Budget Allocation', chartType: 'bar', data: [{ name: 'Sales Team', value: 2400 }, { name: 'Marketing', value: 1800 }, { name: 'Partnerships', value: 600 }, { name: 'PLG/Product', value: 900 }, { name: 'Events', value: 500 }], xLabel: 'Category', yLabel: 'Budget ($K)' }, block_meta: { sectionIndex: 9 } },
      { type: 'scenario_set', order_index: 10, content: { title: 'Growth Scenarios', scenarios: [{ name: 'Conservative', description: '120 new customers, $6M new ARR. Assumes 60% quota attainment.', probability: 25 }, { name: 'Base Case', description: '200 new customers, $10M new ARR. Assumes 80% quota attainment + PLG traction.', probability: 50 }, { name: 'Aggressive', description: '300 new customers, $16M new ARR. Requires all channels firing + 2 large enterprise deals.', probability: 25 }] }, block_meta: { sectionIndex: 10 } },
      { type: 'recommendation_panel', order_index: 11, content: { title: 'Next Steps', recommendation: 'Approve Q1 hiring plan (8 AEs + 3 SEs) and $1.8M marketing budget', supportingPoints: ['Pipeline coverage currently at 2.1x — needs 3.5x for base case', 'Competitor Fivetran raised $565M — window for mid-market positioning is narrowing', 'Three enterprise POCs in progress — need SE capacity to convert'], owner: 'VP Sales & CMO', deadline: 'Board approval by Jan 15' }, block_meta: { sectionIndex: 11 } },
    ],
  },

  // ── 4. City Innovation Lab — Quarterly Review (Government, 9 slides) ───
  {
    slug: 'example-city-innovation-quarterly',
    title: 'City Innovation Lab — Quarterly Review',
    description: 'Q1 performance review for a municipal innovation program. 9 slides covering KPIs, program updates, and stakeholder feedback.',
    category: 'Projects and Operations',
    tags: ['example-deck', 'quarterly review', 'government', 'public sector'],
    is_featured: true,
    default_theme_id: 'forest',
    blocks: [
      { type: 'hero_header', order_index: 0, content: { title: 'City Innovation Lab', subtitle: 'Q1 2025 Quarterly Review', tagline: 'Building a smarter, more responsive city government' }, block_meta: { sectionIndex: 0 } },
      { type: 'exec_summary', order_index: 1, content: { title: 'Mission Recap', points: ['Accelerate digital transformation across 12 city departments', 'Reduce citizen service wait times by 50% through process automation', 'Launch 3 pilot programs per quarter testing emerging technologies', 'Build internal innovation capacity through training and mentorship'] }, block_meta: { sectionIndex: 1 } },
      { type: 'card_grid', order_index: 2, content: { title: 'Q1 Highlights', cards: [{ title: '311 AI Chatbot', description: 'Launched AI-powered citizen service bot. Handling 34% of inquiries autonomously.' }, { title: 'Permit Automation', description: 'Reduced building permit processing from 21 days to 7 days.' }, { title: 'Open Data Portal', description: '47 new datasets published. 12K monthly active users (+89%).' }, { title: 'Smart Traffic Pilot', description: 'AI signal optimization in 3 corridors. 18% reduction in commute times.' }] }, block_meta: { sectionIndex: 2 } },
      { type: 'stat_block', order_index: 3, content: { title: 'Key Performance Indicators', stats: [{ value: '34%', label: 'Inquiries Automated' }, { value: '67%', label: 'Permit Time Reduction' }, { value: '4.2/5', label: 'Citizen Satisfaction' }, { value: '$2.1M', label: 'Estimated Annual Savings' }] }, block_meta: { sectionIndex: 3 } },
      { type: 'timeline_block', order_index: 4, content: { title: 'Program Updates', items: [{ date: 'Jan', title: '311 AI Chatbot — Live', description: 'Deployed to production. Handling water, waste, and parks inquiries.' }, { date: 'Feb', title: 'Permit System v2', description: 'Integrated with GIS for automated zoning checks.' }, { date: 'Mar', title: 'Data Literacy Training', description: '120 city employees completed analytics bootcamp (cohort 3).' }] }, block_meta: { sectionIndex: 4 } },
      { type: 'chart_block', order_index: 5, content: { title: 'Budget Status', chartType: 'bar', data: [{ name: 'Personnel', value: 420 }, { name: 'Technology', value: 380 }, { name: 'Training', value: 95 }, { name: 'Pilots', value: 210 }, { name: 'Contingency', value: 145 }], xLabel: 'Category', yLabel: 'Spend ($K)' }, block_meta: { sectionIndex: 5 } },
      { type: 'evidence_map', order_index: 6, content: { title: 'Stakeholder Feedback', categories: [{ name: 'Citizens', items: [{ claim: 'Service speed improved', evidence: '4.2/5 satisfaction score (up from 3.6)', impact: 'high' }, { claim: 'Digital access gap', evidence: '22% of residents lack broadband', impact: 'medium' }] }, { name: 'Department Heads', items: [{ claim: 'Innovation capacity growing', evidence: '8 departments now have designated innovation leads', impact: 'high' }, { claim: 'Change resistance', evidence: '3 departments delayed pilot adoption', impact: 'medium' }] }] }, block_meta: { sectionIndex: 6 } },
      { type: 'decision_next_steps', order_index: 7, content: { title: 'Q2 Goals', decisions: [{ action: 'Expand 311 AI to 5 more service categories', detail: 'Target: 50% autonomous resolution rate by end of Q2' }, { action: 'Launch predictive maintenance pilot', detail: 'IoT sensors on 200 water mains in aging infrastructure zones' }, { action: 'Digital equity initiative', detail: 'Partner with libraries for 15 public Wi-Fi + digital literacy hubs' }, { action: 'Innovation fellowship program', detail: 'Recruit 4 fellows from local universities for summer projects' }] }, block_meta: { sectionIndex: 7 } },
      { type: 'cta_section', order_index: 8, content: { title: 'Contact & Resources', description: 'For questions about the Innovation Lab or to propose a pilot project, reach out to the team.', primaryCta: 'Submit Pilot Proposal', secondaryCta: 'View Open Data Portal' }, block_meta: { sectionIndex: 8 } },
    ],
  },
];

/**
 * Metadata for display in the ExampleDecks showcase component.
 * This is used for client-side rendering before DB data loads.
 */
export const EXAMPLE_DECK_META = [
  {
    slug: 'example-mediflow-investor-pitch',
    title: 'MediFlow AI — Investor Pitch',
    industry: 'Healthcare SaaS',
    deckType: 'Investor Pitch',
    slideCount: 10,
    theme: 'ocean',
  },
  {
    slug: 'example-fintech-board-update',
    title: 'FinTech Capital — Board Update',
    industry: 'Finance',
    deckType: 'Board Update',
    slideCount: 8,
    theme: 'executive',
  },
  {
    slug: 'example-cloudsync-gtm-strategy',
    title: 'CloudSync — GTM Strategy',
    industry: 'B2B SaaS',
    deckType: 'GTM Strategy',
    slideCount: 12,
    theme: 'midnight',
  },
  {
    slug: 'example-city-innovation-quarterly',
    title: 'City Innovation Lab — Q1 Review',
    industry: 'Government',
    deckType: 'Quarterly Review',
    slideCount: 9,
    theme: 'forest',
  },
] as const;
