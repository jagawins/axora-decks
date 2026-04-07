/**
 * SocialContentGenerator v2 — Viral-quality LinkedIn and Twitter posts
 *
 * Generates properly formatted posts with:
 * - Hook-first structure (first 2 lines grab attention)
 * - Short paragraphs with line breaks
 * - Emoji usage where appropriate
 * - Hashtag strategy
 * - Image/diagram suggestions per post
 * - Copy-paste ready formatting
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, Loader2, Copy, Check, RefreshCw, Twitter,
  Linkedin, ArrowRight, ChevronDown, Image, Download,
} from "lucide-react";

type Platform = "linkedin" | "twitter";
type PostStyle = "thought_leadership" | "case_study" | "hot_take" | "how_to" | "data_insight" | "announcement";

const STYLES: { id: PostStyle; label: string; desc: string; icon: string }[] = [
  { id: "thought_leadership", label: "Thought Leadership", desc: "Share an insight or perspective", icon: "💡" },
  { id: "case_study", label: "Case Study / Win", desc: "Share a result or outcome", icon: "📊" },
  { id: "hot_take", label: "Hot Take", desc: "Bold opinion that sparks discussion", icon: "🔥" },
  { id: "how_to", label: "How-To / Tips", desc: "Practical advice in 3-5 steps", icon: "📝" },
  { id: "data_insight", label: "Data Insight", desc: "Lead with a surprising number", icon: "📈" },
  { id: "announcement", label: "Announcement", desc: "Share a new feature or update", icon: "🚀" },
];

const TOPIC_SUGGESTIONS = [
  "Why most presentations fail in the first 30 seconds",
  "The difference between a deck and a decision tool",
  "How AI is changing executive communication",
  "3 things board members want to see (and 3 they don't)",
  "Why your all-hands needs anonymous Q&A",
  "The consulting slide structure that gets approvals",
  "Smart Slides: presentations that adapt to what the audience says",
  "Stop using Slido as a separate tool",
  "Voice-powered presentations are here",
  "I built a presentation tool and here is what I learned",
];

interface GeneratedPost {
  platform: Platform;
  content: string;
  hashtags: string[];
  hookLine: string;
  imageSuggestion?: string;
}

export default function SocialContentGenerator() {
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [style, setStyle] = useState<PostStyle>("thought_leadership");
  const [topic, setTopic] = useState("");
  const [deckContext, setDeckContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [showTopics, setShowTopics] = useState(false);

  const generate = useCallback(async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setPosts([]);

    try {
      const styleInfo = STYLES.find(s => s.id === style);

      const { data, error } = await supabase.functions.invoke("generate-outline", {
        body: {
          topic: topic,
          prompt: platform === "linkedin"
            ? buildLinkedInPrompt(topic, styleInfo, deckContext)
            : buildTwitterPrompt(topic, styleInfo, deckContext),
          tone: "executive",
          cardsCount: 3,
        },
      });

      if (error) throw error;

      const outline = data?.outline;
      const sections = outline?.sections || [];

      // Build posts from outline sections
      const generated: GeneratedPost[] = sections.slice(0, 3).map((section: any, i: number) => {
        const heading = section.heading || "";
        const desc = section.description || "";
        const bullets = section.bullets || [];

        let content: string;

        if (platform === "linkedin") {
          const parts: string[] = [];

          // Hook line from heading
          if (heading && !heading.toLowerCase().startsWith("post")) {
            parts.push(heading);
            parts.push("");
          }

          // Body paragraphs from description (split into short paras)
          if (desc) {
            const sentences = desc.split(/(?<=\.)\s+/);
            for (let j = 0; j < sentences.length; j += 2) {
              const para = sentences.slice(j, j + 2).join(" ").trim();
              if (para) {
                parts.push(para);
                parts.push("");
              }
            }
          }

          // Bullet points as formatted lines
          if (bullets.length > 0) {
            bullets.forEach((b: string) => {
              const clean = b.replace(/^[-•*]\s*/, "").trim();
              if (clean) parts.push(clean);
            });
            parts.push("");
          }

          content = parts.join("\n").trim();

          // Add AXIVA branding + hashtags
          const brandLine = "🔗 Built with AXIVA — axiva.ai";
          const hashtags = content.includes("#") ? "" : "\n" + generateHashtags(topic, style);
          content += "\n\n" + brandLine + hashtags;
        } else {
          // Twitter: combine and truncate, leave room for branding
          const all = [heading, desc, ...bullets].filter(Boolean).join(" ").trim();
          const brand = " via @inaxiva axiva.ai";
          const hashStr = generateHashtags(topic, style, 2);
          const maxLen = 280 - brand.length - hashStr.length - 2;
          content = all.substring(0, maxLen) + brand;
          if (!content.includes("#")) {
            content += " " + hashStr;
          }
          if (content.length > 280) content = content.substring(0, 277) + "...";
        }

        return {
          platform,
          content,
          hashtags: content.match(/#\w+/g) || [],
          hookLine: content.split("\n")[0] || "",
          imageSuggestion: getImageSuggestion(style, i),
        };
      });

      if (generated.length === 0) {
        generated.push({
          platform,
          content: "Generation returned empty. Try a more specific topic or add deck context.",
          hashtags: [],
          hookLine: "",
        });
      }

      setPosts(generated);
    } catch (err) {
      console.error("Social content generation failed:", err);
      setPosts([{
        platform,
        content: "Generation failed. Check your connection and try again.",
        hashtags: [],
        hookLine: "",
      }]);
    } finally {
      setGenerating(false);
    }
  }, [topic, platform, style, deckContext]);

  const copyPost = (index: number) => {
    navigator.clipboard.writeText(posts[index].content);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadImage = (post: GeneratedPost, index: number) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1200;
    const H = 630;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0f0f14");
    grad.addColorStop(1, "#1a1a2e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle accent glow
    const glowGrad = ctx.createRadialGradient(W * 0.8, H * 0.3, 0, W * 0.8, H * 0.3, 400);
    glowGrad.addColorStop(0, "rgba(124, 58, 237, 0.08)");
    glowGrad.addColorStop(1, "rgba(124, 58, 237, 0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H);

    // Extract hook line (first meaningful line)
    const lines = post.content.split("\n").filter(l => l.trim() && !l.startsWith("#") && !l.startsWith("🔗"));
    const hookLine = lines[0] || post.hookLine || "Insight";
    const bodyLines = lines.slice(1, 5).filter(l => l.trim() && !l.startsWith("#") && !l.startsWith("🔗"));

    // Hook text (large, white)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px system-ui, -apple-system, sans-serif";
    const wrappedHook = wrapText(ctx, hookLine, W - 160);
    let y = 80;
    wrappedHook.forEach(line => {
      ctx.fillText(line, 80, y);
      y += 52;
    });

    // Accent line
    y += 10;
    ctx.fillStyle = "#7c3aed";
    ctx.fillRect(80, y, 80, 4);
    y += 30;

    // Body text (smaller, gray)
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "400 22px system-ui, -apple-system, sans-serif";
    bodyLines.forEach(line => {
      const clean = line.replace(/^[-•*]\s*/, "").trim();
      if (!clean) return;
      const wrapped = wrapText(ctx, clean, W - 160);
      wrapped.forEach(wl => {
        if (y < H - 100) {
          ctx.fillText(wl, 80, y);
          y += 30;
        }
      });
      y += 8;
    });

    // Bottom bar with AXIVA branding
    ctx.fillStyle = "rgba(124, 58, 237, 0.1)";
    ctx.fillRect(0, H - 70, W, 70);

    ctx.fillStyle = "#7c3aed";
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    ctx.fillText("AXIVA", 80, H - 30);

    ctx.fillStyle = "#71717a";
    ctx.font = "400 16px system-ui, -apple-system, sans-serif";
    ctx.fillText("axiva.ai", 160, H - 30);

    // Right side: platform icon hint
    ctx.fillStyle = "#52525b";
    ctx.font = "400 14px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(platform === "linkedin" ? "linkedin.com" : "x.com", W - 80, H - 30);
    ctx.textAlign = "left";

    // Download
    const link = document.createElement("a");
    link.download = `axiva-post-${index + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const openInPlatform = (post: GeneratedPost) => {
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
        <p className="text-sm text-muted-foreground mt-1">Generate viral LinkedIn and Twitter posts. Each post includes a hook, formatted body, hashtags, and image suggestions.</p>
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
      </div>

      {/* Style selector */}
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
        <label className="text-sm font-semibold mb-1.5 block">What do you want to post about?</label>
        <Textarea value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g., Why most board presentations fail in the first 30 seconds" className="min-h-[72px]" />
        <button onClick={() => setShowTopics(!showTopics)}
          className="text-[11px] text-accent font-medium mt-1.5 flex items-center gap-1 hover:underline">
          <Sparkles className="h-3 w-3" /> Topic suggestions
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

      {/* Deck context */}
      <div>
        <label className="text-sm font-semibold mb-1.5 block">
          Deck context <span className="text-muted-foreground font-normal">(optional, paste key points)</span>
        </label>
        <Textarea value={deckContext} onChange={e => setDeckContext(e.target.value)}
          placeholder="Paste key points, stats, or talking points from your deck..." className="min-h-[56px]" />
      </div>

      {/* Generate */}
      <Button onClick={generate} disabled={generating || !topic.trim()} variant="hero" className="gap-2 w-full sm:w-auto">
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {generating ? "Writing 3 viral posts..." : `Generate ${platform === "linkedin" ? "LinkedIn" : "Twitter"} Posts`}
      </Button>

      {/* Results */}
      {posts.length > 0 && (
        <div className="space-y-5">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {posts.length} post{posts.length > 1 ? "s" : ""} generated
          </h3>
          {posts.map((post, i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-muted/20">
                <div className="flex items-center gap-2">
                  {platform === "linkedin" ? <Linkedin className="h-4 w-4 text-[#0A66C2]" /> : <Twitter className="h-4 w-4" />}
                  <span className="text-xs font-medium">Post {i + 1}</span>
                  {platform === "twitter" && (
                    <span className={cn("text-[10px]", post.content.length > 280 ? "text-red-500 font-bold" : "text-muted-foreground")}>
                      {post.content.length}/280
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => copyPost(i)}>
                    {copied === i ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {copied === i ? "Copied" : "Copy text"}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => downloadImage(post, i)}>
                    <Download className="h-3 w-3" /> Image
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => openInPlatform(post)}>
                    <ArrowRight className="h-3 w-3" /> Post
                  </Button>
                </div>
              </div>

              {/* Branded image card preview */}
              <div className="p-4 sm:p-5">
                <BrandedImageCard post={post} index={i} style={style} />
              </div>

              {/* Text content (copy-paste ready) */}
              <div className="border-t border-border/30 px-4 py-3 sm:px-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Post text (copy-paste ready)</p>
                <div className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground max-h-40 overflow-y-auto">{post.content}</div>
              </div>

              {/* Image suggestion */}
              {post.imageSuggestion && (
                <div className="border-t border-border/30 bg-amber-500/[0.03] px-4 py-3 flex items-start gap-2.5">
                  <Image className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">Additional image idea</p>
                    <p className="text-xs text-muted-foreground">{post.imageSuggestion}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={generate} disabled={generating}>
              <RefreshCw className="h-4 w-4" /> Regenerate all
            </Button>
            <p className="text-[10px] text-muted-foreground">Each generation creates 3 unique variants</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Text wrapping helper for canvas ──────────────────────── */

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/* ── Branded Image Card (inline preview) ─────────────────── */

function BrandedImageCard({ post, index, style }: { post: GeneratedPost; index: number; style: PostStyle }) {
  const lines = post.content.split("\n").filter(l => l.trim() && !l.startsWith("#") && !l.startsWith("🔗") && !l.startsWith("via @"));
  const hookLine = lines[0] || "";
  const bodyLines = lines.slice(1, 4).map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);

  const ACCENT_COLORS: Record<PostStyle, string> = {
    thought_leadership: "#7c3aed",
    case_study: "#10b981",
    hot_take: "#ef4444",
    how_to: "#3b82f6",
    data_insight: "#f59e0b",
    announcement: "#ec4899",
  };
  const accent = ACCENT_COLORS[style] || "#7c3aed";

  return (
    <div className="rounded-xl overflow-hidden border border-border/30 bg-[#0f0f14] text-white aspect-[1200/630] relative flex flex-col justify-between p-6 sm:p-8">
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 rounded-full opacity-10 blur-3xl" style={{ background: accent }} />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <p className="text-base sm:text-lg md:text-xl font-bold leading-snug mb-3" style={{ lineHeight: 1.3 }}>
          {hookLine}
        </p>
        <div className="w-12 h-1 rounded-full mb-3" style={{ backgroundColor: accent }} />
        {bodyLines.map((line, j) => (
          <p key={j} className="text-[10px] sm:text-xs text-gray-400 leading-relaxed mb-1">{line}</p>
        ))}
      </div>

      {/* Bottom bar with branding */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: accent }}>AXIVA</span>
          <span className="text-[10px] text-gray-500">axiva.ai</span>
        </div>
        <span className="text-[10px] text-gray-600">{post.platform === "linkedin" ? "linkedin.com" : "x.com"}</span>
      </div>
    </div>
  );
}

/* ── Prompt builders ─────────────────────────────────────── */

function buildLinkedInPrompt(topic: string, styleInfo: any, deckContext: string): string {
  return `Write 3 viral LinkedIn posts about: "${topic}"

${deckContext ? `Use these specific details:\n${deckContext}\n` : ""}

STYLE: ${styleInfo?.label} — ${styleInfo?.desc}

RULES FOR EACH POST:
1. HOOK (heading): First 1-2 lines MUST grab attention. Use a surprising stat, contrarian opinion, bold claim, or provocative question. This is what people see before clicking "see more."
2. BODY (description): Write 4-6 short paragraphs. Each paragraph is 1-2 sentences max. This creates the scannable format that performs on LinkedIn.
3. Use one of these proven formats:
   - Story: "I used to think X. Then Y happened. Now I believe Z."
   - Lesson: "3 things I learned about [topic]:"
   - Contrarian: "Everyone says X. They are wrong. Here is why."
   - Data-led: "X% of [thing]. That number changed how I see [topic]."
4. CLOSING (last bullet): End with a question that invites comments or a clear takeaway. Add 3-5 hashtags.
5. TONE: First person. Conversational. Like telling a smart colleague over coffee. Not corporate. Not salesy.
6. AXIVA MENTION: Naturally weave in a mention of AXIVA (axiva.ai) as the tool you used or recommend. Don't force it. Examples: "I used AXIVA to generate this deck in 12 seconds" or "Tools like AXIVA are making this possible" or "This is what convinced me to build AXIVA."
7. Each of the 3 posts MUST use a DIFFERENT angle and hook style.

Return heading as the hook line, description as the body, and bullets for key points/CTA/hashtags.`;
}

function buildTwitterPrompt(topic: string, styleInfo: any, deckContext: string): string {
  return `Write 3 standalone Twitter/X posts about: "${topic}"

${deckContext ? `Context:\n${deckContext}\n` : ""}

STYLE: ${styleInfo?.label}

RULES:
1. Each MUST be under 220 characters (room for branding link)
2. Lead with the punchiest statement possible
3. Be provocative enough to get quote tweets and replies
4. Include 1-2 hashtags at the end
5. Mention @inaxiva naturally in at least one of the three posts
6. No thread format. 3 standalone bangers.

Return heading as the tweet text.`;
}

function generateHashtags(topic: string, style: PostStyle, count: number = 4): string {
  const t = topic.toLowerCase();
  const tags: string[] = ["#leadership"];

  if (t.includes("presentation") || t.includes("deck") || t.includes("slide")) tags.push("#presentations", "#publicspeaking");
  if (t.includes("ai") || t.includes("artificial")) tags.push("#AI", "#generativeAI");
  if (t.includes("board") || t.includes("executive")) tags.push("#executivecommunication");
  if (t.includes("startup") || t.includes("pitch")) tags.push("#startups", "#fundraising");
  if (t.includes("sales") || t.includes("deal")) tags.push("#sales", "#B2B");
  if (t.includes("consulting")) tags.push("#consulting", "#strategy");
  if (style === "hot_take") tags.push("#unpopularopinion");
  if (style === "how_to") tags.push("#productivity");
  if (style === "data_insight") tags.push("#data");

  return [...new Set(tags)].slice(0, count).join(" ");
}

function getImageSuggestion(style: PostStyle, index: number): string {
  const suggestions: Record<PostStyle, string[]> = {
    thought_leadership: [
      "Text-on-image quote card: your boldest sentence in large white text on a dark gradient background with your name and title at the bottom.",
      "Simple before/after diagram showing the old way vs your insight. Two columns, minimal design, dark background.",
      "Screenshot a key slide from your deck with a red circle highlighting the key insight.",
    ],
    case_study: [
      "KPI card with the headline result. Large number (e.g., '12.4 seconds'), small label, brand purple accent.",
      "Before/after comparison. Left: old way in gray/red. Right: new result in green. Include the key metric.",
      "Timeline: problem → solution → result. Three nodes connected by a line. Clean, minimal.",
    ],
    hot_take: [
      "Bold text image: your hot take centered in large font on a solid dark background. No decoration, just the statement.",
      "Two-column comparison: 'What everyone thinks' vs 'What actually works'. Simple icons, contrasting colors.",
      "Meme-style: a relatable image with your contrarian take as an overlay. Professional but punchy.",
    ],
    how_to: [
      "Numbered carousel: each step gets its own card with a large step number, icon, and one-line description.",
      "Flowchart showing the process from start to finish. 3-5 steps, connected by arrows, clean layout.",
      "Infographic: one row per tip, icon on the left, text on the right. Vertical, scannable.",
    ],
    data_insight: [
      "Bar chart with one highlighted bar. The key stat in a different color, everything else in gray.",
      "Giant number card: the headline stat in 72pt+ font with context in 14pt below it.",
      "Trend line with an arrow pointing to the key inflection point. Minimal labels, clean axes.",
    ],
    announcement: [
      "Product screenshot with a 'NEW' badge in the corner. Show the feature being used, not just a logo.",
      "Feature comparison: 'Before' column vs 'Now' column. Check marks for new capabilities.",
      "3-panel image: before → during → after. Showing the feature's impact visually.",
    ],
  };

  return (suggestions[style] || suggestions.thought_leadership)[index % 3];
}
