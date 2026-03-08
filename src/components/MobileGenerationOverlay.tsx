/**
 * Full-screen generation loading overlay for mobile.
 * Shows pulsing logo, user prompt, and progressive stage labels.
 */

import { useEffect, useState } from "react";
import axivaWordmark from "@/assets/axiva-wordmark-dark.svg";

const STAGES = [
  "Outlining your deck…",
  "Writing slides…",
  "Adding visuals…",
  "Finishing up…",
];

interface MobileGenerationOverlayProps {
  visible: boolean;
  promptText?: string;
}

export function MobileGenerationOverlay({ visible, promptText }: MobileGenerationOverlayProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [instanceKey, setInstanceKey] = useState(0);

  useEffect(() => {
    if (!visible) return;
    // Reset on each new show (handles re-generation in same session)
    setStageIndex(0);
    setInstanceKey(k => k + 1);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setStageIndex((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [visible, instanceKey]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl px-6">
      {/* Pulsing logo */}
      <div className="animate-pulse-glow mb-8">
        <img src={axivaWordmark} alt="Axiva" className="h-8 w-auto opacity-90" />
      </div>

      {/* Prompt echo */}
      {promptText && (
        <p className="text-sm text-muted-foreground italic text-center max-w-xs mb-8 line-clamp-3">
          "{promptText}"
        </p>
      )}

      {/* Stage label */}
      <div className="flex flex-col items-center gap-4">
        <div className="h-1 w-48 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-[3000ms] ease-linear rounded-full"
            style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
          />
        </div>
        <p className="text-sm font-medium text-foreground animate-fade-in" key={stageIndex}>
          {STAGES[stageIndex]}
        </p>
      </div>
    </div>
  );
}
