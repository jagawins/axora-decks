import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Copy, Check, Mail, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getReferralCode } from "@/lib/usage-gates";
import { useToast } from "@/hooks/use-toast";

interface InviteTeamModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InviteTeamModal({ open, onClose }: InviteTeamModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emails, setEmails] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  if (!user) return null;

  const referralCode = getReferralCode(user.id);
  const inviteLink = `https://axiva.ai/auth?ref=${referralCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied!", description: "Share it with your team." });
    } catch {
      /* fallback */
    }
  };

  const handleSendInvites = async () => {
    const emailList = emails
      .split(/[,;\n]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));

    if (emailList.length === 0) {
      toast({ title: "No valid emails", description: "Enter at least one email address.", variant: "destructive" });
      return;
    }

    setSending(true);
    // For now, copy the invite link and show a toast
    // In the future, this can call a Supabase edge function to send actual invite emails
    try {
      await navigator.clipboard.writeText(
        `Hey! I've been using AXIVA to build executive decks with AI — it's really good. Try it here: ${inviteLink}`
      );
      toast({
        title: `Invite message copied!`,
        description: `Paste it in an email to ${emailList.length} colleague${emailList.length > 1 ? "s" : ""}.`,
      });
      setEmails("");
      onClose();
    } catch {
      toast({ title: "Copied invite link", description: "Share it with your team." });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-lg">Invite your team</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Collaborate on decks together
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Value prop */}
          <div className="rounded-xl bg-accent/5 border border-accent/10 p-4">
            <p className="text-sm font-medium mb-2">Why invite teammates?</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                <span>They get their own 3 free decks</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                <span>You earn <strong className="text-foreground">+1 bonus deck</strong> for each signup</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                <span>Share decks and build a team library</span>
              </div>
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter email addresses</label>
            <Input
              placeholder="colleague@company.com, manager@company.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="text-sm"
            />
            <p className="text-[10px] text-muted-foreground">Separate multiple emails with commas</p>
          </div>

          {/* Or copy link */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">or share your invite link</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              readOnly
              value={inviteLink}
              className="text-xs bg-muted/30 font-mono"
            />
            <Button variant="outline" size="icon" className="shrink-0" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Maybe later
          </Button>
          <Button
            variant="hero"
            size="sm"
            className="gap-2"
            onClick={handleSendInvites}
            disabled={sending || !emails.trim()}
          >
            <Mail className="h-4 w-4" />
            Copy Invite Message
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Trigger logic ────────────────────────────────────
// Show the invite modal after the user's 2nd deck creation.
// Check is done in usage-gates, displayed in Editor or Dashboard.

const INVITE_STORAGE_KEY = "axiva_invite_team_shown";
const INVITE_DISMISS_DAYS = 14; // Don't show again for 14 days

export function shouldShowInviteTeam(deckCount: number): boolean {
  if (deckCount < 2) return false;
  try {
    const dismissed = localStorage.getItem(INVITE_STORAGE_KEY);
    if (dismissed) {
      const elapsed = Date.now() - new Date(dismissed).getTime();
      if (elapsed < INVITE_DISMISS_DAYS * 24 * 60 * 60 * 1000) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function dismissInviteTeam(): void {
  try {
    localStorage.setItem(INVITE_STORAGE_KEY, new Date().toISOString());
  } catch { /* silent */ }
}
