/**
 * Presenter View – dual-pane layout with current slide, next preview, notes, and timer
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { computeSlides, type SlideBlock, type ComputedSlide } from "@/lib/slide-engine";
import { resolveBrandStyles, type BrandKit } from "@/lib/brand";
import { VisualBlockRenderer } from "@/components/blocks/VisualBlockRenderer";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";
import { ThemeId, DEFAULT_THEME } from "@/lib/themes";
import type { BlockType } from "@/lib/blocks";

interface Block {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
}

export default function Present() {
  const { id: projectId } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Untitled");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const run = async () => {
      if (!user || !projectId) return;
      setLoading(true);

      const { data: p } = await supabase
        .from("projects")
        .select("id, title, theme, brand_kit, notes")
        .eq("id", projectId)
        .maybeSingle();

      if (!p) {
        navigate("/dashboard");
        return;
      }

      setTitle(p.title || "Untitled");
      setTheme((p.theme as ThemeId) || DEFAULT_THEME);
      setBrandKit((p.brand_kit as BrandKit) || null);
      setNotes((p.notes as Record<string, string>) || {});

      const { data: blocksData } = await supabase
        .from("blocks")
        .select("id, type, content, order_index")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });

      setBlocks(
        (blocksData || []).map((b) => ({
          id: b.id,
          type: b.type as BlockType,
          content: (b.content || {}) as Record<string, unknown>,
          order_index: b.order_index,
        }))
      );
      setLoading(false);
    };
    run();
  }, [user, projectId, navigate]);

  const slides = useMemo(() => computeSlides(blocks), [blocks]);
  const brandStyles = useMemo(() => resolveBrandStyles(brandKit), [brandKit]);
  const totalSlides = slides.length;

  const goTo = useCallback(
    (idx: number) => setCurrentSlide(Math.max(0, Math.min(idx, totalSlides - 1))),
    [totalSlides]
  );

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goTo(currentSlide + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(currentSlide - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentSlide, goTo]);

  // BroadcastChannel sync
  useEffect(() => {
    if (!projectId) return;
    const channel = new BroadcastChannel(`axiva-present-${projectId}`);
    channel.postMessage({ slide: currentSlide });
    return () => channel.close();
  }, [currentSlide, projectId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const current = slides[currentSlide];
  const nextSlideData = slides[currentSlide + 1] || null;
  const slideNotes = notes[String(currentSlide)] || "";

  return (
    <div className={`min-h-screen flex flex-col theme-${theme} bg-[var(--deck-bg)]`} style={brandStyles}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-[var(--deck-border)] bg-[var(--deck-bg)]/90">
        <h1 className="font-semibold text-sm text-[var(--deck-fg)] truncate">{title}</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[var(--deck-muted)]">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-mono">{formatTime(elapsed)}</span>
          </div>
          <span className="text-sm text-[var(--deck-muted)]">
            {currentSlide + 1} / {totalSlides}
          </span>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/editor/${projectId}`)}>
            <X className="h-4 w-4 mr-1" /> Close
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Current slide (large) */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl aspect-[16/9] bg-[var(--deck-bg)] text-[var(--deck-fg)] border border-[var(--deck-border)] rounded-xl shadow-xl p-8 flex items-center justify-center overflow-auto">
            {current && (
              <div className="w-full">
                {current.blocks.map((block) => (
                  <PresenterBlock key={block.id} block={block} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel: next slide + notes */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          {/* Next slide preview */}
          <div className="border border-[var(--deck-border)] rounded-lg overflow-hidden bg-[var(--deck-bg)]">
            <div className="px-3 py-1.5 border-b border-[var(--deck-border)]">
              <span className="text-xs font-medium text-[var(--deck-muted)]">Next</span>
            </div>
            <div className="aspect-[16/9] p-4 flex items-center justify-center">
              {nextSlideData ? (
                <div className="w-full transform scale-75 origin-center">
                  {nextSlideData.blocks.map((block) => (
                    <PresenterBlock key={block.id} block={block} />
                  ))}
                </div>
              ) : (
                <span className="text-xs text-[var(--deck-muted)]">End of deck</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="flex-1 border border-[var(--deck-border)] rounded-lg overflow-hidden bg-[var(--deck-bg)]">
            <div className="px-3 py-1.5 border-b border-[var(--deck-border)]">
              <span className="text-xs font-medium text-[var(--deck-muted)]">Notes</span>
            </div>
            <div className="p-3 text-sm text-[var(--deck-fg)] overflow-y-auto">
              {slideNotes || <span className="text-[var(--deck-muted)] italic">No notes for this slide</span>}
            </div>
          </div>

          {/* Nav */}
          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" onClick={() => goTo(currentSlide - 1)} disabled={currentSlide === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button className="flex-1" variant="outline" onClick={() => goTo(currentSlide + 1)} disabled={currentSlide === totalSlides - 1}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PresenterBlock({ block }: { block: SlideBlock }) {
  const isBasic = ["heading", "text", "list", "callout", "two_col", "table", "image"].includes(block.type);

  if (!isBasic) {
    return (
      <VisualBlockRenderer
        block={{ type: block.type as any, content: block.content as any } as any}
        readOnly
      />
    );
  }

  const c = block.content || {};
  switch (block.type) {
    case "heading":
      return <div className="text-3xl font-bold text-center">{String(c.text || "")}</div>;
    case "text":
      return <p className="text-lg text-center">{String(c.text || "")}</p>;
    default:
      return <p className="text-sm text-[var(--deck-muted)]">{String(c.text || block.type)}</p>;
  }
}
