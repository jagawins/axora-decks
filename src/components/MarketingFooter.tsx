import { Link } from "react-router-dom";
import axoraWordmark from "@/assets/axora-wordmark-dark.svg";

const MarketingFooter = () => {
  return (
    <footer className="border-t border-border py-12 md:py-16 pb-safe">
      <div className="container-wide">
        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Column 1: Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/templates" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Compare */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Compare</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/gamma-alternative" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  AXORA vs Gamma
                </Link>
              </li>
              <li>
                <Link to="/powerpoint-ai" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  PowerPoint AI
                </Link>
              </li>
              <li>
                <Link to="/ai-deck-generator" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  AI Deck Generator
                </Link>
              </li>
              <li>
                <Link to="/executive-deck-generator" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Executive Decks
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/templates" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Template Gallery
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Press Kit
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/founder" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Founder
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Founder Signature */}
        <div className="border-t border-white/5 pt-8 mb-8">
          <p className="text-sm text-center text-muted-foreground">
            Built by{" "}
            <Link to="/founder" className="text-accent hover:underline font-medium">
              Jag Mariappan
            </Link>{" "}
            — Founder of AXORA
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-6">
          <div className="flex items-center">
            <img src={axoraWordmark} alt="AXORA" className="h-5 sm:h-6 w-auto" />
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md order-3 md:order-2">
            AXORA is an AI deck generator built for executives who need structured, presentation-ready slides.
          </p>

          <p className="text-xs sm:text-sm text-muted-foreground order-2 md:order-3">
            © {new Date().getFullYear()} AXORA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MarketingFooter;
