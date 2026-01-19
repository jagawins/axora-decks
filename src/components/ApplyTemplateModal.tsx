import { useState } from "react";
import { BlockType } from "@/lib/ai-engine";
import { getTemplatesForType, BlockTemplate } from "@/lib/block-templates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Heading, List, AlertCircle, Columns, Table, Image, Loader2, LayoutTemplate } from "lucide-react";

const BLOCK_ICONS: Record<BlockType, typeof FileText> = {
  text: FileText,
  heading: Heading,
  list: List,
  callout: AlertCircle,
  two_col: Columns,
  table: Table,
  image: Image,
};

const BLOCK_LABELS: Record<BlockType, string> = {
  text: "Text",
  heading: "Heading",
  list: "List",
  callout: "Callout",
  two_col: "Two Column",
  table: "Table",
  image: "Image",
};

interface ApplyTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockType: BlockType;
  blockPreview: string;
  onApply: (templateId: string, context?: string) => Promise<void>;
}

export function ApplyTemplateModal({
  open,
  onOpenChange,
  blockType,
  blockPreview,
  onApply,
}: ApplyTemplateModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [context, setContext] = useState("");
  const [applying, setApplying] = useState(false);

  const templates = getTemplatesForType(blockType);
  const Icon = BLOCK_ICONS[blockType];

  const handleApply = async () => {
    if (!selectedTemplateId) return;
    
    setApplying(true);
    try {
      await onApply(selectedTemplateId, context.trim() || undefined);
      // Reset state on success
      setSelectedTemplateId("");
      setContext("");
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setSelectedTemplateId("");
      setContext("");
    }
    onOpenChange(newOpen);
  };

  // Truncate preview to 40 chars
  const truncatedPreview = blockPreview.length > 40 
    ? blockPreview.slice(0, 40) + "…" 
    : blockPreview;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-accent" />
            Apply Template
          </DialogTitle>
          <DialogDescription>
            Transform your block using a predefined template format.
          </DialogDescription>
        </DialogHeader>

        {/* Block preview */}
        <div className="rounded-lg bg-muted/50 border border-border p-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Selected block:</span>
            <span className="font-medium flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {BLOCK_LABELS[blockType]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            "{truncatedPreview}"
          </p>
        </div>

        <div className="space-y-4 py-2">
          {/* Template selector */}
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No templates available for {BLOCK_LABELS[blockType]} blocks.
              </p>
            ) : (
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Optional context input */}
          <div className="space-y-2">
            <Label htmlFor="context">
              Context <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="context"
              placeholder="e.g., Focus on Q4 results, emphasize cost savings..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={applying}
              maxLength={200}
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              Add 1-2 sentences of context to guide the transformation.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <p className="text-xs text-muted-foreground mr-auto hidden sm:block">
            Type preserved: output stays as {BLOCK_LABELS[blockType]}
          </p>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={applying}>
            Cancel
          </Button>
          <Button 
            variant="hero" 
            onClick={handleApply} 
            disabled={!selectedTemplateId || applying || templates.length === 0}
          >
            {applying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Applying...
              </>
            ) : (
              <>
                <LayoutTemplate className="h-4 w-4 mr-2" />
                Apply Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
