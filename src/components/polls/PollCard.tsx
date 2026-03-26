/**
 * Poll Card — displays a single poll with QR code, results, and actions
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Copy, Check, Smartphone, Download, Layers, Eye,
  ExternalLink, Play, Trash2
} from "lucide-react";
import { POLL_TYPES, type LivePoll } from "./LivePollCreator";

interface PollCardProps {
  poll: LivePoll;
  qrUrl: (code: string) => string;
  copyCode: (code: string) => void;
  copiedId: string | null;
  onDelete: () => void;
  onRefresh: () => void;
  onInsertToDeck: () => void;
  toast: any;
}

export default function PollCard({ poll, qrUrl, copyCode, copiedId, onDelete, onRefresh, onInsertToDeck, toast }: PollCardProps) {
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const results = poll.results || {};
  const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);

  const downloadQR = async () => {
    try {
      const response = await fetch(qrUrl(poll.code));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `axiva-poll-${poll.code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "QR code downloaded!" });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const handleViewResults = () => {
    if (!showResults) onRefresh(); // refresh data when opening results
    setShowResults(!showResults);
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
      {/* Poll header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold uppercase">
            {POLL_TYPES.find(t => t.id === poll.poll_type)?.label}
          </span>
          <span className="text-[9px] text-muted-foreground">
            {new Date(poll.created_at).toLocaleDateString()} {new Date(poll.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-base font-bold">{poll.question}</p>
        {poll.options && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {poll.options.map((o, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-lg bg-muted/30 border border-border/30">{o}</span>
            ))}
          </div>
        )}
      </div>

      {/* Live Results (toggle) */}
      {showResults && (
        <div className="border-t border-border/30 bg-accent/[0.02] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Live Results</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500">{totalVotes} votes</span>
            </div>
          </div>
          {totalVotes === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No votes yet. Share the QR code or event code to get started.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(results).map(([label, count]) => {
                const pct = Math.round((count / totalVotes) * 100);
                return (
                  <div key={label} className="relative p-3 rounded-xl border border-border/30 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-accent/10" style={{ width: `${pct}%` }} />
                    <div className="relative flex items-center justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{count} votes</span>
                        <span className="text-sm font-bold text-accent">{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* QR code + event code section */}
      <div className="border-t border-border/30 bg-muted/10 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative shrink-0 group">
            <img src={qrUrl(poll.code)} alt="QR code" className="w-28 h-28 rounded-lg border border-border/30" />
            <button onClick={downloadQR}
              className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Download className="h-5 w-5 text-white" />
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Smartphone className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Share with audience</span>
            </div>
            <p className="text-sm text-muted-foreground">Scan QR or go to <span className="font-mono font-semibold text-foreground">axiva.ai/live</span></p>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="flex gap-1">
                {poll.code.split("").map((char, i) => (
                  <div key={i} className="w-7 h-9 rounded-lg border-2 border-accent/30 bg-accent/5 flex items-center justify-center text-base font-bold text-accent">
                    {char}
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={() => copyCode(poll.code)}>
                {copiedId === poll.code ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border/30 px-4 py-3 flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={handleViewResults}>
          <Eye className="h-3.5 w-3.5" /> {showResults ? "Hide results" : "View results"}
        </Button>
        <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={downloadQR}>
          <Download className="h-3.5 w-3.5" /> Download QR
        </Button>
        <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={onInsertToDeck}>
          <Layers className="h-3.5 w-3.5" /> Insert into deck
        </Button>
        <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => {
          navigator.clipboard.writeText(`https://axiva.ai/live/${poll.code}`);
          toast({ title: "Link copied!" });
        }}>
          <ExternalLink className="h-3.5 w-3.5" /> Copy link
        </Button>
        <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => navigate(`/live/${poll.code}`)}>
          <Play className="h-3.5 w-3.5" /> Present
        </Button>
        <Button variant="ghost" size="sm" className="text-xs gap-1.5 ml-auto text-red-500 hover:text-red-600" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
