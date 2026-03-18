/**
 * Static SEO Page Generator for AXIVA
 * 
 * Generates plain HTML pages for each public route with real content
 * that crawlers can index. The SPA still loads on top via the JS bundle.
 * 
 * This runs AFTER `vite build` and writes directly into dist/.
 * Each route gets a folder with an index.html that contains:
 * - Full <head> with per-page title, description, canonical, OG tags
 * - Visible text content (headings, descriptions, links)
 * - The React root div + JS bundle (so the SPA hydrates for real users)
 * 
 * Cost: $0/month. No external service. Runs at build time.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);

// Read the built index.html as our base template
const baseHtml = fs.readFileSync(toAbsolute('dist/index.html'), 'utf-8');

// ── Page definitions ───────────────────────────────────────────
// Each page has: route, title, description, h1, content (HTML string)

const PAGES = [
  {
    route: '/',
    title: 'AXIVA — AI Executive Deck Generator | Consulting-Grade Presentations',
    description: 'Create consulting-grade presentations with AI. BCG & McKinsey slide methodology — Pyramid Principle, action titles, 70% visual density. 25+ block types. Native PPTX export. 3 free decks.',
    h1: 'AI Executive Deck Generator',
    content: `<p>AXIVA generates consulting-grade presentations using BCG and McKinsey slide methodology. Pyramid Principle structure, action titles, and 70%+ visual density — the standard top consulting firms use.</p>
    <h2>Features</h2>
    <ul>
      <li>AI generates executive-grade slides in under 2 minutes</li>
      <li>25+ specialized block types: KPI dashboards, comparison tables, 2×2 matrices, timeline blocks, three pillars</li>
      <li>Consulting methodology: Pyramid Principle, action titles, answer-first structure</li>
      <li>Native editable PowerPoint (PPTX) and PDF export</li>
      <li>Data & Visuals generator with CSV/Excel import</li>
      <li>Brand kit, team sharing, and view analytics</li>
    </ul>
    <h2>Templates</h2>
    <ul>
      <li><a href="/templates/investor-pitch-deck-template">Investor Pitch Deck Template</a></li>
      <li><a href="/templates/board-update-template">Board Update Template</a></li>
      <li><a href="/templates/quarterly-review-template">Quarterly Business Review Template</a></li>
      <li><a href="/templates/strategy-deck-template">Strategy Deck Template</a></li>
      <li><a href="/templates/consulting-deck-template">Consulting Deck Template (BCG/McKinsey Style)</a></li>
      <li><a href="/templates/ai-governance-framework-template">AI Governance Framework Template</a></li>
      <li><a href="/templates/ai-risk-assessment-template">AI Risk Assessment Template</a></li>
      <li><a href="/templates/ai-strategy-executive-template">AI Strategy Executive Template</a></li>
    </ul>
    <h2>Alternatives</h2>
    <ul>
      <li><a href="/gamma-alternative">AXIVA vs Gamma</a> — Purpose-built for executives, not generic slides</li>
      <li><a href="/genspark-alternative">AXIVA vs GenSpark</a> — No credits, no complexity</li>
      <li><a href="/beautiful-ai-alternative">AXIVA vs Beautiful.ai</a> — Consulting methodology built-in</li>
    </ul>
    <p>Try free at <a href="https://axiva.ai">axiva.ai</a> — 3 decks, no credit card required. Built by <a href="/founder">Jag Mariappan</a>.</p>`,
  },
  {
    route: '/ai-presentation-maker',
    title: 'AI Presentation Maker — Create Executive Decks with AI | AXIVA',
    description: 'Generate professional presentations with AI in under 2 minutes. KPI dashboards, comparison tables, timeline blocks, and 25+ specialized slide types. Free to try.',
    h1: 'AI Presentation Maker',
    content: `<p>AXIVA is an AI presentation maker built for executives. Generate board decks, investor pitches, strategy presentations, and quarterly reviews with consulting-grade AI.</p>
    <h2>How It Works</h2><ol><li>Describe your presentation in one sentence</li><li>AI generates 10-15 structured slides with data visualizations</li><li>Export to native, editable PowerPoint</li></ol>
    <h2>Why Executives Choose AXIVA</h2><ul><li>Consulting methodology: Pyramid Principle, action titles, answer-first structure</li><li>25+ executive block types including KPI dashboards, 2×2 matrices, comparison tables</li><li>70%+ visual density — not text walls</li><li>Native PPTX export with editable elements (not images)</li></ul>
    <p><a href="/pricing">Pricing</a>: Free (3 decks) / Pro $28/month</p>`,
  },
  {
    route: '/gamma-alternative',
    title: 'AXIVA vs Gamma — Best Gamma Alternative for Executives | 2026',
    description: 'Looking for a Gamma alternative built for executives? AXIVA generates consulting-grade decks with BCG/McKinsey methodology, native PPTX export, and no credit system.',
    h1: 'AXIVA vs Gamma: The Executive Alternative',
    content: `<p>Gamma is great for general presentations. AXIVA is built specifically for executive communication — board decks, investor pitches, and strategy presentations.</p>
    <h2>Key Differences</h2><ul><li>AXIVA uses consulting methodology (Pyramid Principle, action titles). Gamma uses topic labels.</li><li>AXIVA generates 70%+ visual slides (charts, frameworks, dashboards). Gamma is more text-heavy.</li><li>AXIVA exports native editable PowerPoint. Gamma exports images in PPTX.</li><li>AXIVA has no credit system. 3 free decks, simple pricing.</li></ul>`,
  },
  {
    route: '/genspark-alternative',
    title: 'AXIVA vs GenSpark — Best GenSpark Alternative for Decks | 2026',
    description: 'GenSpark is a broad AI workspace. AXIVA is purpose-built for executive presentations with consulting methodology, native PPTX export, and no credits.',
    h1: 'AXIVA vs GenSpark: Purpose-Built for Executives',
    content: `<p>GenSpark ($460M raised, $1.25B valuation) is an all-in-one AI workspace. AXIVA focuses exclusively on executive-grade presentations.</p>
    <h2>Key Differences</h2><ul><li>AXIVA: consulting methodology (Pyramid Principle). GenSpark: generic AI output.</li><li>AXIVA: native editable PPTX. GenSpark: converts elements to images.</li><li>AXIVA: no credits, no complexity. GenSpark: credit-based system.</li><li>AXIVA: 25+ executive block types. GenSpark: general-purpose slides.</li></ul>`,
  },
  {
    route: '/beautiful-ai-alternative',
    title: 'AXIVA vs Beautiful.ai — Best Beautiful.ai Alternative | 2026',
    description: 'Beautiful.ai focuses on design automation. AXIVA focuses on consulting-grade content with BCG/McKinsey methodology, KPI dashboards, and executive frameworks.',
    h1: 'AXIVA vs Beautiful.ai: Content Over Design',
    content: `<p>Beautiful.ai automates slide design. AXIVA generates consulting-grade content — action titles, data visualizations, strategic frameworks — using the methodology top firms use.</p>`,
  },
  {
    route: '/pricing',
    title: 'AXIVA Pricing — Free AI Deck Generator | Pro $28/month',
    description: 'AXIVA pricing: Free (3 decks, no credit card) or Pro at $28/month for unlimited decks, PDF export, brand kit, and priority AI.',
    h1: 'Pricing',
    content: `<h2>Free</h2><p>3 decks, PowerPoint export, 25+ block types, consulting methodology. No credit card required.</p>
    <h2>Pro — $28/month</h2><p>Unlimited decks, PDF export, brand kit, priority AI, view analytics, team sharing, watermark-free exports.</p>`,
  },
  {
    route: '/features',
    title: 'AXIVA Features — 25+ AI Slide Types, PPTX Export, Consulting Methodology',
    description: 'AXIVA features: KPI dashboards, comparison tables, 2×2 matrices, timeline blocks, chart blocks, three pillars, and more. Consulting-grade AI with native PPTX export.',
    h1: 'Features',
    content: `<ul><li>25+ specialized block types for executive presentations</li><li>KPI dashboards with trend indicators</li><li>Comparison tables, 2×2 matrices, three pillars</li><li>Chart blocks (bar, donut, area, line)</li><li>Timeline blocks, flow diagrams</li><li>Consulting methodology: Pyramid Principle, action titles</li><li>Native PPTX and PDF export</li><li>Brand kit customization</li><li>Team sharing and view analytics</li><li>Data & Visuals generator with CSV/Excel import</li></ul>`,
  },
  {
    route: '/templates',
    title: 'AI Presentation Templates — Board Decks, Pitch Decks, Strategy | AXIVA',
    description: 'Browse AI presentation templates for investors, boards, strategy, consulting, and AI governance. Generate any template in under 2 minutes with AXIVA.',
    h1: 'Presentation Templates',
    content: `<ul>
    <li><a href="/templates/investor-pitch-deck-template">Investor Pitch Deck</a></li>
    <li><a href="/templates/board-update-template">Board Update</a></li>
    <li><a href="/templates/quarterly-review-template">Quarterly Business Review</a></li>
    <li><a href="/templates/strategy-deck-template">Strategy Deck</a></li>
    <li><a href="/templates/consulting-deck-template">Consulting Deck (BCG/McKinsey Style)</a></li>
    <li><a href="/templates/ai-governance-framework-template">AI Governance Framework</a></li>
    <li><a href="/templates/ai-risk-assessment-template">AI Risk Assessment</a></li>
    <li><a href="/templates/ai-strategy-executive-template">AI Strategy for Executives</a></li>
    <li><a href="/templates/sales-deck-template">Sales Deck</a></li></ul>`,
  },
  {
    route: '/blog',
    title: 'AXIVA Blog — AI Presentations, Consulting Methodology, Executive Decks',
    description: 'Articles on AI-powered presentations, consulting slide methodology, executive deck best practices, and AXIVA product updates.',
    h1: 'Blog',
    content: `<ul>
    <li><a href="/blog/consulting-slide-methodology-ai-2026">How AXIVA Uses BCG & McKinsey Slide Methodology</a></li>
    <li><a href="/blog/ai-governance-framework-executives-2026">AI Governance for Executives: The Framework Your Board Needs</a></li>
    <li><a href="/blog/10-board-deck-templates-that-work">10 Board Deck Templates That Work</a></li>
    <li><a href="/blog/how-to-build-investor-pitch-deck-2026">How to Build an Investor Pitch Deck in 2026</a></li>
    <li><a href="/blog/axiva-vs-gamma-vs-genspark-vs-beautiful-ai-2026">AXIVA vs Gamma vs GenSpark vs Beautiful.ai</a></li>
    <li><a href="/blog/executives-guide-ai-presentations">Executive's Guide to AI Presentations</a></li></ul>`,
  },
  {
    route: '/founder',
    title: 'About the Founder — Jag Mariappan | AXIVA',
    description: 'AXIVA is built by Jag Mariappan, a founder focused on bringing consulting-grade AI to executive presentations.',
    h1: 'About the Founder',
    content: `<p>AXIVA is built by Jag Mariappan. The mission: make consulting-grade presentations accessible to every executive, not just those who can afford McKinsey.</p>`,
  },
];

// Template SEO pages
const TEMPLATE_PAGES = [
  { slug: 'investor-pitch-deck-template', title: 'Investor Pitch Deck Template', desc: 'Generate a complete investor pitch deck with AI. Traction charts, TAM analysis, competitive positioning, and ask slides.' },
  { slug: 'board-update-template', title: 'Board Update Template', desc: 'AI-generated board update decks with KPI dashboards, strategic initiatives, and risk assessments.' },
  { slug: 'quarterly-review-template', title: 'Quarterly Business Review Template', desc: 'QBR deck generator with revenue analysis, pipeline metrics, and quarterly goals.' },
  { slug: 'strategy-deck-template', title: 'Strategy Deck Template', desc: 'AI strategy presentation generator with market analysis, competitive positioning, and execution roadmaps.' },
  { slug: 'consulting-deck-template', title: 'Consulting Deck Template (BCG/McKinsey Style)', desc: 'Generate consulting-grade decks using Pyramid Principle, action titles, and 70% visual density — the methodology top firms use.' },
  { slug: 'sales-deck-template', title: 'Sales Deck Template', desc: 'AI sales presentation generator with ROI calculators, customer testimonials, and pricing slides.' },
  { slug: 'ai-governance-framework-template', title: 'AI Governance Framework Template', desc: 'AI governance presentation covering risk assessment, ethical guidelines, compliance, and implementation roadmaps.' },
  { slug: 'ai-risk-assessment-template', title: 'AI Risk Assessment Template', desc: 'AI risk assessment deck with risk matrices, bias analysis, mitigation strategies, and monitoring frameworks.' },
  { slug: 'ai-strategy-executive-template', title: 'AI Strategy Executive Template', desc: 'Enterprise AI strategy deck with maturity assessment, use case prioritization, and investment roadmap.' },
];

for (const tp of TEMPLATE_PAGES) {
  PAGES.push({
    route: `/templates/${tp.slug}`,
    title: `${tp.title} | AXIVA`,
    description: tp.desc,
    h1: tp.title,
    content: `<p>${tp.desc}</p><p><a href="/templates">Browse all templates</a> · <a href="/">Generate your deck free</a></p>`,
  });
}

// Blog posts
const BLOG_POSTS = [
  { slug: 'consulting-slide-methodology-ai-2026', title: 'How AXIVA Uses BCG & McKinsey Slide Methodology to Generate Consulting-Grade Decks' },
  { slug: 'ai-governance-framework-executives-2026', title: 'AI Governance for Executives: The Framework Your Board Needs in 2026' },
  { slug: '10-board-deck-templates-that-work', title: '10 Board Deck Templates That Actually Work' },
  { slug: 'how-to-build-investor-pitch-deck-2026', title: 'How to Build an Investor Pitch Deck in 2026' },
  { slug: 'axiva-vs-gamma-vs-genspark-vs-beautiful-ai-2026', title: 'AXIVA vs Gamma vs GenSpark vs Beautiful.ai — 2026 Comparison' },
  { slug: 'executives-guide-ai-presentations', title: "Executive's Guide to AI Presentations" },
];

for (const bp of BLOG_POSTS) {
  PAGES.push({
    route: `/blog/${bp.slug}`,
    title: `${bp.title} | AXIVA Blog`,
    description: bp.title,
    h1: bp.title,
    content: `<p>Read the full article on <a href="https://axiva.ai/blog/${bp.slug}">AXIVA</a>.</p><p><a href="/blog">Back to blog</a></p>`,
  });
}

// Additional SEO landing pages
const EXTRA = [
  { route: '/ai-deck-generator', title: 'AI Deck Generator', desc: 'Generate executive decks with AI. KPI dashboards, comparison tables, timeline blocks. Free to try.' },
  { route: '/executive-deck-generator', title: 'Executive Deck Generator', desc: 'AI-powered executive presentation generator. Board decks, investor pitches, strategy presentations.' },
  { route: '/powerpoint-ai', title: 'PowerPoint AI — Generate PPTX with AI', desc: 'Generate native, editable PowerPoint presentations with AI. No images — real editable elements.' },
  { route: '/healthcare-ai-presentations', title: 'AI Presentations for Healthcare', desc: 'Generate healthcare executive presentations with AI. Board reports, clinical outcomes, regulatory compliance.' },
];

for (const ex of EXTRA) {
  PAGES.push({
    route: ex.route,
    title: `${ex.title} | AXIVA`,
    description: ex.desc,
    h1: ex.title,
    content: `<p>${ex.desc}</p><p><a href="/">Try AXIVA free</a></p>`,
  });
}

// ── Generate pages ─────────────────────────────────────────────

function generatePage(page) {
  let html = baseHtml;

  // Replace <title>
  html = html.replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${page.description}"`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="https://axiva.ai${page.route}"`
  );

  // Replace OG tags
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${page.title}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${page.description}"`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="https://axiva.ai${page.route}"`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${page.title}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${page.description}"`
  );

  // Inject visible content into the root div for crawlers
  // The React app will hydrate over this on load
  const seoContent = `<div id="seo-content" style="position:absolute;left:-9999px;"><h1>${page.h1}</h1>${page.content}</div>`;
  html = html.replace('<!--app-html-->', seoContent);

  return html;
}

console.log(`\n🚀 Generating ${PAGES.length} static SEO pages...\n`);

let count = 0;
for (const page of PAGES) {
  try {
    const html = generatePage(page);
    const routePath = page.route === '/' ? '' : page.route;
    const dir = toAbsolute(`dist${routePath}`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    count++;
    console.log(`  ✓ ${page.route}`);
  } catch (err) {
    console.error(`  ✗ ${page.route} — ${err.message}`);
  }
}

console.log(`\n✅ Generated ${count}/${PAGES.length} pages\n`);
