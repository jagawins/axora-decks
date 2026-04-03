/**
 * AIChatbot — Floating support chatbot powered by Claude
 * 
 * Answers questions about AXIVA features, pricing, templates,
 * and how to use the product. Replaces human support.
 * 
 * Positioned as a floating button in bottom-right corner.
 * Expands into a chat window on click.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, X, Send, Loader2, Sparkles, ArrowRight } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are AXIVA's AI assistant. You help visitors understand AXIVA and answer their questions concisely.

ABOUT AXIVA:
- AI-powered executive presentation platform
- Generates decks from one sentence using consulting methodology (answer-first structure)
- Speech prep with delivery coaching (vocal tips, story structure, body language)
- Live audience polls with QR codes (replaces Slido)
- Smart Slides that adapt in real-time based on audience input and voice recognition
- 98 executive templates across 6 categories
- 23 timeline styles
- PPTX and PDF export
- Webinar-ready: deck + speech + polls + coaching in one tool

PRICING:
- Free: 3 projects, basic AI generation, web sharing
- Pro: $28/month or $269/year. Unlimited projects, PPTX export, speech prep, live polls, Smart Slides, brand kit
- Team: $78/month per user. Everything in Pro + shared workspaces, governance
- Enterprise: Custom pricing. SSO, dedicated support, SLAs

COMPETITORS:
- vs Gamma: AXIVA has delivery coaching, live polls, speech generation. Gamma does not.
- vs Beautiful.ai: AXIVA has AI generation and live polls. Beautiful.ai does not.
- vs Canva: AXIVA is executive-focused with consulting methodology. Canva is general design.
- vs Slido: AXIVA builds polls INTO the deck. Slido is a separate tool.
- vs PowerPoint Copilot: AXIVA has delivery coaching and live polls built in.

RULES:
- Keep answers under 3 sentences when possible
- Be friendly and direct
- If asked about features, link to relevant pages: /features, /pricing, /executive, /live-polls, /webinars
- If asked how to do something, give step-by-step instructions
- If you don't know something specific, suggest they try the product or contact support
- Never make up features that don't exist`;

const QUICK_QUESTIONS = [
  "What makes AXIVA different from Gamma?",
  "How do live polls work?",
  "What does the Pro plan include?",
  "Can I export to PowerPoint?",
];

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setHasInteracted(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: newMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      const assistantText = data.content?.[0]?.text || "Sorry, I could not process that. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: assistantText }]);
    } catch {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm having trouble connecting right now. You can explore AXIVA at axiva.ai/features or email us for help." 
      }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] max-h-[500px] rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-accent/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold">AXIVA Assistant</p>
                <p className="text-[10px] text-muted-foreground">Ask me anything about AXIVA</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[340px]">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="bg-accent/5 border border-accent/10 rounded-xl p-3">
                  <p className="text-sm">Hi! I can help you learn about AXIVA. Ask me about features, pricing, or how to get started.</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quick questions</p>
                  {QUICK_QUESTIONS.map(q => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border/40 hover:border-accent/30 hover:bg-accent/5 transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  msg.role === "user" 
                    ? "bg-accent text-white rounded-br-sm" 
                    : "bg-muted/50 border border-border/30 rounded-bl-sm")}>
                  {msg.content.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-1" : ""}>{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted/50 border border-border/30 rounded-xl rounded-bl-sm px-3 py-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border/30 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask about AXIVA..."
                className="flex-1 px-3 py-2 rounded-lg border border-border/40 bg-background text-sm outline-none focus:border-accent/50 transition-colors"
                disabled={loading}
              />
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
                className="p-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-40 transition-all shrink-0">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-4 right-4 sm:right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95",
          open ? "bg-muted border border-border/50" : "bg-accent text-white hover:bg-accent/90"
        )}>
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageSquare className="h-5 w-5" />
        )}
      </button>
    </>
  );
}
