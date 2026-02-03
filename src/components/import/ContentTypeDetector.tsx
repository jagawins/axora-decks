import { useMemo } from "react";
import { FileText, ListChecks, Quote, BarChart3, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type DetectedContentType = 
  | "meeting_notes"
  | "article"
  | "bullet_points"
  | "transcript"
  | "statistics"
  | "timeline"
  | "general";

interface ContentTypeDetectorProps {
  content: string;
  className?: string;
}

const TYPE_CONFIG: Record<DetectedContentType, { label: string; icon: typeof FileText; color: string }> = {
  meeting_notes: { label: "Meeting Notes", icon: ListChecks, color: "text-blue-500" },
  article: { label: "Article / Report", icon: FileText, color: "text-green-500" },
  bullet_points: { label: "Bullet Points", icon: ListChecks, color: "text-purple-500" },
  transcript: { label: "Transcript", icon: Quote, color: "text-orange-500" },
  statistics: { label: "Data / Statistics", icon: BarChart3, color: "text-cyan-500" },
  timeline: { label: "Timeline / Events", icon: Calendar, color: "text-pink-500" },
  general: { label: "General Content", icon: FileText, color: "text-muted-foreground" },
};

export function detectContentType(content: string): DetectedContentType {
  const text = content.toLowerCase();
  const lines = content.split("\n").filter(l => l.trim());

  // Meeting notes patterns
  if (
    /\b(meeting|agenda|action items|attendees|minutes|discussion)\b/i.test(text) ||
    /\b(q[1-4]|deadline|follow[- ]?up)\b/i.test(text)
  ) {
    return "meeting_notes";
  }

  // Transcript patterns (speaker labels, timestamps)
  if (
    /^\s*\[?\d{1,2}:\d{2}/m.test(content) ||
    /^[A-Z][a-z]+:\s/m.test(content) ||
    /\b(speaker|interviewer|interviewee)\b/i.test(text)
  ) {
    return "transcript";
  }

  // Statistics patterns
  const numberDensity = (content.match(/\d+\.?\d*%?/g) || []).length / lines.length;
  if (numberDensity > 0.5 || /\b(roi|kpi|metrics?|growth|increase|decrease|revenue)\b/i.test(text)) {
    return "statistics";
  }

  // Timeline patterns
  if (
    /\b(q[1-4]\s*\d{4}|phase\s*\d|step\s*\d|milestone)\b/i.test(text) ||
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b.*\d{4}/i.test(text)
  ) {
    return "timeline";
  }

  // Bullet points detection
  const bulletLines = lines.filter(l => /^[\s]*[-•*]\s/.test(l));
  if (bulletLines.length > lines.length * 0.4) {
    return "bullet_points";
  }

  // Article detection (longer paragraphs)
  const avgLineLength = lines.reduce((sum, l) => sum + l.length, 0) / lines.length;
  if (avgLineLength > 80 && lines.length > 3) {
    return "article";
  }

  return "general";
}

export function ContentTypeDetector({ content, className }: ContentTypeDetectorProps) {
  const detectedType = useMemo(() => detectContentType(content), [content]);
  
  if (!content.trim() || detectedType === "general") return null;

  const config = TYPE_CONFIG[detectedType];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50",
      className
    )}>
      <Icon className={cn("h-3.5 w-3.5", config.color)} />
      <span className="text-xs text-muted-foreground">
        Detected: <span className="text-foreground font-medium">{config.label}</span>
      </span>
    </div>
  );
}
