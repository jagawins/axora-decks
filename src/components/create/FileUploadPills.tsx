import { useState, useRef } from "react";
import { X, Upload, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { FileExtract } from "@/types/research-mode";

interface FileUploadPillsProps {
  files: FileExtract[];
  onFilesChange: (files: FileExtract[]) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = [".pdf", ".docx", ".txt", ".md"];
const MAX_FILES = 3;

export default function FileUploadPills({
  files,
  onFilesChange,
  disabled,
}: FileUploadPillsProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const remaining = MAX_FILES - files.length;
    const toProcess = Array.from(selected).slice(0, remaining);
    if (toProcess.length === 0) return;

    setUploading(true);

    try {
      const newExtracts: FileExtract[] = [];

      for (const file of toProcess) {
        const ext = file.name.split(".").pop()?.toLowerCase();

        // Plain text files — read directly
        if (ext === "txt" || ext === "md") {
          const text = await file.text();
          newExtracts.push({ fileName: file.name, text });
          continue;
        }

        // PDF / DOCX — send to parse-file edge function
        const formData = new FormData();
        formData.append("file", file);

        const { data, error } = await supabase.functions.invoke("parse-file", {
          body: formData,
        });

        if (error) {
          console.error(`Failed to parse ${file.name}:`, error);
          continue;
        }

        newExtracts.push({
          fileName: file.name,
          text: data?.text || "",
        });
      }

      onFilesChange([...files, ...newExtracts]);
    } catch (err) {
      console.error("File upload error:", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">
        Context Files{" "}
        <span className="text-muted-foreground font-normal">(optional)</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Upload documents for context — financial reports, existing decks, data
        exports
      </p>

      {/* Uploaded pills */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-sm"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground max-w-[160px] truncate">
                {f.fileName}
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                disabled={disabled}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {files.length < MAX_FILES && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border/60",
            "text-sm text-muted-foreground hover:text-foreground hover:border-accent/50",
            "transition-colors disabled:opacity-50"
          )}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Extracting text…" : "Upload file"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
