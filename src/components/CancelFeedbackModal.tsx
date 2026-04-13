import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CANCEL_REASONS = [
  { key: "A", label: "Missing features" },
  { key: "B", label: "Prefer another tool" },
  { key: "C", label: "Not what I expected" },
  { key: "D", label: "AI or technical issues" },
  { key: "E", label: "It's too expensive" },
  { key: "F", label: "Free plan good enough" },
  { key: "G", label: "I don't need it right now" },
];

interface CancelFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCancel: () => Promise<boolean>;
  cancelLoading: boolean;
}

type Step = "reason" | "feedback" | "confirm";

export function CancelFeedbackModal({
  open,
  onOpenChange,
  onConfirmCancel,
  cancelLoading,
}: CancelFeedbackModalProps) {
  const [step, setStep] = useState<Step>("reason");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState("");
  const [feedback, setFeedback] = useState("");

  const reset = () => {
    setStep("reason");
    setSelectedReason(null);
    setFollowUp("");
    setFeedback("");
  };

  const handleClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const selectedLabel = CANCEL_REASONS.find((r) => r.key === selectedReason)?.label;

  // Follow-up prompts based on reason
  const getFollowUpPrompt = () => {
    switch (selectedReason) {
      case "A": return "What features were you looking for?";
      case "B": return "Which tool do you prefer and why?";
      case "C": return "What were you expecting?";
      case "D": return "What issues did you experience?";
      case "E": return "What price would feel fair?";
      case "F": return "What would make Pro worth it?";
      case "G": return "What would bring you back?";
      default: return "Tell us more...";
    }
  };

  const handleConfirm = async () => {
    // Send feedback email via edge function
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "cancellation-feedback",
          recipientEmail: "jag@axiva.ai",
          idempotencyKey: `cancel-feedback-${Date.now()}`,
          templateData: {
            reason: selectedLabel || "Not specified",
            followUp: followUp.trim() || "No details provided",
            feedback: feedback.trim() || "No additional feedback",
          },
        },
      });
    } catch (e) {
      console.error("Failed to send feedback email:", e);
    }

    const success = await onConfirmCancel();
    if (success) {
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {step === "reason" && (
          <>
            <DialogHeader className="flex-row items-center gap-2 space-y-0">
              <Heart className="h-5 w-5 text-accent" />
              <DialogTitle className="text-accent text-base font-semibold">Your feedback</DialogTitle>
            </DialogHeader>

            <div className="pt-2 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  We're sorry AXIVA isn't working for you.
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Could you tell us why you're leaving?
                </p>
              </div>

              <div className="space-y-2">
                {CANCEL_REASONS.map((reason) => (
                  <button
                    key={reason.key}
                    onClick={() => setSelectedReason(reason.key)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-colors text-left",
                      selectedReason === reason.key
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border text-foreground hover:border-muted-foreground/30"
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center h-7 w-7 rounded-md text-xs font-bold shrink-0",
                        selectedReason === reason.key
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {selectedReason === reason.key ? "✓" : reason.key}
                    </span>
                    {reason.label}
                  </button>
                ))}
              </div>

              {selectedReason && (
                <div className="space-y-2 pt-1">
                  <label className="text-sm font-medium text-foreground">
                    {getFollowUpPrompt()}
                  </label>
                  <Textarea
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder="We read every answer..."
                    rows={3}
                    className="resize-y"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Go back
              </Button>
              <Button
                disabled={!selectedReason}
                onClick={() => setStep("feedback")}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                Next
              </Button>
            </div>
          </>
        )}

        {step === "feedback" && (
          <>
            <DialogHeader className="flex-row items-center gap-2 space-y-0">
              <Heart className="h-5 w-5 text-accent" />
              <DialogTitle className="text-accent text-base font-semibold">Your feedback</DialogTitle>
            </DialogHeader>

            <div className="pt-2 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  What could we have done better?
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  We want to make the best product possible. We'd appreciate your honest feedback.
                </p>
              </div>

              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="We read every answer..."
                rows={5}
                className="resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("reason")}>
                Back
              </Button>
              <Button
                onClick={() => setStep("confirm")}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                Next
              </Button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <DialogHeader className="flex-row items-center gap-2 space-y-0">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <DialogTitle className="text-foreground text-base font-semibold">Final confirmation</DialogTitle>
            </DialogHeader>

            <div className="pt-2 space-y-4">
              <h2 className="text-xl font-bold text-foreground">
                Just making sure.
              </h2>
              <p className="text-sm text-muted-foreground">
                You'll lose access to your paid plan at the end of your billing period.
              </p>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Once it expires:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Exports will include the "Made with AXIVA" badge</li>
                  <li>AI usage will be limited</li>
                  <li>Premium templates & themes will be locked</li>
                  <li>Brand Kit features will be unavailable</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("feedback")}>
                Back
              </Button>
              <Button
                disabled={cancelLoading}
                onClick={handleConfirm}
                className="bg-foreground text-background hover:bg-foreground/90 gap-1"
              >
                {cancelLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm & cancel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
