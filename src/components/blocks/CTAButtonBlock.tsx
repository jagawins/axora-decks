/**
 * CTA Button Block — Action Buttons for Executive Decks
 *
 * Use cases:
 * - "Schedule Follow-up" → Calendly link
 * - "Approve This Proposal" → email mailto
 * - "Book a Demo" → sales link
 * - "View Full Report" → Google Drive link
 * - Multiple buttons in a row for decision decks
 */

import { cn } from "@/lib/utils";
import {
  Calendar, Mail, ExternalLink, FileText, ThumbsUp,
  ArrowRight, Download, MessageSquare, Phone, Video
} from "lucide-react";

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  calendar: Calendar,
  mail: Mail,
  link: ExternalLink,
  document: FileText,
  approve: ThumbsUp,
  arrow: ArrowRight,
  download: Download,
  message: MessageSquare,
  phone: Phone,
  video: Video,
};

export interface CTAButton {
  label: string;
  url: string;
  icon?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  description?: string;
}

export interface CTAButtonBlockPayload {
  title?: string;
  subtitle?: string;
  buttons: CTAButton[];
  layout?: "horizontal" | "vertical" | "card";
  alignment?: "left" | "center" | "right";
}

interface CTAButtonBlockProps {
  payload: CTAButtonBlockPayload;
  readOnly?: boolean;
  className?: string;
}

export function CTAButtonBlock({ payload, readOnly = true, className }: CTAButtonBlockProps) {
  const { title, subtitle, buttons = [], layout = "horizontal", alignment = "center" } = payload;

  const alignClass = alignment === "left" ? "items-start" : alignment === "right" ? "items-end" : "items-center";

  return (
    <div className={cn("w-full flex flex-col gap-space-4", alignClass, className)}>
      {title && (
        <h3 className="text-fluid-lg font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))] max-w-lg text-center">
          {subtitle}
        </p>
      )}

      {layout === "card" ? (
        /* Card layout — each button is a card with description */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
          {buttons.map((btn, i) => {
            const Icon = ICON_MAP[btn.icon || "arrow"] || ArrowRight;
            return (
              <a
                key={i}
                href={btn.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 rounded-xl border border-[var(--deck-border,hsl(var(--border)))] hover:border-[var(--deck-accent,hsl(var(--accent)))] transition-all hover:shadow-md group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--deck-accent,hsl(var(--accent)))]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--deck-accent,hsl(var(--accent)))]/20 transition-colors">
                  <Icon className="h-5 w-5 text-[var(--deck-accent,hsl(var(--accent)))]" />
                </div>
                <div>
                  <p className="text-fluid-base font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">{btn.label}</p>
                  {btn.description && (
                    <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-0.5">{btn.description}</p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        /* Horizontal or Vertical button layout */
        <div className={cn(
          "flex gap-3 flex-wrap",
          layout === "vertical" ? "flex-col" : "flex-row",
          alignment === "center" && "justify-center"
        )}>
          {buttons.map((btn, i) => {
            const Icon = ICON_MAP[btn.icon || "arrow"] || ArrowRight;
            const variantStyles = {
              primary: "bg-[var(--deck-accent,hsl(var(--accent)))] text-white hover:opacity-90 shadow-md",
              secondary: "bg-[var(--deck-fg,hsl(var(--foreground)))]/10 text-[var(--deck-fg,hsl(var(--foreground)))] hover:bg-[var(--deck-fg,hsl(var(--foreground)))]/15",
              outline: "border-2 border-[var(--deck-accent,hsl(var(--accent)))] text-[var(--deck-accent,hsl(var(--accent)))] hover:bg-[var(--deck-accent,hsl(var(--accent)))]/5",
              ghost: "text-[var(--deck-accent,hsl(var(--accent)))] hover:bg-[var(--deck-accent,hsl(var(--accent)))]/5 underline-offset-4 hover:underline",
            };

            return (
              <a
                key={i}
                href={btn.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-fluid-base font-semibold transition-all",
                  variantStyles[btn.variant || (i === 0 ? "primary" : "outline")]
                )}
              >
                <Icon className="h-4 w-4" />
                {btn.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
