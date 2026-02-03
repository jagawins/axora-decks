import { useCallback, useState } from "react";
import { Upload, FileText, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentDropZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  acceptedTypes?: string[];
}

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

export function ContentDropZone({ onFileSelect, disabled }: ContentDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      ACCEPTED_MIME_TYPES.includes(file.type) ||
      ACCEPTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (validFile) {
      onFileSelect(validFile);
    }
  }, [disabled, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = ""; // Reset for same file selection
    }
  }, [onFileSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-lg p-4 transition-all duration-200",
        "flex flex-col items-center justify-center gap-2 text-center",
        isDragging 
          ? "border-accent bg-accent/5 scale-[1.01]" 
          : "border-border/50 hover:border-accent/50 hover:bg-muted/30",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <input
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload file"
      />
      
      <div className={cn(
        "p-2 rounded-full transition-colors",
        isDragging ? "bg-accent/10" : "bg-muted"
      )}>
        <Upload className={cn(
          "h-5 w-5 transition-colors",
          isDragging ? "text-accent" : "text-muted-foreground"
        )} />
      </div>
      
      <div className="space-y-0.5">
        <p className={cn(
          "text-sm font-medium transition-colors",
          isDragging ? "text-accent" : "text-foreground"
        )}>
          {isDragging ? "Drop file here" : "Drag & drop or click to upload"}
        </p>
        <p className="text-xs text-muted-foreground">
          PDF, DOCX, TXT, or Markdown
        </p>
      </div>
    </div>
  );
}

export function FilePreviewBadge({ 
  fileName, 
  onRemove 
}: { 
  fileName: string; 
  onRemove: () => void;
}) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const Icon = ext === "pdf" ? FileText : File;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-sm">
      <Icon className="h-3.5 w-3.5 text-accent" />
      <span className="text-foreground font-medium truncate max-w-[200px]">{fileName}</span>
      <button
        onClick={onRemove}
        className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Remove file"
      >
        ×
      </button>
    </div>
  );
}
