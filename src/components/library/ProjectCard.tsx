import { useState, useEffect } from "react";
import { MoreHorizontal, Pencil, Copy, FolderInput, Star, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { MiniSlidePreview } from "@/components/MiniSlidePreview";

interface ProjectCardProps {
  id: string;
  title: string;
  coverImageUrl: string | null;
  lastViewedAt: string | null;
  updatedAt: string;
  isFavorite: boolean;
  viewMode: "grid" | "list";
  onOpen: (id: string) => void;
  onRename: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveToFolder: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDelete: (id: string, title: string) => void;
}

const formatRelativeTime = (dateString: string | null) => {
  if (!dateString) return "Never viewed";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Generate a placeholder gradient based on title
const getPlaceholderGradient = (title: string) => {
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    "from-violet-600/20 to-indigo-600/20",
    "from-cyan-600/20 to-blue-600/20",
    "from-emerald-600/20 to-teal-600/20",
    "from-orange-600/20 to-red-600/20",
    "from-pink-600/20 to-rose-600/20",
    "from-amber-600/20 to-yellow-600/20",
  ];
  return gradients[hash % gradients.length];
};

interface MiniBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order_index: number;
}

export const ProjectCard = ({
  id,
  title,
  coverImageUrl,
  lastViewedAt,
  updatedAt,
  isFavorite,
  viewMode,
  onOpen,
  onRename,
  onDuplicate,
  onMoveToFolder,
  onToggleFavorite,
  onDelete,
}: ProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [blocks, setBlocks] = useState<MiniBlock[]>([]);
  const [blocksLoaded, setBlocksLoaded] = useState(false);

  // Lazy-load blocks for preview when card mounts
  useEffect(() => {
    let cancelled = false;
    const loadBlocks = async () => {
      const { data } = await supabase
        .from('blocks')
        .select('id, type, content, order_index')
        .eq('project_id', id)
        .order('order_index')
        .limit(5);
      if (!cancelled && data) {
        setBlocks(data.map(b => ({
          id: b.id,
          type: b.type,
          content: (b.content || {}) as Record<string, unknown>,
          order_index: b.order_index,
        })));
        setBlocksLoaded(true);
      }
    };
    loadBlocks();
    return () => { cancelled = true; };
  }, [id]);

  const hasRealPreview = blocksLoaded && blocks.length > 0;

  const renderThumbnail = (aspectClass: string) => {
    if (coverImageUrl) {
      return (
        <div className={cn(aspectClass, "w-full overflow-hidden")}>
          <img src={coverImageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      );
    }
    if (hasRealPreview) {
      return (
        <MiniSlidePreview
          blocks={blocks}
          className={cn(aspectClass, "border-0 rounded-none")}
          scale={viewMode === "list" ? 0.067 : 0.25}
        />
      );
    }
    return (
      <div className={cn(
        aspectClass,
        "w-full bg-gradient-to-br flex items-center justify-center",
        getPlaceholderGradient(title)
      )}>
        <span className={cn(
          "font-bold text-foreground/20",
          viewMode === "list" ? "text-lg" : "text-4xl"
        )}>
          {title.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  if (viewMode === "list") {
    return (
      <div
        className="group flex items-center gap-4 p-4 rounded-lg border border-border bg-card/50 hover:border-accent/30 transition-all cursor-pointer"
        onClick={() => onOpen(id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail */}
        <div className="w-16 h-12 rounded-md overflow-hidden flex-shrink-0">
          {renderThumbnail("w-16 h-12")}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(lastViewedAt || updatedAt)}
          </p>
        </div>

        {isFavorite && (
          <Star className="h-4 w-4 text-accent fill-accent flex-shrink-0" />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className={cn("flex-shrink-0 transition-opacity", isHovered ? "opacity-100" : "opacity-0")}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onRename(id)}><Pencil className="h-4 w-4 mr-2" />Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(id)}><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = `/editor/${id}?share=true`}><Share2 className="h-4 w-4 mr-2" />Share</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMoveToFolder(id)}><FolderInput className="h-4 w-4 mr-2" />Move to folder</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleFavorite(id, !isFavorite)}>
              <Star className={cn("h-4 w-4 mr-2", isFavorite && "fill-current")} />
              {isFavorite ? "Remove from favorites" : "Add to favorites"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(id, title)}>
              <Trash2 className="h-4 w-4 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className="group relative rounded-xl border border-border bg-card/50 overflow-hidden hover:border-accent/30 transition-all cursor-pointer"
      onClick={() => onOpen(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover / Preview */}
      {renderThumbnail("aspect-[16/10]")}

      {/* Favorite badge */}
      {isFavorite && (
        <div className="absolute top-3 right-3">
          <Star className="h-4 w-4 text-accent fill-accent" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium truncate mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(lastViewedAt || updatedAt)}
        </p>
      </div>

      {/* Hover actions */}
      <div className={cn("absolute top-3 left-3 transition-opacity", isHovered ? "opacity-100" : "opacity-0")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="secondary" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onRename(id)}><Pencil className="h-4 w-4 mr-2" />Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(id)}><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = `/editor/${id}?share=true`}><Share2 className="h-4 w-4 mr-2" />Share</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMoveToFolder(id)}><FolderInput className="h-4 w-4 mr-2" />Move to folder</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleFavorite(id, !isFavorite)}>
              <Star className={cn("h-4 w-4 mr-2", isFavorite && "fill-current")} />
              {isFavorite ? "Remove from favorites" : "Add to favorites"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(id, title)}>
              <Trash2 className="h-4 w-4 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
