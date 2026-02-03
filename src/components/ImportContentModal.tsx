import { useState, useCallback, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, FileText, Sparkles, Plus, Eye, Brain, Wand2, 
  Quote, BarChart3, Calendar, Grid3X3, Rows3, Lightbulb, Target, Type, Layers
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiEngine, Block as AIBlock } from "@/lib/ai-engine";
import { Block, VISUAL_BLOCK_TYPES } from "@/lib/blocks";
import { BlockPreviewList } from "@/components/import/BlockPreviewList";
import { BlockIntelligencePreview } from "@/components/BlockIntelligencePreview";
import { ContentDropZone, FilePreviewBadge } from "@/components/import/ContentDropZone";
import { ContentTypeDetector, detectContentType } from "@/components/import/ContentTypeDetector";
import { cn } from "@/lib/utils";

interface ImportContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: (content: string) => Promise<void>;
  onInsertBlocks?: (blocks: Block[]) => void;
}

// ============== Inlined: ContentStats ==============
function ContentStats({ content }: { content: string }) {
  const stats = useMemo(() => {
    const text = content.trim();
    if (!text) return { words: 0, slides: 0 };
    const words = text.split(/\s+/).filter(Boolean).length;
    const lineCount = text.split("\n").filter(l => l.trim()).length;
    const hasStructure = /^[-•*#\d.]/m.test(text);
    let slides = Math.ceil(words / 100);
    if (hasStructure) slides = Math.max(slides, Math.ceil(lineCount / 4));
    slides = Math.max(1, Math.min(slides, 20));
    return { words, slides };
  }, [content]);

  if (stats.words === 0) return null;

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <FileText className="h-3.5 w-3.5" />
        <span>{stats.words.toLocaleString()} words</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Layers className="h-3.5 w-3.5" />
        <span>~{stats.slides} slide{stats.slides !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}

// ============== Inlined: ConversionPlan ==============
const BLOCK_ICONS: Record<string, { icon: typeof FileText; color: string }> = {
  hero_header: { icon: Target, color: "text-accent" },
  exec_summary: { icon: Lightbulb, color: "text-green-500" },
  stat_block: { icon: BarChart3, color: "text-blue-500" },
  quote_block: { icon: Quote, color: "text-orange-500" },
  timeline_block: { icon: Calendar, color: "text-purple-500" },
  comparison_table: { icon: Grid3X3, color: "text-cyan-500" },
  card_grid: { icon: Rows3, color: "text-pink-500" },
  heading: { icon: Type, color: "text-foreground" },
  text: { icon: FileText, color: "text-muted-foreground" },
  list: { icon: Rows3, color: "text-muted-foreground" },
};

interface PredictedBlock {
  type: string;
  label: string;
  icon: typeof FileText;
  count: number;
  color: string;
}

function predictBlocks(content: string, enableVisualBlocks: boolean): PredictedBlock[] {
  const text = content.trim();
  if (!text) return [];
  const lines = text.split("\n").filter(l => l.trim());
  const detectedType = detectContentType(content);
  const predictions: PredictedBlock[] = [];

  if (lines.length > 3) {
    predictions.push({ type: "hero_header", label: "Hero Header", icon: BLOCK_ICONS.hero_header.icon, count: 1, color: BLOCK_ICONS.hero_header.color });
  }

  if (enableVisualBlocks) {
    const numberMatches = content.match(/\d+\.?\d*%?/g) || [];
    if (numberMatches.length >= 2) {
      predictions.push({ type: "stat_block", label: "Statistics", icon: BLOCK_ICONS.stat_block.icon, count: Math.min(Math.ceil(numberMatches.length / 3), 3), color: BLOCK_ICONS.stat_block.color });
    }
    const quoteMatches = content.match(/[""]([^""]+)[""]|"([^"]+)"/g) || [];
    if (quoteMatches.length > 0) {
      predictions.push({ type: "quote_block", label: "Quotes", icon: BLOCK_ICONS.quote_block.icon, count: Math.min(quoteMatches.length, 2), color: BLOCK_ICONS.quote_block.color });
    }
    if (detectedType === "timeline" || /\b(phase|step|stage|q[1-4])\b/i.test(text)) {
      predictions.push({ type: "timeline_block", label: "Timeline", icon: BLOCK_ICONS.timeline_block.icon, count: 1, color: BLOCK_ICONS.timeline_block.color });
    }
    if (/\bvs\.?\b|versus|compared to|before.*after/i.test(text)) {
      predictions.push({ type: "comparison_table", label: "Comparison", icon: BLOCK_ICONS.comparison_table.icon, count: 1, color: BLOCK_ICONS.comparison_table.color });
    }
  }

  if (lines.length > 5) {
    predictions.push({ type: "exec_summary", label: "Executive Summary", icon: BLOCK_ICONS.exec_summary.icon, count: 1, color: BLOCK_ICONS.exec_summary.color });
  }

  const bulletLines = lines.filter(l => /^[\s]*[-•*]\s/.test(l));
  if (bulletLines.length > 2) {
    predictions.push({ type: "list", label: "Lists", icon: BLOCK_ICONS.list.icon, count: Math.ceil(bulletLines.length / 4), color: BLOCK_ICONS.list.color });
  }

  const paragraphCount = Math.max(1, Math.ceil((lines.length - bulletLines.length) / 3));
  if (paragraphCount > 0) {
    predictions.push({ type: "text", label: "Text Blocks", icon: BLOCK_ICONS.text.icon, count: paragraphCount, color: BLOCK_ICONS.text.color });
  }

  return predictions;
}

function ConversionPlan({ content, enableVisualBlocks }: { content: string; enableVisualBlocks: boolean }) {
  const predictions = useMemo(() => predictBlocks(content, enableVisualBlocks), [content, enableVisualBlocks]);
  if (predictions.length === 0) return null;
  const totalBlocks = predictions.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Conversion Plan</h4>
        <span className="text-xs text-muted-foreground">~{totalBlocks} block{totalBlocks !== 1 ? "s" : ""}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {predictions.map((block, idx) => {
          const Icon = block.icon;
          return (
            <div key={`${block.type}-${idx}`} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/50">
              <Icon className={cn("h-3 w-3", block.color)} />
              <span className="text-xs text-foreground">{block.label}</span>
              {block.count > 1 && <span className="text-xs text-muted-foreground">×{block.count}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
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
  const [rawGeneratedBlocks, setRawGeneratedBlocks] = useState<AIBlock[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsingFile, setParsingFile] = useState(false);
  const [enableVisualBlocks, setEnableVisualBlocks] = useState(true);
  const [preserveWording, setPreserveWording] = useState(true);

  // Convert raw AI blocks to editor blocks by adding id and order_index only
  const previewBlocks = useMemo((): Block[] => {
    if (!rawGeneratedBlocks) return [];
    return rawGeneratedBlocks.map((block, index) => {
      const isVisual = VISUAL_BLOCK_TYPES.includes(block.type as any);
      return {
        id: crypto.randomUUID(),
        type: block.type,
        content: block.content,
        order_index: index,
        // Add block_meta with schema_version for visual blocks
        ...(isVisual && { block_meta: { schema_version: 1 } }),
      } as Block;
    });
  }, [rawGeneratedBlocks]);

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadedFile(file);
    setParsingFile(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "txt" || ext === "md") {
        // Read text files directly on client
        const text = await file.text();
        setContent(text);
      } else if (ext === "pdf" || ext === "docx") {
        // Use edge function for PDF/DOCX parsing
        const formData = new FormData();
        formData.append("file", file);

        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-file`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to parse file");
        }

        const result = await response.json();
        if (result.text) {
          setContent(result.text);
          toast({
            title: "File parsed",
            description: `Extracted ${result.meta?.wordCount || 0} words from ${file.name}`,
          });
        } else {
          throw new Error("No text extracted from file");
        }
      } else {
        toast({
          title: "Unsupported file type",
          description: "Please upload PDF, DOCX, TXT, or Markdown files.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "Error reading file",
        description: error instanceof Error ? error.message : "Please try pasting the content instead.",
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
      // Generate blocks once and store raw result
      const blocks = await aiEngine.generateBlocksFromText(
        content.trim(), 
        enableVisualBlocks,
        preserveWording
      );

      if (blocks.length > 0) {
        setRawGeneratedBlocks(blocks);
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
      // Insert exact same blocks from preview (no re-generation)
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

    // If we already have generated blocks, use them directly
    if (rawGeneratedBlocks && rawGeneratedBlocks.length > 0 && onInsertBlocks) {
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
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setImporting(true);
    try {
      const firstLine = content.trim().split("\n")[0].replace(/^[#*-\s]+/, "");
      const title = firstLine.substring(0, 100) || "Imported Deck";

      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({ title, user_id: user.id })
        .select()
        .single();

      if (projectError || !newProject) throw new Error("Failed to create project");

      // Generate blocks with settings
      const blocks = await aiEngine.generateBlocksFromText(
        content.trim(), 
        enableVisualBlocks,
        preserveWording
      );

      if (blocks.length > 0) {
        const blocksToInsert = blocks.map((block, index) => {
          const isVisual = VISUAL_BLOCK_TYPES.includes(block.type as any);
          return {
            project_id: newProject.id,
            type: block.type,
            content: block.content as Record<string, unknown>,
            order_index: index,
            // Add block_meta for visual blocks
            ...(isVisual && { block_meta: { schema_version: 1 } }),
          };
        });
        await supabase.from("blocks").insert(blocksToInsert as any);
      }

      resetAndClose();
      navigate(`/preview/${newProject.id}`);
      toast({ title: "Deck created!", description: "Your content has been converted to a deck." });
    } catch (error) {
      console.error("Error importing content:", error);
      toast({ title: "Error", description: "Failed to import content.", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const resetAndClose = () => {
    setContent("");
    setRawGeneratedBlocks(null);
    setShowPreview(false);
    setUploadedFile(null);
    setEnableVisualBlocks(true);
    setPreserveWording(true);
    onOpenChange(false);
  };

  const handleBack = () => {
    setShowPreview(false);
    setRawGeneratedBlocks(null);
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
            <ContentDropZone onFileSelect={handleFileSelect} disabled={isLoading} />

            {/* File badge */}
            {uploadedFile && (
              <FilePreviewBadge fileName={uploadedFile.name} onRemove={handleRemoveFile} />
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

            {/* Inlined: Settings toggles */}
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
                  checked={enableVisualBlocks}
                  onCheckedChange={setEnableVisualBlocks}
                  disabled={isLoading}
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
                  checked={preserveWording}
                  onCheckedChange={setPreserveWording}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground -mt-1 ml-5">
                Keep your text intact—no AI rewrites
              </p>
            </div>

            {/* Conversion plan */}
            {content.trim() && (
              <ConversionPlan content={content} enableVisualBlocks={enableVisualBlocks} />
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
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
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
