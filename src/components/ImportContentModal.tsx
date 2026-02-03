import { useState, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Sparkles, Plus, Eye, Brain, Wand2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiEngine } from "@/lib/ai-engine";
import { Block } from "@/lib/blocks";
import { BlockPreviewList } from "@/components/import/BlockPreviewList";
import { BlockIntelligencePreview } from "@/components/BlockIntelligencePreview";
import { ContentDropZone, FilePreviewBadge } from "@/components/import/ContentDropZone";
import { ContentStats } from "@/components/import/ContentStats";
import { ContentTypeDetector } from "@/components/import/ContentTypeDetector";
import { ImportSettings, ImportSettingsState } from "@/components/import/ImportSettings";
import { ConversionPlan } from "@/components/import/ConversionPlan";

interface ImportContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (content: string) => Promise<void>;
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsingFile, setParsingFile] = useState(false);
  const [settings, setSettings] = useState<ImportSettingsState>({
    enableVisualBlocks: true,
    preserveWording: true,
  });

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadedFile(file);
    setParsingFile(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "txt" || ext === "md") {
        // Read text files directly
        const text = await file.text();
        setContent(text);
      } else if (ext === "pdf" || ext === "docx") {
        // For PDF/DOCX, we'd need server-side parsing
        // For now, show a message that complex files need the AI pipeline
        toast({
          title: "File uploaded",
          description: `${file.name} will be processed. For best results with PDFs and DOCX, paste the text content directly.`,
        });
        // Try to read as text anyway (won't work well for binary)
        try {
          const text = await file.text();
          if (text && text.length > 0 && !text.includes("\x00")) {
            setContent(text);
          } else {
            toast({
              title: "Complex file format",
              description: "Please paste the text content from this file for best results.",
              variant: "destructive",
            });
          }
        } catch {
          toast({
            title: "Unable to read file",
            description: "Please paste the text content from this file.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "Error reading file",
        description: "Please try pasting the content instead.",
        variant: "destructive",
      });
    } finally {
      setParsingFile(false);
    }
  }, [toast]);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setContent("");
  }, []);

  const handleGeneratePreview = async () => {
    if (!content.trim()) return;

    setGenerating(true);
    try {
      const blocks = await aiEngine.generateBlocksFromText(
        content.trim(), 
        settings.enableVisualBlocks
      );

      if (blocks.length > 0) {
        const editorBlocks = blocks.map((block, index) => ({
          id: crypto.randomUUID(),
          type: block.type,
          content: block.content,
          order_index: index,
        })) as Block[];
        setPreviewBlocks(editorBlocks);
        setShowPreview(true);
      } else {
        toast({ 
          title: "No blocks generated", 
          description: "Try adding more detail to your content.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Error generating blocks:", error);
      toast({ 
        title: "Error", 
        description: "Failed to generate blocks from content.", 
        variant: "destructive" 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleInsertBlocks = () => {
    if (previewBlocks.length === 0) return;

    if (onInsertBlocks) {
      onInsertBlocks(previewBlocks);
      resetAndClose();
      toast({ 
        title: "Blocks inserted!", 
        description: `${previewBlocks.length} blocks added to your deck.` 
      });
      return;
    }

    if (onImport) {
      onImport(content.trim());
      resetAndClose();
      return;
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    if (previewBlocks.length > 0 && onInsertBlocks) {
      handleInsertBlocks();
      return;
    }

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

    if (!user) {
      toast({ 
        title: "Error", 
        description: "You must be logged in.", 
        variant: "destructive" 
      });
      return;
    }

    setImporting(true);
    try {
      const firstLine = content.trim().split("\n")[0].replace(/^[#*-\s]+/, "");
      const title = firstLine.substring(0, 100) || "Imported Deck";

      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({
          title,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError || !newProject) {
        throw new Error("Failed to create project");
      }

      const blocks = await aiEngine.generateBlocksFromText(
        content.trim(), 
        settings.enableVisualBlocks
      );

      if (blocks.length > 0) {
        const blocksToInsert = blocks.map((block, index) => ({
          project_id: newProject.id,
          type: block.type,
          content: block.content as Record<string, unknown>,
          order_index: index,
        }));
        await supabase.from("blocks").insert(blocksToInsert as any);
      }

      resetAndClose();
      navigate(`/preview/${newProject.id}`);
      toast({ 
        title: "Deck created!", 
        description: "Your content has been converted to a deck." 
      });
    } catch (error) {
      console.error("Error importing content:", error);
      toast({ 
        title: "Error", 
        description: "Failed to import content.", 
        variant: "destructive" 
      });
    } finally {
      setImporting(false);
    }
  };

  const resetAndClose = () => {
    setContent("");
    setPreviewBlocks([]);
    setShowPreview(false);
    setUploadedFile(null);
    setSettings({ enableVisualBlocks: true, preserveWording: true });
    onOpenChange(false);
  };

  const handleBack = () => {
    setShowPreview(false);
    setPreviewBlocks([]);
  };

  const isLoading = importing || generating || parsingFile;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetAndClose();
      else onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showPreview ? (
              <>
                <Eye className="h-5 w-5 text-accent" />
                Preview Blocks
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 text-accent" />
                Import Content
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {showPreview 
              ? `${previewBlocks.length} blocks generated. Review and insert them into your deck.`
              : "Import any content—Axora will structure it into executive-grade slides."
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
          <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-0">
            {/* Drag and drop zone */}
            <ContentDropZone 
              onFileSelect={handleFileSelect} 
              disabled={isLoading} 
            />

            {/* File badge */}
            {uploadedFile && (
              <FilePreviewBadge 
                fileName={uploadedFile.name} 
                onRemove={handleRemoveFile} 
              />
            )}

            {/* Textarea */}
            <div className="space-y-2">
              <Textarea
                placeholder="Paste text, meeting notes, transcripts, or upload a file. Axora identifies structure, detects insights, and converts it into a clean narrative."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-muted/50 min-h-[140px] font-mono text-sm resize-none"
                disabled={isLoading}
              />
              
              {/* Stats and detection row */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <ContentStats content={content} />
                <ContentTypeDetector content={content} />
              </div>
            </div>

            {/* Settings toggles */}
            <ImportSettings 
              settings={settings} 
              onChange={setSettings} 
              disabled={isLoading} 
            />

            {/* Conversion plan */}
            {content.trim() && (
              <ConversionPlan 
                content={content} 
                enableVisualBlocks={settings.enableVisualBlocks} 
              />
            )}
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
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              {onInsertBlocks && (
                <Button
                  variant="outline"
                  onClick={handleGeneratePreview}
                  disabled={!content.trim() || isLoading}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing...
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
                disabled={!content.trim() || isLoading}
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
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
