/**
 * AXIVA Cloudflare Worker — SEO Prerendering
 * 
 * Detects search engine bots and serves pre-rendered HTML with
 * full meta tags, structured data, and page content.
 * Normal users get the SPA as usual.
 * 
 * SETUP:
 * 1. Go to Cloudflare Dashboard → Workers & Pages → Create Worker
 * 2. Paste this code
 * 3. Add route: axiva.ai/* → this worker
 * 4. Deploy
 */

// Bot user agents to detect
const BOT_AGENTS = [
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'slurp',
  'baiduspider', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'applebot', 'discordbot', 'semrushbot',
  'ahrefsbot', 'dotbot', 'rogerbot', 'embedly', 'quora link preview',
  'outbrain', 'pinterest', 'slack', 'vkshare', 'w3c_validator',
  'redditbot', 'sogou', 'exabot', 'ia_archiver', 'archive.org_bot',
  'petalbot', 'gptbot', 'chatgpt-user', 'claudebot', 'anthropic-ai',
  'perplexitybot', 'cohere-ai', 'bytespider',
];

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some(bot => ua.includes(bot));
}

// Page metadata for all routes
const PAGES = {
  '/': {
    title: 'AXIVA — AI Executive Deck Generator | Consulting-Grade Presentations',
    description: 'Create stunning pitch decks in minutes. AI builds structure, narrative, and visuals using BCG & McKinsey methodology. 23 timeline styles. 25+ block types. PPTX export.',
    h1: 'Create stunning pitch decks in minutes, not hours',
    content: `AXIVA is an AI-powered executive presentation generator that creates consulting-grade decks in under 2 minutes. Built on BCG and McKinsey slide methodology with Pyramid Principle, action titles, and 70% visual density. Features include 68+ executive templates, 25+ specialized block types (KPI dashboards, comparison tables, 2×2 matrices, timeline blocks), AI infographic generator, data visualization generator, and a 23-style timeline generator with scenario branching, cause-effect chains, and three-horizon models. Export to PowerPoint, PDF, or PNG. Free to start, Pro unlocks all features.`,
  },
  '/templates': {
    title: 'Presentation Templates | AI Infographics | Data Visuals | Timelines — AXIVA',
    description: '68+ executive templates, AI infographics, data visualizations, and 23 timeline styles. Board decks, pitch decks, strategy presentations. AI-customizable, PPTX export.',
    h1: '68+ Executive Templates',
    content: `Browse AXIVA's premium collection of board-ready decks, investor pitches, and strategy presentations. Every template is AI-customizable and exports to PowerPoint. Includes AI Infographic generator, Data & Visuals generator with 8 chart types, and Timeline Generator with 23 professional styles across 5 categories: Core (horizontal, vertical, Gantt, milestone cards, swim lanes, alternating), Strategy (strategic phase, three-horizon, product evolution, decision gate), Visualization (S-curve, calendar, step process, layered theme, before/after), Advanced Reasoning (scenario branching, impact magnitude, cause & effect), and Viral (life journey, company story, tech evolution, then vs now, future prediction).`,
  },
  '/pricing': {
    title: 'Pricing — AXIVA AI Deck Generator',
    description: 'Free plan with 10 projects. Pro at $28/mo with unlimited projects, PPTX export, 23 timeline styles, brand kit. 14-day free trial. Team plan at $78/mo.',
    h1: 'Simple, transparent pricing',
    content: `AXIVA offers three plans. Free: 10 projects, basic AI generation, standard blocks, web sharing, PNG export. Pro ($28/month or $269/year): Unlimited projects, PDF & PowerPoint export, brand kit & custom themes, 23 Timeline Styles (Gantt, scenarios, S-curve), interactive blocks, AI image generation, AI infographics, data & visuals generator, advanced AI actions, priority support. 14-day free trial. Team ($78/month or $749/year): Everything in Pro plus team collaboration, shared brand kit, admin controls, SSO, dedicated support.`,
  },
  '/features': {
    title: 'Features — AI Deck Generator with 25+ Block Types | AXIVA',
    description: 'AI-powered deck generation with 23 timeline styles, KPI dashboards, comparison tables, 2x2 matrices, flow diagrams. BCG/McKinsey methodology built-in.',
    h1: 'Built for executives who need results, not slides',
    content: `AXIVA features: AI-powered deck generation using BCG & McKinsey consulting methodology. 25+ specialized block types including KPI dashboards, comparison tables, 2×2 matrices, timeline blocks, three pillars, flow diagrams, chart blocks, and decision frameworks. 23 AI Timeline Styles: Gantt charts, roadmaps, scenario branching, cause-effect chains, three-horizon models, and more. Native PowerPoint export. Brand kit with custom themes. Interactive blocks with tabs and toggles. AI image generation. Deep research mode.`,
  },
  '/gamma-alternative': {
    title: 'AXIVA vs Gamma — Best AI Presentation Alternative 2026',
    description: 'AXIVA generates consulting-grade decks with BCG methodology, 23 timeline styles, and native PPTX export. Compare with Gamma, Beautiful.ai, and GenSpark.',
    h1: 'The Gamma Alternative Built for Executives',
    content: `Why executives choose AXIVA over Gamma: Consulting-grade methodology (Pyramid Principle, action titles, 70% visual density) vs Gamma's generic layouts. 25+ specialized block types vs basic text and image blocks. 23 timeline styles including scenario branching and three-horizon models. Native PowerPoint export. BCG/McKinsey slide methodology built-in. AXIVA is designed for board decks, investor pitches, and strategy presentations — not generic slideshows.`,
  },
  '/templates/ai-timeline-generator': {
    title: 'AI Timeline Generator — 23 Professional Styles | AXIVA',
    description: 'Generate timelines with AI. 23 styles: Gantt charts, roadmaps, scenario branching, cause-effect, three-horizon. One dataset, multiple narrative views.',
    h1: 'AI Timeline Generator — 23 Styles',
    content: `AXIVA's AI Timeline Generator features 23 professional styles across 5 categories. Core Timelines: Horizontal, Vertical, Gantt Chart, Milestone Cards, Swim Lane Roadmap, Alternating. Strategy Timelines: Strategic Phase, Three Horizon (McKinsey model), Product Evolution, Decision Gate. Visualization: S-Curve, Calendar, Step Process, Layered Theme, Before/After. Advanced Reasoning: Scenario Branching (multiple futures from a decision point), Impact Magnitude (events sized by importance), Cause & Effect (causal chains). Viral/Shareable: Life Journey, Company Story, Tech Evolution, Then vs Now, Future Prediction. One dataset generates multiple narrative views — enter your events once, switch between completely different executive narratives with one click. Import CSV, JPG, PNG, PPTX, or PDF files. AI vision reads images and extracts timeline events.`,
  },
  '/ai-presentation-maker': {
    title: 'AI Presentation Maker — Executive Decks in 2 Minutes | AXIVA',
    description: 'AI presentation maker that creates consulting-grade decks. Pyramid Principle, action titles, 70% visual density. PPTX export. Free to start.',
    h1: 'AI Presentation Maker',
    content: `AXIVA is an AI presentation maker that generates executive-grade decks in under 2 minutes. Unlike generic AI slide tools, AXIVA uses BCG and McKinsey consulting methodology: Pyramid Principle for structure, action titles instead of topic labels, 70% visual density, and answer-first frameworks. 68+ templates for board updates, investor pitches, quarterly reviews, and strategy presentations. 25+ block types. 23 timeline styles. Export to PowerPoint, PDF, or PNG.`,
  },
  '/ai-deck-generator': {
    title: 'AI Deck Generator — Board Decks, Pitch Decks, Strategy | AXIVA',
    description: 'Generate executive presentations with AI. Board updates, investor pitches, strategy decks. BCG/McKinsey methodology. PPTX export.',
    h1: 'AI Deck Generator',
    content: `AXIVA's AI deck generator creates board-ready presentations in minutes. Describe your goal — AI builds the structure, narrative, and visuals. Consulting-grade methodology with Pyramid Principle and action titles. 68+ templates. 25+ specialized block types. 23 timeline styles. Native PowerPoint export. Brand kit customization. Free to start with 10 projects.`,
  },
  '/investor-pitch-deck': {
    title: 'AI Investor Pitch Deck Generator | AXIVA',
    description: 'Generate investor pitch decks that raise funding. AI-powered with consulting methodology. Problem, solution, traction, financials, ask. PPTX export.',
    h1: 'Investor Pitch Deck Generator',
    content: `Create investor pitch decks that actually raise funding. AXIVA's AI generates pitch decks with the proven structure: Problem, Solution, Market Size, Traction, Business Model, Team, Financials, and The Ask. Built on consulting methodology with data-driven visuals, KPI dashboards, and growth charts. Export to PowerPoint for investor meetings.`,
  },
};

// Generate the bot-friendly HTML
function generateHTML(path, url) {
  const page = PAGES[path] || PAGES['/'];
  const canonical = `https://axiva.ai${path}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <link rel="canonical" href="${canonical}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:image" content="https://axiva.ai/og-image.png">
  <meta property="og:site_name" content="AXIVA">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${page.title}">
  <meta name="twitter:description" content="${page.description}">
  <meta name="twitter:image" content="https://axiva.ai/og-image.png">
  
  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AXIVA",
    "url": "https://axiva.ai",
    "description": "${page.description}",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
  </script>
</head>
<body>
  <header>
    <nav>
      <a href="/">AXIVA</a>
      <a href="/features">Features</a>
      <a href="/templates">Templates</a>
      <a href="/pricing">Pricing</a>
    </nav>
  </header>
  
  <main>
    <h1>${page.h1}</h1>
    <p>${page.content}</p>
    
    <section>
      <h2>Key Features</h2>
      <ul>
        <li>23 AI Timeline Styles: Gantt charts, roadmaps, scenario branching, cause-effect, three-horizon models</li>
        <li>25+ specialized block types: KPI dashboards, comparison tables, 2×2 matrices, flow diagrams</li>
        <li>BCG & McKinsey consulting methodology: Pyramid Principle, action titles, 70% visual density</li>
        <li>68+ executive templates for board decks, pitch decks, strategy presentations</li>
        <li>Native PowerPoint, PDF, and PNG export</li>
        <li>AI infographic generator and data visualization tools</li>
        <li>File import: CSV, JPG, PNG, PPTX, PDF — AI vision reads images</li>
        <li>One dataset, multiple narrative views — same data, different executive stories</li>
      </ul>
    </section>
    
    <section>
      <h2>Timeline Generator — 23 Professional Styles</h2>
      <p>Core: Horizontal, Vertical, Gantt Chart, Milestone Cards, Swim Lanes, Alternating</p>
      <p>Strategy: Strategic Phase, Three Horizon, Product Evolution, Decision Gate</p>
      <p>Visual: S-Curve, Calendar, Step Process, Layered Theme, Before/After</p>
      <p>Advanced: Scenario Branching, Impact Magnitude, Cause & Effect</p>
      <p>Viral: Life Journey, Company Story, Tech Evolution, Then vs Now, Future Prediction</p>
    </section>
    
    <footer>
      <a href="/templates">Templates</a>
      <a href="/features">Features</a>
      <a href="/pricing">Pricing</a>
      <a href="/blog">Blog</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </footer>
  </main>
</body>
</html>`;
}

// Add blog pages dynamically
const BLOG_PAGES = {
  '/blog/ai-timeline-generator-23-styles-2026': {
    title: '23 Timeline Styles That Turn Data Into Executive Narratives — AXIVA Blog',
    description: 'Most timeline tools generate one layout. AXIVA generates 23 narrative views from one dataset. Scenario branching, cause-effect, three-horizon models.',
    h1: '23 Timeline Styles That Turn Data Into Executive Narratives',
    content: 'Every timeline tool generates one layout from one dataset. AXIVA generates 23 different narrative views from the same data. Includes advanced reasoning timelines: Scenario Branching for multiple futures, Impact Magnitude for events sized by importance, Cause and Effect for causal chains. Plus viral styles: Life Journey, Company Story, Then vs Now, Future Prediction.',
  },
  '/blog/consulting-slide-methodology-ai-2026': {
    title: 'How AXIVA Uses BCG & McKinsey Methodology — AXIVA Blog',
    description: 'BCG and McKinsey consulting slide methodology built into an AI deck generator. Pyramid Principle, action titles, 70% visual density.',
    h1: 'BCG & McKinsey Consulting Slide Methodology in AI',
    content: 'AXIVA implements the consulting methodology used by BCG and McKinsey. Pyramid Principle for structure. Action titles instead of topic labels. 70% visual density. Answer-first frameworks. MECE structure. The AI generates slides that follow these principles automatically.',
  },
};

// Merge blog pages
Object.assign(PAGES, BLOG_PAGES);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    
    // Only intercept for bots
    if (!isBot(userAgent)) {
      // Pass through to origin for normal users
      return fetch(request);
    }
    
    // For bots: serve prerendered HTML
    const path = url.pathname.replace(/\/$/, '') || '/';
    
    // Check if we have a page definition
    if (PAGES[path]) {
      const html = generateHTML(path, url.toString());
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          'X-Prerendered': 'true',
        },
      });
    }
    
    // For unknown paths, pass through to origin
    return fetch(request);
  },
};
