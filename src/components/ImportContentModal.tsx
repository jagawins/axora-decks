import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, FileText } from "lucide-react";

interface ImportContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (content: string) => Promise<void>;
}

export function ImportContentModal({
  open,
  onOpenChange,
  onImport,
}: ImportContentModalProps) {
  const [content, setContent] = useState("");
  const [importing, setImporting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setImporting(true);
    try {
      await onImport(content.trim());
      // Reset form on success
      setContent("");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Import Content
          </DialogTitle>
          <DialogDescription>
            Paste your existing content below. AI will convert it into a structured presentation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Paste your text, notes, article, or outline here. The AI will analyze it and create presentation slides automatically.

Example:
- Meeting notes
- Article text
- Bullet points
- Existing outline
- Report summary"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-muted/50 min-h-[200px] font-mono text-sm"
              disabled={importing}
            />
            <p className="text-xs text-muted-foreground">
              Supports plain text, bullet points, and structured outlines.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleSubmit}
            disabled={!content.trim() || importing}
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Converting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Convert to Deck
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
