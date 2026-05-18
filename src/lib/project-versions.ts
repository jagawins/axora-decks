/**
 * Project version history: full snapshots of a deck's blocks + theme so the
 * user can revert any AI-driven change. Retention is 30 per project (trigger).
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectVersion {
  id: string;
  project_id: string;
  user_id: string;
  label: string;
  snapshot: {
    blocks: Array<{
      id?: string;
      type: string;
      content: Record<string, unknown>;
      order_index: number;
    }>;
    theme?: string;
    title?: string;
  };
  created_at: string;
}

export async function createSnapshot(
  projectId: string,
  userId: string,
  label: string,
  snapshot: ProjectVersion["snapshot"]
): Promise<string | null> {
  const { data, error } = await (supabase as any)
    .from("project_versions")
    .insert({ project_id: projectId, user_id: userId, label, snapshot })
    .select("id")
    .single();
  if (error) {
    console.error("[project-versions] snapshot failed", error);
    return null;
  }
  return (data as { id: string } | null)?.id ?? null;
}

export async function listVersions(projectId: string): Promise<ProjectVersion[]> {
  const { data, error } = await (supabase as any)
    .from("project_versions")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[project-versions] list failed", error);
    return [];
  }
  return (data ?? []) as ProjectVersion[];
}

export async function deleteVersion(versionId: string): Promise<boolean> {
  const { error } = await (supabase as any)
    .from("project_versions")
    .delete()
    .eq("id", versionId);
  if (error) {
    console.error("[project-versions] delete failed", error);
    return false;
  }
  return true;
}

/**
 * Restore a snapshot: snapshots current state first (so restore is itself
 * undoable), then replaces all blocks with the version's blocks.
 */
export async function restoreVersion(
  projectId: string,
  userId: string,
  version: ProjectVersion,
  currentSnapshot: ProjectVersion["snapshot"]
): Promise<boolean> {
  // 1. Snapshot current state with a labeled tag
  await createSnapshot(
    projectId,
    userId,
    `Before restore · ${new Date().toLocaleString()}`,
    currentSnapshot
  );

  // 2. Delete all current blocks
  const { error: delErr } = await supabase
    .from("blocks")
    .delete()
    .eq("project_id", projectId);
  if (delErr) {
    console.error("[project-versions] delete blocks failed", delErr);
    return false;
  }

  // 3. Re-insert snapshot blocks (strip ids, ensure clean content)
  const rows = version.snapshot.blocks.map((b, i) => ({
    project_id: projectId,
    type: b.type as never,
    content: b.content as never,
    order_index: typeof b.order_index === "number" ? b.order_index : i,
  }));

  if (rows.length > 0) {
    const { error: insErr } = await supabase.from("blocks").insert(rows);
    if (insErr) {
      console.error("[project-versions] insert blocks failed", insErr);
      return false;
    }
  }

  // 4. Update project theme if changed
  if (version.snapshot.theme) {
    await supabase
      .from("projects")
      .update({ theme: version.snapshot.theme })
      .eq("id", projectId);
  }

  return true;
}

export function useProjectVersions(projectId: string | undefined) {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const v = await listVersions(projectId);
    setVersions(v);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { versions, loading, refresh };
}
