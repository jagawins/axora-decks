/**
 * Post-generation mobile share bottom sheet.
 * Primary: native share (or copy link). Secondary: nudge to desktop for PPTX.
 */

import { Share2, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MobileShareSheetProps {
  visible: boolean;
  shareUrl: string;
  title: string;
  onDismiss: () => void;
}

export function MobileShareSheet({ visible, shareUrl, title, onDismiss }: MobileShareSheetProps) {
  const { toast } = useToast();

  if (!visible) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out "${title}" — built with Axiva`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error — fallback to copy
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied!", description: "Share it anywhere." });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] animate-slide-up">
      <div className="mx-4 p-5 rounded-2xl bg-card border border-border shadow-2xl space-y-3" style={{ marginBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <p className="text-sm font-semibold text-foreground text-center">Your deck is ready! 🎉</p>

        <Button
          variant="hero"
          size="lg"
          className="w-full gap-2"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
          Share Link
        </Button>

        <button
          onClick={onDismiss}
          className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground py-2 touch-target"
        >
          <Monitor className="h-3.5 w-3.5" />
          Export to PPTX on desktop
        </button>
      </div>
    </div>
  );
}
