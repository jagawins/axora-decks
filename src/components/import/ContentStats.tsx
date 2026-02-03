import { useMemo } from "react";
import { FileText, Layers } from "lucide-react";

interface ContentStatsProps {
  content: string;
}

export function ContentStats({ content }: ContentStatsProps) {
  const stats = useMemo(() => {
    const text = content.trim();
    if (!text) return { words: 0, slides: 0 };

    // Word count
    const words = text.split(/\s+/).filter(Boolean).length;

    // Estimate slides: ~80-120 words per slide for executive content
    // Also factor in structure (headings, bullet points, etc.)
    const lineCount = text.split("\n").filter(l => l.trim()).length;
    const hasStructure = /^[-•*#\d.]/m.test(text);
    
    // Base calculation on words
    let slides = Math.ceil(words / 100);
    
    // Adjust for structured content (tends to create more blocks)
    if (hasStructure) {
      slides = Math.max(slides, Math.ceil(lineCount / 4));
    }

    // Minimum 1 slide if there's content
    slides = Math.max(1, Math.min(slides, 20)); // Cap at 20

    return { words, slides };
  }, [content]);

  if (stats.words === 0) return null;

  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <FileText className="h-3.5 w-3.5" />
        <span>{stats.words.toLocaleString()} words</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Layers className="h-3.5 w-3.5" />
        <span>~{stats.slides} slide{stats.slides !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
