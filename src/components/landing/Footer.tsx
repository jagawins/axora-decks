import { Link } from "react-router-dom";
import axoraWordmark from "@/assets/axora-wordmark-dark.svg";

const Footer = () => {
  return (
    <footer className="border-t border-border py-16">
      <div className="container-wide">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/ai-deck-generator" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  AI Deck Generator
                </Link>
              </li>
              <li>
                <Link to="/gamma-alternative" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Gamma Alternative
                </Link>
              </li>
              <li>
                <Link to="/powerpoint-ai" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  PowerPoint AI
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Features
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
                  AXOR vs Gamma
                </Link>
              </li>
              <li>
                <Link to="/gamma-alternative" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Gamma AI Alternative
                </Link>
              </li>
              <li>
                <Link to="/powerpoint-ai" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  PowerPoint AI Generator
                </Link>
              </li>
              <li>
                <Link to="/ai-deck-generator" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  AI Slide Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Pricing
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
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="mailto:hello@axor.verityaxis.com" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center">
              <img src={axoraWordmark} alt="AXORA" className="h-6 w-auto" />
            </div>

            {/* Micro-copy */}
            <p className="text-sm text-muted-foreground text-center max-w-md">
              AXOR is an AI deck generator built for executives who need structured, presentation-ready slides — not generic content.
            </p>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © 2024 AXORA. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
