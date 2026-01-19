import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, LayoutTemplate, FileText, Heading, List, AlertCircle, Columns, Table, Image } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { BlockType } from "@/lib/ai-engine";

const BLOCK_ICONS: Record<BlockType, typeof FileText> = {
  text: FileText,
  heading: Heading,
  list: List,
  callout: AlertCircle,
  two_col: Columns,
  table: Table,
  image: Image,
};

const BLOCK_LABELS: Record<BlockType, string> = {
  text: "Text",
  heading: "Heading",
  list: "List",
  callout: "Callout",
  two_col: "Two Column",
  table: "Table",
  image: "Image",
};

interface Block {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
}

interface MobileAIPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBlock: Block | null;
  onGenerate: () => void;
  onRefine: () => void;
  onApplyTemplate: () => void;
  onQuickEdit: (instruction: string) => void;
}

const MobileAIPanel = ({
  open,
  onOpenChange,
  selectedBlock,
  onGenerate,
  onRefine,
  onApplyTemplate,
  onQuickEdit,
}: MobileAIPanelProps) => {
  const quickEdits = [
    { label: "✂️ Shorten", instruction: "Make it more concise and punchy" },
    { label: "📝 Expand", instruction: "Expand with more detail and examples" },
    { label: "👔 Professional", instruction: "Make the tone more professional and executive" },
    { label: "💡 Simplify", instruction: "Simplify the language for a general audience" },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader className="border-b border-border pb-3">
          <DrawerTitle>AI Actions</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto p-4 space-y-4 pb-safe">
          {selectedBlock ? (
            <>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Selected block</p>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = BLOCK_ICONS[selectedBlock.type];
                    return <Icon className="h-4 w-4 text-muted-foreground" />;
                  })()}
                  <p className="font-medium text-sm">{BLOCK_LABELS[selectedBlock.type]}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  variant="hero" 
                  className="w-full justify-start" 
                  onClick={() => {
                    onGenerate();
                    onOpenChange(false);
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => {
                    onRefine();
                    onOpenChange(false);
                  }}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Agent Edit
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => {
                    onApplyTemplate();
                    onOpenChange(false);
                  }}
                >
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  Apply Template
                </Button>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-3">Quick edits</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickEdits.map((edit) => (
                    <Button
                      key={edit.label}
                      variant="ghost"
                      size="sm"
                      className="justify-start text-sm h-10"
                      onClick={() => {
                        onQuickEdit(edit.instruction);
                        onOpenChange(false);
                      }}
                    >
                      {edit.label}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Select a block to use AI actions
            </p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileAIPanel;
