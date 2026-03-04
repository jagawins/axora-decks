import { useState } from "react";
import { Sparkles, X, ArrowRight, Crown, Download, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import { isDismissedUpgradeBanner, dismissUpgradeBanner, getDecksRemaining } from "@/lib/usage-gates";

/**
 * Inline upgrade nudge — appears in the editor at high-intent moments.
 *
 * Conversion psychology: The best time to upsell is when the user
 * just experienced value. After generating their first deck, they're
 * excited — that's when you show what Pro unlocks NEXT.
 *
 * This is NOT a blocker. It's a gentle "you could do more" nudge.
 */

interface EditorUpgradeNudgeProps {
  /** Which context triggered the nudge */
  context?: "post-generation" | "export-attempt" | "feature-locked" | "sidebar";
}

const NUDGE_MESSAGES = {
  "post-generation": {
    title: "Nice deck! Want to make it even better?",
    body: "Pro unlocks AI images, premium templates, and PowerPoint export.",
    icon: Sparkles,
  },
  "export-attempt": {
    title: "Export to PowerPoint & PDF",
    body: "Free exports include an AXIVA watermark. Upgrade for clean exports.",
    icon: Download,
  },
  "feature-locked": {
    title: "This feature is Pro-only",
    body: "Start a free trial to unlock the full AXIVA experience.",
    icon: Crown,
  },
  "sidebar": {
    title: "Unlock the full toolkit",
    body: "Brand kits, premium themes, interactive blocks, and more.",
    icon: Palette,
  },
};

export function EditorUpgradeNudge({ context = "sidebar" }: EditorUpgradeNudgeProps) {
  const { subscription, createCheckout } = useSubscription();
  const [dismissed, setDismissed] = useState(isDismissedUpgradeBanner());

  // Don't show for paid users
  if (subscription.tier !== "free" || dismissed) return null;

  const msg = NUDGE_MESSAGES[context];
  const Icon = msg.icon;
  const remaining = getDecksRemaining(subscription.tier);

  const handleDismiss = () => {
    dismissUpgradeBanner();
    setDismissed(true);
  };

  const handleUpgrade = async () => {
    const priceId = SUBSCRIPTION_TIERS.pro.monthlyPriceId;
    if (!priceId) return;
    const url = await createCheckout(priceId);
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="relative mx-3 my-2 rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 p-3.5 animate-fade-in">
      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="flex items-start gap-2.5 mb-2.5">
        <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
          <Icon className="h-3.5 w-3.5 text-accent" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground leading-tight">{msg.title}</p>
          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{msg.body}</p>
        </div>
      </div>

      {/* Remaining counter */}
      {remaining >= 0 && remaining < 3 && (
        <div className="flex items-center gap-1.5 mb-2.5 text-[10px] text-amber-500">
          <div className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: i < remaining ? "currentColor" : "rgba(245, 158, 11, 0.2)",
                }}
              />
            ))}
          </div>
          <span className="font-medium">
            {remaining === 0 ? "No free decks remaining" : `${remaining} free deck${remaining === 1 ? "" : "s"} remaining`}
          </span>
        </div>
      )}

      <Button
        variant="hero"
        size="sm"
        onClick={handleUpgrade}
        className="w-full text-xs gap-1 h-7"
      >
        Start Free Trial
        <ArrowRight className="h-3 w-3" />
      </Button>

      <p className="text-center text-[9px] text-muted-foreground mt-1.5">
        No credit card · Cancel anytime
      </p>
    </div>
  );
}
