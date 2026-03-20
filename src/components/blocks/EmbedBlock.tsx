/**
 * Embed Block — Live Dashboard & App Embeds
 *
 * Supports: Google Sheets, PowerBI, Tableau, Figma, Miro,
 * Loom, YouTube, and any URL via iframe.
 *
 * Executive use cases:
 * - Live KPI dashboard from Google Sheets in a board deck
 * - PowerBI revenue report embedded in quarterly review
 * - Figma prototype in a product strategy presentation
 * - Miro board in a workshop deck
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ExternalLink, Maximize2, Minimize2 } from "lucide-react";

// Known embed providers with icon + transform
const PROVIDERS: Record<string, { name: string; icon: string; transform?: (url: string) => string }> = {
  "docs.google.com/spreadsheets": {
    name: "Google Sheets",
    icon: "📊",
    transform: (url) => url.includes("/pubhtml") ? url : url.replace(/\/edit.*$/, "/pubhtml?widget=true&headers=false"),
  },
  "docs.google.com/presentation": {
    name: "Google Slides",
    icon: "📽️",
    transform: (url) => url.includes("/embed") ? url : url.replace(/\/edit.*$/, "/embed?start=false&loop=false&delayms=3000"),
  },
  "docs.google.com/document": {
    name: "Google Docs",
    icon: "📄",
    transform: (url) => url.includes("/pub") ? url : url.replace(/\/edit.*$/, "/pub?embedded=true"),
  },
  "app.powerbi.com": { name: "PowerBI", icon: "📈" },
  "public.tableau.com": { name: "Tableau", icon: "📉" },
  "figma.com": {
    name: "Figma",
    icon: "🎨",
    transform: (url) => `https://www.figma.com/embed?embed_host=axiva&url=${encodeURIComponent(url)}`,
  },
  "miro.com": {
    name: "Miro",
    icon: "🗺️",
    transform: (url) => url.includes("embed") ? url : url.replace("board/", "app/embed/"),
  },
  "loom.com": {
    name: "Loom",
    icon: "🎥",
    transform: (url) => url.replace("loom.com/share/", "loom.com/embed/"),
  },
  "youtube.com": {
    name: "YouTube",
    icon: "▶️",
    transform: (url) => {
      const id = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    },
  },
  "youtu.be": {
    name: "YouTube",
    icon: "▶️",
    transform: (url) => {
      const id = url.split("/").pop()?.split("?")[0];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    },
  },
  "calendly.com": {
    name: "Calendly",
    icon: "📅",
  },
  "airtable.com": {
    name: "Airtable",
    icon: "📋",
    transform: (url) => url.includes("embed") ? url : url.replace("airtable.com/", "airtable.com/embed/"),
  },
};

function detectProvider(url: string) {
  for (const [domain, provider] of Object.entries(PROVIDERS)) {
    if (url.includes(domain)) return provider;
  }
  return null;
}

export interface EmbedBlockPayload {
  title?: string;
  url: string;
  height?: number;
  caption?: string;
  provider?: string;
}

interface EmbedBlockProps {
  payload: EmbedBlockPayload;
  readOnly?: boolean;
  className?: string;
}

export function EmbedBlock({ payload, readOnly = true, className }: EmbedBlockProps) {
  const { title, url, height = 400, caption } = payload;
  const [expanded, setExpanded] = useState(false);
  const provider = detectProvider(url);
  const embedUrl = provider?.transform ? provider.transform(url) : url;

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      {(title || provider) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {provider && <span className="text-lg">{provider.icon}</span>}
            <h3 className="text-fluid-base font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">
              {title || `${provider?.name || "Embedded"} Content`}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <Minimize2 className="h-4 w-4 text-muted-foreground" /> : <Maximize2 className="h-4 w-4 text-muted-foreground" />}
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors" title="Open in new tab">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </div>
      )}

      {/* Embed iframe */}
      <div
        className="rounded-xl border border-[var(--deck-border,hsl(var(--border)))] overflow-hidden bg-white"
        style={{ height: expanded ? "80vh" : `${height}px` }}
      >
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          loading="lazy"
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
        />
      </div>

      {/* Caption */}
      {caption && (
        <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-2 text-center italic">
          {caption}
        </p>
      )}
    </div>
  );
}
