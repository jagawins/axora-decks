/**
 * PWA install banner — appears only for signed-in users on authenticated surfaces, after a repeat visit.
 */

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// Public / first-use surfaces where the invitation must never interrupt.
const BLOCKED_PREFIXES = ["/", "/demo", "/create", "/auth", "/live", "/live-polls", "/live-quiz", "/pricing", "/onboarding"];

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const isBlockedRoute = BLOCKED_PREFIXES.some((p) => (p === "/" ? path === "/" : path === p || path.startsWith(p + "/")));
  const eligible = Boolean(user) && !isBlockedRoute;

  useEffect(() => {
    if (!eligible) return;
    // Already running as installed PWA — skip entirely
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Check visit count
    const visits = parseInt(localStorage.getItem("axiva_visits") || "0", 10);
    localStorage.setItem("axiva_visits", String(visits + 1));

    // Don't show if dismissed or fewer than 2 visits
    if (visits < 1 || localStorage.getItem("axiva_pwa_dismissed") === "1") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [eligible]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("axiva_pwa_dismissed", "1");
  };

  if (!show || !eligible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] animate-fade-in md:left-auto md:right-4 md:w-80">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-xl">
        <Download className="h-5 w-5 text-accent flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Add Axiva to home screen</p>
          <p className="text-xs text-muted-foreground">Faster access, works offline</p>
        </div>
        <Button size="sm" variant="hero" onClick={handleInstall} className="flex-shrink-0">
          Install
        </Button>
        <button type="button" onClick={handleDismiss} aria-label="Dismiss install suggestion" className="p-1 text-muted-foreground touch-target">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
