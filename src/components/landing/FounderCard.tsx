import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import founderCardSquare from "@/assets/founder-card-square.png";

interface FounderCardProps {
  variant?: "default" | "compact";
  className?: string;
}

const FounderCard = ({ variant = "default", className = "" }: FounderCardProps) => {
  if (variant === "compact") {
    return (
      <Link to="/about" className={`flex items-center gap-4 hover:opacity-80 transition-opacity ${className}`}>
        <img 
          src={founderCardSquare} 
          alt="Jag Mariappan — Founder of AXIVA" 
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-foreground">Jag Mariappan</p>
          <p className="text-sm text-muted-foreground">Founder of AXIVA</p>
        </div>
      </Link>
    );
  }

  return (
    <section className={`py-16 ${className}`}>
      <div className="container-narrow">
        <div className="glass-card overflow-hidden">
          {/* Header gradient band */}
          <div className="h-24 bg-gradient-to-r from-[hsl(210,100%,95%)] to-[hsl(210,100%,88%)]" />
          
          {/* Content area */}
          <div className="px-8 pb-8 -mt-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-6">
              {/* Profile image */}
              <Link to="/about">
                <img 
                  src={founderCardSquare} 
                  alt="Jag Mariappan — Founder of AXIVA" 
                  className="w-24 h-24 rounded-2xl border-4 border-background shadow-lg object-cover hover:shadow-xl transition-shadow"
                />
              </Link>
              
              {/* Name and title */}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <Link to="/about" className="hover:opacity-80 transition-opacity">
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                      Jag Mariappan
                    </h3>
                  </Link>
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    AXIVA
                  </span>
                </div>
                <p className="text-muted-foreground mt-1">
                  Founder of AXIVA · <a 
                    href="https://x.com/inaxiva" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    @inaxiva
                  </a>
                </p>
              </div>
            </div>
            
            {/* Quote */}
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              I build executive grade decks fast. Structured blocks in, polished slides out.
            </p>
            
            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="group">
                  Try AXIVA
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="group">
                  <Play className="h-4 w-4 mr-2" />
                  Watch demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderCard;
