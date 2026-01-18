import { Plus, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LibraryActionBarProps {
  onCreateNew: () => void;
  onNewWithAI: () => void;
  onImport: () => void;
}

export const LibraryActionBar = ({ onCreateNew, onNewWithAI, onImport }: LibraryActionBarProps) => {
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Create new
      </Button>
      <Button variant="hero" onClick={onNewWithAI}>
        <Sparkles className="h-4 w-4 mr-2" />
        New with AI
      </Button>
      <Button variant="outline" onClick={onImport}>
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
    </div>
  );
};
