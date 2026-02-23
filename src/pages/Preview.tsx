import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DeckPlayer from "@/components/DeckPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ThemeId, DEFAULT_THEME } from "@/lib/themes";
import { BrandKit } from "@/lib/brand";
import type { BlockType } from "@/lib/blocks";

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

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Untitled");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const initialSlide = parseInt(searchParams.get("slide") || "1", 10) - 1;

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

      <main className="flex-1">
        <DeckPlayer
          blocks={blocks}
          title={title}
          theme={theme}
          brandKit={brandKit}
          initialSlide={Math.max(0, initialSlide)}
        />
      </main>
    </div>
  );
}
