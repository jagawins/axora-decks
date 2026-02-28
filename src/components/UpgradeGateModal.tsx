import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Check, ArrowRight } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import { useNavigate } from "react-router-dom";

interface UpgradeGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional context for what triggered the gate */
  feature?: string;
}

const PRO_FEATURES = [
  "Unlimited deck generations",
  "AI image generation",
  "Brand Kit (fonts, colors, logo)",
  "Interactive blocks (Tabs, Toggle, Reveal)",
  "Premium templates & themes",
  "Presenter view & slide analytics",
  "PDF & PowerPoint export",
  "Passcode-protected sharing",
];

export function UpgradeGateModal({ open, onOpenChange, feature }: UpgradeGateModalProps) {
  const { createCheckout } = useSubscription();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    const priceId = SUBSCRIPTION_TIERS.pro.monthlyPriceId;
    if (!priceId) return;

    const url = await createCheckout(priceId);
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-accent" />
            {feature ? `${feature} is a Pro Feature` : "Generation Limit Reached"}
          </DialogTitle>
          <DialogDescription>
            {feature
              ? `${feature} requires an Axora Pro plan. Upgrade for $28/mo to unlock it and everything below.`
              : "You've used all 3 free deck generations. Upgrade to Pro ($28/mo) for unlimited access."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-accent" />
              <p className="text-sm font-bold text-foreground">Everything in Pro — $28/mo:</p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-success font-medium">
              ✦ 14-day free trial — no credit card required • Full refund guarantee
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Continue on Free
          </Button>
          <Button variant="hero" onClick={handleUpgrade} className="group">
            Start 14-Day Free Trial
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </DialogFooter>

        <div className="text-center">
          <button
            onClick={() => {
              onOpenChange(false);
              navigate("/pricing");
            }}
            className="text-xs text-muted-foreground hover:text-accent transition-colors"
          >
            Compare all plans →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Utility functions for soft gating
const STORAGE_KEY = "axora_deck_gen_count";
const MAX_FREE_GENERATIONS = 3;

export function getDeckGenCount(): number {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

export function incrementDeckGenCount(): number {
  const count = getDeckGenCount() + 1;
  try {
    localStorage.setItem(STORAGE_KEY, String(count));
  } catch {}
  return count;
}

export function canGenerateDeck(tier: string): boolean {
  if (tier !== "free") return true;
  return getDeckGenCount() < MAX_FREE_GENERATIONS;
}
