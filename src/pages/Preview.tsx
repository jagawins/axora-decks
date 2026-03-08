import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DeckPlayer from "@/components/DeckPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, X, Share2 } from "lucide-react";
import { ThemeId, DEFAULT_THEME } from "@/lib/themes";
import { BrandKit } from "@/lib/brand";
import type { BlockType } from "@/lib/blocks";
import { sanitizeContent, normalizeBlockContent } from "@/lib/blocks";
import { sanitizeListItems } from "@/lib/sanitize";
import { aiEngine } from "@/lib/ai-engine";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileShareSheet } from "@/components/MobileShareSheet";

interface Block {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
}

export default function Preview() {
  const { id: projectId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Untitled");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [showMobileShare, setShowMobileShare] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  // Inline edit state
  const [editingBlockIds, setEditingBlockIds] = useState<string[] | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user && projectId) fetchProject();
  }, [user, projectId]);

  const fetchProject = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data: p, error: pe } = await supabase
        .from("projects")
        .select("id, title, description, theme, brand_kit")
        .eq("id", projectId)
        .maybeSingle();

      if (pe) throw pe;
      if (!p) { navigate("/dashboard"); return; }

      setTitle(p.title || "Untitled");
      setTheme((p.theme as ThemeId) || DEFAULT_THEME);
      setBrandKit((p.brand_kit as BrandKit) || null);
      setShareToken(p.share_token ? String(p.share_token) : null);

      // Show mobile share sheet on first load (from generate flow)
      if (isMobile && searchParams.get("new") === "1") {
        setShowMobileShare(true);
      }

      const { data: blocksData, error: be } = await supabase
        .from("blocks")
        .select("*")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });

      if (be) throw be;

      setBlocks(
        (blocksData || []).map((b) => ({
          id: b.id,
          type: b.type as BlockType,
          content: b.content as Record<string, unknown>,
          order_index: b.order_index,
        }))
      );
    } catch (error) {
      console.error("Error fetching project:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Save a single block to DB and update local state
  const saveBlock = useCallback(async (blockId: string, content: Record<string, unknown>) => {
    if (!projectId) return;
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content } : b));
    try {
      await supabase
        .from("blocks")
        .update({ content: content as any })
        .eq("id", blockId)
        .eq("project_id", projectId);
    } catch (err) {
      console.error("Save block error:", err);
    }
  }, [projectId]);

  // Handle quick AI action from DeckPlayer
  const handleQuickAction = useCallback(async (blockId: string, instruction: string) => {
    const block = blocks.find(b => b.id === blockId);
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

      await saveBlock(blockId, sanitized);
      toast({ title: "Block updated", description: "AI applied the edit." });
    } catch (err) {
      console.error("Quick action error:", err);
      toast({ title: "AI edit failed", variant: "destructive" });
    }
  }, [blocks, saveBlock, toast]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const initialSlide = parseInt(searchParams.get("slide") || "1", 10) - 1;
  const editBlocks = editingBlockIds ? blocks.filter(b => editingBlockIds.includes(b.id)) : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/editor/${projectId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold truncate max-w-[300px]">{title}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/editor/${projectId}`)}>
            Back to editor
          </Button>
        </div>
      </header>

      <main className="flex-1 relative">
        <DeckPlayer
          blocks={blocks}
          title={title}
          theme={theme}
          brandKit={brandKit}
          initialSlide={Math.max(0, initialSlide)}
          onEditSlide={(blockIds) => setEditingBlockIds(blockIds)}
          onQuickAction={handleQuickAction}
        />

        {/* Inline edit slide-over panel */}
        {editingBlockIds && editBlocks.length > 0 && (
          <div className="absolute inset-y-0 right-0 w-96 bg-card border-l border-border shadow-xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm">Edit Slide</h3>
              <Button variant="ghost" size="icon" onClick={() => setEditingBlockIds(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {editBlocks.map(block => (
                <InlineBlockEditor
                  key={block.id}
                  block={block}
                  onSave={(content) => {
                    saveBlock(block.id, content);
                  }}
                />
              ))}
            </div>
            <div className="p-4 border-t border-border">
              <Button
                variant="hero"
                className="w-full"
                onClick={() => setEditingBlockIds(null)}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/** Simple inline editor for a single block */
function InlineBlockEditor({
  block,
  onSave,
}: {
  block: Block;
  onSave: (content: Record<string, unknown>) => void;
}) {
  const [content, setContent] = useState(block.content);

  const handleChange = (key: string, value: unknown) => {
    const next = { ...content, [key]: value };
    setContent(next);
    onSave(next);
  };

  const c = content;

  // Render simple editors based on block type
  if (block.type === "heading" || block.type === "text" || block.type === "callout") {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">
          {block.type}
        </label>
        <Textarea
          value={String(c.text || "")}
          onChange={(e) => handleChange("text", e.target.value)}
          className="bg-muted/30 resize-none"
          rows={3}
        />
      </div>
    );
  }

  if (block.type === "list") {
    const items = Array.isArray(c.items) ? (c.items as string[]) : [];
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase">List</label>
        {items.map((item, i) => (
          <Input
            key={i}
            value={item}
            onChange={(e) => {
              const newItems = [...items];
              newItems[i] = e.target.value;
              handleChange("items", newItems);
            }}
            className="bg-muted/30"
            placeholder={`Item ${i + 1}`}
          />
        ))}
      </div>
    );
  }

  // Fallback: show JSON preview
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase">
        {block.type.replace(/_/g, " ")}
      </label>
      <p className="text-xs text-muted-foreground">
        Visual blocks can be edited in the full editor.
      </p>
    </div>
  );
}
