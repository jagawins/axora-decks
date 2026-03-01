/**
 * AgentChatSidebar – Gamma-style conversational AI agent for editing slides
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, Send, Loader2, X, Bot, User, ChevronLeft,
  Scissors, Eye, Target, FileText, Palette, RefreshCw
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
  { icon: Scissors, label: "Make all slides more concise", instruction: "Make every slide more concise. Remove filler words, redundancy, and verbose phrases across all blocks." },
  { icon: Eye, label: "Add an executive summary", instruction: "Add a new executive summary slide at the beginning that captures the key points of this entire presentation." },
  { icon: Palette, label: "Recommend a theme based on my content", instruction: "Analyze the content and recommend the best visual theme. Explain why it fits." },
  { icon: Target, label: "Strengthen the narrative flow", instruction: "Review the overall narrative flow across all slides. Identify gaps in logic or missing transitions and suggest improvements." },
  { icon: FileText, label: "Add supporting data points", instruction: "Review each slide and suggest specific data points, statistics, or metrics that would strengthen the arguments." },
  { icon: RefreshCw, label: "Rewrite for a C-suite audience", instruction: "Rewrite all content to be appropriate for C-suite executives. Use outcome-driven language, remove jargon, and lead with impact." },
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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

    try {
      await onAgentAction(message);

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Done! I've applied your edit: "${message.slice(0, 80)}${message.length > 80 ? '…' : ''}"`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Sorry, I couldn't complete that action. ${err instanceof Error ? err.message : "Please try again."}`,
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

  if (!open) {
    return (
      <button
        onClick={onToggle}
        className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 items-center gap-1 bg-accent text-accent-foreground border border-accent/50 rounded-l-lg px-2 py-3 hover:bg-accent/90 transition-colors shadow-lg"
      >
        <Sparkles className="h-4 w-4" />
        <ChevronLeft className="h-3 w-3" />
      </button>
    );
  }

  return (
    <aside className="hidden md:flex w-96 border-l border-border bg-card/50 backdrop-blur-sm flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Agent</h3>
            <p className="text-[10px] text-muted-foreground">AI-powered editing</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setMessages([])}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          /* Empty state with suggestions */
          <div className="space-y-6">
            {/* Context card */}
            {blocks.length > 0 && (
              <div className="rounded-xl bg-muted/30 border border-border p-4 text-center">
                <p className="text-sm font-medium">{deckTitle || "Your Presentation"}</p>
                <p className="text-xs text-muted-foreground mt-1">{blocks.length} slides</p>
              </div>
            )}

            {/* Quick suggestions */}
            <div className="space-y-2">
              {QUICK_SUGGESTIONS.map(({ icon: Icon, label, instruction }) => (
                <button
                  key={label}
                  onClick={() => handleSend(instruction)}
                  disabled={isProcessing || blocks.length === 0}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-muted/50 hover:border-accent/30 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="h-7 w-7 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Icon className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
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
                "flex gap-2",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-accent" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  msg.role === "user"
                    ? "bg-accent text-accent-foreground rounded-br-sm"
                    : "bg-muted/50 border border-border rounded-bl-sm"
                )}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))
        )}

        {isProcessing && (
          <div className="flex gap-2 items-start">
            <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Loader2 className="h-3.5 w-3.5 text-accent animate-spin" />
            </div>
            <div className="bg-muted/50 border border-border rounded-xl rounded-bl-sm px-3 py-2 text-sm text-muted-foreground">
              Editing your deck…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-3 bg-card/80">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to edit, create, or style anything…"
            className="pr-10 resize-none bg-muted/30 border-border/50 rounded-xl min-h-[44px] max-h-[120px] text-sm"
            rows={1}
            disabled={isProcessing}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 bottom-1 h-8 w-8 text-accent hover:bg-accent/10 rounded-lg"
            onClick={() => handleSend()}
            disabled={!input.trim() || isProcessing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleSend("Make slides shorter and more impactful")}
            disabled={isProcessing || blocks.length === 0}
            className="text-[11px] px-2.5 py-1 rounded-full border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            ✨ Quick edits
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AgentChatSidebar;
