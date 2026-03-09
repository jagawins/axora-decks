import { useEffect, useReducer, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { outlineReducer } from "./outlineReducer";
import { invokeFunction } from "@/lib/supabase-function-client";
import { useToast } from "@/hooks/use-toast";
import type {
  AlignmentData,
  ResearchBrief,
  OutlineSlide,
} from "@/types/research-mode";

interface OutlineStepProps {
  alignment: AlignmentData;
  brief: ResearchBrief;
  outline: OutlineSlide[];
  onOutlineChange: (slides: OutlineSlide[]) => void;
  onNext: () => void;
  onBack: () => void;
}

// ─── Sortable Slide Card ────────────────────────────────────────────
function SortableSlideCard({
  slide,
  index,
  dispatch,
  total,
}: {
  slide: OutlineSlide;
  index: number;
  dispatch: React.Dispatch<any>;
  total: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/50 group"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Slide number */}
      <span className="mt-1 text-xs font-bold text-accent min-w-[24px]">
        {index + 1}
      </span>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <Input
          value={slide.title}
          onChange={(e) =>
            dispatch({
              type: "EDIT_TITLE",
              id: slide.id,
              title: e.target.value,
            })
          }
          className="font-medium bg-transparent border-none px-0 h-auto text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Slide title"
        />
        {slide.keyPoints.map((point, pi) => (
          <Input
            key={pi}
            value={point}
            onChange={(e) =>
              dispatch({
                type: "EDIT_POINT",
                id: slide.id,
                pointIndex: pi,
                value: e.target.value,
              })
            }
            className="text-sm bg-transparent border-none px-0 h-auto text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder={`Key point ${pi + 1}`}
          />
        ))}
        {slide.dataPoint && (
          <p className="text-xs text-accent/80">📊 {slide.dataPoint}</p>
        )}
      </div>

      {/* Delete */}
      {total > 1 && (
        <button
          type="button"
          onClick={() => dispatch({ type: "DELETE", id: slide.id })}
          className="mt-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function OutlineStep({
  alignment,
  brief,
  outline,
  onOutlineChange,
  onNext,
  onBack,
}: OutlineStepProps) {
  const { toast } = useToast();
  const [slides, dispatch] = useReducer(outlineReducer, outline);
  const [loading, setLoading] = useState(outline.length === 0);

  // Sync reducer → parent
  useEffect(() => {
    onOutlineChange(slides);
  }, [slides, onOutlineChange]);

  // Generate outline on mount if empty
  useEffect(() => {
    if (outline.length > 0) return;

    let cancelled = false;

    async function generateOutline() {
      setLoading(true);

      // Build enhanced prompt with research context
      const researchContext = brief.findings
        .map(
          (f) =>
            `- ${f.title}: ${f.detail}${f.data_points.length ? ` (${f.data_points.join(", ")})` : ""}`
        )
        .join("\n");

      const enhancedPrompt = `${alignment.goal}

AUDIENCE: ${alignment.audience}
DESIRED OUTCOME: ${alignment.outcome}
${alignment.mustIncludeFacts ? `MUST-INCLUDE: ${alignment.mustIncludeFacts}` : ""}

RESEARCH FINDINGS:
${researchContext}

${brief.conflicts.length > 0 ? `CONFLICTING VIEWPOINTS:\n${brief.conflicts.map((c) => `- ${c.topic}: ${c.positions.join(" vs ")}`).join("\n")}` : ""}`;

      const res = await invokeFunction<{
        outline: {
          title: string;
          sections: Array<{ heading: string; points: string[] }>;
        };
      }>("generate-outline", {
        topic: alignment.goal,
        prompt: enhancedPrompt,
        tone: "executive",
        cardsCount: 10,
      });

      if (cancelled) return;

      if (res.error || !res.data?.outline?.sections) {
        toast({
          title: "Outline generation failed",
          description: res.error || "Please try again",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Map sections → OutlineSlide[]
      const generated: OutlineSlide[] = res.data.outline.sections.map(
        (section) => {
          // Try to match a research data point to this section
          const matchedFinding = brief.findings.find((f) =>
            section.heading
              .toLowerCase()
              .includes(f.title.toLowerCase().split(" ")[0])
          );

          return {
            id: crypto.randomUUID(),
            title: section.heading,
            keyPoints: section.points.slice(0, 3),
            dataPoint: matchedFinding?.data_points[0],
          };
        }
      );

      dispatch({ type: "SET", slides: generated });
      setLoading(false);
    }

    generateOutline();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      dispatch({
        type: "REORDER",
        activeId: String(active.id),
        overId: String(over.id),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Building your outline…
          </h3>
          <p className="text-sm text-muted-foreground">
            Creating a slide-by-slide plan from research
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Slide Outline
        </h2>
        <p className="text-sm text-muted-foreground">
          Drag to reorder, edit titles and points, add or remove slides.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={slides.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {slides.map((slide, i) => (
              <SortableSlideCard
                key={slide.id}
                slide={slide}
                index={i}
                dispatch={dispatch}
                total={slides.length}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add slide */}
      <button
        type="button"
        onClick={() => dispatch({ type: "ADD" })}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add slide
      </button>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button
          variant="hero"
          size="lg"
          className="flex-1"
          onClick={onNext}
          disabled={slides.length === 0}
        >
          Generate Full Deck
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
