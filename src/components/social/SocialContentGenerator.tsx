/**
 * SocialContentGenerator v3
 *
 * Fixes:
 * 1. Generates actual branded image (not just suggestion)
 * 2. "Copy Image + Text" button copies both to clipboard
 * 3. "Post" opens LinkedIn with image ready to paste
 * 4. Post history saved to Supabase and displayed
 * 5. Updated description mentioning image generation
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sparkles, Loader2, Copy, Check, RefreshCw, Twitter,
  Linkedin, ArrowRight, ChevronDown, Image, Download,
  Clock, Trash2,
} from "lucide-react";

type Platform = "linkedin" | "twitter";
type PostStyle = "thought_leadership" | "case_study" | "hot_take" | "how_to" | "data_insight" | "announcement";

const STYLES: { id: PostStyle; label: string; icon: string }[] = [
  { id: "thought_leadership", label: "Thought Leadership", icon: "💡" },
  { id: "case_study", label: "Case Study / Win", icon: "📊" },
  { id: "hot_take", label: "Hot Take", icon: "🔥" },
  { id: "how_to", label: "How-To / Tips", icon: "📝" },
  { id: "data_insight", label: "Data Insight", icon: "📈" },
  { id: "announcement", label: "Announcement", icon: "🚀" },
];

const TOPIC_SUGGESTIONS = [
  "Why most presentations fail in the first 30 seconds",
  "The difference between a deck and a decision tool",
  "How AI is changing executive communication",
  "3 things board members want to see (and 3 they don't)",
  "Why your all-hands needs anonymous Q&A",
  "Smart Slides: presentations that adapt to what the audience says",
  "Stop using Slido as a separate tool",
  "I built a presentation tool and here is what I learned",
];

interface GeneratedPost {
  platform: Platform;
  content: string;
  hookLine: string;
  imageDataUrl?: string;
}

interface SavedPost {
  id: string;
  platform: string;
  content: string;
  style: string;
  topic: string;
  created_at: string;
}

const ACCENT_COLORS: Record<PostStyle, string> = {
  thought_leadership: "#7c3aed",
  case_study: "#10b981",
  hot_take: "#ef4444",
  how_to: "#3b82f6",
  data_insight: "#f59e0b",
  announcement: "#ec4899",
};

export default function SocialContentGenerator() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [style, setStyle] = useState<PostStyle>("thought_leadership");
  const [topic, setTopic] = useState("");
  const [deckContext, setDeckContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [showTopics, setShowTopics] = useState(false);
  const [history, setHistory] = useState<SavedPost[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load post history
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await supabase
          .from("social_posts" as any)
          .select("id, platform, content, style, topic, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (data) setHistory(data as any as SavedPost[]);
      } catch { /* table may not exist yet */ }
    })();
  }, [user]);

  // Generate branded image from post content
  const generateImage = useCallback((post: GeneratedPost, accent: string): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const W = 1200, H = 630;
    canvas.width = W;
    canvas.height = H;

    // Background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0f0f14");
    grad.addColorStop(1, "#1a1a2e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Accent glow
    const glow = ctx.createRadialGradient(W * 0.8, H * 0.2, 0, W * 0.8, H * 0.2, 400);
    glow.addColorStop(0, accent + "18");
    glow.addColorStop(1, accent + "00");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Extract text
    const lines = post.content.split("\n").filter(l => l.trim() && !l.startsWith("#") && !l.startsWith("🔗") && !l.startsWith("via @"));
    const hookLine = lines[0] || "";
    const bodyLines = lines.slice(1, 5).filter(l => l.trim());

    // Hook text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px system-ui, -apple-system, sans-serif";
    let y = 90;
    wrapText(ctx, hookLine, W - 160).forEach(line => {
      ctx.fillText(line, 80, y);
      y += 56;
    });

    // Accent bar
    y += 12;
    ctx.fillStyle = accent;
    ctx.fillRect(80, y, 80, 4);
    y += 32;

    // Body
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "400 22px system-ui, -apple-system, sans-serif";
    bodyLines.forEach(line => {
      const clean = line.replace(/^[-•*]\s*/, "").trim();
      if (!clean) return;
      wrapText(ctx, clean, W - 160).forEach(wl => {
        if (y < H - 90) { ctx.fillText(wl, 80, y); y += 30; }
      });
      y += 10;
    });

    // Bottom bar
    ctx.fillStyle = accent + "15";
    ctx.fillRect(0, H - 65, W, 65);

    ctx.fillStyle = accent;
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillText("AXIVA", 80, H - 28);

    ctx.fillStyle = "#71717a";
    ctx.font = "400 16px system-ui, sans-serif";
    ctx.fillText("axiva.ai", 170, H - 28);

    ctx.textAlign = "right";
    ctx.fillStyle = "#52525b";
    ctx.font = "400 14px system-ui, sans-serif";
    ctx.fillText(post.platform === "linkedin" ? "linkedin.com" : "x.com", W - 80, H - 28);
    ctx.textAlign = "left";

    return canvas.toDataURL("image/png");
  }, []);

  const generate = useCallback(async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setPosts([]);

    try {
      const styleInfo = STYLES.find(s => s.id === style);
      const accent = ACCENT_COLORS[style];

      const { data, error } = await supabase.functions.invoke("generate-outline", {
        body: {
          topic,
          prompt: platform === "linkedin"
            ? buildLinkedInPrompt(topic, styleInfo, deckContext)
            : buildTwitterPrompt(topic, styleInfo, deckContext),
          tone: "executive",
          cardsCount: 3,
        },
      });

      if (error) throw error;

      const sections = data?.outline?.sections || [];

      const generated: GeneratedPost[] = sections.slice(0, 3).map((section: any) => {
        const heading = section.heading || "";
        const desc = section.description || "";
        const bullets = section.bullets || [];

        let content: string;

        if (platform === "linkedin") {
          const parts: string[] = [];
          if (heading && !heading.toLowerCase().startsWith("post")) { parts.push(heading); parts.push(""); }
          if (desc) {
            desc.split(/(?<=\.)\s+/).forEach((s: string, j: number, a: string[]) => {
              if (j % 2 === 0) {
                const para = a.slice(j, j + 2).join(" ").trim();
                if (para) { parts.push(para); parts.push(""); }
              }
            });
          }
          bullets.forEach((b: string) => { const c = b.replace(/^[-•*]\s*/, "").trim(); if (c) parts.push(c); });
          parts.push("");
          content = parts.join("\n").trim();
          content += "\n\n🔗 Built with AXIVA — axiva.ai\n" + generateHashtags(topic, style);
        } else {
          const all = [heading, desc, ...bullets].filter(Boolean).join(" ").trim();
          const brand = " via @inaxiva axiva.ai";
          content = all.substring(0, 280 - brand.length - 25) + brand + " " + generateHashtags(topic, style, 2);
          if (content.length > 280) content = content.substring(0, 277) + "...";
        }

        const post: GeneratedPost = { platform, content, hookLine: content.split("\n")[0] || "" };
        post.imageDataUrl = generateImage(post, accent);
        return post;
      });

      if (generated.length === 0) {
        generated.push({ platform, content: "Generation returned empty. Try a more specific topic.", hookLine: "" });
      }

      setPosts(generated);

      // Save to history
      if (user) {
        for (const p of generated) {
          try {
            await supabase.from("social_posts" as any).insert({
              user_id: user.id,
              platform: p.platform,
              content: p.content,
              style,
              topic,
            } as any);
          } catch { /* table may not exist */ }
        }
        // Refresh history
        try {
          const { data: h } = await supabase
            .from("social_posts" as any)
            .select("id, platform, content, style, topic, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20);
          if (h) setHistory(h as any as SavedPost[]);
        } catch {}
      }
    } catch (err) {
      console.error("Generation failed:", err);
      setPosts([{ platform, content: "Generation failed. Check connection and try again.", hookLine: "" }]);
    } finally {
      setGenerating(false);
    }
  }, [topic, platform, style, deckContext, user, generateImage]);

  const copyTextAndImage = async (index: number) => {
    const post = posts[index];
    try {
      // Copy text to clipboard
      await navigator.clipboard.writeText(post.content);

      // Also try to copy image to clipboard (if supported)
      if (post.imageDataUrl) {
        try {
          const res = await fetch(post.imageDataUrl);
          const blob = await res.blob();
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
              "text/plain": new Blob([post.content], { type: "text/plain" }),
            }),
          ]);
        } catch {
          // Fallback: just text was copied
        }
      }

      setCopied(index);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback
      navigator.clipboard.writeText(post.content);
      setCopied(index);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const downloadImage = (index: number) => {
    const post = posts[index];
    if (!post.imageDataUrl) return;
    const link = document.createElement("a");
    link.download = `axiva-post-${index + 1}.png`;
    link.href = post.imageDataUrl;
    link.click();
  };

  const postToPlatform = async (post: GeneratedPost) => {
    // Download image first so user has it ready
    if (post.imageDataUrl) {
      const link = document.createElement("a");
      link.download = "axiva-post.png";
      link.href = post.imageDataUrl;
      link.click();
    }
    // Copy text
    await navigator.clipboard.writeText(post.content);

    // Open platform
    if (post.platform === "linkedin") {
      window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank");
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}`, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Social Content Generator</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generate viral LinkedIn and Twitter posts with branded images.
          Each post includes a hook, formatted body, downloadable image card with AXIVA branding, and hashtags.
        </p>
      </div>

      {/* Platform toggle */}
      <div className="flex items-center gap-2">
        <button onClick={() => setPlatform("linkedin")}
          className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
            platform === "linkedin" ? "bg-[#0A66C2]/10 border border-[#0A66C2]/30 text-[#0A66C2]" : "bg-card/50 border border-border/50 text-muted-foreground hover:text-foreground")}>
          <Linkedin className="h-4 w-4" /> LinkedIn
        </button>
        <button onClick={() => setPlatform("twitter")}
          className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
            platform === "twitter" ? "bg-foreground/10 border border-foreground/20 text-foreground" : "bg-card/50 border border-border/50 text-muted-foreground hover:text-foreground")}>
          <Twitter className="h-4 w-4" /> Twitter / X
        </button>

        {/* History toggle */}
        {history.length > 0 && (
          <button onClick={() => setShowHistory(!showHistory)}
            className="ml-auto text-xs text-muted-foreground hover:text-accent flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {showHistory ? "Hide" : "Show"} history ({history.length})
          </button>
        )}
      </div>

      {/* Post history */}
      {showHistory && history.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto rounded-xl border border-border/50 p-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recent posts</p>
          {history.map(h => (
            <div key={h.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 cursor-pointer group"
              onClick={() => { setTopic(h.topic); navigator.clipboard.writeText(h.content); }}>
              <div className="shrink-0 mt-0.5">
                {h.platform === "linkedin" ? <Linkedin className="h-3 w-3 text-[#0A66C2]" /> : <Twitter className="h-3 w-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate">{h.content.split("\n")[0]}</p>
                <p className="text-[9px] text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Style */}
      <div>
        <label className="text-sm font-semibold mb-2 block">Post style</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STYLES.map(s => (
            <button key={s.id} onClick={() => setStyle(s.id)}
              className={cn("text-left p-3 rounded-xl border text-sm transition-all",
                style === s.id ? "border-accent bg-accent/5" : "border-border/50 hover:border-accent/30")}>
              <span className="text-base mr-1">{s.icon}</span>
              <span className="font-medium text-xs">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Topic */}
      <div>
        <label className="text-sm font-semibold mb-1.5 block">Topic</label>
        <Textarea value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g., Why most board presentations fail in the first 30 seconds" className="min-h-[72px]" />
        <button onClick={() => setShowTopics(!showTopics)}
          className="text-[11px] text-accent font-medium mt-1.5 flex items-center gap-1 hover:underline">
          <Sparkles className="h-3 w-3" /> Suggestions
          <ChevronDown className={cn("h-3 w-3 transition-transform", showTopics && "rotate-180")} />
        </button>
        {showTopics && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {TOPIC_SUGGESTIONS.map(t => (
              <button key={t} onClick={() => { setTopic(t); setShowTopics(false); }}
                className="text-[11px] px-2.5 py-1.5 rounded-lg border border-border/50 hover:border-accent/30 hover:bg-accent/5 transition-all text-muted-foreground hover:text-foreground">
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Context */}
      <div>
        <label className="text-sm font-semibold mb-1.5 block">
          Deck context <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Textarea value={deckContext} onChange={e => setDeckContext(e.target.value)}
          placeholder="Paste key points from your deck..." className="min-h-[56px]" />
      </div>

      {/* Generate */}
      <Button onClick={generate} disabled={generating || !topic.trim()} variant="hero" className="gap-2 w-full sm:w-auto">
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {generating ? "Writing 3 posts + images..." : `Generate Posts + Images`}
      </Button>

      {/* Results */}
      {posts.length > 0 && (
        <div className="space-y-5">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {posts.length} post{posts.length > 1 ? "s" : ""} with images
          </h3>
          {posts.map((post, i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-muted/20">
                <div className="flex items-center gap-2">
                  {platform === "linkedin" ? <Linkedin className="h-4 w-4 text-[#0A66C2]" /> : <Twitter className="h-4 w-4" />}
                  <span className="text-xs font-medium">Post {i + 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => copyTextAndImage(i)}>
                    {copied === i ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {copied === i ? "Copied!" : "Copy text + image"}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => downloadImage(i)}>
                    <Download className="h-3 w-3" /> Save image
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-accent" onClick={() => postToPlatform(post)}>
                    <ArrowRight className="h-3 w-3" /> Post
                  </Button>
                </div>
              </div>

              {/* Branded image card */}
              {post.imageDataUrl && (
                <div className="p-3 sm:p-4 bg-black/20">
                  <img src={post.imageDataUrl} alt="Branded post image"
                    className="w-full rounded-lg border border-border/20 shadow-lg" />
                </div>
              )}

              {/* Text content */}
              <div className="px-4 py-3 sm:px-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Post text</p>
                <div className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground max-h-32 overflow-y-auto">
                  {post.content}
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={generate} disabled={generating}>
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) { lines.push(current); current = word; }
    else current = test;
  }
  if (current) lines.push(current);
  return lines;
}

function buildLinkedInPrompt(topic: string, styleInfo: any, ctx: string): string {
  return `Write 3 viral LinkedIn posts about: "${topic}"
${ctx ? `Details:\n${ctx}\n` : ""}
STYLE: ${styleInfo?.label}

RULES:
1. HOOK: First 1-2 lines MUST grab attention (surprising stat, contrarian opinion, bold claim, question)
2. BODY: 4-6 short paragraphs, 1-2 sentences each, blank lines between
3. FORMAT: Use story/lesson/contrarian/data-led structure
4. TONE: First person, conversational, like telling a colleague over coffee
5. AXIVA: Naturally mention AXIVA (axiva.ai) in at least one post
6. Each post uses a DIFFERENT angle and hook style
7. End with a question that invites comments

Return heading as hook, description as body, bullets for key points.`;
}

function buildTwitterPrompt(topic: string, styleInfo: any, ctx: string): string {
  return `Write 3 Twitter/X posts about: "${topic}"
${ctx ? `Context:\n${ctx}\n` : ""}
STYLE: ${styleInfo?.label}
RULES: Each under 220 chars. Punchy. Mention @inaxiva in one. No threads.
Return heading as the tweet.`;
}

function generateHashtags(topic: string, style: PostStyle, count: number = 4): string {
  const t = topic.toLowerCase();
  const tags: string[] = ["#leadership"];
  if (t.includes("presentation") || t.includes("deck")) tags.push("#presentations");
  if (t.includes("ai")) tags.push("#AI", "#generativeAI");
  if (t.includes("board") || t.includes("executive")) tags.push("#executivecommunication");
  if (t.includes("startup") || t.includes("pitch")) tags.push("#startups");
  if (t.includes("sales")) tags.push("#sales");
  if (style === "hot_take") tags.push("#unpopularopinion");
  if (style === "how_to") tags.push("#productivity");
  return [...new Set(tags)].slice(0, count).join(" ");
}
