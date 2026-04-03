/**
 * SocialContentGenerator — Generate LinkedIn and Twitter posts
 * from your deck content.
 *
 * Two modes:
 * 1. From a deck: AI reads your slides and generates social posts
 * 2. From scratch: Pick a topic, AI generates thought leadership content
 *
 * Every post subtly includes AXIVA branding — viral marketing built in.
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, Loader2, Copy, Check, RefreshCw, Twitter,
  Linkedin, FileText, Zap, Hash, ArrowRight, ChevronDown,
} from "lucide-react";

type Platform = "linkedin" | "twitter";
type PostStyle = "thought_leadership" | "case_study" | "hot_take" | "how_to" | "data_insight" | "announcement";

const STYLES: { id: PostStyle; label: string; desc: string; icon: string }[] = [
  { id: "thought_leadership", label: "Thought Leadership", desc: "Share an insight or perspective", icon: "💡" },
  { id: "case_study", label: "Case Study / Win", desc: "Share a result or outcome", icon: "📊" },
  { id: "hot_take", label: "Hot Take", desc: "Bold opinion that sparks discussion", icon: "🔥" },
  { id: "how_to", label: "How-To / Tips", desc: "Practical advice in 3-5 steps", icon: "📝" },
  { id: "data_insight", label: "Data Insight", desc: "Lead with a surprising number", icon: "📈" },
  { id: "announcement", label: "Product Announcement", desc: "Share a new feature or update", icon: "🚀" },
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
  "98 templates later: what we learned about executive decks",
];

interface GeneratedPost {
  platform: Platform;
  content: string;
  hashtags: string[];
  hookLine: string;
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
          topic: "Social media content generation",
          prompt: `Generate 3 ${platform === "linkedin" ? "LinkedIn" : "Twitter/X"} posts about this topic:

TOPIC: ${topic}

${deckContext ? `CONTEXT FROM DECK:\n${deckContext}\n` : ""}

STYLE: ${styleInfo?.label} — ${styleInfo?.desc}

PLATFORM RULES:
${platform === "linkedin" ? `
- LinkedIn posts should be 150-300 words
- Start with a hook line (first 2 lines visible before "see more")
- Use short paragraphs (1-2 sentences each)
- Add line breaks between paragraphs for readability
- End with a question or call to action
- Include 3-5 relevant hashtags at the end
- Mention AXIVA naturally if relevant (not forced)
- Write in first person, conversational professional tone
` : `
- Twitter posts must be under 280 characters
- Lead with the most compelling point
- Use a thread format (3 tweets that work together)
- Each tweet should stand alone but connect to the thread
- Include 2-3 hashtags
- Be punchy, direct, no fluff
- Mention @inaxiva if naturally relevant
`}

FORMAT YOUR RESPONSE AS EXACTLY 3 SECTIONS:
---POST 1---
[full post content including hashtags]
---POST 2---
[full post content including hashtags]
---POST 3---
[full post content including hashtags]

Make each post genuinely useful and engaging. Not salesy. Write like a real executive sharing real insights, not a marketing team.`,
          tone: "executive",
          cardsCount: 1,
        },
      });

      if (error) throw error;

      const outline = data?.outline;
      const responseText = outline?.sections?.map((s: any) =>
        `${s.heading || ""}\n${s.bullets?.join("\n") || s.description || ""}`
      ).join("\n\n") || "";

      // Parse the 3 posts
      const postTexts = responseText.split(/---POST \d+---/).filter((t: string) => t.trim());
      
      const generated: GeneratedPost[] = postTexts.slice(0, 3).map((text: string) => {
        const clean = text.trim();
        const hashtagMatch = clean.match(/#\w+/g);
        const hashtags = hashtagMatch || [];
        const hookLine = clean.split("\n")[0] || "";
        return {
          platform,
          content: clean,
          hashtags,
          hookLine,
        };
      });

      if (generated.length === 0) {
        // Fallback: treat the whole response as one post
        generated.push({
          platform,
          content: responseText.trim(),
          hashtags: responseText.match(/#\w+/g) || [],
          hookLine: responseText.split("\n")[0] || "",
        });
      }

      setPosts(generated);
    } catch (err) {
      console.error("Social content generation failed:", err);
      setPosts([{
        platform,
        content: "Generation failed. Try a more specific topic or check your connection.",
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

  const openInPlatform = (post: GeneratedPost) => {
    if (post.platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://axiva.ai")}`, "_blank");
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}`, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Social Content Generator</h2>
        <p className="text-sm text-muted-foreground mt-1">Generate LinkedIn and Twitter posts from your deck content or any topic. Every share grows your reach.</p>
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

      {/* Topic input */}
      <div>
        <label className="text-sm font-semibold mb-1.5 block">What do you want to post about?</label>
        <Textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g., Why most board presentations fail in the first 30 seconds"
          className="min-h-[72px]"
        />
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

      {/* Optional deck context */}
      <div>
        <label className="text-sm font-semibold mb-1.5 block">
          Deck context <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Textarea
          value={deckContext}
          onChange={e => setDeckContext(e.target.value)}
          placeholder="Paste key points from your deck to make the post more specific..."
          className="min-h-[56px]"
        />
      </div>

      {/* Generate button */}
      <Button onClick={generate} disabled={generating || !topic.trim()} variant="hero" className="gap-2 w-full sm:w-auto">
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {generating ? "Generating 3 posts..." : `Generate ${platform === "linkedin" ? "LinkedIn" : "Twitter"} Posts`}
      </Button>

      {/* Generated posts */}
      {posts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {posts.length} post{posts.length > 1 ? "s" : ""} generated
          </h3>
          {posts.map((post, i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
              {/* Post header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-muted/20">
                <div className="flex items-center gap-2">
                  {platform === "linkedin" ? (
                    <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                  ) : (
                    <Twitter className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium">Post {i + 1}</span>
                  {platform === "twitter" && (
                    <span className="text-[10px] text-muted-foreground">{post.content.length}/280</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => copyPost(i)}>
                    {copied === i ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {copied === i ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => openInPlatform(post)}>
                    <ArrowRight className="h-3 w-3" /> Post
                  </Button>
                </div>
              </div>

              {/* Post content */}
              <div className="p-4">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {post.content}
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" className="gap-2" onClick={generate} disabled={generating}>
            <RefreshCw className="h-4 w-4" /> Regenerate
          </Button>
        </div>
      )}
    </div>
  );
}
