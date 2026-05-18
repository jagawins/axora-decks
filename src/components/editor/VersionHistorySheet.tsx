/**
 * VersionHistorySheet — list, preview, restore, delete deck versions.
 */
import { useState } from "react";
import { History, Loader2, RotateCcw, Trash2, Save } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useProjectVersions,
  createSnapshot,
  deleteVersion,
  restoreVersion,
  type ProjectVersion,
} from "@/lib/project-versions";
import { useToast } from "@/hooks/use-toast";

interface VersionHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  userId: string;
  currentSnapshot: ProjectVersion["snapshot"];
  onRestored?: () => void;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function VersionHistorySheet({
  open,
  onOpenChange,
  projectId,
  userId,
  currentSnapshot,
  onRestored,
}: VersionHistorySheetProps) {
  const { versions, loading, refresh } = useProjectVersions(open ? projectId : undefined);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<ProjectVersion | null>(null);
  const { toast } = useToast();

  const handleManualSave = async () => {
    setSaving(true);
    const id = await createSnapshot(
      projectId,
      userId,
      `Manual save · ${new Date().toLocaleString()}`,
      currentSnapshot
    );
    setSaving(false);
    if (id) {
      toast({ title: "Version saved", description: "You can restore this state anytime." });
      void refresh();
    } else {
      toast({ title: "Couldn't save version", variant: "destructive" });
    }
  };

  const handleRestore = async (v: ProjectVersion) => {
    setRestoring(v.id);
    const ok = await restoreVersion(projectId, userId, v, currentSnapshot);
    setRestoring(null);
    setConfirmRestore(null);
    if (ok) {
      toast({ title: "Version restored", description: v.label });
      onOpenChange(false);
      onRestored?.();
    } else {
      toast({ title: "Restore failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteVersion(id);
    if (ok) {
      void refresh();
    } else {
      toast({ title: "Couldn't delete version", variant: "destructive" });
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Version history
            </SheetTitle>
            <SheetDescription>
              Every AI regeneration is snapshotted. Last 30 versions kept.
            </SheetDescription>
            <div className="pt-2">
              <Button onClick={handleManualSave} disabled={saving} size="sm" className="w-full gap-2">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save current version
              </Button>
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <div className="px-6 py-4 space-y-2">
              {loading && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
                </div>
              )}
              {!loading && versions.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No versions yet. They appear here automatically when you regenerate.
                </div>
              )}
              {versions.map((v) => {
                const slideCount = v.snapshot.blocks?.length ?? 0;
                return (
                  <div
                    key={v.id}
                    className="rounded-lg border border-border p-3 hover:border-foreground/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{v.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {relativeTime(v.created_at)} · {slideCount} {slideCount === 1 ? "block" : "blocks"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs gap-1.5 flex-1"
                        onClick={() => setConfirmRestore(v)}
                        disabled={restoring !== null}
                      >
                        {restoring === v.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3 w-3" />
                        )}
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(v.id)}
                        aria-label="Delete version"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmRestore} onOpenChange={(o) => !o && setConfirmRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this version?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current deck will be snapshotted first, then replaced with{" "}
              <span className="font-medium text-foreground">{confirmRestore?.label}</span>. You can
              undo by restoring the auto-snapshot.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmRestore && handleRestore(confirmRestore)}>
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
