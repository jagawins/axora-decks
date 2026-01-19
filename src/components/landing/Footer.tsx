import { Link } from "react-router-dom";
import axoraLogo from "@/assets/axora-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container-wide">
        {/* SEO Links Section */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 pb-8 border-b border-white/5">
          <Link 
            to="/gamma-alternative" 
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            Gamma Alternative
          </Link>
          <Link 
            to="/powerpoint-ai" 
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            PowerPoint AI
          </Link>
          <Link 
            to="/ai-deck-generator" 
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            AI Deck Generator
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={axoraLogo} alt="Axora" className="h-7 w-auto" />
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2024 AXORA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
