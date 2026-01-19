import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { aiEngine, Block as AIBlock, BlockType } from "@/lib/ai-engine";
import { sanitizeContent, sanitizeListItems } from "@/lib/sanitize";
import { THEMES, DEFAULT_THEME, ThemeId } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Wand2,
  Sparkles,
  FileText,
  Heading,
  List,
  AlertCircle,
  Columns,
  Table,
  Image,
  Play,
  Share2,
  Copy,
  Check,
  Palette,
  FileDown,
  Upload,
  LayoutTemplate,
  MoreVertical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axoraWordmark from "@/assets/axora-wordmark-dark.svg";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { CreateDeckModal } from "@/components/CreateDeckModal";
import { ImportContentModal } from "@/components/ImportContentModal";
import { ApplyTemplateModal } from "@/components/ApplyTemplateModal";
import { getTemplateById } from "@/lib/block-templates";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileEditorTabs, { MobileTab } from "@/components/editor/MobileEditorTabs";
import MobileBlocksPanel from "@/components/editor/MobileBlocksPanel";
import MobileAIPanel from "@/components/editor/MobileAIPanel";

interface Project {
  id: string;
  title: string;
  description: string | null;
}

interface Block {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
}

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

/**
 * Normalization helpers
 * Purpose: make AI outputs consistent with your renderer expectations, and strip markdown artifacts.
 */
function stripMarkdown(s: string) {
  return s
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*\*/g, "$1") // defensive: odd patterns
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^#+\s+/gm, "")
    .trim();
}

function normalizeBlockContent(type: BlockType, raw: Record<string, unknown>) {
  const text = stripMarkdown(String(raw.text ?? raw.content ?? raw.value ?? raw.message ?? ""));

  switch (type) {
    case "heading":
      return {
        level: Number(raw.level ?? 2),
        text: text || "New Heading",
      };

    case "text":
      return {
        text: text || "Enter your text here...",
      };

    case "callout":
      return {
        text: text || "Important point here",
        icon: String(raw.icon ?? "info"),
      };

    case "two_col":
      return {
        left: stripMarkdown(String(raw.left ?? raw.col1 ?? raw.column1 ?? raw.a ?? "")) || "Left content",
        right: stripMarkdown(String(raw.right ?? raw.col2 ?? raw.column2 ?? raw.b ?? "")) || "Right content",
      };

    case "list": {
      const itemsRaw = raw.items ?? raw.bullets ?? raw.points ?? [];
      const items = Array.isArray(itemsRaw)
        ? itemsRaw
            .map((x) => stripMarkdown(String(x)))
            .map((x) => x.replace(/^[-•\d.]+\s*/, "").trim())
            .filter(Boolean)
        : stripMarkdown(String(itemsRaw))
            .split("\n")
            .map((x) => stripMarkdown(x.replace(/^[-•\d.]+\s*/, "")))
            .filter(Boolean);

      return {
        items: items.length ? items : ["Item 1", "Item 2"],
        ordered: Boolean(raw.ordered),
      };
    }

    case "table": {
      const headersRaw = raw.headers ?? [];
      const rowsRaw = raw.rows ?? [];

      const headers = Array.isArray(headersRaw)
        ? headersRaw.map((h) => stripMarkdown(String(h))).filter(Boolean)
        : ["Column 1", "Column 2"];

      const rows =
        Array.isArray(rowsRaw) && rowsRaw.every((r) => Array.isArray(r))
          ? (rowsRaw as unknown[][]).map((r) => r.map((c) => stripMarkdown(String(c))))
          : [["Data", "Data"]];

      return {
        headers: headers.length ? headers : ["Column 1", "Column 2"],
        rows,
      };
    }

    case "image":
      return {
        src: String(raw.src ?? raw.url ?? ""),
        alt: stripMarkdown(String(raw.alt ?? "")),
        caption: stripMarkdown(String(raw.caption ?? "")),
      };

    default:
      return raw;
  }
}

const Editor = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [project, setProject] = useState<Project | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // AI refine state
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState("");
  const [refining, setRefining] = useState(false);

  // AI generate state (per-block)
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  // AI deck generation modals
  const [createDeckOpen, setCreateDeckOpen] = useState(false);
  const [importContentOpen, setImportContentOpen] = useState(false);

  // Apply template state
  const [applyTemplateOpen, setApplyTemplateOpen] = useState(false);

  // Add block state
  const [addBlockOpen, setAddBlockOpen] = useState(false);
  const [newBlockType, setNewBlockType] = useState<BlockType>("text");

  // Share state
  const [shareEnabled, setShareEnabled] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);

  // Mobile panel state
  const [mobileTab, setMobileTab] = useState<MobileTab>("blocks");
  const [mobileBlocksOpen, setMobileBlocksOpen] = useState(false);
  const [mobileAIOpen, setMobileAIOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && projectId) {
      fetchProject();
    }
  }, [user, projectId]);

  const fetchProject = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id, title, description, share_enabled, share_token, theme")
        .eq("id", projectId)
        .maybeSingle();

      if (projectError) throw projectError;
      if (!projectData) {
        navigate("/dashboard");
        return;
      }

      setProject(projectData);
      setShareEnabled(!!projectData.share_enabled);
      setShareToken(projectData.share_token ? String(projectData.share_token) : null);
      setTheme((projectData.theme as ThemeId) || DEFAULT_THEME);

      const { data: blocksData, error: blocksError } = await supabase
        .from("blocks")
        .select("*")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });

      if (blocksError) throw blocksError;

      setBlocks(
        (blocksData || []).map((b) => ({
          id: b.id,
          type: b.type as BlockType,
          content: b.content as Record<string, unknown>,
          order_index: b.order_index,
        })),
      );
    } catch (error) {
      console.error("Error fetching project:", error);
      toast({
        title: "Error",
        description: "Failed to load project.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!projectId || saving) return;

    setSaving(true);
    try {
      await supabase.from("blocks").delete().eq("project_id", projectId);

      if (blocks.length > 0) {
        const blocksToInsert = blocks.map((block, index) => ({
          project_id: projectId,
          type: block.type as "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout",
          content: block.content as unknown as import("@/integrations/supabase/types").Json,
          order_index: index,
        }));

        const { error } = await supabase.from("blocks").insert(blocksToInsert);
        if (error) throw error;
      }

      await supabase.from("projects").update({ updated_at: new Date().toISOString() }).eq("id", projectId);

      setHasUnsavedChanges(false);
      toast({
        title: "Saved",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save failed",
        description: "Could not save your changes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateBlock = useCallback((blockId: string, content: Record<string, unknown>) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, content } : b)));
    setHasUnsavedChanges(true);
  }, []);

  const moveBlock = useCallback((blockId: string, direction: "up" | "down") => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === blockId);
      if (index === -1) return prev;
      if (direction === "up" && index === 0) return prev;
      if (direction === "down" && index === prev.length - 1) return prev;

      const newBlocks = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      return newBlocks.map((b, i) => ({ ...b, order_index: i }));
    });
    setHasUnsavedChanges(true);
  }, []);

  const deleteBlock = useCallback(
    (blockId: string) => {
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      if (selectedBlockId === blockId) setSelectedBlockId(null);
      setHasUnsavedChanges(true);
    },
    [selectedBlockId],
  );

  const addBlock = () => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type: newBlockType,
      content: getDefaultContent(newBlockType),
      order_index: blocks.length,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    setAddBlockOpen(false);
    setHasUnsavedChanges(true);
  };

  const getDefaultContent = (type: BlockType): Record<string, unknown> => {
    switch (type) {
      case "heading":
        return { level: 2, text: "New Heading" };
      case "text":
        return { text: "Enter your text here..." };
      case "list":
        return { items: ["Item 1", "Item 2"], ordered: false };
      case "callout":
        return { text: "Important point here", icon: "info" };
      case "two_col":
        return { left: "Left content", right: "Right content" };
      case "table":
        return { headers: ["Column 1", "Column 2"], rows: [["Data", "Data"]] };
      case "image":
        return { src: "", alt: "", caption: "" };
      default:
        return {};
    }
  };

  const handleRefine = async () => {
    const block = blocks.find((b) => b.id === selectedBlockId);
    if (!block || !refineInstruction.trim()) return;

    setRefining(true);
    try {
      const refined = await aiEngine.refineBlock({
        block: {
          type: block.type,
          content: block.content,
          order_index: block.order_index,
        },
        instruction: refineInstruction.trim(),
      });

      let sanitized = sanitizeContent(refined.content);
      sanitized = normalizeBlockContent(block.type, sanitized);

      if (block.type === "list" && Array.isArray(sanitized.items)) {
        sanitized.items = sanitizeListItems(sanitized.items);
      }

      updateBlock(block.id, sanitized);
      setRefineOpen(false);
      setRefineInstruction("");

      toast({
        title: "Block rewritten",
        description: "Agent updated this block only. No other changes made.",
      });
    } catch (error) {
      console.error("Agent edit error:", error);
      toast({
        title: "Agent edit failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefining(false);
    }
  };

  const handleGenerate = async () => {
    const block = blocks.find((b) => b.id === selectedBlockId);
    if (!block || !generatePrompt.trim()) return;

    setGenerating(true);
    try {
      const content = await aiEngine.generateBlockContent({
        type: block.type,
        prompt: generatePrompt.trim(),
      });

      let sanitized = sanitizeContent(content);
      sanitized = normalizeBlockContent(block.type, sanitized);

      if (block.type === "list" && Array.isArray(sanitized.items)) {
        sanitized.items = sanitizeListItems(sanitized.items);
      }

      updateBlock(block.id, sanitized);
      setGenerateOpen(false);
      setGeneratePrompt("");

      toast({
        title: "Content generated",
        description: "AI has created new content for your block.",
      });
    } catch (error) {
      console.error("Generate error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Apply Template handler
  const handleApplyTemplate = async (templateId: string, context?: string) => {
    const block = blocks.find((b) => b.id === selectedBlockId);
    if (!block) return;

    const template = getTemplateById(templateId);
    if (!template) {
      toast({
        title: "Template not found",
        description: "The selected template could not be found.",
        variant: "destructive",
      });
      return;
    }

    // Enforce type preservation on client side as well
    if (template.type !== block.type) {
      toast({
        title: "Type mismatch",
        description: `Template is for ${template.type} blocks, but selected block is ${block.type}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Call refine-block with templateId instead of instruction
      const { data, error } = await supabase.functions.invoke("refine-block", {
        body: {
          block: {
            type: block.type,
            content: block.content,
            order_index: block.order_index,
          },
          templateId,
          context,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const refinedBlock = data?.block;
      if (!refinedBlock?.content) {
        throw new Error("No content returned from template application");
      }

      // Enforce type preservation: reject if type changed
      if (refinedBlock.type !== block.type) {
        console.error("Type changed during template application, rejecting", refinedBlock.type, block.type);
        throw new Error("Template output violated type preservation");
      }

      let sanitized = sanitizeContent(refinedBlock.content);
      sanitized = normalizeBlockContent(block.type, sanitized);

      if (block.type === "list" && Array.isArray(sanitized.items)) {
        sanitized.items = sanitizeListItems(sanitized.items);
      }

      updateBlock(block.id, sanitized);

      toast({
        title: "Template applied",
        description: `Block transformed using "${template.name}" template.`,
      });
    } catch (error) {
      console.error("Apply template error:", error);
      toast({
        title: "Template application failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let modal handle loading state
    }
  };

  // AI Deck Generation handler
  const handleCreateDeck = async (params: {
    topic: string;
    audience?: string;
    goal?: string;
    tone: "professional" | "crisp" | "analytical" | "persuasive" | "executive" | "casual";
    slideCount: number;
  }) => {
    if (!projectId) return;

    try {
      let prompt = params.topic;
      if (params.audience) prompt += `\n\nTarget audience: ${params.audience}`;
      if (params.goal) prompt += `\n\nGoal: ${params.goal}`;
      prompt += `\n\nCreate approximately ${params.slideCount} slides.`;

      const result = await aiEngine.generateFromPrompt({
        topic: params.topic,
        prompt,
        tone: params.tone,
      });

      const newBlocks: Block[] = result.blocks.map((b, i) => {
        let sanitized = sanitizeContent(b.content);
        sanitized = normalizeBlockContent(b.type, sanitized);

        if (b.type === "list" && Array.isArray(sanitized.items)) {
          sanitized.items = sanitizeListItems(sanitized.items);
        }

        return {
          id: crypto.randomUUID(),
          type: b.type,
          content: sanitized,
          order_index: i,
        };
      });

      setBlocks(newBlocks);
      setHasUnsavedChanges(true);
      setCreateDeckOpen(false);

      await saveBlocksAndNavigate(newBlocks);
    } catch (error) {
      console.error("Create deck error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Import content handler
  const handleImportContent = async (content: string) => {
    if (!projectId) return;

    try {
      const result = await aiEngine.generateFromPrompt({
        topic: "Presentation from imported content",
        prompt: content,
        tone: "professional",
      });

      const newBlocks: Block[] = result.blocks.map((b, i) => {
        let sanitized = sanitizeContent(b.content);
        sanitized = normalizeBlockContent(b.type, sanitized);

        if (b.type === "list" && Array.isArray(sanitized.items)) {
          sanitized.items = sanitizeListItems(sanitized.items);
        }

        return {
          id: crypto.randomUUID(),
          type: b.type,
          content: sanitized,
          order_index: i,
        };
      });

      setBlocks(newBlocks);
      setHasUnsavedChanges(true);
      setImportContentOpen(false);

      await saveBlocksAndNavigate(newBlocks);
    } catch (error) {
      console.error("Import content error:", error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper to save blocks and navigate to preview
  const saveBlocksAndNavigate = async (blocksToSave: Block[]) => {
    if (!projectId) return;

    try {
      await supabase.from("blocks").delete().eq("project_id", projectId);

      if (blocksToSave.length > 0) {
        const blocksToInsert = blocksToSave.map((block, index) => ({
          project_id: projectId,
          type: block.type as "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout",
          content: block.content as unknown as import("@/integrations/supabase/types").Json,
          order_index: index,
        }));

        const { error } = await supabase.from("blocks").insert(blocksToInsert);
        if (error) throw error;
      }

      await supabase.from("projects").update({ updated_at: new Date().toISOString() }).eq("id", projectId);

      setHasUnsavedChanges(false);

      toast({
        title: "Deck created",
        description: "Your presentation is ready!",
      });

      navigate(`/preview/${projectId}`);
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save failed",
        description: "Could not save your deck.",
        variant: "destructive",
      });
    }
  };

  const toggleSharing = async () => {
    if (!projectId) return;

    try {
      const newShareEnabled = !shareEnabled;
      const { data, error } = await supabase
        .from("projects")
        .update({ share_enabled: newShareEnabled })
        .eq("id", projectId)
        .select("share_enabled, share_token")
        .single();

      if (error) throw error;

      setShareEnabled(!!data.share_enabled);
      setShareToken(String(data.share_token));

      toast({
        title: newShareEnabled ? "Sharing enabled" : "Sharing disabled",
        description: newShareEnabled
          ? "Anyone with the link can now view this presentation."
          : "This presentation is now private.",
      });
    } catch (error) {
      console.error("Error toggling share:", error);
      toast({
        title: "Error",
        description: "Failed to update sharing settings.",
        variant: "destructive",
      });
    }
  };

  const copyShareLink = async () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/p/${shareToken}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard.",
    });
  };

  const updateTheme = async (next: ThemeId) => {
    if (!projectId) return;
    setTheme(next);
    try {
      const { error } = await supabase.from("projects").update({ theme: next }).eq("id", projectId);

      if (error) throw error;
      toast({ title: "Theme updated" });
    } catch (e) {
      console.error("Theme update error:", e);
      toast({
        title: "Theme update failed",
        variant: "destructive",
      });
    }
  };

  const exportPdf = () => {
    if (!projectId) return;
    window.open(`/print/${projectId}`, "_blank", "noopener,noreferrer");
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Mobile tab handler
  const handleMobileTabChange = (tab: MobileTab) => {
    setMobileTab(tab);
    if (tab === "blocks") setMobileBlocksOpen(true);
    else if (tab === "ai") setMobileAIOpen(true);
  };

  return (
    <div className="min-h-screen-safe bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50 safe-area-top">
        <div className="flex h-14 items-center justify-between px-2 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={axoraWordmark} alt="AXORA" className="h-4 w-auto hidden sm:block" />
              <span className="text-muted-foreground hidden sm:inline">|</span>
              <span className="font-semibold truncate max-w-[120px] sm:max-w-[200px] text-sm sm:text-base">{project?.title || "Untitled"}</span>
            </div>
          </div>

          {/* Desktop header actions */}
          <div className="hidden md:flex items-center gap-2">
            {hasUnsavedChanges && <span className="text-xs text-muted-foreground">Unsaved changes</span>}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateDeckOpen(true)}
              className="border-accent/30 text-accent hover:bg-accent/10"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Deck
            </Button>

            <Button variant="ghost" size="sm" onClick={() => navigate(`/preview/${projectId}`)}>
              <Play className="h-4 w-4 mr-2" />
              Preview
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Palette className="h-4 w-4 mr-2" />
                  Theme
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(THEMES) as ThemeId[]).map((t) => (
                  <DropdownMenuItem
                    key={t}
                    onClick={() => updateTheme(t)}
                    className={theme === t ? "bg-accent/20" : ""}
                  >
                    {THEMES[t].label}
                    {theme === t && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={exportPdf}>
              <FileDown className="h-4 w-4 mr-2" />
              PDF
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setShareDialogOpen(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            <Button variant="hero" size="sm" onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>

          {/* Mobile header actions */}
          <div className="flex md:hidden items-center gap-1">
            <Button variant="hero" size="sm" onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCreateDeckOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Deck
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/preview/${projectId}`)}>
                  <Play className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportPdf}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Editor layout */}
      <div className="flex-1 flex overflow-hidden pb-14 md:pb-0">
        {/* Left sidebar - Block list (Desktop only) */}
        <aside className="hidden md:block w-64 border-r border-border bg-card/30 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Blocks</h3>
              <Button size="icon" variant="ghost" onClick={() => setAddBlockOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {blocks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No blocks yet. Create with AI or add manually.
                </p>
              ) : (
                blocks.map((block, index) => {
                  const Icon = BLOCK_ICONS[block.type] || FileText;
                  return (
                    <div
                      key={block.id}
                      className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedBlockId === block.id ? "bg-accent/20 border border-accent/30" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedBlockId(block.id)}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate flex-1">{getBlockPreview(block)}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(block.id, "up");
                          }}
                          disabled={index === 0}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(block.id, "down");
                          }}
                          disabled={index === blocks.length - 1}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBlock(block.id);
                          }}
                          className="p-1 hover:bg-destructive/20 rounded text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* Center - Canvas */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {blocks.length === 0 ? (
              <div className="text-center py-16">
                <div className="glass-card p-8 max-w-lg mx-auto">
                  <Sparkles className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Create Your Presentation</h3>
                  <p className="text-muted-foreground mb-8">
                    Let AI help you build a professional deck in seconds, or import existing content.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="hero" size="lg" onClick={() => setCreateDeckOpen(true)} className="gap-2">
                      <Sparkles className="h-5 w-5" />
                      Create Deck with AI
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setImportContentOpen(true)} className="gap-2">
                      <Upload className="h-5 w-5" />
                      Import Content
                    </Button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">Or start manually</p>
                    <Button variant="ghost" onClick={() => setAddBlockOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Block
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              blocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => setSelectedBlockId(block.id)}
                  onUpdate={(content) => updateBlock(block.id, content)}
                />
              ))
            )}
          </div>
        </main>

        {/* Right sidebar - AI Panel (Desktop only) */}
        <aside className="hidden md:block w-72 border-l border-border bg-card/30 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-4">AI Actions</h3>

            {selectedBlock ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Selected block</p>
                  <p className="font-medium text-sm">{BLOCK_LABELS[selectedBlock.type]}</p>
                </div>

                <Button variant="hero" className="w-full justify-start" onClick={() => setGenerateOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>

                <Button variant="outline" className="w-full justify-start" onClick={() => setRefineOpen(true)}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Agent Edit
                </Button>

                <Button variant="outline" className="w-full justify-start" onClick={() => setApplyTemplateOpen(true)}>
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  Apply Template
                </Button>
                <p className="text-xs text-muted-foreground px-1">
                  Transform block using a predefined format
                </p>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Quick edits (block only)</p>
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm h-8"
                      onClick={() => {
                        setRefineInstruction("Make it more concise and punchy");
                        setRefineOpen(true);
                      }}
                    >
                      ✂️ Shorten
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm h-8"
                      onClick={() => {
                        setRefineInstruction("Expand with more detail and examples");
                        setRefineOpen(true);
                      }}
                    >
                      📝 Expand
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm h-8"
                      onClick={() => {
                        setRefineInstruction("Make the tone more professional and executive");
                        setRefineOpen(true);
                      }}
                    >
                      👔 Professional
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm h-8"
                      onClick={() => {
                        setRefineInstruction("Simplify the language for a general audience");
                        setRefineOpen(true);
                      }}
                    >
                      💡 Simplify
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Select a block to use AI actions</p>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Tabs */}
      <MobileEditorTabs
        activeTab={mobileTab}
        onTabChange={handleMobileTabChange}
        hasSelectedBlock={!!selectedBlock}
      />

      {/* Mobile Blocks Panel */}
      <MobileBlocksPanel
        open={mobileBlocksOpen}
        onOpenChange={setMobileBlocksOpen}
        blocks={blocks}
        selectedBlockId={selectedBlockId}
        onSelectBlock={setSelectedBlockId}
        onMoveBlock={moveBlock}
        onDeleteBlock={deleteBlock}
        onAddBlock={() => setAddBlockOpen(true)}
        getBlockPreview={getBlockPreview}
      />

      {/* Mobile AI Panel */}
      <MobileAIPanel
        open={mobileAIOpen}
        onOpenChange={setMobileAIOpen}
        selectedBlock={selectedBlock || null}
        onGenerate={() => setGenerateOpen(true)}
        onRefine={() => setRefineOpen(true)}
        onApplyTemplate={() => setApplyTemplateOpen(true)}
        onQuickEdit={(instruction) => {
          setRefineInstruction(instruction);
          setRefineOpen(true);
        }}
      />

      {/* Add Block Dialog */}
      <Dialog open={addBlockOpen} onOpenChange={setAddBlockOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Block</DialogTitle>
            <DialogDescription>Choose a block type to add</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newBlockType} onValueChange={(v) => setNewBlockType(v as BlockType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => {
                  const Icon = BLOCK_ICONS[type];
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {BLOCK_LABELS[type]}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBlockOpen(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={addBlock}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Edit Dialog - Block-scoped refinement */}
      <Dialog open={refineOpen} onOpenChange={setRefineOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-accent" />
              Agent Edit
            </DialogTitle>
            <DialogDescription>
              AI will rewrite only the selected block. No other changes will be made to your deck.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBlock && (
            <div className="rounded-lg bg-muted/50 border border-border p-3 my-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Scope:</span>
                <span className="font-medium flex items-center gap-1.5">
                  {(() => {
                    const Icon = BLOCK_ICONS[selectedBlock.type];
                    return <Icon className="h-3.5 w-3.5" />;
                  })()}
                  {BLOCK_LABELS[selectedBlock.type]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                "{getBlockPreview(selectedBlock)}"
              </p>
            </div>
          )}
          
          <div className="py-2">
            <Label htmlFor="instruction">How should AI rewrite this block?</Label>
            <Textarea
              id="instruction"
              placeholder="e.g., Make it more persuasive, add statistics, simplify the language..."
              value={refineInstruction}
              onChange={(e) => setRefineInstruction(e.target.value)}
              className="mt-2 bg-muted/50"
              rows={3}
              disabled={refining}
            />
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <p className="text-xs text-muted-foreground mr-auto hidden sm:block">
              Only this block will be modified
            </p>
            <Button variant="outline" onClick={() => setRefineOpen(false)} disabled={refining}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleRefine} disabled={!refineInstruction.trim() || refining}>
              {refining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Rewriting...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Rewrite Block
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Dialog (per-block) */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate with AI</DialogTitle>
            <DialogDescription>
              Describe what content you want to create for this{" "}
              {selectedBlock ? BLOCK_LABELS[selectedBlock.type].toLowerCase() : "block"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="generate-prompt">Topic or prompt</Label>
            <Textarea
              id="generate-prompt"
              placeholder="e.g., Key benefits of cloud migration, Q3 sales performance metrics, Project timeline overview..."
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              className="mt-2 bg-muted/50"
              rows={3}
              disabled={generating}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)} disabled={generating}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleGenerate} disabled={!generatePrompt.trim() || generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Presentation</DialogTitle>
            <DialogDescription>
              {shareEnabled
                ? "Anyone with the link can view this presentation."
                : "Enable link sharing to let anyone view this presentation."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <Share2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Public link sharing</p>
                  <p className="text-xs text-muted-foreground">{shareEnabled ? "Enabled" : "Disabled"}</p>
                </div>
              </div>
              <Button variant={shareEnabled ? "outline" : "hero"} size="sm" onClick={toggleSharing}>
                {shareEnabled ? "Disable" : "Enable"}
              </Button>
            </div>

            {shareEnabled && shareToken && (
              <div className="space-y-2">
                <Label>Share link</Label>
                <div className="flex gap-2">
                  <Input readOnly value={`${window.location.origin}/p/${shareToken}`} className="bg-muted/50 text-sm" />
                  <Button variant="outline" size="icon" onClick={copyShareLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Deck Generation Modal */}
      <CreateDeckModal open={createDeckOpen} onOpenChange={setCreateDeckOpen} onGenerate={handleCreateDeck} />

      {/* Import Content Modal */}
      <ImportContentModal open={importContentOpen} onOpenChange={setImportContentOpen} onImport={handleImportContent} />

      {/* Apply Template Modal */}
      {selectedBlock && (
        <ApplyTemplateModal
          open={applyTemplateOpen}
          onOpenChange={setApplyTemplateOpen}
          blockType={selectedBlock.type}
          blockPreview={getBlockPreview(selectedBlock)}
          onApply={handleApplyTemplate}
        />
      )}
    </div>
  );
};

// Helper function for block preview text - renders actual content for sidebar labels
function getBlockPreview(block: Block): string {
  const content = block.content;
  switch (block.type) {
    case "heading": {
      const text = String(content.text || "").trim();
      if (!text || text === "New Heading") return "Heading";
      return text.slice(0, 35) + (text.length > 35 ? "…" : "");
    }
    case "text": {
      const text = String(content.text || "").trim();
      if (!text || text === "Enter your text here...") return "Text block";
      return text.slice(0, 35) + (text.length > 35 ? "…" : "");
    }
    case "callout": {
      const text = String(content.text || "").trim();
      if (!text || text === "Important point here") return "Callout";
      return text.slice(0, 35) + (text.length > 35 ? "…" : "");
    }
    case "list": {
      const items = content.items as string[] | undefined;
      if (!items || items.length === 0) return "List";
      const firstItem = items[0]?.trim();
      if (!firstItem || firstItem === "Item 1") return `List (${items.length} items)`;
      return firstItem.slice(0, 30) + (items.length > 1 ? ` +${items.length - 1}` : "");
    }
    case "two_col": {
      const left = String(content.left || "").trim();
      if (!left || left === "Left content") return "Two columns";
      return left.slice(0, 30) + "…";
    }
    case "table": {
      const headers = content.headers as string[] | undefined;
      const rows = content.rows as string[][] | undefined;
      if (!headers || headers.length === 0) return "Table";
      return `Table: ${headers.slice(0, 2).join(", ")}${headers.length > 2 ? "…" : ""} (${rows?.length || 0} rows)`;
    }
    case "image": {
      const alt = String(content.alt || "").trim();
      const caption = String(content.caption || "").trim();
      return alt || caption || "Image";
    }
    default:
      return BLOCK_LABELS[block.type] || "Block";
  }
}

// Block Renderer Component
interface BlockRendererProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: Record<string, unknown>) => void;
}

const BlockRenderer = ({ block, isSelected, onSelect, onUpdate }: BlockRendererProps) => {
  const content = block.content;

  const handleChange = (key: string, value: unknown) => {
    onUpdate({ ...content, [key]: value });
  };

  return (
    <div
      className={`rounded-lg border p-4 transition-all cursor-pointer ${
        isSelected
          ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
          : "border-border hover:border-muted-foreground/30"
      }`}
      onClick={onSelect}
    >
      {block.type === "heading" && (
        <Input
          value={String(content.text || "")}
          onChange={(e) => handleChange("text", e.target.value)}
          className={`border-none bg-transparent font-bold ${
            content.level === 1 ? "text-3xl" : content.level === 2 ? "text-2xl" : "text-xl"
          }`}
          placeholder="Heading..."
        />
      )}

      {block.type === "text" && (
        <Textarea
          value={String(content.text || "")}
          onChange={(e) => handleChange("text", e.target.value)}
          className="border-none bg-transparent resize-none min-h-[100px]"
          placeholder="Enter text..."
        />
      )}

      {block.type === "list" && (
        <div className="space-y-2">
          {((content.items as string[]) || []).map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1">{content.ordered ? `${idx + 1}.` : "•"}</span>
              <Input
                value={item}
                onChange={(e) => {
                  const newItems = [...((content.items as string[]) || [])];
                  newItems[idx] = e.target.value;
                  handleChange("items", newItems);
                }}
                className="border-none bg-transparent flex-1"
                placeholder="List item..."
              />
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleChange("items", [...((content.items as string[]) || []), ""]);
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add item
          </Button>
        </div>
      )}

      {block.type === "callout" && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
          <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <Textarea
            value={String(content.text || "")}
            onChange={(e) => handleChange("text", e.target.value)}
            className="border-none bg-transparent resize-none flex-1"
            placeholder="Important point..."
          />
        </div>
      )}

      {block.type === "two_col" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Left</Label>
            <Textarea
              value={String(content.left || "")}
              onChange={(e) => handleChange("left", e.target.value)}
              className="bg-muted/30 resize-none"
              rows={3}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Right</Label>
            <Textarea
              value={String(content.right || "")}
              onChange={(e) => handleChange("right", e.target.value)}
              className="bg-muted/30 resize-none"
              rows={3}
            />
          </div>
        </div>
      )}

      {block.type === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {((content.headers as string[]) || []).map((header, idx) => (
                  <th key={idx} className="border border-border p-2 bg-muted/30">
                    <Input
                      value={header}
                      onChange={(e) => {
                        const newHeaders = [...((content.headers as string[]) || [])];
                        newHeaders[idx] = e.target.value;
                        handleChange("headers", newHeaders);
                      }}
                      className="border-none bg-transparent font-semibold text-center"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {((content.rows as string[][]) || []).map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="border border-border p-2">
                      <Input
                        value={cell}
                        onChange={(e) => {
                          const newRows = [...((content.rows as string[][]) || [])];
                          newRows[rowIdx] = [...newRows[rowIdx]];
                          newRows[rowIdx][cellIdx] = e.target.value;
                          handleChange("rows", newRows);
                        }}
                        className="border-none bg-transparent text-center"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {block.type === "image" && (
        <div className="space-y-2">
          <Input
            value={String(content.src || "")}
            onChange={(e) => handleChange("src", e.target.value)}
            placeholder="Image URL..."
            className="bg-muted/30"
          />
          {content.src && (
            <img src={String(content.src)} alt={String(content.alt || "")} className="max-w-full rounded-lg" />
          )}
          <Input
            value={String(content.caption || "")}
            onChange={(e) => handleChange("caption", e.target.value)}
            placeholder="Caption (optional)"
            className="bg-muted/30 text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default Editor;
