import { useState } from "react";
import { Gift, Copy, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getReferralCode, getReferralCount, getReferralCredits } from "@/lib/usage-gates";

export default function ReferralPanel() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const referralCode = getReferralCode(user.id);
  const referralCount = getReferralCount();
  const referralCredits = getReferralCredits();
  const referralLink = `https://axiva.ai/auth?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-accent/10">
          <Gift className="h-4 w-4 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold">Invite & Earn</p>
          <p className="text-[10px] text-muted-foreground">+1 free deck per referral</p>
        </div>
      </div>

      {/* Stats */}
      {referralCount > 0 && (
        <div className="flex items-center gap-3 mb-3 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{referralCount} invited</span>
          </div>
          <div className="flex items-center gap-1 text-accent font-medium">
            <Gift className="h-3 w-3" />
            <span>+{referralCredits} bonus decks</span>
          </div>
        </div>
      )}

      {/* Copy link */}
      <div className="flex gap-2">
        <div className="flex-1 text-[10px] text-muted-foreground bg-muted/30 rounded-lg px-2.5 py-2 truncate font-mono">
          {referralLink}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 h-8 px-2.5"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
        Share your link. When someone signs up and creates a deck, you both get +1 free generation.
      </p>
    </div>
  );
}
