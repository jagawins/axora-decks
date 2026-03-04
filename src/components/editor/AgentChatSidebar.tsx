/**
 * AgentChatSidebar – Compact floating AI agent panel
 *
 * Redesigned from full sidebar (w-96) to floating overlay panel.
 * The old design consumed 384px, squeezing the slide canvas.
 * New design: 360px floating panel at bottom-right, overlays content
 * instead of pushing it. Collapses to a fab button when closed.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, Send, Loader2, X, Bot, User,
  Scissors, Eye, Target, FileText, Palette, RefreshCw,
  Minimize2, Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Block } from "@/lib/blocks";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AgentChatSidebarProps {
  open: boolean;
  onToggle: () => void;
  blocks: Block[];
  onAgentAction: (instruction: string) => Promise<void>;
  onQuickAction: (blockIndex: number, instruction: string) => Promise<void>;
  deckTitle?: string;
}

const QUICK_SUGGESTIONS = [
  { icon: Scissors, label: "Make slides concise", instruction: "Make every slide more concise. Remove filler words, redundancy, and verbose phrases across all blocks." },
  { icon: Eye, label: "Add executive summary", instruction: "Add a new executive summary slide at the beginning that captures the key points of this entire presentation." },
  { icon: Palette, label: "Recommend a theme", instruction: "Analyze the content and recommend the best visual theme. Explain why it fits." },
  { icon: Target, label: "Strengthen narrative", instruction: "Review the overall narrative flow across all slides. Identify gaps in logic or missing transitions and suggest improvements." },
  { icon: FileText, label: "Add data points", instruction: "Review each slide and suggest specific data points, statistics, or metrics that would strengthen the arguments." },
  { icon: RefreshCw, label: "Rewrite for C-suite", instruction: "Rewrite all content to be appropriate for C-suite executives. Use outcome-driven language, remove jargon, and lead with impact." },
];

const AgentChatSidebar = ({
  open,
  onToggle,
  blocks,
  onAgentAction,
  onQuickAction,
  deckTitle,
}: AgentChatSidebarProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when panel opens
  useEffect(() => {
    if (open && !isMinimized) {
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [open, isMinimized]);

  const handleSend = async (text?: string) => {
    const message = text || input.trim();
    if (!message || isProcessing) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);
    setIsMinimized(false); // expand when sending

    try {
      await onAgentAction(message);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Done! Applied: "${message.slice(0, 60)}${message.length > 60 ? '…' : ''}"`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Couldn't complete that. ${err instanceof Error ? err.message : "Please try again."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── FAB button (closed state) ── */
  if (!open) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-accent text-accent-foreground rounded-full px-4 py-3 shadow-xl shadow-accent/20 hover:shadow-accent/30 hover:scale-105 transition-all duration-200"
        title="Open AI Agent"
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-semibold hidden sm:inline">Agent</span>
      </button>
    );
  }

  /* ── Minimized state (just header bar) ── */
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-72 rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
        <div
          className="flex items-center justify-between px-3 py-2.5 cursor-pointer"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
            </div>
            <span className="text-xs font-semibold">Agent</span>
            {isProcessing && <Loader2 className="h-3 w-3 text-accent animate-spin" />}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}>
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Expanded floating panel ── */
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-[360px] max-h-[min(520px,70vh)] flex flex-col rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
          </div>
          <div>
            <span className="text-xs font-semibold">Agent</span>
            <span className="text-[10px] text-muted-foreground ml-1.5">AI editing</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground"
              title="Clear chat"
              onClick={() => setMessages([])}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Minimize" onClick={() => setIsMinimized(true)}>
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" title="Close" onClick={onToggle}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Messages / Suggestions */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 ? (
          /* Empty state with compact suggestions */
          <div className="space-y-2">
            {blocks.length > 0 && (
              <div className="text-center py-2">
                <p className="text-xs text-muted-foreground">{blocks.length} slides · {deckTitle || "Untitled"}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_SUGGESTIONS.map(({ icon: Icon, label, instruction }) => (
                <button
                  key={label}
                  onClick={() => handleSend(instruction)}
                  disabled={isProcessing || blocks.length === 0}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/50 hover:bg-muted/50 hover:border-accent/30 transition-all text-left group disabled:opacity-40"
                >
                  <Icon className="h-3 w-3 text-accent shrink-0" />
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat messages */
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-1.5",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3 w-3 text-accent" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-2.5 py-1.5 text-xs leading-relaxed",
                  msg.role === "user"
                    ? "bg-accent text-accent-foreground rounded-br-sm"
                    : "bg-muted/50 border border-border/50 rounded-bl-sm"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}

        {isProcessing && (
          <div className="flex gap-1.5 items-start">
            <div className="h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Loader2 className="h-3 w-3 text-accent animate-spin" />
            </div>
            <div className="bg-muted/50 border border-border/50 rounded-xl rounded-bl-sm px-2.5 py-1.5 text-xs text-muted-foreground">
              Editing your deck…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/50 p-2.5 shrink-0">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Edit, style, or ask anything…"
            className="pr-9 resize-none bg-muted/20 border-border/30 rounded-xl min-h-[36px] max-h-[80px] text-xs"
            rows={1}
            disabled={isProcessing}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0.5 bottom-0.5 h-7 w-7 text-accent hover:bg-accent/10 rounded-lg"
            onClick={() => handleSend()}
            disabled={!input.trim() || isProcessing}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentChatSidebar;
