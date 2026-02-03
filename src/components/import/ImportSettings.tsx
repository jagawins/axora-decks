import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, Quote } from "lucide-react";

export interface ImportSettingsState {
  enableVisualBlocks: boolean;
  preserveWording: boolean;
}

interface ImportSettingsProps {
  settings: ImportSettingsState;
  onChange: (settings: ImportSettingsState) => void;
  disabled?: boolean;
}

export function ImportSettings({ settings, onChange, disabled }: ImportSettingsProps) {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <Label htmlFor="visual-blocks" className="text-sm font-medium cursor-pointer">
            Enable visual blocks
          </Label>
        </div>
        <Switch
          id="visual-blocks"
          checked={settings.enableVisualBlocks}
          onCheckedChange={(checked) => 
            onChange({ ...settings, enableVisualBlocks: checked })
          }
          disabled={disabled}
        />
      </div>
      <p className="text-xs text-muted-foreground -mt-1 ml-5">
        Auto-select stat blocks, timelines, and comparison tables
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Quote className="h-3.5 w-3.5 text-accent" />
          <Label htmlFor="preserve-wording" className="text-sm font-medium cursor-pointer">
            Preserve original wording
          </Label>
        </div>
        <Switch
          id="preserve-wording"
          checked={settings.preserveWording}
          onCheckedChange={(checked) => 
            onChange({ ...settings, preserveWording: checked })
          }
          disabled={disabled}
        />
      </div>
      <p className="text-xs text-muted-foreground -mt-1 ml-5">
        Keep your text intact—no AI rewrites
      </p>
    </div>
  );
}
