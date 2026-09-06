import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { aiEngine } from "@/lib/ai-engine";
import { runVisualLayoutPass, enrichHeroImage } from "@/lib/visual-layout-pass";
import {
  Block,
  BlockType,
  toEditorBlocks,
  sanitizeContent,
  normalizeBlockContent,
  getDefaultContent,
  BLOCK_LABELS,
  extractRawText,
} from "@/lib/blocks";
import { sanitizeListItems } from "@/lib/sanitize";
import { THEMES, DEFAULT_THEME, ThemeId, LAYOUT_PRESETS, DEFAULT_LAYOUT, LayoutPresetId } from "@/lib/themes";
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
  Play,
  Share2,
  Copy,
  Check,
  Palette,
  FileDown,
  Upload,
  LayoutTemplate,
  MoreVertical,
  AlertCircle,
  Eye,
  Pencil,
  GripVertical,
  PanelRight,
  Zap,
  Layers,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axivaWordmark from "@/assets/axiva-wordmark-dark.svg";
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
import { UpgradeGateModal, canGenerateDeck, incrementDeckGenCount } from "@/components/UpgradeGateModal";
import { PostGenBanner } from "@/components/PostGenBanner";
import InviteTeamModal, { shouldShowInviteTeam, dismissInviteTeam } from "@/components/InviteTeamModal";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Badge } from "@/components/ui/badge";
import { getTemplateById } from "@/lib/block-templates";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileEditorTabs, { MobileTab } from "@/components/editor/MobileEditorTabs";
import MobileBlocksPanel from "@/components/editor/MobileBlocksPanel";
import MobileAIPanel from "@/components/editor/MobileAIPanel";
import BlockHoverToolbar from "@/components/editor/BlockHoverToolbar";
import AgentChatSidebar from "@/components/editor/AgentChatSidebar";
import { VisualSuggestionsSidebar } from "@/components/editor/VisualSuggestionsSidebar";
import EditorToolset from "@/components/editor/EditorToolset";
import { BLOCK_ICONS, getBlockIcon } from "@/lib/block-icons";
import { BrandKitPanel } from "@/components/BrandKitPanel";
import { ExportMenu } from "@/components/ExportMenu";
import { EditorMoreMenu } from "@/components/editor/EditorMoreMenu";
import { VersionHistorySheet } from "@/components/editor/VersionHistorySheet";
import { SlideLocksSheet } from "@/components/editor/SlideLocksSheet";
import { useSlideLocks } from "@/lib/slide-locks";
import { createSnapshot } from "@/lib/project-versions";
import type { BrandKit } from "@/lib/brand";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BarChart3, RefreshCw, Lock } from "lucide-react";
import { VisualBlockRenderer } from "@/components/blocks/VisualBlockRenderer";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Project {
  id: string;
  title: string;
  description: string | null;
  brand_kit?: unknown;
}

const Editor = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [project, setProject] = useState<Project | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "presentation">("edit");
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [visualSuggestionsOpen, setVisualSuggestionsOpen] = useState(false);

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  // Auto-open share dialog from URL param (?share=true)
  useEffect(() => {
    if (searchParams.get("share") === "true") {
      setShareDialogOpen(true);
      searchParams.delete("share");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Theme state
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);

  // Mobile panel state
  const [mobileTab, setMobileTab] = useState<MobileTab>("blocks");
  const [mobileBlocksOpen, setMobileBlocksOpen] = useState(false);
  const [mobileAIOpen, setMobileAIOpen] = useState(false);

  // Activation & engagement features
  const [beforeAfterMode, setBeforeAfterMode] = useState<"after" | "before">("after");
  const [recentBadges, setRecentBadges] = useState<Record<string, string>>({});
  const [upgradeGateOpen, setUpgradeGateOpen] = useState(false);
  const [showPostGenBanner, setShowPostGenBanner] = useState(false);
  const [showInviteTeam, setShowInviteTeam] = useState(false);
  const [upgradeGateFeature, setUpgradeGateFeature] = useState<string | undefined>();
  const [clarityScore, setClarityScore] = useState<number | null>(null);
  const [stressTestTrigger, setStressTestTrigger] = useState<string | null>(null);
  const [pptxLoading, setPptxLoading] = useState(false);

  // Quick Polish state
  const [polishing, setPolishing] = useState(false);
  const [polishProgress, setPolishProgress] = useState<{ current: number; total: number } | null>(null);

  // Layout preset state
  const [layoutPreset, setLayoutPreset] = useState<LayoutPresetId>(DEFAULT_LAYOUT);

  // Brand kit state
  const [brandKit, setBrandKit] = useState<BrandKit>({});
  const [brandPanelOpen, setBrandPanelOpen] = useState(false);

  // Share passcode state
  const [sharePasscode, setSharePasscode] = useState("");
  const [viewAnalytics, setViewAnalytics] = useState<{ total: number; unique: number; topSlides: { index: number; avgTime: number }[] } | null>(null);


  // Version history & slide locks
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [locksOpen, setLocksOpen] = useState(false);
  const { locked: lockedSlideIndexes, refresh: refreshLocks } = useSlideLocks(projectId);

  // Helper: snapshot current state before any destructive AI op
  const snapshotBeforeAI = useCallback(
    async (label: string) => {
      if (!projectId || !user) return;
      await createSnapshot(projectId, user.id, label, {
        blocks: blocks.map((b) => ({
          id: b.id,
          type: b.type,
          content: b.content as Record<string, unknown>,
          order_index: b.order_index,
        })),
        theme,
        title: project?.title,
      });
    },
    [projectId, user, blocks, theme, project?.title]
  );

  // Save progress prompt - beforeunload
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  // Badge auto-clear helper
  const showBadge = useCallback((blockId: string, text: string) => {
    setRecentBadges((prev) => ({ ...prev, [blockId]: text }));
    setTimeout(() => {
      setRecentBadges((prev) => {
        const next = { ...prev };
        delete next[blockId];
        return next;
      });
    }, 4000);
  }, []);
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
        .select("id, title, description, share_enabled, share_token, theme, brand_kit, share_passcode")
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
      setBrandKit((projectData.brand_kit as BrandKit) || {});
      setSharePasscode(projectData.share_passcode || "");

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

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex = prev.findIndex((b) => b.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex).map((b, i) => ({ ...b, order_index: i }));
    });
    setHasUnsavedChanges(true);
  }, []);

  const handleQuickAIAction = useCallback(async (blockId: string, instruction: string, badgeText?: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    try {
      const refined = await aiEngine.refineBlock({
        block: { type: block.type, content: block.content, order_index: block.order_index },
        instruction,
      });

      let sanitized = sanitizeContent(refined.content);
      sanitized = normalizeBlockContent(block.type, sanitized);

      if (block.type === "list" && Array.isArray(sanitized.items)) {
        sanitized.items = sanitizeListItems(sanitized.items);
      }

      updateBlock(block.id, sanitized);
      if (badgeText) showBadge(block.id, badgeText);
      toast({ title: "Block updated", description: "AI applied the edit." });
    } catch (error) {
      console.error("Quick AI action error:", error);
      toast({
        title: "AI edit failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  }, [blocks, updateBlock, toast]);

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

  // getDefaultContent is imported from @/lib/blocks

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

    // Soft gate check
    if (!canGenerateDeck(subscription.tier)) {
      setUpgradeGateFeature(undefined);
      setUpgradeGateOpen(true);
      return;
    }

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

      // Use shared pipeline for normalization
      let newBlocks = toEditorBlocks(result.blocks);
      // Run visual layout pass to enforce variety
      newBlocks = runVisualLayoutPass(newBlocks);

      setBlocks(newBlocks);
      setHasUnsavedChanges(true);
      setCreateDeckOpen(false);
      incrementDeckGenCount();

      // Show post-generation upgrade nudge for free users
      if (subscription.tier === "free") {
        setShowPostGenBanner(true);
      }

      // Show "invite your team" after 2nd deck creation
      const { getDeckGenCount } = await import("@/lib/usage-gates");
      if (shouldShowInviteTeam(getDeckGenCount())) {
        setTimeout(() => {
          setShowInviteTeam(true);
          dismissInviteTeam();
        }, 3000); // 3s delay — let post-gen banner show first
      }

      await saveBlocksAndNavigate(newBlocks);

      // Async hero image enrichment (non-blocking)
      enrichHeroImage(newBlocks).then((enriched) => {
        if (enriched !== newBlocks) {
          setBlocks(enriched);
          setHasUnsavedChanges(true);
        }
      });
    } catch (error) {
      console.error("Create deck error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Import content handler (legacy flow - converts content to blocks)
  const handleImportContent = async (content: string) => {
    if (!projectId) return;

    try {
      const result = await aiEngine.generateFromPrompt({
        topic: "Presentation from imported content",
        prompt: content,
        tone: "professional",
      });

      // Use shared pipeline for normalization
      const newBlocks = toEditorBlocks(result.blocks);

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

  // Direct insert blocks handler (new flow - appends blocks to existing deck)
  const handleInsertBlocks = (newBlocks: Block[]) => {
    if (!projectId || newBlocks.length === 0) return;

    // Re-index new blocks to continue after existing blocks
    const startIndex = blocks.length;
    const reindexedBlocks = newBlocks.map((block, i) => ({
      ...block,
      id: crypto.randomUUID(), // Ensure unique IDs
      order_index: startIndex + i,
    }));

    const updatedBlocks = [...blocks, ...reindexedBlocks];
    setBlocks(updatedBlocks);
    setHasUnsavedChanges(true);
    setImportContentOpen(false);
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

    // Hard gate — PDF export is paid-only (same as PPTX)
    const isPaid = subscription.subscribed && subscription.tier !== 'free';
    if (!isPaid) {
      setUpgradeGateFeature("PDF Export");
      setUpgradeGateOpen(true);
      return;
    }

    // Open the existing print route synchronously from the click so the
    // browser's popup rules treat it as user-initiated. The browser's own
    // print/save dialog then needs additional actions from the person.
    window.open(`/print/${projectId}`, "_blank", "noopener,noreferrer");
  };

  const exportPptx = async () => {
    if (!projectId) return;

    // Show upgrade prompt for free users — hard gate (no watermarked download)
    const isPaid = subscription.subscribed && subscription.tier !== 'free';
    if (!isPaid) {
      setUpgradeGateFeature("PowerPoint Export");
      setUpgradeGateOpen(true);
      return; // Block export for free users — key conversion point
    }

    setPptxLoading(true);
    try {
      const { generatePptxBlob } = await import("@/lib/pptx-export");
      const blob = await generatePptxBlob({
        title: project?.title || "Untitled Deck",
        blocks: blocks.map((b) => ({
          id: b.id,
          type: b.type,
          content: b.content as Record<string, unknown>,
          order_index: b.order_index,
        })),
        brandKit: project?.brand_kit as Record<string, unknown> | undefined,
        showWatermark: !isPaid,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project?.title || "deck"}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast({ title: "PowerPoint exported", description: isPaid ? "Your .pptx file is downloading." : "Your .pptx file is downloading (with Axiva watermark)." });
    } catch (e) {
      console.error("PPTX export error:", e);
      toast({ title: "Export failed", description: "Could not generate PowerPoint file. Please try again.", variant: "destructive" });
    } finally {
      setPptxLoading(false);
    }
  };

  // Brand kit save handler
  const handleBrandKitChange = async (kit: BrandKit) => {
    setBrandKit(kit);
    if (!projectId) return;
    try {
      await supabase.from("projects").update({ brand_kit: kit as any }).eq("id", projectId);
    } catch (e) {
      console.error("Brand kit save error:", e);
    }
  };

  // Share passcode save handler — stores SHA-256 hash, not plaintext
  const handlePasscodeSave = async (value: string) => {
    if (!projectId) return;
    setSharePasscode(value);
    try {
      let hashedValue: string | null = null;
      if (value) {
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        hashedValue = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      }
      await supabase.from("projects").update({ share_passcode: hashedValue }).eq("id", projectId);
      toast({ title: value ? "Passcode set" : "Passcode removed" });
    } catch (e) {
      console.error("Passcode save error:", e);
      toast({ title: "Failed to update passcode", variant: "destructive" });
    }
  };

  // Regenerate share link
  const regenerateShareLink = async () => {
    if (!projectId) return;
    try {
      const { data, error } = await supabase
        .from("projects")
        .update({ share_token: crypto.randomUUID() })
        .eq("id", projectId)
        .select("share_token")
        .single();
      if (error) throw error;
      setShareToken(String(data.share_token));
      toast({ title: "Link regenerated", description: "Old links will no longer work." });
    } catch (e) {
      console.error("Regenerate link error:", e);
      toast({ title: "Failed to regenerate link", variant: "destructive" });
    }
  };

  // Fetch view analytics
  const fetchViewAnalytics = async () => {
    if (!projectId) return;
    try {
      const { data, error } = await supabase
        .from("deck_views")
        .select("viewer_hash, slide_index, duration_seconds")
        .eq("project_id", projectId);
      if (error) throw error;
      const views = data || [];
      const uniqueViewers = new Set(views.map(v => v.viewer_hash).filter(Boolean));
      
      // Top slides by avg time
      const slideMap: Record<number, { total: number; count: number }> = {};
      for (const v of views) {
        if (v.slide_index != null && v.duration_seconds != null) {
          if (!slideMap[v.slide_index]) slideMap[v.slide_index] = { total: 0, count: 0 };
          slideMap[v.slide_index].total += v.duration_seconds;
          slideMap[v.slide_index].count += 1;
        }
      }
      const topSlides = Object.entries(slideMap)
        .map(([idx, { total, count }]) => ({ index: Number(idx), avgTime: Math.round(total / count) }))
        .sort((a, b) => b.avgTime - a.avgTime)
        .slice(0, 3);

      setViewAnalytics({ total: views.length, unique: uniqueViewers.size, topSlides });
    } catch (e) {
      console.error("Analytics fetch error:", e);
    }
  };

  // Quick Polish – iterate all blocks sequentially with executive refinement
  const handleQuickPolish = async () => {
    if (polishing || blocks.length === 0) return;
    await snapshotBeforeAI(`Before Quick Polish · ${new Date().toLocaleTimeString()}`);
    setPolishing(true);
    const total = blocks.length;
    const polishInstruction = `Tighten all wording — remove filler, redundancy, and passive voice. If this is a heading and it uses a generic phrase like "Overview", "Summary", "Plan", "Introduction", "Next Steps", or "Conclusion", rewrite it as an outcome-driven headline that communicates specific value (e.g., "Revenue Leakage Risk Identified in Q3 Operations"). Strengthen the executive tone. Keep content factual and concise. Do not add new information.`;

    for (let i = 0; i < total; i++) {
      setPolishProgress({ current: i + 1, total });
      const block = blocks[i];
      if (lockedSlideIndexes.has(block.order_index)) {
        showBadge(block.id, "Locked");
        continue;
      }
      try {
        const refined = await aiEngine.refineBlock({
          block: { type: block.type, content: block.content, order_index: block.order_index },
          instruction: polishInstruction,
        });
        let sanitized = sanitizeContent(refined.content);
        sanitized = normalizeBlockContent(block.type, sanitized);
        if (block.type === "list" && Array.isArray(sanitized.items)) {
          sanitized.items = sanitizeListItems(sanitized.items);
        }
        updateBlock(block.id, sanitized);
        showBadge(block.id, "Polished");
      } catch (err) {
        console.error(`Quick Polish failed on block ${i + 1}:`, err);
      }
    }

    setPolishing(false);
    setPolishProgress(null);
    setHasUnsavedChanges(true);
    const skipped = blocks.filter((b) => lockedSlideIndexes.has(b.order_index)).length;
    toast({
      title: "Quick Polish complete",
      description: skipped > 0
        ? `${total - skipped} refined · ${skipped} locked slide${skipped === 1 ? "" : "s"} skipped.`
        : `${total} blocks refined.`,
    });
  };

  // Make it Visual – run layout pass to transform verbose blocks (respects locks)
  const handleMakeItVisual = useCallback(async () => {
    if (blocks.length === 0) return;
    await snapshotBeforeAI(`Before Make it Visual · ${new Date().toLocaleTimeString()}`);
    const transformed = runVisualLayoutPass(blocks);
    // Preserve locked slides: keep originals where order_index is locked
    const merged = transformed.map((b) =>
      lockedSlideIndexes.has(b.order_index)
        ? blocks.find((orig) => orig.order_index === b.order_index) ?? b
        : b
    );
    setBlocks(merged);
    setHasUnsavedChanges(true);
    const skipped = blocks.filter((b) => lockedSlideIndexes.has(b.order_index)).length;
    toast({
      title: "Layout upgraded",
      description: skipped > 0 ? `${skipped} locked slide${skipped === 1 ? "" : "s"} preserved.` : "Verbose blocks converted to visual layouts.",
    });
  }, [blocks, toast, lockedSlideIndexes, snapshotBeforeAI]);

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
            <Button variant="ghost" size="icon" className="shrink-0" aria-label="Back to my decks" onClick={() => {
              if (hasUnsavedChanges && !window.confirm("You have unsaved changes. Leave anyway?")) return;
              navigate("/dashboard");
            }}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <img src={axivaWordmark} alt="AXIVA" className="h-4 w-auto hidden sm:block" />
              <span className="text-muted-foreground hidden sm:inline">|</span>
              <input
                aria-label="Deck title"
                className="w-full font-semibold truncate max-w-[110px] sm:max-w-[200px] text-sm sm:text-base bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/50 rounded px-1 -mx-1 cursor-text"
                value={project?.title || ""}
                placeholder="Untitled"
                onChange={(e) => {
                  if (project) setProject({ ...project, title: e.target.value });
                }}
                onBlur={async (e) => {
                  const newTitle = e.target.value.trim();
                  if (!newTitle || !projectId || newTitle === project?.title) return;
                  await supabase.from("projects").update({ title: newTitle }).eq("id", projectId);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
              />
            </div>
          </div>

          {/* Desktop header actions */}
          <div className="hidden md:flex items-center gap-2">
            {hasUnsavedChanges && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
            {polishProgress && (
              <span className="text-xs text-muted-foreground">
                Polishing block {polishProgress.current} of {polishProgress.total}…
              </span>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              <Button
                variant={viewMode === "edit" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setViewMode("edit")}
              >
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant={viewMode === "presentation" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setViewMode("presentation")}
              >
                <Eye className="h-3 w-3 mr-1" />
                Present
              </Button>
            </div>

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

            {/* Prominent Share button — key growth driver */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareDialogOpen(true)}
              className="gap-1.5"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            {/* Visual Suggestions toggle */}
            <Button
              variant={visualSuggestionsOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setVisualSuggestionsOpen((v) => !v)}
              title="Visual Suggestions"
              className="gap-1.5"
            >
              <Palette className="h-4 w-4" />
              Visuals
            </Button>

            {/* Agent Sidebar toggle */}
            <Button
              variant={aiSidebarOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
              title="AI Agent"
              className="gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              Agent
            </Button>

            {/* Direct, clearly labeled export entry point (same handlers, same gates) */}
            <ExportMenu
              onPrintPDF={exportPdf}
              onExportPPTX={exportPptx}
              pptxLoading={pptxLoading}
              onShareLink={() => setShareDialogOpen(true)}
              onPresenterView={() => navigate(`/present/${projectId}`)}
            />

            {/* Gamma-style consolidated menu */}
            <EditorMoreMenu
              projectTitle={project?.title}
              onBrandKit={() => setBrandPanelOpen(true)}
              onThemeChange={updateTheme}
              currentTheme={theme}
              onLayoutChange={(id) => setLayoutPreset(id)}
              currentLayout={layoutPreset}
              onExportPDF={exportPdf}
              onExportPPTX={exportPptx}
              pptxLoading={pptxLoading}
              onShare={() => setShareDialogOpen(true)}
              onPresenterView={() => navigate(`/present/${projectId}`)}
              onAnalytics={fetchViewAnalytics}
              onGenerateDeck={() => setCreateDeckOpen(true)}
              onQuickPolish={handleQuickPolish}
              polishing={polishing}
              onMakeItVisual={handleMakeItVisual}
              blocksCount={blocks.length}
              onVersionHistory={() => setVersionsOpen(true)}
              onSlideLocks={() => setLocksOpen(true)}
              lockedSlidesCount={lockedSlideIndexes.size}
              onImportContent={() => setImportContentOpen(true)}
              onDuplicate={async () => {
                if (!projectId || !project) return;
                try {
                  const { data: newProject, error } = await supabase
                    .from("projects")
                    .insert({
                      title: `${project.title} (copy)`,
                      description: project.description,
                      user_id: user!.id,
                      theme,
                      brand_kit: brandKit as any,
                    })
                    .select("id")
                    .single();
                  if (error) throw error;
                  if (blocks.length > 0) {
                    const blocksToInsert = blocks.map((block, index) => ({
                      project_id: newProject.id,
                      type: block.type as any,
                      content: block.content as any,
                      order_index: index,
                    }));
                    await supabase.from("blocks").insert(blocksToInsert);
                  }
                  toast({ title: "Deck duplicated", description: "Opening the copy…" });
                  navigate(`/editor/${newProject.id}`);
                } catch (e) {
                  console.error("Duplicate error:", e);
                  toast({ title: "Duplicate failed", variant: "destructive" });
                }
              }}
              onDelete={async () => {
                if (!projectId || !window.confirm("Delete this deck permanently?")) return;
                try {
                  await supabase.from("blocks").delete().eq("project_id", projectId);
                  await supabase.from("projects").delete().eq("id", projectId);
                  toast({ title: "Deck deleted" });
                  navigate("/dashboard");
                } catch (e) {
                  console.error("Delete error:", e);
                  toast({ title: "Delete failed", variant: "destructive" });
                }
              }}
            />
          </div>

          {/* Mobile header actions */}
          <div className="flex md:hidden shrink-0 items-center gap-1">
            <Button
              variant="hero"
              size="sm"
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              aria-label="Save deck"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
            <ExportMenu
              onPrintPDF={exportPdf}
              onExportPPTX={exportPptx}
              pptxLoading={pptxLoading}
              onShareLink={() => setShareDialogOpen(true)}
              onPresenterView={() => navigate(`/present/${projectId}`)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More deck actions">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCreateDeckOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Deck
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleQuickPolish} disabled={polishing || blocks.length === 0}>
                  <Zap className="h-4 w-4 mr-2" />
                  {polishing ? "Polishing…" : "Quick Polish"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMakeItVisual} disabled={blocks.length === 0}>
                  <Layers className="h-4 w-4 mr-2" />
                  Make it Visual
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/preview/${projectId}`)}>
                  <Play className="h-4 w-4 mr-2" />
                  Preview
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
                  const Icon = getBlockIcon(block.type);
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
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className={LAYOUT_PRESETS[layoutPreset].canvas}>
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
            ) : beforeAfterMode === "before" ? (
              /* Before AI Mode - Raw bullet text */
              <div className="space-y-4">
                <div className="text-xs text-muted-foreground text-center mb-2 uppercase tracking-wide">
                  Raw content — before AI structuring
                </div>
                {blocks.map((block) => {
                  const lines = extractRawText(block);
                  return (
                    <div key={block.id} className="rounded-lg border border-dashed border-border p-4 bg-muted/20">
                      {lines.map((line, i) => (
                        <p key={i} className="text-sm text-muted-foreground leading-relaxed">• {line}</p>
                      ))}
                      {lines.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">Empty block</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : viewMode === "presentation" ? (
              /* Presentation Mode - Read-only slide layout */
              <div className="space-y-8">
                {blocks.map((block) => (
                  <div key={block.id} className="bg-card rounded-xl border border-border p-8 shadow-sm">
                    <PresentationBlock block={block} />
                  </div>
                ))}
              </div>
            ) : (
              /* Edit Mode - Draggable blocks with hover toolbar */
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  {blocks.map((block) => (
                    <div key={block.id} className="relative">
                      {/* Value reinforcement badge */}
                      {recentBadges[block.id] && (
                        <div className="absolute -top-3 right-4 z-30">
                          <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-accent/20">
                            ✓ {recentBadges[block.id]}
                          </Badge>
                        </div>
                      )}
                      <SortableBlock
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onSelect={() => setSelectedBlockId(block.id)}
                        onUpdate={(content) => updateBlock(block.id, content)}
                        onQuickAIAction={(instruction, badgeText) => handleQuickAIAction(block.id, instruction, badgeText)}
                        onDelete={() => deleteBlock(block.id)}
                        onGenerate={() => {
                          setSelectedBlockId(block.id);
                          setGenerateOpen(true);
                        }}
                        onRefine={() => {
                          setSelectedBlockId(block.id);
                          setRefineOpen(true);
                        }}
                        layoutBlockClass={LAYOUT_PRESETS[layoutPreset].block}
                      />
                    </div>
                  ))}
                </SortableContext>
              </DndContext>
            )}
            {/* Social proof line */}
            {blocks.length > 0 && (
              <p className="text-center text-xs text-muted-foreground/60 mt-8 mb-4">
                Used by strategy leaders to prepare board-level narratives.
              </p>
            )}
          </div>
        </main>

        {/* Right sidebar - Visual Suggestions (Napkin-style) */}
        <VisualSuggestionsSidebar
          open={visualSuggestionsOpen}
          onClose={() => setVisualSuggestionsOpen(false)}
          selectedBlock={selectedBlock || null}
          onUpdateContent={(blockId, content) => {
            updateBlock(blockId, content);
          }}
        />

        {/* Right sidebar - Agent Chat */}
        <AgentChatSidebar
          open={aiSidebarOpen}
          onToggle={() => setAiSidebarOpen(!aiSidebarOpen)}
          blocks={blocks}
          deckTitle={project?.title}
          onAgentAction={async (instruction) => {
            // Apply the instruction to all blocks sequentially
            for (const block of blocks) {
              try {
                const refined = await aiEngine.refineBlock({
                  block: { type: block.type, content: block.content, order_index: block.order_index },
                  instruction,
                });
                let sanitized = sanitizeContent(refined.content);
                sanitized = normalizeBlockContent(block.type, sanitized);
                if (block.type === "list" && Array.isArray(sanitized.items)) {
                  sanitized.items = sanitizeListItems(sanitized.items);
                }
                updateBlock(block.id, sanitized);
              } catch (err) {
                console.error(`Agent action failed on block:`, err);
              }
            }
            setHasUnsavedChanges(true);
          }}
          onQuickAction={async (blockIndex, instruction) => {
            const block = blocks[blockIndex];
            if (block) await handleQuickAIAction(block.id, instruction);
          }}
        />

        {/* Right toolset strip */}
        <EditorToolset
          onAddBlock={(type) => {
            const newBlock: Block = {
              id: crypto.randomUUID(),
              type,
              content: getDefaultContent(type),
              order_index: blocks.length,
            };
            setBlocks((prev) => [...prev, newBlock]);
            setSelectedBlockId(newBlock.id);
            setHasUnsavedChanges(true);
          }}
          currentTheme={theme}
          onThemeChange={updateTheme}
          onInsertImage={(src, alt) => {
            const newBlock: Block = {
              id: crypto.randomUUID(),
              type: "image",
              content: { src, alt, caption: "" },
              order_index: blocks.length,
            };
            setBlocks((prev) => [...prev, newBlock]);
            setSelectedBlockId(newBlock.id);
            setHasUnsavedChanges(true);
          }}
          deckTitle={project?.title}
        />
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
      <Dialog open={shareDialogOpen} onOpenChange={(open) => {
        setShareDialogOpen(open);
        if (open) fetchViewAnalytics();
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Presentation</DialogTitle>
            <DialogDescription>
              {shareEnabled
                ? "Anyone with the link can view this presentation."
                : "Enable link sharing to let anyone view this presentation."}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link">Link & Security</TabsTrigger>
              <TabsTrigger value="analytics">Views</TabsTrigger>
            </TabsList>
            <TabsContent value="link" className="space-y-4 pt-4">
              {/* Enable/Disable toggle */}
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
                <>
                  {/* Share link with copy */}
                  <div className="space-y-2">
                    <Label>Share link</Label>
                    <div className="flex gap-2">
                      <Input readOnly value={`${window.location.origin}/p/${shareToken}`} className="bg-muted/50 text-sm" />
                      <Button variant="outline" size="icon" onClick={copyShareLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Regenerate link */}
                  <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={regenerateShareLink}>
                    <RefreshCw className="h-3 w-3" />
                    Regenerate link (old links stop working)
                  </Button>

                  {/* Passcode */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5" />
                      Passcode protection
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Leave empty for no passcode"
                        value={sharePasscode}
                        onChange={(e) => setSharePasscode(e.target.value)}
                        className="bg-muted/50 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePasscodeSave(sharePasscode)}
                      >
                        Save
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sharePasscode ? "Viewers must enter this passcode to view." : "No passcode set – anyone with the link can view."}
                    </p>
                  </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4 pt-4">
              {viewAnalytics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
                      <p className="text-2xl font-bold">{viewAnalytics.total}</p>
                      <p className="text-xs text-muted-foreground">Total views</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
                      <p className="text-2xl font-bold">{viewAnalytics.unique}</p>
                      <p className="text-xs text-muted-foreground">Unique viewers</p>
                    </div>
                  </div>
                  {viewAnalytics.topSlides.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Top slides by avg. time</p>
                      {viewAnalytics.topSlides.map(({ index, avgTime }) => (
                        <div key={index} className="flex items-center justify-between text-sm px-3 py-2 rounded bg-muted/30">
                          <span>Slide {index + 1}</span>
                          <span className="text-muted-foreground">{avgTime}s avg</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                  <BarChart3 className="h-8 w-8" />
                  <p className="text-sm">No view data yet</p>
                  <p className="text-xs">Share your presentation to start tracking views.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Brand Kit Sheet */}
      <Sheet open={brandPanelOpen} onOpenChange={setBrandPanelOpen}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Brand Kit</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <BrandKitPanel brandKit={brandKit} onChange={handleBrandKitChange} />
          </div>
        </SheetContent>
      </Sheet>

      {/* AI Deck Generation Modal */}
      <CreateDeckModal open={createDeckOpen} onOpenChange={setCreateDeckOpen} onGenerate={handleCreateDeck} />

      {/* Import Content Modal */}
      <ImportContentModal 
        open={importContentOpen} 
        onOpenChange={setImportContentOpen} 
        onImport={handleImportContent}
        onInsertBlocks={handleInsertBlocks}
      />

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

      {/* Upgrade Gate Modal */}
      <UpgradeGateModal open={upgradeGateOpen} onOpenChange={setUpgradeGateOpen} feature={upgradeGateFeature} />
      <PostGenBanner
        visible={showPostGenBanner}
        onDismiss={() => setShowPostGenBanner(false)}
        slideCount={blocks.length}
      />

      {/* Invite Team Modal — triggers after 2nd deck */}
      <InviteTeamModal
        open={showInviteTeam}
        onClose={() => setShowInviteTeam(false)}
      />


      {/* Version history sheet */}
      {projectId && user && (
        <VersionHistorySheet
          open={versionsOpen}
          onOpenChange={setVersionsOpen}
          projectId={projectId}
          userId={user.id}
          currentSnapshot={{
            blocks: blocks.map((b) => ({
              id: b.id,
              type: b.type,
              content: b.content as Record<string, unknown>,
              order_index: b.order_index,
            })),
            theme,
            title: project?.title,
          }}
          onRestored={() => fetchProject()}
        />
      )}

      {/* Slide locks sheet */}
      {projectId && user && (
        <SlideLocksSheet
          open={locksOpen}
          onOpenChange={(o) => {
            setLocksOpen(o);
            if (!o) void refreshLocks();
          }}
          projectId={projectId}
          userId={user.id}
          slides={blocks.map((b) => ({
            orderIndex: b.order_index,
            title:
              (b.content as any)?.title ||
              (b.content as any)?.text ||
              (b.content as any)?.heading ||
              `Slide ${b.order_index + 1}`,
            type: b.type,
          }))}
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

// ============================================================
// SortableBlock – wraps BlockRenderer with dnd-kit + hover toolbar
// ============================================================
interface SortableBlockProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: Record<string, unknown>) => void;
  onQuickAIAction: (instruction: string, badgeText: string) => Promise<void>;
  onDelete: () => void;
  onGenerate: () => void;
  onRefine: () => void;
  layoutBlockClass?: string;
}

const SortableBlock = ({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onQuickAIAction,
  onDelete,
  onGenerate,
  onRefine,
  layoutBlockClass,
}: SortableBlockProps) => {
  const [hovered, setHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover toolbar with AI quick actions */}
      <BlockHoverToolbar visible={hovered && !isDragging} onQuickAction={onQuickAIAction} />

      {/* Drag handle + actions */}
      <div className={`absolute -left-10 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isDragging ? 'opacity-100' : ''}`}>
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Delete / AI buttons on right side */}
      <div className="absolute -right-10 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onGenerate(); }}
          className="p-1 hover:bg-accent/20 rounded text-accent"
          title="Generate with AI"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRefine(); }}
          className="p-1 hover:bg-accent/20 rounded text-accent"
          title="Agent Edit"
        >
          <Wand2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 hover:bg-destructive/20 rounded text-destructive"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <BlockRenderer
        block={block}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        layoutBlockClass={layoutBlockClass}
      />
    </div>
  );
};

// ============================================================
// PresentationBlock – Read-only slide rendering
// ============================================================
const PresentationBlock = ({ block }: { block: Block }) => {
  const content = block.content;

  switch (block.type) {
    case "heading":
      return (
        <h2 className={`font-bold ${content.level === 1 ? "text-4xl" : content.level === 2 ? "text-3xl" : "text-2xl"}`}>
          {String(content.text || "")}
        </h2>
      );
    case "text":
      return <p className="text-lg leading-relaxed text-muted-foreground">{String(content.text || "")}</p>;
    case "list":
      return (
        <ul className="space-y-2 text-lg">
          {((content.items as string[]) || []).map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-accent flex-shrink-0">{content.ordered ? `${i + 1}.` : "•"}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div className="flex items-start gap-4 p-6 rounded-xl bg-accent/10 border border-accent/20">
          <AlertCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-lg">{String(content.text || "")}</p>
        </div>
      );
    case "two_col":
      return (
        <div className="grid grid-cols-2 gap-8">
          <div className="text-muted-foreground">{String(content.left || "")}</div>
          <div className="text-muted-foreground">{String(content.right || "")}</div>
        </div>
      );
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {((content.headers as string[]) || []).map((h, i) => (
                  <th key={i} className="border border-border p-3 bg-muted/30 font-semibold text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {((content.rows as string[][]) || []).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-border p-3">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "image":
      return content.src ? (
        <img src={String(content.src)} alt={String(content.alt || "")} className="max-w-full rounded-lg" />
      ) : (
        <div className="aspect-video bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
          <p className="text-muted-foreground">Image placeholder</p>
        </div>
      );
    default:
      return (
        <VisualBlockRenderer
          block={{
            id: block.id,
            type: block.type,
            content: block.content,
            order_index: block.order_index,
            block_payload: block.content,
            block_meta: { schema_version: 1 },
          } as any}
          readOnly
        />
      );
  }
};

// Block Renderer Component (Edit Mode)
interface BlockRendererProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: Record<string, unknown>) => void;
  layoutBlockClass?: string;
}

const BlockRenderer = ({ block, isSelected, onSelect, onUpdate, layoutBlockClass }: BlockRendererProps) => {
  const content = block.content;

  const handleChange = (key: string, value: unknown) => {
    onUpdate({ ...content, [key]: value });
  };

  return (
    <div
      className={`rounded-lg border transition-all cursor-pointer ${layoutBlockClass || "p-4"} ${
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

      {/* Visual/Decision block fallback display */}
      {!["heading", "text", "list", "callout", "two_col", "table", "image"].includes(block.type) && (
        <VisualBlockRenderer
          block={{
            id: block.id,
            type: block.type,
            content: block.content,
            order_index: block.order_index,
            block_payload: block.content,
            block_meta: { schema_version: 1 },
          } as any}
          readOnly
        />
      )}
    </div>
  );
};

export default Editor;
