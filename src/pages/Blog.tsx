import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";

// Static blog posts - no placeholder text
const blogPosts = [
  {
    slug: "ai-presentations-executive-guide",
    title: "The Executive Guide to AI-Powered Presentations",
    excerpt:
      "How senior leaders are using AI to cut presentation creation time by 80% while maintaining the strategic depth boards expect.",
    category: "Strategy",
    publishedAt: "2025-01-15",
    author: "Jag Mariappan",
  },
  {
    slug: "board-deck-best-practices",
    title: "Board Deck Best Practices: Structure That Drives Decisions",
    excerpt:
      "A framework for organizing board presentations that communicate complex information clearly and drive alignment.",
    category: "Best Practices",
    publishedAt: "2025-01-10",
    author: "Jag Mariappan",
  },
  {
    slug: "gamma-vs-axora-comparison",
    title: "Gamma vs AXORA: Which AI Presentation Tool Fits Your Workflow?",
    excerpt:
      "An honest comparison of AI presentation tools for executives who need structured, professional decks.",
    category: "Product",
    publishedAt: "2025-01-05",
    author: "Jag Mariappan",
  },
];

export default function Blog() {
  const jsonLd = {
    "@type": "Blog",
    name: "AXORA Blog",
    description:
      "Insights on AI presentations, executive communication, and building effective board decks.",
    publisher: {
      "@type": "Organization",
      name: "AXORA",
    },
    blogPost: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      author: {
        "@type": "Person",
        name: post.author,
      },
    })),
  };

  return (
    <>
      <SeoHead
        title="Blog | AXORA - AI Presentation Insights"
        description="Insights on AI presentations, executive communication, and building effective board decks from AXORA founder Jag Mariappan."
        canonicalPath="/blog"
        keywords="AI presentations, executive decks, board presentations, presentation tips"
        jsonLd={jsonLd}
      />

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          {/* Header */}
          <section className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              AXORA Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Insights on AI presentations, executive communication, and building decks that drive decisions.
            </p>
          </section>

          {/* Posts Grid */}
          <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="group p-6 rounded-xl border border-border bg-card hover:border-accent/50 transition-colors"
              >
                <div className="mb-4">
                  <span className="text-xs font-medium text-accent">
                    {post.category}
                  </span>
                  <span className="mx-2 text-muted-foreground">·</span>
                  <time className="text-xs text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>

                <h2 className="text-xl font-semibold mb-3 group-hover:text-accent transition-colors">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    By {post.author}
                  </span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm text-accent hover:underline"
                  >
                    Read more <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>

      <MarketingFooter />
    </>
  );
}
