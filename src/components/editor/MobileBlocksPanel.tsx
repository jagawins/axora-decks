import { Button } from "@/components/ui/button";
import { Plus, ChevronUp, ChevronDown, Trash2, FileText } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { BlockType } from "@/lib/blocks";
import { BLOCK_ICONS } from "@/lib/block-icons";

interface Block {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
}

interface MobileBlocksPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: "up" | "down") => void;
  onDeleteBlock: (id: string) => void;
  onAddBlock: () => void;
  getBlockPreview: (block: Block) => string;
}

const MobileBlocksPanel = ({
  open,
  onOpenChange,
  blocks,
  selectedBlockId,
  onSelectBlock,
  onMoveBlock,
  onDeleteBlock,
  onAddBlock,
  getBlockPreview,
}: MobileBlocksPanelProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <DrawerTitle>Blocks</DrawerTitle>
            <Button size="sm" variant="ghost" onClick={onAddBlock}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </DrawerHeader>
        <div className="overflow-y-auto p-4 space-y-3 pb-safe">
          {blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No blocks yet. Create with AI or add manually.
            </p>
          ) : (
            blocks.map((block, index) => {
              const Icon = BLOCK_ICONS[block.type] || FileText;
              return (
                <div
                  key={block.id}
                  className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedBlockId === block.id ? "bg-accent/20 border border-accent/30" : "bg-muted/30 hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    onSelectBlock(block.id);
                    onOpenChange(false);
                  }}
                >
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{getBlockPreview(block)}</span>
                    <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveBlock(block.id, "up");
                      }}
                      disabled={index === 0}
                      className="p-2 hover:bg-muted rounded disabled:opacity-30 touch-target flex items-center justify-center"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveBlock(block.id, "down");
                      }}
                      disabled={index === blocks.length - 1}
                      className="p-2 hover:bg-muted rounded disabled:opacity-30 touch-target flex items-center justify-center"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBlock(block.id);
                      }}
                      className="p-2 hover:bg-destructive/20 rounded text-destructive touch-target flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileBlocksPanel;
