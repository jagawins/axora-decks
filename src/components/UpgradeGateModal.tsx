import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";

interface UpgradeGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeGateModal({ open, onOpenChange }: UpgradeGateModalProps) {
  const { createCheckout } = useSubscription();

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-accent" />
            Generation Limit Reached
          </DialogTitle>
          <DialogDescription>
            You've used all 3 free full deck generations. Block-level edits remain unlimited.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
            <p className="text-sm font-medium mb-2">Upgrade to Pro for:</p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Unlimited full deck generations
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                PDF & PowerPoint export
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Custom themes
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Continue Editing
          </Button>
          <Button variant="hero" onClick={handleUpgrade}>
            Upgrade to Pro
          </Button>
        </DialogFooter>
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
