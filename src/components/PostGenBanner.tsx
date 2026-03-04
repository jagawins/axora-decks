/**
 * Post-generation success banner — the "aha moment" conversion trigger.
 *
 * Gamma's insight: The moment a user sees their first AI-generated deck
 * is the highest-intent moment in the entire funnel. At that point they
 * KNOW the product works and are most receptive to "unlock more."
 *
 * This component shows after generation completes, celebrating the
 * result while gently introducing what Pro unlocks next.
 */

import { useState, useEffect } from "react";
import { Sparkles, Download, Image, Palette, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import { getDeckGenCount } from "@/lib/usage-gates";

interface PostGenBannerProps {
  visible: boolean;
  onDismiss: () => void;
  slideCount?: number;
}

export function PostGenBanner({ visible, onDismiss, slideCount }: PostGenBannerProps) {
  const { subscription, createCheckout } = useSubscription();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      // Delay showing slightly so the deck renders first
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
    setShow(false);
  }, [visible]);

  // Don't show for paid users
  if (subscription.tier !== "free" || !show) return null;

  const genCount = getDeckGenCount();
  const isFirstDeck = genCount <= 1;
  const isLastFree = genCount >= 3;

  const handleUpgrade = async () => {
    const priceId = SUBSCRIPTION_TIERS.pro.monthlyPriceId;
    if (!priceId) return;
    const url = await createCheckout(priceId);
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up max-w-md w-[90vw]">
      <div className="relative rounded-2xl border border-accent/20 bg-card/95 backdrop-blur-xl p-5 shadow-2xl shadow-accent/5">
        {/* Dismiss */}
        <button
          onClick={() => { setShow(false); onDismiss(); }}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Success message */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-success" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {isFirstDeck ? "Your first deck is ready!" : `${slideCount || "Your"} slides generated`}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isLastFree
                ? "This was your last free generation."
                : `${3 - genCount} free generation${3 - genCount === 1 ? "" : "s"} remaining`
              }
            </p>
          </div>
        </div>

        {/* What Pro unlocks — preview-then-pay */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: Download, label: "PPTX Export", sub: "No watermark" },
            { icon: Image, label: "AI Images", sub: "Custom visuals" },
            { icon: Palette, label: "Brand Kit", sub: "Your identity" },
          ].map(f => (
            <div key={f.label} className="text-center p-2 rounded-lg bg-muted/20 border border-border/30">
              <f.icon className="h-3.5 w-3.5 text-accent mx-auto mb-1" />
              <p className="text-[10px] font-semibold text-foreground">{f.label}</p>
              <p className="text-[9px] text-muted-foreground">{f.sub}</p>
            </div>
          ))}
        </div>

        <Button
          variant="hero"
          size="sm"
          onClick={handleUpgrade}
          className="w-full text-xs gap-1.5"
        >
          Unlock Pro — Free for 14 Days
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
