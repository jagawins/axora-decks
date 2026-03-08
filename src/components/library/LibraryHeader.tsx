import { Search, LogOut, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface LibraryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  userName: string | null | undefined;
  onSignOut: () => void;
}

export const LibraryHeader = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  userName,
  onSignOut,
}: LibraryHeaderProps) => {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 gap-3">
      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search decks... (⌘K)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-muted/50 border-transparent focus:border-accent"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
          <Button
            variant="ghost"
            size="icon"
            className={viewMode === "grid" ? "bg-background shadow-sm" : ""}
            onClick={() => onViewModeChange("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={viewMode === "list" ? "bg-background shadow-sm" : ""}
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <span className="text-sm text-muted-foreground hidden sm:block">
          {userName}
        </span>

        <Button variant="ghost" size="icon" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
