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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Sparkles, Plus, Eye, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiEngine } from "@/lib/ai-engine";
import { Block, toEditorBlocks, AIBlock } from "@/lib/blocks";
import { BlockPreviewList } from "@/components/import/BlockPreviewList";
import { BlockIntelligencePreview } from "@/components/BlockIntelligencePreview";
interface ImportContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Callback when import is complete (for Editor integration) */
  onImport?: (content: string) => Promise<void>;
  /** Direct callback to insert generated blocks (for Editor integration) */
  onInsertBlocks?: (blocks: Block[]) => void;
}

export function ImportContentModal({
  open,
  onOpenChange,
  onImport,
  onInsertBlocks,
}: ImportContentModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [content, setContent] = useState("");
  const [importing, setImporting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewBlocks, setPreviewBlocks] = useState<Block[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleGeneratePreview = async () => {
    if (!content.trim()) return;

    setGenerating(true);
    try {
      const result = await aiEngine.generateFromPrompt({
        topic: content.trim(),
        tone: 'professional',
        enableVisualBlocks: true, // Enable visual block generation
      });

      if (result.blocks.length > 0) {
        const editorBlocks = toEditorBlocks(result.blocks as AIBlock[]);
        setPreviewBlocks(editorBlocks);
        setShowPreview(true);
      } else {
        toast({ title: 'No blocks generated', description: 'Try adding more detail to your content.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error generating blocks:', error);
      toast({ title: 'Error', description: 'Failed to generate blocks from content.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleInsertBlocks = () => {
    if (previewBlocks.length === 0) return;

    if (onInsertBlocks) {
      onInsertBlocks(previewBlocks);
      resetAndClose();
      toast({ title: 'Blocks inserted!', description: `${previewBlocks.length} blocks added to your deck.` });
      return;
    }

    // Fallback: use onImport if available (legacy flow)
    if (onImport) {
      onImport(content.trim());
      resetAndClose();
      return;
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    // If we have preview blocks and onInsertBlocks, use direct insert
    if (previewBlocks.length > 0 && onInsertBlocks) {
      handleInsertBlocks();
      return;
    }

    // If onImport callback is provided (Editor mode), use it
    if (onImport) {
      setImporting(true);
      try {
        await onImport(content.trim());
        resetAndClose();
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

      // Generate blocks from content using proper API with visual blocks
      const result = await aiEngine.generateFromPrompt({
        topic: content.trim(),
        tone: 'professional',
        enableVisualBlocks: true, // Enable visual block generation
      });

      if (result.blocks.length > 0) {
        const editorBlocks = toEditorBlocks(result.blocks as AIBlock[]);
        const blocksToInsert = editorBlocks.map((block, index) => ({
          project_id: newProject.id,
          type: block.type,
          content: block.content as Record<string, unknown>,
          order_index: index,
        }));

        await supabase.from('blocks').insert(blocksToInsert as any);
      }

      resetAndClose();
      navigate(`/preview/${newProject.id}`);
      toast({ title: 'Deck created!', description: 'Your content has been converted to a deck.' });
    } catch (error) {
      console.error('Error importing content:', error);
      toast({ title: 'Error', description: 'Failed to import content.', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const resetAndClose = () => {
    setContent("");
    setPreviewBlocks([]);
    setShowPreview(false);
    onOpenChange(false);
  };

  const handleBack = () => {
    setShowPreview(false);
    setPreviewBlocks([]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetAndClose();
      else onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showPreview ? (
              <>
                <Eye className="h-5 w-5 text-accent" />
                Preview Blocks
              </>
            ) : (
              <>
                <FileText className="h-5 w-5 text-accent" />
                Import Content
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {showPreview 
              ? `${previewBlocks.length} blocks generated. Review and insert them into your deck.`
              : 'Paste your existing content below. AI will convert it into structured presentation blocks.'
            }
          </DialogDescription>
        </DialogHeader>

        {showPreview ? (
          <div className="flex-1 overflow-y-auto py-4 min-h-0">
            <Tabs defaultValue="intelligence" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="intelligence" className="gap-2">
                  <Brain className="h-3.5 w-3.5" />
                  Intelligence
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Block List
                </TabsTrigger>
              </TabsList>
              <TabsContent value="intelligence" className="mt-0">
                <BlockIntelligencePreview 
                  blocks={previewBlocks} 
                  showRecommendedOrder 
                  showDeckSummary 
                />
              </TabsContent>
              <TabsContent value="list" className="mt-0">
                <BlockPreviewList blocks={previewBlocks} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
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
                disabled={importing || generating}
              />
              <p className="text-xs text-muted-foreground">
                Supports plain text, bullet points, and structured outlines.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2">
          {showPreview ? (
            <>
              <Button variant="outline" onClick={handleBack} disabled={importing}>
                Back
              </Button>
              <Button
                variant="hero"
                onClick={handleInsertBlocks}
                disabled={previewBlocks.length === 0 || importing}
              >
                <Plus className="h-4 w-4 mr-2" />
                Insert {previewBlocks.length} Blocks
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing || generating}>
                Cancel
              </Button>
              
              {/* Generate Preview button - shows preview before inserting */}
              {onInsertBlocks && (
                <Button
                  variant="outline"
                  onClick={handleGeneratePreview}
                  disabled={!content.trim() || generating || importing}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Preview Blocks
                    </>
                  )}
                </Button>
              )}
              
              <Button
                variant="hero"
                onClick={handleSubmit}
                disabled={!content.trim() || importing || generating}
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
