import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";
import { getBlogPost } from "@/data/blog-posts";
import BlogPostContent from "@/components/blog/BlogPostContent";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

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
          <div className="mb-8">
            <Link
              to="/blog"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </div>

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

          <BlogPostContent content={post.content} />

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
