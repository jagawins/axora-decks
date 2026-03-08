/**
 * PWA install banner — appears after 2nd visit if not installed.
 */

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
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
  }, []);

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

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[80] animate-fade-in md:left-auto md:right-4 md:w-80">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-xl">
        <Download className="h-5 w-5 text-accent flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Add Axiva to home screen</p>
          <p className="text-xs text-muted-foreground">Faster access, works offline</p>
        </div>
        <Button size="sm" variant="hero" onClick={handleInstall} className="flex-shrink-0">
          Install
        </Button>
        <button onClick={handleDismiss} className="p-1 text-muted-foreground touch-target">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
