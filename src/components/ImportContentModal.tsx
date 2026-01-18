import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiEngine, BlockType } from "@/lib/ai-engine";
import { sanitizeContent, sanitizeListItems } from "@/lib/sanitize";

interface ImportContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Callback when import is complete (for Editor integration) */
  onImport?: (content: string) => Promise<void>;
}

export function ImportContentModal({
  open,
  onOpenChange,
  onImport,
}: ImportContentModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [content, setContent] = useState("");
  const [importing, setImporting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    // If onImport callback is provided (Editor mode), use it
    if (onImport) {
      setImporting(true);
      try {
        await onImport(content.trim());
        setContent("");
      } finally {
        setImporting(false);
      }
      return;
    }

    // Library mode: create new project first
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }

    setImporting(true);
    try {
      // Extract a title from the content (first line or first 50 chars)
      const firstLine = content.trim().split('\n')[0].replace(/^[#*-\s]+/, '');
      const title = firstLine.substring(0, 100) || 'Imported Deck';

      // Create new project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          title,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError || !newProject) {
        throw new Error('Failed to create project');
      }

      // Generate blocks from content using proper API
      const result = await aiEngine.generateFromPrompt({
        topic: content.trim(),
        tone: 'professional',
      });

      if (result.blocks.length > 0) {
        const blocksToInsert = result.blocks.map((block, index) => ({
          project_id: newProject.id,
          type: block.type,
          content: block.content as Record<string, unknown>,
          order_index: index,
        }));

        await supabase.from('blocks').insert(blocksToInsert as any);
      }

      setContent("");
      onOpenChange(false);
      navigate(`/preview/${newProject.id}`);
      toast({ title: 'Deck created!', description: 'Your content has been converted to a deck.' });
    } catch (error) {
      console.error('Error importing content:', error);
      toast({ title: 'Error', description: 'Failed to import content.', variant: 'destructive' });
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
