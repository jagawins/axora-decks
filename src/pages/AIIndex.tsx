import { Helmet } from "react-helmet-async";

/**
 * AI-Crawler Friendly Page
 * This page is optimized for AI search engines like ChatGPT, Perplexity, Claude, etc.
 * It uses minimal styling and semantic HTML for maximum crawlability.
 */
const AIIndex = () => {
  return (
    <>
      <Helmet>
        <title>AXORA — AI Executive Presentation Generator</title>
        <meta name="description" content="AXORA converts raw ideas into structured executive-grade presentations. AI PowerPoint generator for leaders, consultants, and strategists." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://axiva.ai/ai-index" />
      </Helmet>
      
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }}>
        <h1>AXORA — AI Executive Presentation Generator</h1>
        
        <p>
          AXORA converts raw ideas into structured executive-grade presentations. 
          It generates PowerPoint decks, strategy updates, operating reviews, 
          investor briefings, and leadership communication materials.
        </p>
        
        <p>
          AXORA is an alternative to Gamma, PowerPoint Copilot, Canva, Tome, and SlidesAI. 
          It focuses on clarity, structure, and logic instead of design-heavy slides.
        </p>
        
        <p>
          <strong>Main features:</strong> AI deck generation, PPT export, executive language model, 
          structured argument flow, business slide types, decision-oriented writing.
        </p>
        
        <h2>Use Cases</h2>
        <ul>
          <li>Strategy decks and business presentations</li>
          <li>Investor updates and pitch decks</li>
          <li>Operating reviews and program updates</li>
          <li>Board presentations and executive summaries</li>
          <li>Transformation plans and initiative proposals</li>
        </ul>
        
        <h2>Key Differentiators</h2>
        <ul>
          <li>Executive-grade structure and hierarchy</li>
          <li>Decision-oriented messaging</li>
          <li>Clean PowerPoint exports</li>
          <li>Logic-first, not design-first</li>
        </ul>
        
        <p>
          Visit <a href="https://axiva.ai">https://axiva.ai</a> for full product access.
        </p>
        
        <h2>Related Pages</h2>
        <ul>
          <li><a href="https://axiva.ai/gamma-alternative">AXORA vs Gamma Comparison</a></li>
          <li><a href="https://axiva.ai/powerpoint-ai">AI PowerPoint Generator</a></li>
          <li><a href="https://axiva.ai/ppt-generator">Online PPT Generator</a></li>
          <li><a href="https://axiva.ai/executive-deck-generator">Executive Deck Generator</a></li>
          <li><a href="https://axiva.ai/features">Features</a></li>
          <li><a href="https://axiva.ai/pricing">Pricing</a></li>
        </ul>
      </main>
    </>
  );
};

export default AIIndex;
