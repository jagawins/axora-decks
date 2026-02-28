import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if example decks already exist
    const { data: existing } = await supabase
      .from("templates")
      .select("slug")
      .like("slug", "example-%");

    if (existing && existing.length >= 4) {
      return new Response(
        JSON.stringify({ success: true, message: "Example decks already seeded", count: existing.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete any partial example decks first
    if (existing && existing.length > 0) {
      const slugs = existing.map((e: any) => e.slug);
      // Get template IDs
      const { data: tplIds } = await supabase
        .from("templates")
        .select("id")
        .in("slug", slugs);
      if (tplIds && tplIds.length > 0) {
        const ids = tplIds.map((t: any) => t.id);
        await supabase.from("template_blocks").delete().in("template_id", ids);
        await supabase.from("templates").delete().in("id", ids);
      }
    }

    // Example deck data
    const decks = [
      {
        template: { slug: "example-mediflow-investor-pitch", title: "MediFlow AI — Investor Pitch", description: "Series A pitch deck for a healthcare SaaS startup. 10 slides with market data, traction metrics, and financial projections.", category: "Startup and Fundraising", tags: ["example-deck", "investor pitch", "healthcare", "saas", "series-a"], is_featured: true, default_theme_id: "ocean" },
        blocks: [
          { type: "hero_header", order_index: 0, content: { title: "MediFlow AI", subtitle: "AI-Powered Clinical Workflow Automation", tagline: "Reducing administrative burden by 60% for healthcare providers" }, block_payload: { title: "MediFlow AI", subtitle: "AI-Powered Clinical Workflow Automation", tagline: "Reducing administrative burden by 60% for healthcare providers" }, block_meta: { sectionIndex: 0 } },
          { type: "exec_summary", order_index: 1, content: { title: "The Problem", points: ["Clinicians spend 49% of time on documentation", "EHR systems create $150B in annual administrative waste", "78% of physicians report burnout from paperwork", "Current solutions automate forms — not clinical reasoning"] }, block_payload: { title: "The Problem", points: ["Clinicians spend 49% of time on documentation", "EHR systems create $150B in annual administrative waste", "78% of physicians report burnout from paperwork", "Current solutions automate forms — not clinical reasoning"] }, block_meta: { sectionIndex: 1 } },
          { type: "three_pillars", order_index: 2, content: { title: "Our Solution", pillars: [{ heading: "AI Scribe", description: "Real-time clinical note generation with 98.7% accuracy" }, { heading: "Smart Routing", description: "Automated prior auth cutting approval from 14 days to 2 hours" }, { heading: "Insight Engine", description: "Population health analytics surfacing care gaps" }] }, block_payload: { title: "Our Solution", pillars: [{ heading: "AI Scribe", description: "Real-time clinical note generation with 98.7% accuracy" }, { heading: "Smart Routing", description: "Automated prior auth cutting approval from 14 days to 2 hours" }, { heading: "Insight Engine", description: "Population health analytics surfacing care gaps" }] }, block_meta: { sectionIndex: 2 } },
          { type: "stat_block", order_index: 3, content: { title: "Market Opportunity", stats: [{ value: "$340B", label: "Healthcare IT Market (2027)" }, { value: "23%", label: "CAGR for Clinical AI" }, { value: "6,000+", label: "US Health Systems" }, { value: "$86B", label: "Addressable Market" }] }, block_payload: { title: "Market Opportunity", stats: [{ value: "$340B", label: "Healthcare IT Market (2027)" }, { value: "23%", label: "CAGR for Clinical AI" }, { value: "6,000+", label: "US Health Systems" }, { value: "$86B", label: "Addressable Market" }] }, block_meta: { sectionIndex: 3 } },
          { type: "comparison_table", order_index: 4, content: { title: "Product Overview", headers: ["Feature", "MediFlow AI", "Legacy EHR", "Manual"], rows: [["Note Generation", "✅ Real-time AI", "⚠️ Template-based", "❌ Manual"], ["Prior Auth", "✅ 2hr auto", "⚠️ 3 days", "❌ 14+ days"], ["Analytics", "✅ Predictive", "⚠️ Retrospective", "❌ None"]] }, block_payload: { title: "Product Overview", headers: ["Feature", "MediFlow AI", "Legacy EHR", "Manual"], rows: [["Note Generation", "✅ Real-time AI", "⚠️ Template-based", "❌ Manual"], ["Prior Auth", "✅ 2hr auto", "⚠️ 3 days", "❌ 14+ days"], ["Analytics", "✅ Predictive", "⚠️ Retrospective", "❌ None"]] }, block_meta: { sectionIndex: 4 } },
          { type: "stat_block", order_index: 5, content: { title: "Traction", stats: [{ value: "127", label: "Active Clinics" }, { value: "$2.4M", label: "ARR" }, { value: "340%", label: "YoY Growth" }, { value: "94%", label: "Net Retention" }] }, block_payload: { title: "Traction", stats: [{ value: "127", label: "Active Clinics" }, { value: "$2.4M", label: "ARR" }, { value: "340%", label: "YoY Growth" }, { value: "94%", label: "Net Retention" }] }, block_meta: { sectionIndex: 5 } },
          { type: "timeline_block", order_index: 6, content: { title: "Go-to-Market Strategy", items: [{ date: "Q1 2025", title: "Enterprise Pilot", description: "5 health system partnerships" }, { date: "Q2 2025", title: "Channel Partnerships", description: "Epic and Cerner marketplace" }, { date: "Q3 2025", title: "Specialty Expansion", description: "Cardiology and oncology modules" }] }, block_payload: { title: "Go-to-Market Strategy", items: [{ date: "Q1 2025", title: "Enterprise Pilot", description: "5 health system partnerships" }, { date: "Q2 2025", title: "Channel Partnerships", description: "Epic and Cerner marketplace" }, { date: "Q3 2025", title: "Specialty Expansion", description: "Cardiology and oncology modules" }] }, block_meta: { sectionIndex: 6 } },
          { type: "card_grid", order_index: 7, content: { title: "Leadership Team", cards: [{ title: "Dr. Sarah Chen", description: "CEO — Former VP Product at Epic Systems" }, { title: "James Rodriguez", description: "CTO — Ex-Google Health, 15 yrs ML" }, { title: "Priya Patel", description: "COO — Scaled Veeva from $50M to $500M" }] }, block_payload: { title: "Leadership Team", cards: [{ title: "Dr. Sarah Chen", description: "CEO — Former VP Product at Epic Systems" }, { title: "James Rodriguez", description: "CTO — Ex-Google Health, 15 yrs ML" }, { title: "Priya Patel", description: "COO — Scaled Veeva from $50M to $500M" }] }, block_meta: { sectionIndex: 7 } },
          { type: "chart_block", order_index: 8, content: { title: "Financial Projections", chartType: "bar", data: [{ name: "2024", value: 2400 }, { name: "2025", value: 8200 }, { name: "2026", value: 22000 }, { name: "2027", value: 48000 }], xLabel: "Year", yLabel: "ARR ($K)" }, block_payload: { title: "Financial Projections", chartType: "bar", data: [{ name: "2024", value: 2400 }, { name: "2025", value: 8200 }, { name: "2026", value: 22000 }, { name: "2027", value: 48000 }], xLabel: "Year", yLabel: "ARR ($K)" }, block_meta: { sectionIndex: 8 } },
          { type: "cta_section", order_index: 9, content: { title: "The Ask", description: "Raising $15M Series A to accelerate enterprise sales and expand engineering.", primaryCta: "Schedule Deep Dive", secondaryCta: "Download Data Room" }, block_payload: { title: "The Ask", description: "Raising $15M Series A to accelerate enterprise sales and expand engineering.", primaryCta: "Schedule Deep Dive", secondaryCta: "Download Data Room" }, block_meta: { sectionIndex: 9 } },
        ]
      },
      {
        template: { slug: "example-fintech-board-update", title: "FinTech Capital Partners — Board Update", description: "Q4 board report for a fintech holding company. 8 slides covering performance, risks, and strategic outlook.", category: "Strategy and Leadership", tags: ["example-deck", "board update", "finance", "quarterly"], is_featured: true, default_theme_id: "executive" },
        blocks: [
          { type: "hero_header", order_index: 0, content: { title: "FinTech Capital Partners", subtitle: "Q4 2024 Board Update", tagline: "Confidential — Board Members Only" }, block_payload: { title: "FinTech Capital Partners", subtitle: "Q4 2024 Board Update", tagline: "Confidential — Board Members Only" }, block_meta: { sectionIndex: 0 } },
          { type: "exec_summary", order_index: 1, content: { title: "Executive Summary", points: ["Revenue grew 18% QoQ to $34.2M, exceeding target by 7%", "Three portfolio companies achieved profitability", "Risk exposure reduced by 22% through hedging refinement", "Board approval sought for Series C co-investment"] }, block_payload: { title: "Executive Summary", points: ["Revenue grew 18% QoQ to $34.2M, exceeding target by 7%", "Three portfolio companies achieved profitability", "Risk exposure reduced by 22% through hedging refinement", "Board approval sought for Series C co-investment"] }, block_meta: { sectionIndex: 1 } },
          { type: "stat_block", order_index: 2, content: { title: "Q4 Performance", stats: [{ value: "$34.2M", label: "Revenue (+18%)" }, { value: "$8.1M", label: "EBITDA (+24%)" }, { value: "2.3x", label: "MOIC (Fund II)" }, { value: "12", label: "Active Portfolio Cos" }] }, block_payload: { title: "Q4 Performance", stats: [{ value: "$34.2M", label: "Revenue (+18%)" }, { value: "$8.1M", label: "EBITDA (+24%)" }, { value: "2.3x", label: "MOIC (Fund II)" }, { value: "12", label: "Active Portfolio Cos" }] }, block_meta: { sectionIndex: 2 } },
          { type: "chart_block", order_index: 3, content: { title: "Revenue Trend", chartType: "line", data: [{ name: "Q1-23", value: 18500 }, { name: "Q2-23", value: 20100 }, { name: "Q3-23", value: 22400 }, { name: "Q4-23", value: 24800 }, { name: "Q1-24", value: 26200 }, { name: "Q2-24", value: 28900 }, { name: "Q3-24", value: 29000 }, { name: "Q4-24", value: 34200 }], xLabel: "Quarter", yLabel: "Revenue ($K)" }, block_payload: { title: "Revenue Trend", chartType: "line", data: [{ name: "Q1-23", value: 18500 }, { name: "Q2-23", value: 20100 }, { name: "Q3-23", value: 22400 }, { name: "Q4-23", value: 24800 }, { name: "Q1-24", value: 26200 }, { name: "Q2-24", value: 28900 }, { name: "Q3-24", value: 29000 }, { name: "Q4-24", value: 34200 }], xLabel: "Quarter", yLabel: "Revenue ($K)" }, block_meta: { sectionIndex: 3 } },
          { type: "decision_summary", order_index: 4, content: { title: "Strategic Initiatives", recommendation: "Proceed with Phase 2 of digital lending expansion", rationale: "Phase 1 delivered 3.2x ROI within 6 months.", risks: ["Regulatory uncertainty in EU", "Key hire dependency"], confidence: 85 }, block_payload: { title: "Strategic Initiatives", recommendation: "Proceed with Phase 2 of digital lending expansion", rationale: "Phase 1 delivered 3.2x ROI within 6 months.", risks: ["Regulatory uncertainty in EU", "Key hire dependency"], confidence: 85 }, block_meta: { sectionIndex: 4 } },
          { type: "evidence_map", order_index: 5, content: { title: "Risk Assessment", categories: [{ name: "Market Risk", items: [{ claim: "Interest rate volatility", evidence: "Fed signaling 2 rate cuts", impact: "medium" }] }, { name: "Operational Risk", items: [{ claim: "Talent retention", evidence: "92% retention rate", impact: "low" }] }] }, block_payload: { title: "Risk Assessment", categories: [{ name: "Market Risk", items: [{ claim: "Interest rate volatility", evidence: "Fed signaling 2 rate cuts", impact: "medium" }] }, { name: "Operational Risk", items: [{ claim: "Talent retention", evidence: "92% retention rate", impact: "low" }] }] }, block_meta: { sectionIndex: 5 } },
          { type: "timeline_block", order_index: 6, content: { title: "Q1 2025 Roadmap", items: [{ date: "Jan", title: "Fund III Close", description: "$250M final close" }, { date: "Feb", title: "NeoBank Co-Investment", description: "Due diligence completion" }, { date: "Mar", title: "Annual LP Meeting", description: "Portfolio review" }] }, block_payload: { title: "Q1 2025 Roadmap", items: [{ date: "Jan", title: "Fund III Close", description: "$250M final close" }, { date: "Feb", title: "NeoBank Co-Investment", description: "Due diligence completion" }, { date: "Mar", title: "Annual LP Meeting", description: "Portfolio review" }] }, block_meta: { sectionIndex: 6 } },
          { type: "cta_section", order_index: 7, content: { title: "Board Resolutions Required", description: "Approval of Q1 investment pipeline ($45M) and updated risk framework.", primaryCta: "Approve Resolutions", secondaryCta: "Request Data" }, block_payload: { title: "Board Resolutions Required", description: "Approval of Q1 investment pipeline ($45M) and updated risk framework.", primaryCta: "Approve Resolutions", secondaryCta: "Request Data" }, block_meta: { sectionIndex: 7 } },
        ]
      },
      {
        template: { slug: "example-cloudsync-gtm-strategy", title: "CloudSync Enterprise — GTM Strategy", description: "Go-to-market plan for a B2B SaaS data integration platform. 12 slides.", category: "Sales and Marketing", tags: ["example-deck", "gtm strategy", "b2b saas", "sales"], is_featured: true, default_theme_id: "midnight" },
        blocks: [
          { type: "hero_header", order_index: 0, content: { title: "CloudSync Enterprise", subtitle: "2025 Go-to-Market Strategy", tagline: "Winning the mid-market data integration space" }, block_payload: { title: "CloudSync Enterprise", subtitle: "2025 Go-to-Market Strategy", tagline: "Winning the mid-market data integration space" }, block_meta: { sectionIndex: 0 } },
          { type: "stat_block", order_index: 1, content: { title: "Market Opportunity", stats: [{ value: "$12.4B", label: "Data Integration Market" }, { value: "19%", label: "Annual Growth" }, { value: "45K", label: "Target Companies" }, { value: "$2.1B", label: "Addressable Segment" }] }, block_payload: { title: "Market Opportunity", stats: [{ value: "$12.4B", label: "Data Integration Market" }, { value: "19%", label: "Annual Growth" }, { value: "45K", label: "Target Companies" }, { value: "$2.1B", label: "Addressable Segment" }] }, block_meta: { sectionIndex: 1 } },
          { type: "card_grid", order_index: 2, content: { title: "Ideal Customer Profile", cards: [{ title: "Company Size", description: "200–2,000 employees. $50M–$500M revenue." }, { title: "Industry", description: "Healthcare, Financial Services, E-commerce." }, { title: "Tech Stack", description: "Multi-cloud. 5+ SaaS tools. Legacy warehouse." }] }, block_payload: { title: "Ideal Customer Profile", cards: [{ title: "Company Size", description: "200–2,000 employees. $50M–$500M revenue." }, { title: "Industry", description: "Healthcare, Financial Services, E-commerce." }, { title: "Tech Stack", description: "Multi-cloud. 5+ SaaS tools. Legacy warehouse." }] }, block_meta: { sectionIndex: 2 } },
          { type: "three_pillars", order_index: 3, content: { title: "Value Proposition", pillars: [{ heading: "10x Faster Setup", description: "200+ pre-built connectors. 2 weeks vs 3 months." }, { heading: "Zero-Code Pipelines", description: "Visual builder for business analysts." }, { heading: "Enterprise Security", description: "SOC 2 Type II, HIPAA, end-to-end encryption." }] }, block_payload: { title: "Value Proposition", pillars: [{ heading: "10x Faster Setup", description: "200+ pre-built connectors. 2 weeks vs 3 months." }, { heading: "Zero-Code Pipelines", description: "Visual builder for business analysts." }, { heading: "Enterprise Security", description: "SOC 2 Type II, HIPAA, end-to-end encryption." }] }, block_meta: { sectionIndex: 3 } },
          { type: "comparison_table", order_index: 4, content: { title: "Competitive Positioning", headers: ["Capability", "CloudSync", "Fivetran", "Informatica"], rows: [["Setup Time", "2 weeks", "4 weeks", "3+ months"], ["Price", "$2K/mo", "$4K/mo", "$15K/mo"], ["No-Code", "✅ Full", "⚠️ Limited", "❌ Dev-only"]] }, block_payload: { title: "Competitive Positioning", headers: ["Capability", "CloudSync", "Fivetran", "Informatica"], rows: [["Setup Time", "2 weeks", "4 weeks", "3+ months"], ["Price", "$2K/mo", "$4K/mo", "$15K/mo"], ["No-Code", "✅ Full", "⚠️ Limited", "❌ Dev-only"]] }, block_meta: { sectionIndex: 4 } },
          { type: "decision_next_steps", order_index: 5, content: { title: "Channel Strategy", decisions: [{ action: "Direct Sales", detail: "8 AEs targeting healthcare and fintech. $500K+ ACV." }, { action: "Partner Channel", detail: "SI partnerships with Accenture, Deloitte." }, { action: "Product-Led Growth", detail: "Free tier → self-serve. 30% pipeline from PLG by Q3." }] }, block_payload: { title: "Channel Strategy", decisions: [{ action: "Direct Sales", detail: "8 AEs targeting healthcare and fintech. $500K+ ACV." }, { action: "Partner Channel", detail: "SI partnerships with Accenture, Deloitte." }, { action: "Product-Led Growth", detail: "Free tier → self-serve. 30% pipeline from PLG by Q3." }] }, block_meta: { sectionIndex: 5 } },
          { type: "timeline_block", order_index: 6, content: { title: "Marketing Milestones", items: [{ date: "Q1", title: "Brand Launch", description: "Website relaunch, analyst briefings" }, { date: "Q2", title: "Content Engine", description: "12 case studies, 6 webinars" }, { date: "Q3", title: "Event Circuit", description: "AWS re:Invent, industry conferences" }] }, block_payload: { title: "Marketing Milestones", items: [{ date: "Q1", title: "Brand Launch", description: "Website relaunch, analyst briefings" }, { date: "Q2", title: "Content Engine", description: "12 case studies, 6 webinars" }, { date: "Q3", title: "Event Circuit", description: "AWS re:Invent, industry conferences" }] }, block_meta: { sectionIndex: 6 } },
          { type: "chart_block", order_index: 7, content: { title: "Budget Allocation", chartType: "bar", data: [{ name: "Sales", value: 2400 }, { name: "Marketing", value: 1800 }, { name: "Partners", value: 600 }, { name: "PLG", value: 900 }], xLabel: "Category", yLabel: "Budget ($K)" }, block_payload: { title: "Budget Allocation", chartType: "bar", data: [{ name: "Sales", value: 2400 }, { name: "Marketing", value: 1800 }, { name: "Partners", value: 600 }, { name: "PLG", value: 900 }], xLabel: "Category", yLabel: "Budget ($K)" }, block_meta: { sectionIndex: 7 } },
          { type: "scenario_set", order_index: 8, content: { title: "Growth Scenarios", scenarios: [{ name: "Conservative", description: "120 customers, $6M new ARR", probability: 25 }, { name: "Base Case", description: "200 customers, $10M new ARR", probability: 50 }, { name: "Aggressive", description: "300 customers, $16M new ARR", probability: 25 }] }, block_payload: { title: "Growth Scenarios", scenarios: [{ name: "Conservative", description: "120 customers, $6M new ARR", probability: 25 }, { name: "Base Case", description: "200 customers, $10M new ARR", probability: 50 }, { name: "Aggressive", description: "300 customers, $16M new ARR", probability: 25 }] }, block_meta: { sectionIndex: 8 } },
          { type: "recommendation_panel", order_index: 9, content: { title: "Next Steps", recommendation: "Approve Q1 hiring plan and $1.8M marketing budget", supportingPoints: ["Pipeline at 2.1x — needs 3.5x for base case", "Competitor raised $565M — window narrowing"], owner: "VP Sales & CMO", deadline: "Jan 15" }, block_payload: { title: "Next Steps", recommendation: "Approve Q1 hiring plan and $1.8M marketing budget", supportingPoints: ["Pipeline at 2.1x — needs 3.5x for base case", "Competitor raised $565M — window narrowing"], owner: "VP Sales & CMO", deadline: "Jan 15" }, block_meta: { sectionIndex: 9 } },
        ]
      },
      {
        template: { slug: "example-city-innovation-quarterly", title: "City Innovation Lab — Quarterly Review", description: "Q1 performance review for a municipal innovation program. 9 slides.", category: "Projects and Operations", tags: ["example-deck", "quarterly review", "government", "public sector"], is_featured: true, default_theme_id: "forest" },
        blocks: [
          { type: "hero_header", order_index: 0, content: { title: "City Innovation Lab", subtitle: "Q1 2025 Quarterly Review", tagline: "Building a smarter city government" }, block_payload: { title: "City Innovation Lab", subtitle: "Q1 2025 Quarterly Review", tagline: "Building a smarter city government" }, block_meta: { sectionIndex: 0 } },
          { type: "exec_summary", order_index: 1, content: { title: "Mission Recap", points: ["Accelerate digital transformation across 12 departments", "Reduce service wait times by 50% through automation", "Launch 3 pilot programs per quarter", "Build internal innovation capacity"] }, block_payload: { title: "Mission Recap", points: ["Accelerate digital transformation across 12 departments", "Reduce service wait times by 50% through automation", "Launch 3 pilot programs per quarter", "Build internal innovation capacity"] }, block_meta: { sectionIndex: 1 } },
          { type: "card_grid", order_index: 2, content: { title: "Q1 Highlights", cards: [{ title: "311 AI Chatbot", description: "Handling 34% of inquiries autonomously" }, { title: "Permit Automation", description: "Processing cut from 21 to 7 days" }, { title: "Open Data Portal", description: "47 new datasets, 12K monthly users" }] }, block_payload: { title: "Q1 Highlights", cards: [{ title: "311 AI Chatbot", description: "Handling 34% of inquiries autonomously" }, { title: "Permit Automation", description: "Processing cut from 21 to 7 days" }, { title: "Open Data Portal", description: "47 new datasets, 12K monthly users" }] }, block_meta: { sectionIndex: 2 } },
          { type: "stat_block", order_index: 3, content: { title: "Key Performance Indicators", stats: [{ value: "34%", label: "Inquiries Automated" }, { value: "67%", label: "Permit Time Reduction" }, { value: "4.2/5", label: "Citizen Satisfaction" }, { value: "$2.1M", label: "Annual Savings" }] }, block_payload: { title: "Key Performance Indicators", stats: [{ value: "34%", label: "Inquiries Automated" }, { value: "67%", label: "Permit Time Reduction" }, { value: "4.2/5", label: "Citizen Satisfaction" }, { value: "$2.1M", label: "Annual Savings" }] }, block_meta: { sectionIndex: 3 } },
          { type: "timeline_block", order_index: 4, content: { title: "Program Updates", items: [{ date: "Jan", title: "311 AI Chatbot — Live", description: "Water, waste, and parks inquiries" }, { date: "Feb", title: "Permit System v2", description: "GIS integration for zoning" }, { date: "Mar", title: "Data Literacy Training", description: "120 employees completed bootcamp" }] }, block_payload: { title: "Program Updates", items: [{ date: "Jan", title: "311 AI Chatbot — Live", description: "Water, waste, and parks inquiries" }, { date: "Feb", title: "Permit System v2", description: "GIS integration for zoning" }, { date: "Mar", title: "Data Literacy Training", description: "120 employees completed bootcamp" }] }, block_meta: { sectionIndex: 4 } },
          { type: "chart_block", order_index: 5, content: { title: "Budget Status", chartType: "bar", data: [{ name: "Personnel", value: 420 }, { name: "Technology", value: 380 }, { name: "Training", value: 95 }, { name: "Pilots", value: 210 }], xLabel: "Category", yLabel: "Spend ($K)" }, block_payload: { title: "Budget Status", chartType: "bar", data: [{ name: "Personnel", value: 420 }, { name: "Technology", value: 380 }, { name: "Training", value: 95 }, { name: "Pilots", value: 210 }], xLabel: "Category", yLabel: "Spend ($K)" }, block_meta: { sectionIndex: 5 } },
          { type: "evidence_map", order_index: 6, content: { title: "Stakeholder Feedback", categories: [{ name: "Citizens", items: [{ claim: "Service speed improved", evidence: "4.2/5 satisfaction (up from 3.6)", impact: "high" }] }, { name: "Department Heads", items: [{ claim: "Innovation capacity growing", evidence: "8 departments have innovation leads", impact: "high" }] }] }, block_payload: { title: "Stakeholder Feedback", categories: [{ name: "Citizens", items: [{ claim: "Service speed improved", evidence: "4.2/5 satisfaction (up from 3.6)", impact: "high" }] }, { name: "Department Heads", items: [{ claim: "Innovation capacity growing", evidence: "8 departments have innovation leads", impact: "high" }] }] }, block_meta: { sectionIndex: 6 } },
          { type: "decision_next_steps", order_index: 7, content: { title: "Q2 Goals", decisions: [{ action: "Expand 311 AI to 5 more categories", detail: "Target: 50% autonomous resolution" }, { action: "Launch predictive maintenance pilot", detail: "IoT sensors on 200 water mains" }, { action: "Digital equity initiative", detail: "15 public Wi-Fi + digital literacy hubs" }] }, block_payload: { title: "Q2 Goals", decisions: [{ action: "Expand 311 AI to 5 more categories", detail: "Target: 50% autonomous resolution" }, { action: "Launch predictive maintenance pilot", detail: "IoT sensors on 200 water mains" }, { action: "Digital equity initiative", detail: "15 public Wi-Fi + digital literacy hubs" }] }, block_meta: { sectionIndex: 7 } },
          { type: "cta_section", order_index: 8, content: { title: "Contact & Resources", description: "Reach out to propose a pilot project or request data.", primaryCta: "Submit Pilot Proposal", secondaryCta: "View Open Data Portal" }, block_payload: { title: "Contact & Resources", description: "Reach out to propose a pilot project or request data.", primaryCta: "Submit Pilot Proposal", secondaryCta: "View Open Data Portal" }, block_meta: { sectionIndex: 8 } },
        ]
      }
    ];

    let templatesInserted = 0;
    let blocksInserted = 0;

    for (const deck of decks) {
      const { data: tpl, error: tplErr } = await supabase
        .from("templates")
        .insert(deck.template)
        .select()
        .single();

      if (tplErr) {
        console.error("Error inserting template:", deck.template.slug, tplErr);
        continue;
      }

      templatesInserted++;

      const blocksWithId = deck.blocks.map((b) => ({
        ...b,
        template_id: tpl.id,
      }));

      const { error: blkErr } = await supabase
        .from("template_blocks")
        .insert(blocksWithId);

      if (blkErr) {
        console.error("Error inserting blocks for:", deck.template.slug, blkErr);
      } else {
        blocksInserted += blocksWithId.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, templatesInserted, blocksInserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
