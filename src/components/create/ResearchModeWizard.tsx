import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AlignmentStep from "./AlignmentStep";
import ResearchStep from "./ResearchStep";
import OutlineStep from "./OutlineStep";
import GenerateStep from "./GenerateStep";
import type {
  WizardStep,
  AlignmentData,
  ResearchBrief,
  OutlineSlide,
} from "@/types/research-mode";

const STEP_LABELS = ["Alignment", "Research", "Outline", "Generate"] as const;

function trackStepEvent(
  userId: string | undefined,
  sessionId: string,
  step: number,
  action: "completed" | "abandoned"
) {
  // Fire-and-forget analytics
  supabase
    .from("analytics_events" as any)
    .insert({
      user_id: userId ?? null,
      session_id: sessionId,
      event: "research_mode_step",
      properties: { step, action },
    } as any)
    .then(() => {});
}

export default function ResearchModeWizard() {
  const { user } = useAuth();
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  const [step, setStep] = useState<WizardStep>(1);
  const [alignment, setAlignment] = useState<AlignmentData>({
    goal: "",
    audience: "Board",
    outcome: "",
    mustIncludeFacts: "",
    fileExtracts: [],
  });
  const [brief, setBrief] = useState<ResearchBrief | null>(null);
  const [outline, setOutline] = useState<OutlineSlide[]>([]);

  const goTo = useCallback(
    (next: WizardStep) => {
      // Track the step we just completed
      if (next > step) {
        trackStepEvent(user?.id, sessionId, step, "completed");
      }
      setStep(next);
    },
    [step, user?.id, sessionId]
  );

  const handleOutlineChange = useCallback((slides: OutlineSlide[]) => {
    setOutline(slides);
  }, []);

  return (
    <div className="space-y-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => {
          const stepNum = (i + 1) as WizardStep;
          const isActive = stepNum === step;
          const isDone = stepNum < step;

          return (
            <div key={label} className="flex-1 flex flex-col gap-1.5">
              <div
                className={cn(
                  "h-1 rounded-full transition-colors",
                  isDone
                    ? "bg-accent"
                    : isActive
                      ? "bg-accent/50"
                      : "bg-border/50"
                )}
              />
              <span
                className={cn(
                  "text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-accent"
                    : isDone
                      ? "text-foreground"
                      : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Steps */}
      {step === 1 && (
        <AlignmentStep
          data={alignment}
          onChange={setAlignment}
          onNext={() => goTo(2)}
        />
      )}

      {step === 2 && (
        <ResearchStep
          alignment={alignment}
          brief={brief}
          onBriefReady={(b) => setBrief(b)}
          onNext={() => goTo(3)}
          onBack={() => goTo(1)}
        />
      )}

      {step === 3 && brief && (
        <OutlineStep
          alignment={alignment}
          brief={brief}
          outline={outline}
          onOutlineChange={handleOutlineChange}
          onNext={() => goTo(4)}
          onBack={() => goTo(2)}
        />
      )}

      {step === 4 && brief && (
        <GenerateStep
          alignment={alignment}
          brief={brief}
          outline={outline}
          sessionId={sessionId}
          onBack={() => goTo(3)}
        />
      )}
    </div>
  );
}
