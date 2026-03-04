import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, X } from "lucide-react";
import { ThemeId, DEFAULT_THEME } from "@/lib/themes";
import { resolveBrandStyles, type BrandKit } from "@/lib/brand";
import { VisualBlockRenderer } from "@/components/blocks/VisualBlockRenderer";
import type { BlockType } from "@/lib/blocks";

type Block = { id: string; type: BlockType; content: Record<string, unknown>; order_index: number };

export default function Print() {
  const { id: projectId } = useParams<{ id: string }>();
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
    const run = async () => {
      if (!user || !projectId) return;

      setLoading(true);
      const { data: projectData, error: pe } = await supabase
        .from("projects")
        .select("id, title, theme, brand_kit")
        .eq("id", projectId)
        .maybeSingle();

      if (pe || !projectData) {
        navigate("/dashboard");
        return;
      }

      const { data: blocksData, error: be } = await supabase
        .from("blocks")
        .select("id, type, content, order_index")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });

      if (be) {
        navigate("/dashboard");
        return;
      }

      setTitle(projectData.title || "Untitled");
      setTheme((projectData.theme as ThemeId) || DEFAULT_THEME);
      setBrandKit((projectData.brand_kit as BrandKit) || null);
      setBlocks(
        (blocksData || []).map((b) => ({
          id: b.id,
          type: b.type as BlockType,
          content: (b.content || {}) as Record<string, unknown>,
          order_index: b.order_index,
        }))
      );

      setLoading(false);
      setTimeout(() => window.print(), 300);
    };

    run();
  }, [user, projectId, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="ml-3 text-muted-foreground">Preparing PDF…</p>
      </div>
    );
  }

  const brandStyles = resolveBrandStyles(brandKit);

  return (
    <div className={`min-h-screen theme-${theme}`} style={brandStyles}>
      {/* Screen-only header */}
      <header className="screen-only fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="font-semibold truncate">{title}</h1>
          <div className="flex items-center gap-2">
            <Button variant="hero" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print to PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </header>

      {/* Slides container */}
      <div className="pt-20 screen-only"></div>
      <div className="print-slides space-y-8 p-8">
        {blocks.map((b, i) => (
          <div
            key={b.id}
            className="slide-page bg-[var(--deck-bg)] text-[var(--deck-fg)] rounded-xl border border-[var(--deck-border)] shadow-xl overflow-hidden flex flex-col"
          >
            <p className="screen-only text-sm text-[var(--deck-muted)] px-6 pt-4 pb-0">Slide {i + 1}</p>
            <div className="flex-1 flex items-center justify-center w-full p-8 overflow-hidden">
              <div className="slide-content-wrapper w-full h-full flex items-center justify-center">
                <VisualBlockRenderer
                  block={{ type: b.type as any, content: b.content as any } as any}
                  readOnly
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media screen {
          .slide-page { 
            aspect-ratio: 16 / 9; 
            max-width: 900px;
            margin: 0 auto;
          }
          .screen-only { display: block; }
          .slide-content-wrapper {
            container-type: inline-size;
          }
        }
        @media print {
          .screen-only { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-slides { padding: 0 !important; }
          .slide-page {
            page-break-after: always;
            break-after: page;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            aspect-ratio: auto;
            width: 100%;
            height: 7.5in;
            margin: 0;
            padding: 0.4in;
            max-width: none;
            overflow: hidden;
          }
          .slide-page:last-child {
            page-break-after: avoid;
          }
          .slide-content-wrapper {
            max-height: 100%;
            overflow: hidden;
          }
          /* Scale down content that overflows the slide */
          .slide-content-wrapper > * {
            max-width: 100%;
            overflow-wrap: break-word;
            word-wrap: break-word;
          }
          /* Tables should shrink to fit */
          table {
            font-size: 0.85em;
            width: 100% !important;
            table-layout: fixed;
          }
          /* Prevent large text from overflowing */
          h1, h2, h3, h4 {
            overflow-wrap: break-word;
            word-wrap: break-word;
            hyphens: auto;
          }
          @page {
            size: letter landscape;
            margin: 0.35in;
          }
        }
      `}</style>
    </div>
  );
}
