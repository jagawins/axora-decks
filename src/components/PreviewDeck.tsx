import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeId, DEFAULT_THEME } from "@/lib/themes";

type BlockType = "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout";

interface Block {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
}

interface PreviewDeckProps {
  blocks: Block[];
  title?: string;
  theme?: ThemeId;
}

const PreviewDeck = ({ blocks, title, theme = DEFAULT_THEME }: PreviewDeckProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalSlides = blocks.length;

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, totalSlides]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No slides to display</p>
      </div>
    );
  }

  const currentBlock = blocks[currentSlide];

  return (
    <div className={`flex flex-col h-full theme-${theme} ${isFullscreen ? "bg-background" : ""}`}>
      {/* Controls */}
      <div className="preview-controls flex items-center justify-between p-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Slide {currentSlide + 1} of {totalSlides}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="w-full max-w-4xl aspect-[16/9] bg-[var(--deck-bg)] text-[var(--deck-fg)] border border-[var(--deck-border)] rounded-xl shadow-2xl p-12 flex items-center justify-center">
          <SlideContent block={currentBlock} />
        </div>
      </div>

      {/* Slide Thumbnails */}
      <div className="preview-thumbnails p-4 border-t border-border bg-card/50 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {blocks.map((block, index) => (
            <button
              key={block.id}
              onClick={() => setCurrentSlide(index)}
              className={`flex-shrink-0 w-20 h-12 rounded border-2 transition-all ${
                index === currentSlide
                  ? "border-[var(--deck-accent)] bg-[var(--deck-accent)]/20"
                  : "border-border hover:border-[var(--deck-accent)]/50"
              }`}
            >
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Slide Content Renderer
const SlideContent = ({ block }: { block: Block }) => {
  const content = block.content;

  switch (block.type) {
    case "heading":
      const level = (content.level as number) || 2;
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag
          className={`font-bold text-center ${
            level === 1
              ? "text-5xl md:text-6xl"
              : level === 2
              ? "text-4xl md:text-5xl"
              : "text-3xl md:text-4xl"
          }`}
        >
          {String(content.text || "")}
        </HeadingTag>
      );

    case "text":
      return (
        <p className="text-xl md:text-2xl text-center leading-relaxed max-w-3xl">
          {String(content.text || "")}
        </p>
      );

    case "list":
      const items = (content.items as string[]) || [];
      const ordered = content.ordered as boolean;
      const ListTag = ordered ? "ol" : "ul";
      return (
        <ListTag className={`text-xl space-y-4 ${ordered ? "list-decimal" : "list-disc"} list-inside`}>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      );

    case "callout":
      const icon = content.icon as string;
      return (
        <div
          className={`p-8 rounded-xl border-2 text-center ${
            icon === "warning"
              ? "border-yellow-500/50 bg-yellow-500/10"
              : icon === "success"
              ? "border-green-500/50 bg-green-500/10"
              : "border-[var(--deck-accent)]/50 bg-[var(--deck-accent)]/10"
          }`}
        >
          <p className="text-xl md:text-2xl">{String(content.text || "")}</p>
        </div>
      );

    case "two_col":
      return (
        <div className="grid grid-cols-2 gap-12 w-full">
          <div className="text-lg">{String(content.left || "")}</div>
          <div className="text-lg">{String(content.right || "")}</div>
        </div>
      );

    case "table":
      const headers = (content.headers as string[]) || [];
      const rows = (content.rows as string[][]) || [];
      return (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="border border-[var(--deck-border)] p-3 bg-[var(--deck-muted)]/20 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-[var(--deck-border)] p-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "image":
      const src = content.src as string;
      const alt = content.alt as string;
      const caption = content.caption as string;
      return (
        <div className="text-center">
          {src ? (
            <img src={src} alt={alt || ""} className="max-h-[60vh] mx-auto rounded-lg" />
          ) : (
            <div className="w-full h-48 bg-[var(--deck-muted)]/20 rounded-lg flex items-center justify-center text-[var(--deck-muted)]">
              No image
            </div>
          )}
          {caption && <p className="mt-4 text-[var(--deck-muted)]">{caption}</p>}
        </div>
      );

    default:
      return <p className="text-muted-foreground">Unknown block type</p>;
  }
};

export default PreviewDeck;
