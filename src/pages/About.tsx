import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Linkedin, Twitter } from "lucide-react";
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
        "@id": "https://axora.lovable.app/#organization",
        "name": "AXORA",
        "url": "https://axora.lovable.app",
        "logo": {
          "@type": "ImageObject",
          "url": "https://axora.lovable.app/favicon.png"
        },
        "description": "AI-powered executive presentation generator. Turn raw ideas into structured, decision-ready decks.",
        "founder": {
          "@id": "https://axora.lovable.app/#person"
        },
        "sameAs": [
          "https://x.com/inaxora"
        ]
      },
      {
        "@type": "Person",
        "@id": "https://axora.lovable.app/#person",
        "name": "Jag Mariappan",
        "jobTitle": "Founder",
        "worksFor": {
          "@id": "https://axora.lovable.app/#organization"
        },
        "image": "https://axora.lovable.app/founder-card-og.png",
        "url": "https://axora.lovable.app/about",
        "sameAs": [
          "https://x.com/inaxora",
          "https://linkedin.com/in/jagmariappan"
        ],
        "description": "Founder of AXORA. Building executive-grade AI presentation tools for leaders, consultants, and strategists."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About AXORA — Jag Mariappan, Founder</title>
        <meta 
          name="description" 
          content="Meet Jag Mariappan, founder of AXORA. Learn about the mission to build executive-grade AI presentation tools for leaders and strategists." 
        />
        <link rel="canonical" href="https://axora.lovable.app/about" />
        
        {/* OG Tags with wide founder image */}
        <meta property="og:title" content="About AXORA — Jag Mariappan, Founder" />
        <meta property="og:description" content="Meet Jag Mariappan, founder of AXORA. Building executive-grade AI presentation tools." />
        <meta property="og:image" content="https://axora.lovable.app/founder-card-og.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="628" />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content="https://axora.lovable.app/about" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About AXORA — Jag Mariappan, Founder" />
        <meta name="twitter:description" content="Meet Jag Mariappan, founder of AXORA. Building executive-grade AI presentation tools." />
        <meta name="twitter:image" content="https://axora.lovable.app/founder-card-og.png" />
        <meta name="twitter:creator" content="@inaxora" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <MarketingHeader />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-60" />
          </div>
          
          <div className="container-narrow relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Founder Card */}
              <div className="glass-card overflow-hidden mb-12">
                {/* Header gradient band */}
                <div className="h-32 bg-gradient-to-r from-[hsl(210,100%,95%)] to-[hsl(210,100%,88%)]" />
                
                {/* Content area */}
                <div className="px-8 pb-8 -mt-16">
                  <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
                    {/* Profile image - using square for page, with srcset for retina */}
                    <img 
                      src={founderCardSquare} 
                      alt="Jag Mariappan — Founder of AXORA" 
                      className="w-32 h-32 rounded-2xl border-4 border-background shadow-xl object-cover"
                    />
                    
                    {/* Name and title */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                          Jag Mariappan
                        </h1>
                        <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          AXORA
                        </span>
                      </div>
                      <p className="text-lg text-muted-foreground">
                        Founder of AXORA · <a 
                          href="https://x.com/inaxora" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          @inaxora
                        </a>
                      </p>
                    </div>
                    
                    {/* Social links */}
                    <div className="flex gap-3">
                      <a 
                        href="https://x.com/inaxora" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-accent/10 transition-colors"
                        aria-label="Follow on X (Twitter)"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                      <a 
                        href="https://linkedin.com/in/jagmariappan" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-accent/10 transition-colors"
                        aria-label="Connect on LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                  
                  {/* Tagline */}
                  <p className="text-xl text-foreground font-medium mb-4">
                    I build executive grade decks fast. Structured blocks in, polished slides out.
                  </p>
                </div>
              </div>

              {/* Biography Section */}
              <div className="prose prose-lg prose-invert max-w-none">
                <h2 className="text-2xl font-bold mb-6">About AXORA</h2>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  AXORA was born from a simple frustration: most AI presentation tools generate 
                  slides that look impressive but say nothing. They prioritize design over substance, 
                  creativity over clarity.
                </p>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  After years of building strategy decks, investor updates, and board presentations, 
                  I realized what executives actually need isn't another design tool—it's a thinking tool. 
                  A system that structures ideas into clear, logical narratives before worrying about fonts 
                  and gradients.
                </p>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  AXORA approaches presentations differently. Instead of generating random slides, 
                  it builds decks from structured blocks: headings, text, lists, tables, callouts, 
                  and two-column layouts. Each block serves a purpose. Each slide advances an argument.
                </p>

                <h3 className="text-xl font-bold mt-10 mb-4">The Philosophy</h3>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Great presentations aren't about visual impact—they're about decision impact. 
                  The best executive decks are clear, concise, and structured for action. They 
                  anticipate questions, address objections, and guide stakeholders toward decisions.
                </p>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  AXORA is built on this philosophy. It generates presentations that think like 
                  executives: brevity over verbosity, hierarchy over chaos, clarity over cleverness.
                </p>

                <h3 className="text-xl font-bold mt-10 mb-4">Who It's For</h3>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Executives who need to communicate strategy clearly",
                    "Founders pitching to investors or boards",
                    "Consultants building client deliverables",
                    "Product leaders presenting roadmaps and reviews",
                    "Strategy teams preparing leadership briefings"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="text-accent mt-1">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <p className="text-muted-foreground leading-relaxed">
                  If you care more about what your presentation says than how it looks, 
                  AXORA is built for you.
                </p>
              </div>

              {/* CTA */}
              <div className="mt-12 flex flex-wrap gap-4">
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
