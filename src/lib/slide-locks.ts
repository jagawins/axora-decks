/**
 * Slide locks: protect specific slides from AI regeneration.
 * Slide index is derived from the order in which blocks chunk into slides
 * via chunkTemplateBlocks. For simplicity in v1 we treat slide_index as
 * "block order_index" of the first block in that slide group.
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SlideLock {
  id: string;
  project_id: string;
  slide_index: number;
  locked_by: string;
  created_at: string;
}

export async function fetchSlideLocks(projectId: string): Promise<number[]> {
  const { data, error } = await (supabase as any)
    .from("slide_locks")
    .select("slide_index")
    .eq("project_id", projectId);
  if (error) {
    console.warn("[slide-locks] fetch failed", error);
    return [];
  }
  return (data ?? []).map((r: { slide_index: number }) => r.slide_index);
}

export async function toggleSlideLock(
  projectId: string,
  slideIndex: number,
  currentlyLocked: boolean,
  userId: string
): Promise<boolean> {
  if (currentlyLocked) {
    const { error } = await (supabase as any)
      .from("slide_locks")
      .delete()
      .eq("project_id", projectId)
      .eq("slide_index", slideIndex);
    if (error) {
      console.error("[slide-locks] unlock failed", error);
      return false;
    }
    return true;
  }
  const { error } = await (supabase as any)
    .from("slide_locks")
    .insert({ project_id: projectId, slide_index: slideIndex, locked_by: userId });
  if (error) {
    console.error("[slide-locks] lock failed", error);
    return false;
  }
  return true;
}

export function useSlideLocks(projectId: string | undefined) {
  const [locked, setLocked] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const indexes = await fetchSlideLocks(projectId);
    setLocked(new Set(indexes));
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { locked, loading, refresh, setLocked };
}
