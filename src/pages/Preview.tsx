import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PreviewDeck from "@/components/PreviewDeck";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ThemeId, DEFAULT_THEME } from "@/lib/themes";

type BlockType = "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout";

interface Block {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  theme: ThemeId;
}

export default function Preview() {
  const { id: projectId } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

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
        .select("id, title, description, theme")
        .eq("id", projectId)
        .maybeSingle();

      if (projectError) throw projectError;
      if (!projectData) {
        navigate("/dashboard");
        return;
      }

      setProject({
        ...projectData,
        theme: (projectData.theme as ThemeId) || DEFAULT_THEME,
      });

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/editor/${projectId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold truncate max-w-[300px]">
              {project?.title || "Untitled"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/editor/${projectId}`)}>
              Back to editor
            </Button>
          </div>
        </div>
      </header>

      {/* Preview Content */}
      <main className="flex-1">
        <PreviewDeck blocks={blocks} title={project?.title} theme={project?.theme} />
      </main>
    </div>
  );
}
