import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, X } from "lucide-react";
import { ThemeId, DEFAULT_THEME } from "@/lib/themes";

type BlockType = "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout";
type Block = { id: string; type: BlockType; content: Record<string, unknown>; order_index: number };

function Slide({ block }: { block: Block }) {
  const c = block.content || {};
  
  switch (block.type) {
    case "heading": {
      const level = Number(c.level || 2);
      const Tag = (`h${Math.min(3, Math.max(1, level))}`) as keyof JSX.IntrinsicElements;
      const sizeClass = level === 1 
        ? "text-5xl md:text-6xl" 
        : level === 2 
        ? "text-4xl md:text-5xl" 
        : "text-3xl md:text-4xl";
      return <Tag className={`font-bold text-center ${sizeClass}`}>{String(c.text || "")}</Tag>;
    }
    case "text":
      return <p className="text-xl md:text-2xl text-center leading-relaxed">{String(c.text || "")}</p>;
    case "list": {
      const items = Array.isArray(c.items) ? c.items : [];
      const ordered = !!c.ordered;
      const ListTag = ordered ? "ol" : "ul";
      return (
        <ListTag className={`text-xl space-y-3 ${ordered ? "list-decimal" : "list-disc"} list-inside`}>
          {items.map((it: string, i: number) => (
            <li key={i}>{it}</li>
          ))}
        </ListTag>
      );
    }
    case "callout": {
      const icon = String(c.icon || "info");
      return (
        <div className={`p-8 rounded-xl border-2 text-center ${
          icon === "warning"
            ? "border-yellow-500/50 bg-yellow-500/10"
            : icon === "success"
            ? "border-green-500/50 bg-green-500/10"
            : "border-[var(--deck-accent)]/50 bg-[var(--deck-accent)]/10"
        }`}>
          <p className="text-xl md:text-2xl">{String(c.text || "")}</p>
        </div>
      );
    }
    case "two_col":
      return (
        <div className="grid grid-cols-2 gap-12 w-full">
          <div className="text-lg">{String(c.left || "")}</div>
          <div className="text-lg">{String(c.right || "")}</div>
        </div>
      );
    case "table": {
      const headers = Array.isArray(c.headers) ? c.headers : [];
      const rows = Array.isArray(c.rows) ? c.rows : [];
      return (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {headers.map((h: string, i: number) => (
                  <th key={i} className="border border-[var(--deck-border)] p-3 bg-[var(--deck-muted)]/20 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: string[], ri: number) => (
                <tr key={ri}>
                  {(Array.isArray(row) ? row : []).map((cell: string, ci: number) => (
                    <td key={ci} className="border border-[var(--deck-border)] p-3">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "image": {
      const src = String(c.src || "");
      const alt = String(c.alt || "");
      const caption = String(c.caption || "");
      return (
        <div className="text-center">
          {src ? (
            <img src={src} alt={alt} className="max-h-[50vh] mx-auto rounded-lg" />
          ) : (
            <div className="w-full h-48 bg-[var(--deck-muted)]/20 rounded-lg flex items-center justify-center text-[var(--deck-muted)]">
              No image
            </div>
          )}
          {caption && <p className="mt-4 text-[var(--deck-muted)]">{caption}</p>}
        </div>
      );
    }
    default:
      return <p className="text-[var(--deck-muted)]">Unknown block</p>;
  }
}

export default function Print() {
  const { id: projectId } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Untitled");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const run = async () => {
      if (!user || !projectId) return;

      setLoading(true);
      const { data: projectData, error: pe } = await supabase
        .from("projects")
        .select("id, title, theme")
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
      setBlocks(
        (blocksData || []).map((b) => ({
          id: b.id,
          type: b.type as BlockType,
          content: (b.content || {}) as Record<string, unknown>,
          order_index: b.order_index,
        }))
      );

      setLoading(false);
      // Auto open print dialog after content loads
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

  return (
    <div className={`min-h-screen theme-${theme}`}>
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
            className="slide-page bg-[var(--deck-bg)] text-[var(--deck-fg)] rounded-xl border border-[var(--deck-border)] shadow-xl p-12 flex flex-col items-center justify-center"
          >
            <p className="screen-only text-sm text-[var(--deck-muted)] mb-4">Slide {i + 1}</p>
            <div className="flex-1 flex items-center justify-center w-full">
              <Slide block={b} />
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
            height: 7.5in;
            margin: 0;
            max-width: none;
          }
          .slide-page:last-child {
            page-break-after: avoid;
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
