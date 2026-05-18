/**
 * SlideLocksSheet — manage which slides are protected from AI changes.
 * Slide index = block order_index of the first block in the slide group.
 * In v1, we simplify: each block IS a slide (one-to-one). User locks by index.
 */
import { useEffect, useState } from "react";
import { Lock, Unlock, Loader2, Shield } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSlideLocks, toggleSlideLock } from "@/lib/slide-locks";

interface SlideLocksSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  userId: string;
  slides: Array<{ orderIndex: number; title: string; type: string }>;
}

export function SlideLocksSheet({
  open,
  onOpenChange,
  projectId,
  userId,
  slides,
}: SlideLocksSheetProps) {
  const { locked, refresh } = useSlideLocks(open ? projectId : undefined);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const handleToggle = async (index: number) => {
    setBusy(index);
    const isLocked = locked.has(index);
    await toggleSlideLock(projectId, index, isLocked, userId);
    await refresh();
    setBusy(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Locked slides
          </SheetTitle>
          <SheetDescription>
            Locked slides are preserved when you regenerate, Quick Polish, or Make it Visual.
            {locked.size > 0 && (
              <span className="block mt-1 font-medium text-foreground">
                {locked.size} {locked.size === 1 ? "slide" : "slides"} locked
              </span>
            )}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-1.5">
            {slides.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                Add some slides first.
              </div>
            )}
            {slides.map((s) => {
              const isLocked = locked.has(s.orderIndex);
              return (
                <div
                  key={s.orderIndex}
                  className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors ${
                    isLocked ? "border-foreground/40 bg-muted/50" : "border-border"
                  }`}
                >
                  <div className="w-6 text-xs text-muted-foreground tabular-nums text-center">
                    {s.orderIndex + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{s.title || s.type.replace(/_/g, " ")}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={isLocked ? "default" : "outline"}
                    className="h-7 px-2 gap-1.5 text-xs"
                    onClick={() => handleToggle(s.orderIndex)}
                    disabled={busy !== null}
                    aria-label={isLocked ? "Unlock slide" : "Lock slide"}
                  >
                    {busy === s.orderIndex ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isLocked ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      <Unlock className="h-3 w-3" />
                    )}
                    {isLocked ? "Locked" : "Lock"}
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
