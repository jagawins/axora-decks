import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import FileUploadPills from "./FileUploadPills";
import type { AlignmentData, AudienceType, FileExtract } from "@/types/research-mode";
import { AUDIENCE_OPTIONS } from "@/types/research-mode";

interface AlignmentStepProps {
  data: AlignmentData;
  onChange: (data: AlignmentData) => void;
  onNext: () => void;
  disabled?: boolean;
}

export default function AlignmentStep({
  data,
  onChange,
  onNext,
  disabled,
}: AlignmentStepProps) {
  const isValid = data.goal.trim().length > 0 && data.outcome.trim().length > 0;

  const update = (partial: Partial<AlignmentData>) =>
    onChange({ ...data, ...partial });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Tell us about your deck
        </h2>
        <p className="text-sm text-muted-foreground">
          Help AXIVA understand your goals so it can research effectively.
        </p>
      </div>

      {/* Goal */}
      <div className="space-y-2">
        <Label htmlFor="rm-goal" className="text-sm font-medium">
          What is the goal of this deck?{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="rm-goal"
          placeholder="e.g. Present Q4 results and 2025 strategy to the board"
          value={data.goal}
          onChange={(e) => update({ goal: e.target.value })}
          className="min-h-[80px] bg-muted/50 resize-none"
          disabled={disabled}
        />
      </div>

      {/* Audience */}
      <div className="space-y-2">
        <Label htmlFor="rm-audience" className="text-sm font-medium">
          Who is the audience?
        </Label>
        <Select
          value={data.audience}
          onValueChange={(v) => update({ audience: v as AudienceType })}
          disabled={disabled}
        >
          <SelectTrigger id="rm-audience" className="bg-muted/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AUDIENCE_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Outcome */}
      <div className="space-y-2">
        <Label htmlFor="rm-outcome" className="text-sm font-medium">
          What should someone do or decide after seeing this?{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="rm-outcome"
          placeholder="e.g. Approve the 2025 budget and headcount plan"
          value={data.outcome}
          onChange={(e) => update({ outcome: e.target.value })}
          className="min-h-[80px] bg-muted/50 resize-none"
          disabled={disabled}
        />
      </div>

      {/* Must-include facts */}
      <div className="space-y-2">
        <Label htmlFor="rm-facts" className="text-sm font-medium">
          Any specific data or facts that must appear?
        </Label>
        <Textarea
          id="rm-facts"
          placeholder="e.g. ARR hit $12M, churn dropped to 3.2%, NPS is 72"
          value={data.mustIncludeFacts}
          onChange={(e) => update({ mustIncludeFacts: e.target.value })}
          className="min-h-[60px] bg-muted/50 resize-none"
          disabled={disabled}
        />
      </div>

      {/* File uploads */}
      <FileUploadPills
        files={data.fileExtracts}
        onFilesChange={(files: FileExtract[]) => update({ fileExtracts: files })}
        disabled={disabled}
      />

      {/* Next */}
      <Button
        variant="hero"
        size="lg"
        className="w-full"
        onClick={onNext}
        disabled={!isValid || disabled}
      >
        Start Research
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
