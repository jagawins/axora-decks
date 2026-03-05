import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { blogPosts } from "@/data/blog-posts";

export default function Blog() {
  const jsonLd = {
    "@type": "Blog",
    name: "AXIVA Blog",
    description:
      "Executive case studies, templates, and insights on AI-powered presentations for board decks, strategy updates, and investor pitches.",
    publisher: {
      "@type": "Organization",
      name: "AXIVA",
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
        title="Blog | AXIVA - Executive AI Presentation Insights"
        description="Case studies, templates, and best practices for AI-powered executive presentations. Board decks, investor pitches, QBRs, and strategy updates."
        canonicalPath="/blog"
        keywords="AI presentations, executive decks, board presentations, investor pitch deck, quarterly business review, strategy presentation"
        jsonLd={jsonLd}
      />

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          {/* Header */}
          <section className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Executive Presentation Insights
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Case studies, templates, and strategies for executives who build decks that drive decisions.
            </p>
          </section>

          {/* Featured Post */}
          {blogPosts.length > 0 && (
            <section className="mb-12">
              <article className="group relative p-8 md:p-10 rounded-2xl border border-border bg-card hover:border-accent/40 transition-colors">
                <div className="md:max-w-2xl">
                  <span className="inline-block text-xs font-semibold tracking-wider uppercase text-accent mb-3">
                    {blogPosts[0].category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-accent transition-colors">
                    <Link to={`/blog/${blogPosts[0].slug}`}>{blogPosts[0].title}</Link>
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {blogPosts[0].author}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <time className="text-sm text-muted-foreground">
                      {new Date(blogPosts[0].publishedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </article>
            </section>
          )}

          {/* Posts Grid */}
          <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.slice(1).map((post) => (
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
