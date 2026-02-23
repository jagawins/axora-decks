import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { invokeFunction } from "@/lib/supabase-function-client";
import DeckPlayer from "@/components/DeckPlayer";
import { Loader2, AlertCircle } from "lucide-react";
import axoraWordmark from "@/assets/axora-wordmark-dark.svg";
import { ThemeId, DEFAULT_THEME } from "@/lib/themes";
import { BrandKit } from "@/lib/brand";
import type { BlockType } from "@/lib/blocks";

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
  brand_kit?: BrandKit | null;
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
        const response = await invokeFunction<{
          project?: Project;
          blocks?: Block[];
          error?: string;
        }>("get-shared-project", { token });

        if (response.error) throw new Error(response.error);
        if (!response.data?.project) throw new Error("Shared project not found");

        const data = response.data;
        setProject({
          ...data.project!,
          theme: (data.project!.theme as ThemeId) || DEFAULT_THEME,
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
        <a href="/" className="text-accent hover:underline mt-4">Go to homepage</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center">
              <img src={axoraWordmark} alt="AXORA" className="h-5 w-auto" />
            </a>
            <span className="text-muted-foreground">|</span>
            <h1 className="font-semibold truncate max-w-[300px]">
              {project?.title || "Untitled"}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <DeckPlayer
          blocks={blocks}
          title={project?.title}
          theme={project?.theme}
          brandKit={project?.brand_kit}
        />
      </main>
    </div>
  );
}
