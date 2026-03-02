import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Linkedin, Globe } from "lucide-react";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import founderCardSquare from "@/assets/founder-card-square.png";

const About = () => {
  // JSON-LD structured data for Person and Organization
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://axiva.ai/#organization",
        "name": "AXORA",
        "url": "https://axiva.ai",
        "logo": "https://axiva.ai/favicon.svg",
        "description": "AI-powered executive presentation generator. Turn raw ideas into structured, decision-ready decks.",
        "founder": {
          "@id": "https://axiva.ai/#person"
        },
        "sameAs": [
          "https://x.com/inaxora"
        ]
      },
      {
        "@type": "Person",
        "@id": "https://axiva.ai/#person",
        "name": "Jag Mariappan",
        "jobTitle": "Founder",
        "affiliation": {
          "@type": "Organization",
          "name": "AXORA"
        },
        "worksFor": {
          "@id": "https://axiva.ai/#organization"
        },
        "image": "https://axiva.ai/founder-card-og.png",
        "url": "https://axiva.ai/about",
        "sameAs": [
          "https://www.linkedin.com/in/jagwinstoday",
          "https://jagmariappan.com"
        ],
        "knowsAbout": [
          "AI presentations",
          "Executive communication",
          "Digital transformation",
          "Strategy development",
          "Enterprise systems",
          "Healthcare technology",
          "AI-driven workflows"
        ],
        "description": "Founder of AXORA. Building executive-grade AI presentation tools for leaders, consultants, and strategists. Two decades of experience in technology, healthcare, enterprise systems, and AI-driven transformation."
      }
    ]
  };

  const journeyItems = [
    "Enterprise portfolio leadership at Stanford Medicine",
    "Founder of multiple AI-driven platforms",
    "Experience across Medtronic, HCL, IBM, public infrastructure, and healthtech",
    "Real-world expertise in governance, digital strategy, and complex systems"
  ];

  const philosophyItems = [
    {
      title: "Structure reveals clarity",
      description: "Great leaders don't speak more — they speak with intention. AXORA mirrors that mindset through structured blocks, meaningful hierarchy, and visual discipline."
    },
    {
      title: "Precision matters more than decoration",
      description: "Beautiful slides fail instantly if the logic is weak. AXORA prioritizes thinking, logic flow, and coherence."
    },
    {
      title: "AI should enhance judgment, not replace it",
      description: "The platform uses AI to accelerate clarity, not overwhelm it. AXORA is designed so users stay in control — every block, every refinement, every choice."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About the Founder — Jag Mariappan | AXORA</title>
        <meta 
          name="description" 
          content="Meet Jag Mariappan, founder of AXORA. Two decades of experience in technology, healthcare, and enterprise systems. Building executive-grade AI presentation tools for leaders." 
        />
        <link rel="canonical" href="https://axiva.ai/about" />
        
        {/* OG Tags with wide founder image */}
        <meta property="og:title" content="About the Founder — Jag Mariappan | AXORA" />
        <meta property="og:description" content="Meet Jag Mariappan, founder of AXORA. Building executive-grade AI presentation tools for leaders and strategists." />
        <meta property="og:image" content="https://axiva.ai/founder-card-og.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="628" />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content="https://axiva.ai/about" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About the Founder — Jag Mariappan | AXORA" />
        <meta name="twitter:description" content="Meet Jag Mariappan, founder of AXORA. Building executive-grade AI presentation tools." />
        <meta name="twitter:image" content="https://axiva.ai/founder-card-og.png" />
        <meta name="twitter:creator" content="@inaxora" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <MarketingHeader />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-60" />
          </div>
          
          <div className="container-narrow relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Page Title */}
              <h1 className="text-4xl sm:text-5xl font-bold text-center mb-16">
                About the Founder
              </h1>

              {/* Founder Card */}
              <div className="glass-card overflow-hidden mb-16">
                {/* Header gradient band */}
                <div className="h-32 bg-gradient-to-r from-[hsl(210,100%,95%)] to-[hsl(210,100%,88%)]" />
                
                {/* Content area */}
                <div className="px-8 pb-8 -mt-16">
                  <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-6">
                    {/* Profile image - using square for page */}
                    <img 
                      src={founderCardSquare} 
                      alt="Jag Mariappan — Founder of AXORA" 
                      className="w-32 h-32 rounded-2xl border-4 border-background shadow-xl object-cover"
                    />
                    
                    {/* Name and title */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                          Jag Mariappan
                        </h2>
                        <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          AXORA
                        </span>
                      </div>
                      <p className="text-lg text-muted-foreground">
                        Founder & Creator of <span className="text-accent font-medium">AXORA</span>
                      </p>
                    </div>
                    
                    {/* Social links */}
                    <div className="flex gap-3">
                      <a 
                        href="https://www.linkedin.com/in/jagwinstoday" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-accent/10 transition-colors"
                        aria-label="Connect on LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                      <a 
                        href="https://jagmariappan.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-accent/10 transition-colors"
                        aria-label="Personal website"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Commitment Section */}
              <div className="mb-16">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">The commitment behind AXORA</h2>
                
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    AXORA was built from a simple idea: <span className="text-foreground font-medium">clarity is the foundation of leadership.</span>
                  </p>
                  <p>
                    In every executive room, every board meeting, and every strategic review, the leaders who win are the ones who communicate with precision.
                  </p>
                  <p>
                    Jag Mariappan has spent more than two decades operating at the intersection of 
                    <span className="text-foreground font-medium"> technology, healthcare, enterprise systems, and AI-driven transformation</span>. 
                    His work spans digital operations, enterprise governance, AI-enabled workflows, and large-scale transformation programs across institutions and emerging startups.
                  </p>
                  <p>
                    AXORA reflects that experience. It is not a toy, not a writing assistant, not a generic deck generator — 
                    it is a tool built for people who think, move, and lead at an executive level.
                  </p>
                </div>
              </div>

              {/* Philosophy Section */}
              <div className="mb-16">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">The philosophy that shaped AXORA</h2>
                
                <div className="grid gap-6">
                  {philosophyItems.map((item, i) => (
                    <div key={i} className="glass-card p-6">
                      <h3 className="text-xl font-bold mb-3 text-accent">{i + 1}. {item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Journey Section */}
              <div className="mb-16">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">The journey behind the platform</h2>
                
                <p className="text-lg text-muted-foreground mb-6">Jag's work includes:</p>
                
                <ul className="space-y-4 mb-8">
                  {journeyItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-accent mt-1">→</span>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  AXORA is the convergence of those domains — a platform built by someone who has lived the work, not just observed it.
                </p>
              </div>

              {/* Name Origin Section */}
              <div className="mb-16">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">Why the name AXORA?</h2>
                
                <div className="glass-card p-8 border-accent/20">
                  <p className="text-lg text-muted-foreground mb-4">AXORA represents:</p>
                  
                  <div className="text-center py-6">
                    <p className="text-2xl font-bold text-accent mb-2">Axiom + Aura</p>
                    <p className="text-lg text-muted-foreground">Truth + Insight</p>
                    <p className="text-lg text-muted-foreground">Clarity + Presence</p>
                  </div>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    It blends logic with intuition, structure with brilliance — the exact balance required for high-stakes executive communication.
                  </p>
                </div>
              </div>

              {/* Mission Section */}
              <div className="mb-16">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">The mission</h2>
                
                <div className="space-y-4 text-lg">
                  <p className="text-foreground font-medium">To help leaders communicate with clarity, confidence, and conviction.</p>
                  <p className="text-muted-foreground">To eliminate noise.</p>
                  <p className="text-muted-foreground">To make structure the default.</p>
                  <p className="text-accent font-medium">To make every idea sharp enough to matter.</p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                <Link to="/auth">
                  <Button variant="hero" size="xl" className="group">
                    Try AXORA Free
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" size="xl">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Links Section */}
        <section className="py-12 border-t border-white/5">
          <div className="container-narrow">
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/ai-deck-generator" className="text-accent hover:underline">
                AI deck generator →
              </Link>
              <Link to="/gamma-alternative" className="text-accent hover:underline">
                Gamma alternative →
              </Link>
              <Link to="/powerpoint-ai" className="text-accent hover:underline">
                PowerPoint AI →
              </Link>
              <Link to="/" className="text-muted-foreground hover:text-accent transition-colors">
                Home →
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
