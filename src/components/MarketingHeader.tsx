import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import axivaWordmarkDark from "@/assets/axiva-wordmark-dark.svg";
import axivaWordmarkLight from "@/assets/axiva-wordmark.svg";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const PRODUCT_LINKS = [
  { to: "/features", label: "Features" },
  { to: "/templates", label: "Templates" },
  { to: "/executive", label: "Executive Hub" },
  { to: "/live-polls", label: "Live Polls" },
  { to: "/live-quiz", label: "Live Quiz" },
  { to: "/how-it-works", label: "How it works" },
];

const RESOURCE_LINKS = [
  { to: "/demo", label: "Sample decks" },
  { to: "/webinars", label: "Webinars" },
  { to: "/all-hands", label: "All-hands" },
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
];

const linkClass =
  "text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm";

function DesktopMenu({ label, links }: { label: string; links: typeof PRODUCT_LINKS }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        className={cn(linkClass, "inline-flex items-center gap-1 py-2")}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute left-0 top-full z-50 min-w-[220px] rounded-xl border border-border/60 bg-background/98 p-2 shadow-xl backdrop-blur-xl"
      >
        <ul>
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const MarketingHeader = () => {
  const { theme } = useTheme();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const axivaWordmark = theme === "light" ? axivaWordmarkLight : axivaWordmarkDark;

  // Close the mobile menu on navigation and on Escape
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  const close = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/85 backdrop-blur-xl">
      <div className="container-wide">
        {/* Desktop / tablet */}
        <div className="hidden h-16 items-center justify-between gap-6 lg:flex">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center" aria-label="AXIVA home">
              <img src={axivaWordmark} alt="AXIVA" className="h-7 w-auto" />
            </Link>
            <div className="flex items-center gap-6">
              <DesktopMenu label="Product" links={PRODUCT_LINKS} />
              <DesktopMenu label="Resources" links={RESOURCE_LINKS} />
              <Link to="/pricing" className={cn(linkClass, "py-2")}>
                Pricing
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {loading ? null : user ? (
              <Button asChild variant="hero" size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild variant="hero" size="sm">
                  <Link to="/auth?mode=signup">Get started free</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile / small tablet */}
        <div className="flex h-16 items-center justify-between lg:hidden">
          <Link to="/" className="flex items-center" aria-label="AXIVA home">
            <img src={axivaWordmark} alt="AXIVA" className="h-6 w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!mobileMenuOpen}
        className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border/50 bg-background/98 backdrop-blur-xl lg:hidden"
      >
        <div className="container-wide flex flex-col gap-5 py-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Product
            </p>
            <ul className="flex flex-col">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} onClick={close} className="block py-2.5 text-[15px] text-foreground/85">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Resources
            </p>
            <ul className="flex flex-col">
              {RESOURCE_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} onClick={close} className="block py-2.5 text-[15px] text-foreground/85">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link to="/pricing" onClick={close} className="py-2.5 text-[15px] font-medium text-foreground">
            Pricing
          </Link>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <ThemeToggle showLabel />
            {loading ? null : user ? (
              <Button asChild variant="hero" size="sm" className="h-11 w-full">
                <Link to="/dashboard" onClick={close}>
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="h-11 w-full">
                  <Link to="/auth" onClick={close}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild variant="hero" size="sm" className="h-11 w-full">
                  <Link to="/auth?mode=signup" onClick={close}>
                    Get started free
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MarketingHeader;
