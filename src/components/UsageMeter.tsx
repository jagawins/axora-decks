import { useEffect } from "react";
import { Sparkles, ArrowRight, Crown, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getUsageSummary } from "@/lib/usage-gates";
import { useNavigate } from "react-router-dom";
import { getVariant, trackABEvent } from "@/lib/ab-testing";

/**
 * Persistent usage meter — always visible in dashboard sidebar.
 * A/B tested with executive-focused copy variants.
 */

const VARIANT_COPY = {
  control: {
    ctaLabel: "Upgrade to Pro",
    ctaIcon: Sparkles,
    subtext: "14-day free trial · No credit card",
    lowLabel: "Running low",
    fullLabel: "Almost full",
  },
  scarcity: {
    ctaLabel: "Unlock Unlimited Decks",
    ctaIcon: Sparkles,
    subtext: "Don't let limits slow your strategy work",
    lowLabel: "Running out",
    fullLabel: "Limit reached",
  },
  value: {
    ctaLabel: "Go Executive",
    ctaIcon: Briefcase,
    subtext: "Board decks, investor updates, brand kits",
    lowLabel: "Almost there",
    fullLabel: "Time to upgrade",
  },
};

export function UsageMeter() {
  const { subscription, createCheckout } = useSubscription();
  const navigate = useNavigate();
  const usage = getUsageSummary(subscription.tier);
  const variant = getVariant("usage_meter_copy") as keyof typeof VARIANT_COPY;
  const copy = VARIANT_COPY[variant] || VARIANT_COPY.control;
  const Icon = copy.ctaIcon;

  useEffect(() => {
    if (subscription.tier === "free") {
      trackABEvent("usage_meter_copy", "impression");
    }
  }, [subscription.tier]);

  const handleUpgrade = async () => {
    trackABEvent("usage_meter_copy", "click");
    const { SUBSCRIPTION_TIERS } = await import("@/lib/subscription");
    const priceId = SUBSCRIPTION_TIERS.pro.monthlyPriceId;
    if (!priceId) return;
    const url = await createCheckout(priceId);
    if (url) window.open(url, "_blank");
  };

  if (subscription.tier !== "free") {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/5 border border-accent/15">
          <Crown className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs font-semibold text-accent capitalize">{subscription.tier} Plan</span>
          <span className="ml-auto text-[10px] text-muted-foreground">Unlimited</span>
        </div>
      </div>
    );
  }

  const meters = [
    { label: "Decks", used: usage.decks.used, limit: usage.decks.limit },
    { label: "AI actions", used: usage.aiGens.used, limit: usage.aiGens.limit },
  ];

  const totalUsedPct = Math.round(
    ((usage.decks.used / usage.decks.limit) + (usage.aiGens.used / usage.aiGens.limit)) / 2 * 100
  );

  return (
    <div className="px-4 py-3">
      <div className="rounded-xl border border-border/50 bg-card/30 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Free Plan</span>
          {totalUsedPct >= 60 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">
              {totalUsedPct >= 90 ? copy.fullLabel : copy.lowLabel}
            </span>
          )}
        </div>

        {meters.map(m => {
          const pct = Math.min(100, (m.used / m.limit) * 100);
          const isMaxed = m.used >= m.limit;
          return (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{m.label}</span>
                <span className={`text-xs font-semibold ${isMaxed ? "text-destructive" : "text-foreground"}`}>
                  {m.used}/{m.limit}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isMaxed ? "hsl(var(--destructive))" : pct >= 70 ? "hsl(35, 90%, 55%)" : "hsl(var(--accent))",
                  }}
                />
              </div>
            </div>
          );
        })}

        <Button
          variant="hero"
          size="sm"
          onClick={handleUpgrade}
          className="w-full text-xs gap-1.5 h-8"
        >
          <Icon className="h-3 w-3" />
          {copy.ctaLabel}
        </Button>

        <p className="text-center text-[10px] text-muted-foreground">
          {copy.subtext}
        </p>
      </div>
    </div>
  );
}
