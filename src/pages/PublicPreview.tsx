import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { invokeFunction } from "@/lib/supabase-function-client";
import DeckPlayer from "@/components/DeckPlayer";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import axivaWordmark from "@/assets/axiva-wordmark-dark.svg";
import { ThemeId, DEFAULT_THEME } from "@/lib/themes";
import { BrandKit } from "@/lib/brand";
import type { BlockType } from "@/lib/blocks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [needsPasscode, setNeedsPasscode] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  const fetchSharedProject = async (passcodeValue?: string) => {
    if (!token) {
      setError("No share token provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setPasscodeError(false);

    try {
      const body: Record<string, unknown> = { token };
      if (passcodeValue) body.passcode = passcodeValue;

      const response = await invokeFunction<{
        project?: Project;
        blocks?: Block[];
        error?: string;
        requires_passcode?: boolean;
      }>("get-shared-project", body);

      // Handle passcode required
      if (response.status === 403 || response.data?.requires_passcode) {
        setNeedsPasscode(true);
        if (passcodeValue) setPasscodeError(true);
        setLoading(false);
        return;
      }

      if (response.error) throw new Error(response.error);
      if (!response.data?.project) throw new Error("Shared project not found");

      const data = response.data;
      setProject({
        ...data.project!,
        theme: (data.project!.theme as ThemeId) || DEFAULT_THEME,
      });
      setBlocks(data.blocks || []);
      setNeedsPasscode(false);
    } catch (e) {
      console.error("Error loading shared project:", e);
      setError(e instanceof Error ? e.message : "Failed to load presentation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedProject();
  }, [token]);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim()) {
      fetchSharedProject(passcode.trim());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-muted-foreground">Loading presentation...</p>
      </div>
    );
  }

  // Passcode gate
  if (needsPasscode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="flex flex-col items-center gap-4 max-w-sm w-full px-4">
          <div className="p-4 rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold">This presentation is protected</h1>
          <p className="text-muted-foreground text-center text-sm">
            Enter the passcode to view this presentation.
          </p>
          <form onSubmit={handlePasscodeSubmit} className="w-full space-y-3">
            <Input
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setPasscodeError(false);
              }}
              className={passcodeError ? "border-destructive" : ""}
              autoFocus
            />
            {passcodeError && (
              <p className="text-sm text-destructive">Incorrect passcode. Please try again.</p>
            )}
            <Button type="submit" className="w-full" disabled={!passcode.trim()}>
              View Presentation
            </Button>
          </form>
          <a href="/" className="text-sm text-muted-foreground hover:underline mt-2">
            Go to homepage
          </a>
        </div>
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
              <img src={axivaWordmark} alt="AXIVA" className="h-5 w-auto" />
            </a>
            <span className="text-muted-foreground">|</span>
            <h1 className="font-semibold truncate max-w-[300px]">
              {project?.title || "Untitled"}
            </h1>
          </div>
          <a
            href="https://axiva.ai/?ref=shared-deck"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-accent transition-colors"
          >
            Create your own deck →
          </a>
        </div>
      </header>

      <main className="flex-1 relative">
        <DeckPlayer
          blocks={blocks}
          title={project?.title}
          theme={project?.theme}
          brandKit={project?.brand_kit}
          trackViews
          projectId={project?.id}
        />

        {/* "Made with AXIVA" watermark — shown on all shared decks */}
        <a
          href="https://axiva.ai/?ref=watermark"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-card/90 backdrop-blur-md border border-border/60 shadow-lg hover:shadow-xl hover:border-accent/40 transition-all duration-300 group"
        >
          <svg width="16" height="16" viewBox="0 0 520 140" xmlns="http://www.w3.org/2000/svg" className="opacity-70 group-hover:opacity-100 transition-opacity">
            <text x="10" y="110" fontSize="120" fill="currentColor" fontWeight="700" fontFamily="Inter,Arial,sans-serif" letterSpacing="6">A</text>
          </svg>
          <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Made with <span className="font-bold text-foreground group-hover:text-accent transition-colors">AXIVA</span>
          </span>
        </a>
      </main>
    </div>
  );
}
