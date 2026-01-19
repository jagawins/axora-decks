import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import axoraWordmark from "@/assets/axora-wordmark-dark.svg";

const Navbar = () => {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl safe-area-top">
      <div className="container-wide">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={axoraWordmark} alt="AXORA" className="h-6 sm:h-7 w-auto" />
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Templates
            </Link>
            <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
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

          {/* Mobile: CTA + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {loading ? null : user ? (
              <Link to="/dashboard">
                <Button variant="hero" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="hero" size="sm">
                  Try Free
                </Button>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl">
          <div className="container-wide py-4 flex flex-col gap-3">
            <Link 
              to="/templates" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Templates
            </Link>
            <Link 
              to="/features" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            {!loading && !user && (
              <Link 
                to="/auth" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
