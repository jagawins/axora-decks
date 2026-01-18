import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PreviewDeck from "@/components/PreviewDeck";
import { Loader2, AlertCircle } from "lucide-react";
import axoraLogo from "@/assets/axora-logo.png";
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

export default function PublicPreview() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    const fetchSharedProject = async () => {
      if (!token) {
        setError("No share token provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("get-shared-project", {
          body: { token },
        });

        if (fnError) {
          throw new Error(fnError.message || "Failed to load shared project");
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        if (!data?.project) {
          throw new Error("Shared project not found");
        }

        setProject({
          ...data.project,
          theme: (data.project.theme as ThemeId) || DEFAULT_THEME,
        });
        setBlocks(data.blocks || []);
      } catch (e) {
        console.error("Error loading shared project:", e);
        setError(e instanceof Error ? e.message : "Failed to load presentation");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedProject();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-muted-foreground">Loading presentation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold">Unable to load presentation</h1>
        <p className="text-muted-foreground">{error}</p>
        <a href="/" className="text-accent hover:underline mt-4">
          Go to homepage
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <img src={axoraLogo} alt="Axora" className="h-6 w-auto" />
            </a>
            <span className="text-muted-foreground">|</span>
            <h1 className="font-semibold truncate max-w-[300px]">
              {project?.title || "Untitled"}
            </h1>
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
