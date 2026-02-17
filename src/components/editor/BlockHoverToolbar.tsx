import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Scissors, Expand, Briefcase, Zap } from "lucide-react";

interface BlockHoverToolbarProps {
  visible: boolean;
  onQuickAction: (instruction: string) => Promise<void>;
}

const actions = [
  { label: "Shorten", icon: Scissors, instruction: "Make it more concise and punchy. Remove filler words." },
  { label: "Expand", icon: Expand, instruction: "Expand with more detail, examples, and supporting evidence." },
  { label: "Executive", icon: Briefcase, instruction: "Rewrite in a confident, executive tone. Lead with impact." },
  { label: "Persuasive", icon: Zap, instruction: "Make it more persuasive. Add urgency and compelling framing." },
];

const BlockHoverToolbar = ({ visible, onQuickAction }: BlockHoverToolbarProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  if (!visible) return null;

  const handleClick = async (instruction: string, label: string) => {
    setLoading(label);
    try {
      await onQuickAction(instruction);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-card border border-border rounded-lg shadow-lg px-1.5 py-1">
      {actions.map(({ label, icon: Icon, instruction }) => (
        <Button
          key={label}
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1"
          disabled={!!loading}
          onClick={(e) => {
            e.stopPropagation();
            handleClick(instruction, label);
          }}
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
};

export default BlockHoverToolbar;
