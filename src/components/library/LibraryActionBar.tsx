import { Plus, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LibraryActionBarProps {
  onCreateNew: () => void;
  onNewWithAI: () => void;
  onImport: () => void;
}

export const LibraryActionBar = ({ onCreateNew, onNewWithAI, onImport }: LibraryActionBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Create new
      </Button>
      <Button variant="hero" onClick={onNewWithAI}>
        <Sparkles className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">New with AI</span>
        <span className="sm:hidden">AI</span>
      </Button>
      <Button variant="outline" size="icon" className="sm:hidden" onClick={onCreateNew}>
        <Plus className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" className="sm:hidden" onClick={onImport}>
        <Upload className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={onImport}>
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
    </div>
  );
};
