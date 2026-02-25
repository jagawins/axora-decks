/**
 * SlideQuickActions – floating toolbar with quick AI refinement actions
 * Appears on hover in DeckPlayer's DeckView
 */

import { useState } from "react";
import { Loader2, Scissors, Eye, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlideQuickActionsProps {
  blockId: string;
  onAction: (blockId: string, instruction: string) => Promise<void>;
}

const ACTIONS = [
  {
    icon: Scissors,
    label: "Shorter",
    instruction: "Make this more concise. Remove filler words and redundancy. Keep the core message.",
  },
  {
    icon: Eye,
    label: "More visual",
    instruction: "Convert this to a more visual block type if possible. Use icons, cards, or structured layouts instead of prose.",
  },
  {
    icon: Target,
    label: "Decision slide",
    instruction: "Reframe this as a decision summary. Lead with the decision, then rationale, then next steps.",
  },
];

export function SlideQuickActions({ blockId, onAction }: SlideQuickActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (instruction: string, label: string) => {
    setLoading(label);
    try {
      await onAction(blockId, instruction);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-[var(--deck-bg)]/90 border border-[var(--deck-border)] rounded-lg backdrop-blur-sm p-1">
      {ACTIONS.map(({ icon: Icon, label, instruction }) => (
        <Button
          key={label}
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1"
          disabled={loading !== null}
          onClick={() => handleAction(instruction, label)}
          title={label}
        >
          {loading === label ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Icon className="h-3 w-3" />
          )}
          {label}
        </Button>
      ))}
    </div>
  );
}
