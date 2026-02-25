/**
 * Unified Export Menu dropdown
 */

import { FileDown, Printer, Share2, Presentation, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportMenuProps {
  onPrintPDF: () => void;
  onShareLink: () => void;
  onPresenterView?: () => void;
  onExportPPTX?: () => void;
  pptxLoading?: boolean;
}

export function ExportMenu({ onPrintPDF, onShareLink, onPresenterView, onExportPPTX, pptxLoading }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onPrintPDF}>
          <Printer className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        {onExportPPTX && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportPPTX} disabled={pptxLoading}>
              {pptxLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2" />
              )}
              Export as PowerPoint
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onShareLink}>
          <Share2 className="h-4 w-4 mr-2" />
          Copy share link
        </DropdownMenuItem>
        {onPresenterView && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onPresenterView}>
              <Presentation className="h-4 w-4 mr-2" />
              Presenter view
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
