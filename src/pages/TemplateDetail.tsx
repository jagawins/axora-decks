import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { fetchTemplates, createDeckFromTemplate, type Template } from "@/lib/templates";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function TemplateDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [slug]);

  const loadTemplate = async () => {
    try {
      const templates = await fetchTemplates();
      const found = templates.find((t) => t.slug === slug);
      setTemplate(found || null);
    } catch (error) {
      console.error("Error loading template:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async () => {
    if (!user) {
      navigate("/auth?redirect=/templates");
      return;
    }

    if (!template) return;

    setCreating(true);
    try {
      const { projectId } = await createDeckFromTemplate(template.id, user.id);
      navigate(`/editor/${projectId}`);
    } catch (error) {
      console.error("Error creating deck:", error);
      toast({
        title: "Failed to create deck",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </>
    );
  }

  if (!template) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container-wide text-center">
            <h1 className="text-3xl font-bold mb-4">Template Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The template you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/templates">Browse All Templates</Link>
            </Button>
          </div>
        </main>
        <MarketingFooter />
      </>
    );
  }

  const jsonLd = {
    "@type": "CreativeWork",
    name: template.title,
    description: template.description,
    creator: {
      "@type": "Organization",
      name: "AXIVA",
    },
    keywords: template.tags?.join(", "),
  };

  return (
    <>
      <SeoHead
        title={`${template.title} Template | AXIVA`}
        description={
          template.description ||
          `Use the ${template.title} template to create professional presentations with AXIVA's AI deck generator.`
        }
        canonicalPath={`/template/${template.slug}`}
        keywords={template.tags?.join(", ")}
        jsonLd={jsonLd}
      />

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              to="/templates"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Preview */}
            <div className="order-2 lg:order-1">
              <div className="aspect-video rounded-xl border border-border bg-card overflow-hidden">
                <TemplatePreview blocks={template.preview_blocks || []} />
              </div>
            </div>

            {/* Details */}
            <div className="order-1 lg:order-2">
              <div className="inline-block px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full mb-4">
                {template.category}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {template.title}
              </h1>

              {template.description && (
                <p className="text-lg text-muted-foreground mb-6">
                  {template.description}
                </p>
              )}

              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-muted rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={handleUseTemplate}
                  disabled={creating}
                  className="w-full sm:w-auto"
                >
                  {creating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Use This Template
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link to="/create">Create from Scratch</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </>
  );
}
