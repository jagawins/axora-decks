import { cn } from "@/lib/utils";

export type LibraryFilter = "all" | "recent" | "created" | "favorites";

interface LibraryTabsProps {
  activeFilter: LibraryFilter;
  onFilterChange: (filter: LibraryFilter) => void;
}

const tabs: { id: LibraryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "recent", label: "Recently viewed" },
  { id: "created", label: "Created by you" },
  { id: "favorites", label: "Favorites" },
];

export const LibraryTabs = ({ activeFilter, onFilterChange }: LibraryTabsProps) => {
  return (
    <div className="flex items-center gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-colors relative",
            activeFilter === tab.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          {activeFilter === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
      ))}
    </div>
  );
};
