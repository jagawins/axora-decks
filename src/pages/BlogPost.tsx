import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";

// Static blog content - actual content, not placeholder
const blogContent: Record<
  string,
  {
    title: string;
    excerpt: string;
    category: string;
    publishedAt: string;
    author: string;
    content: string;
  }
> = {
  "ai-presentations-executive-guide": {
    title: "The Executive Guide to AI-Powered Presentations",
    excerpt:
      "How senior leaders are using AI to cut presentation creation time by 80% while maintaining the strategic depth boards expect.",
    category: "Strategy",
    publishedAt: "2025-01-15",
    author: "Jag Mariappan",
    content: `
## The Shift in Executive Communication

Senior leaders spend an average of 8 hours per week creating presentations. Board decks, strategy updates, investor pitches — the work compounds. Yet the presentations that matter most often get the least time because executives are, understandably, focused on the business itself.

AI changes this equation fundamentally.

## What AI Presentations Actually Do Well

The misconception is that AI creates generic, lifeless slides. That's true for tools designed for casual users. But AI built for executive communication focuses on different outcomes:

**Structure over decoration.** Boards don't need animations. They need clear frameworks: situation, options, recommendation, timeline. AI excels at organizing complex information into decision-ready formats.

**Density with clarity.** Executive presentations pack more information per slide than consumer decks. AI can maintain high information density while preserving readability — something that takes humans multiple revision passes.

**Consistency across updates.** Quarterly business reviews follow patterns. AI maintains structural consistency while updating the content, eliminating the reformatting tax.

## The 80% Time Reduction

This number comes from executives who've adopted AI presentation tools. The breakdown:

- **First draft:** 5 minutes instead of 2 hours
- **Structural revisions:** 10 minutes instead of 45 minutes  
- **Content refinement:** 15 minutes instead of 1 hour
- **Final polish:** 10 minutes instead of 30 minutes

The total shifts from 4+ hours to under 45 minutes. And the quality often improves because executives spend their time on strategic thinking rather than formatting.

## When AI Presentations Fall Short

AI isn't a replacement for strategic thinking. It structures and articulates — it doesn't generate novel insights. Executives still need to:

- Define the core message and recommendation
- Validate the data and analysis
- Ensure alignment with organizational context
- Add the judgment calls that require human experience

The tool is powerful. The thinking remains yours.
    `,
  },
  "board-deck-best-practices": {
    title: "Board Deck Best Practices: Structure That Drives Decisions",
    excerpt:
      "A framework for organizing board presentations that communicate complex information clearly and drive alignment.",
    category: "Best Practices",
    publishedAt: "2025-01-10",
    author: "Jag Mariappan",
    content: `
## The Purpose of a Board Deck

Board presentations serve one function: enabling informed decisions. Everything else — the design, the data, the narrative — supports this goal.

Yet most board decks fail because they confuse information delivery with decision enablement. A dump of dashboards is not a board deck. A collection of updates is not a board deck.

## The Structure That Works

After reviewing hundreds of board presentations, a pattern emerges in the ones that drive clear outcomes:

### 1. Context (1-2 slides)
Where are we? What's changed since the last meeting? This isn't a recap — it's orientation. Board members context-switch between multiple companies. Help them arrive in your business.

### 2. Performance (2-3 slides)
Metrics against plan. Not every metric — the ones that matter for the decisions ahead. Red, yellow, green works. Trend lines work. Twenty data points do not.

### 3. Strategic Items (3-5 slides each)
The decisions or discussions you need. Each item follows its own structure:
- Situation: What's happening?
- Options: What could we do?
- Recommendation: What should we do and why?
- Ask: What do you need from the board?

### 4. Forward Look (1-2 slides)
What's coming? What should the board think about for next time? This sets up future meetings and manages expectations.

### 5. Appendix
Supporting data for those who want depth. Reference it, don't present it.

## Common Mistakes

**Too many slides.** If you have 40 slides for a 90-minute meeting, you have 40 slides for a 90-minute meeting where nothing gets discussed.

**Burying the ask.** Put your recommendation upfront. Don't make board members hunt for it.

**Overloading slides.** One slide, one point. If you're squinting at your own deck, so will they.

**Missing the "so what."** Data without interpretation is noise. Every chart needs a headline that tells the story.

## The AXIVA Approach

This is why we built AXIVA for executive communication. The AI understands these structures. When you describe a board update, it generates slides that follow decision-ready frameworks — not marketing templates.

Start with the decision you need. Build backward from there.
    `,
  },
  "gamma-vs-axiva-comparison": {
    title: "Gamma vs AXIVA: Which AI Presentation Tool Fits Your Workflow?",
    excerpt:
      "An honest comparison of AI presentation tools for executives who need structured, professional decks.",
    category: "Product",
    publishedAt: "2025-01-05",
    author: "Jag Mariappan",
    content: `
## The AI Presentation Landscape

AI presentation tools have exploded in 2024-2025. Gamma pioneered the category. Beautiful.ai refined the design automation angle. We built AXIVA for a different user: executives who need structured, decision-ready decks.

This comparison is written by AXIVA's founder, so take it with appropriate context. I'll try to be fair, but I obviously believe we've built something valuable.

## Gamma: The Pioneer

Gamma defined what AI presentations could be. Their strengths:

- **Visual design:** Gamma produces visually striking presentations with minimal effort
- **Flexibility:** Supports various content types, embeds, and interactive elements
- **Collaboration:** Strong sharing and co-editing features
- **Speed:** Impressive generation times for complete decks

Gamma works well for marketing content, pitch decks, and presentations where visual impact matters more than structural density.

## AXIVA: Built for Executive Communication

We built AXIVA after years of creating board decks and executive presentations. Different priorities:

- **Structure:** AI trained on executive communication patterns — not marketing templates
- **Density:** Supports high-information slides that boards expect
- **Refinement:** Block-level AI editing preserves formatting while updating content
- **Export:** Clean PDF and presentation exports without platform lock-in

AXIVA works best for board decks, strategy presentations, executive updates, and anywhere that structured thinking matters more than visual flourish.

## Key Differences

| Aspect | Gamma | AXIVA |
|--------|-------|-------|
| Primary use case | Marketing, pitch decks | Executive, board decks |
| Design focus | Visual impact | Information structure |
| AI training | General content | Executive communication |
| Best for | Creative presentations | Decision-ready decks |

## The Honest Take

If you're creating marketing content or investor pitch decks, Gamma does excellent work. If you're preparing board materials, strategy updates, or executive communications, AXIVA is purpose-built for that workflow.

The tools aren't competing for the same job. They're optimized for different outcomes.

Try both. See which fits how you work.
    `,
  },
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogContent[slug] : null;

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container-wide text-center">
            <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The article you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </main>
        <MarketingFooter />
      </>
    );
  }

  const jsonLd = {
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
      url: "https://axiva.ai/founder",
    },
    publisher: {
      "@type": "Organization",
      name: "AXIVA",
    },
  };

  return (
    <>
      <SeoHead
        title={`${post.title} | AXIVA Blog`}
        description={post.excerpt}
        canonicalPath={`/blog/${slug}`}
        ogType="article"
        articlePublishedTime={post.publishedAt}
        articleAuthor={post.author}
        jsonLd={jsonLd}
      />

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <article className="container max-w-3xl">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              to="/blog"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </div>

          {/* Header */}
          <header className="mb-12">
            <div className="mb-4">
              <span className="text-sm font-medium text-accent">
                {post.category}
              </span>
              <span className="mx-2 text-muted-foreground">·</span>
              <time className="text-sm text-muted-foreground">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

            <p className="text-lg text-muted-foreground">{post.excerpt}</p>

            <div className="mt-6 pt-6 border-t border-border">
              <Link
                to="/founder"
                className="inline-flex items-center gap-3 hover:text-accent transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
                  JM
                </div>
                <div>
                  <div className="font-medium">{post.author}</div>
                  <div className="text-sm text-muted-foreground">
                    Founder, AXIVA
                  </div>
                </div>
              </Link>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {post.content.split("\n").map((line, i) => {
              if (line.startsWith("## ")) {
                return (
                  <h2 key={i} className="text-2xl font-bold mt-10 mb-4">
                    {line.replace("## ", "")}
                  </h2>
                );
              }
              if (line.startsWith("### ")) {
                return (
                  <h3 key={i} className="text-xl font-semibold mt-8 mb-3">
                    {line.replace("### ", "")}
                  </h3>
                );
              }
              if (line.startsWith("**") && line.endsWith("**")) {
                return (
                  <p key={i} className="font-semibold">
                    {line.replace(/\*\*/g, "")}
                  </p>
                );
              }
              if (line.startsWith("- ")) {
                return (
                  <li key={i} className="ml-4">
                    {line.replace("- ", "")}
                  </li>
                );
              }
              if (line.startsWith("|")) {
                return null; // Skip table rows for simple rendering
              }
              if (line.trim() === "") {
                return <br key={i} />;
              }
              return (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {line}
                </p>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 rounded-xl bg-accent/5 border border-accent/20 text-center">
            <h3 className="text-xl font-semibold mb-2">
              Ready to create your own executive deck?
            </h3>
            <p className="text-muted-foreground mb-6">
              Try AXIVA free and see how AI can transform your presentations.
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/create">Start Creating</Link>
            </Button>
          </div>
        </article>
      </main>

      <MarketingFooter />
    </>
  );
}
