import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import axoraIcon from "@/assets/axora-icon.svg";

const MarketingHeader = () => {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="container-wide">
        {/* Desktop: 3-column grid */}
        <div className="hidden md:grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: Logo with fixed width */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src={axoraIcon} alt="AXORA" className="h-8 w-8" />
              <span className="text-lg font-bold tracking-tight">AXORA</span>
            </Link>
          </div>

          {/* Center: SEO Navigation Links */}
          <div className="flex items-center justify-center gap-6">
            <Link to="/ai-deck-generator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              AI Deck Generator
            </Link>
            <Link to="/gamma-alternative" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Gamma Alternative
            </Link>
            <Link to="/powerpoint-ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              PowerPoint AI
            </Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>

          {/* Right: CTA Buttons */}
          <div className="flex items-center justify-end gap-3">
            {loading ? null : user ? (
              <Link to="/dashboard">
                <Button variant="hero" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm">
                    Try Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile: Logo + hamburger */}
        <div className="flex md:hidden h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={axoraIcon} alt="AXORA" className="h-8 w-8" />
            <span className="text-lg font-bold tracking-tight">AXORA</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl">
          <div className="container-wide py-4 flex flex-col gap-4">
            <Link 
              to="/ai-deck-generator" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              AI Deck Generator
            </Link>
            <Link 
              to="/gamma-alternative" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gamma Alternative
            </Link>
            <Link 
              to="/powerpoint-ai" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              PowerPoint AI
            </Link>
            <Link 
              to="/pricing" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              {loading ? null : user ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="hero" size="sm" className="w-full">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="hero" size="sm" className="w-full">
                      Try Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MarketingHeader;
