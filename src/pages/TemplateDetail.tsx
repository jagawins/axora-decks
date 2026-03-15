import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Loader2, Download, Sparkles, Zap,
  Layers, BarChart3, Clock, GitCompare, FileText, LayoutGrid, Target, Quote, Lightbulb, Check,
} from "lucide-react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { fetchTemplates, fetchTemplateBlocks, createDeckFromTemplate, type Template, type TemplateBlock } from "@/lib/templates";
import { chunkTemplateBlocks } from "@/lib/template-slides";
import { inferVisualCategory, getCategoryStyle } from "@/components/templates/TemplateThumbnail";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const BLOCK_DISPLAY: Record<string, { icon: typeof BarChart3; label: string }> = {
  chart_block: { icon: BarChart3, label: 'Charts' },
  kpi_dashboard: { icon: BarChart3, label: 'KPI Dashboard' },
  timeline_block: { icon: Clock, label: 'Timeline' },
  comparison_table: { icon: GitCompare, label: 'Comparison Table' },
  flow_diagram: { icon: GitCompare, label: 'Flow Diagram' },
  stat_block: { icon: Target, label: 'Statistics' },
  quote_block: { icon: Quote, label: 'Quotes' },
  card_grid: { icon: LayoutGrid, label: 'Card Grids' },
  exec_summary: { icon: FileText, label: 'Executive Summary' },
  hero_header: { icon: Sparkles, label: 'Hero Header' },
  three_pillars: { icon: LayoutGrid, label: 'Three Pillars' },
  framed_insight: { icon: Lightbulb, label: 'Framed Insights' },
  decision_summary: { icon: Target, label: 'Decision Summary' },
  recommendation_panel: { icon: Target, label: 'Recommendations' },
  scenario_set: { icon: LayoutGrid, label: 'Scenarios' },
};

export default function TemplateDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [template, setTemplate] = useState<Template | null>(null);
  const [allBlocks, setAllBlocks] = useState<TemplateBlock[]>([]);
  const [relatedTemplates, setRelatedTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    loadTemplate();
  }, [slug]);

  const loadTemplate = async () => {
    try {
      const templates = await fetchTemplates();
      const found = templates.find((t) => t.slug === slug);
      setTemplate(found || null);
      if (found) {
        const blocks = await fetchTemplateBlocks(found.id);
        setAllBlocks(blocks);
        // Related templates: same category, excluding self
        setRelatedTemplates(
          templates.filter((t) => t.category === found.category && t.id !== found.id).slice(0, 3)
        );
      }
    } catch (error) {
      console.error("Error loading template:", error);
    } finally {
      setLoading(false);
    }
  };

  const slides = useMemo(() => chunkBlocks(allBlocks), [allBlocks]);

  const blockBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of allBlocks) {
      if (BLOCK_DISPLAY[b.type]) counts.set(b.type, (counts.get(b.type) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([type, count]) => ({ ...BLOCK_DISPLAY[type], count }))
      .sort((a, b) => b.count - a.count);
  }, [allBlocks]);

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
      toast({ title: "Failed to create deck", description: "Please try again.", variant: "destructive" });
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
            <p className="text-muted-foreground mb-8">The template you're looking for doesn't exist.</p>
            <Button asChild><Link to="/templates">Browse All Templates</Link></Button>
          </div>
        </main>
        <MarketingFooter />
      </>
    );
  }

  const visualCat = inferVisualCategory(template.category, template.tags);
  const style = getCategoryStyle(visualCat);

  const jsonLd = {
    "@type": "CreativeWork",
    name: template.title,
    description: template.description,
    creator: { "@type": "Organization", name: "AXIVA" },
    keywords: template.tags?.join(", "),
  };

  return (
    <>
      <SeoHead
        title={`${template.title} Template | AXIVA`}
        description={template.description || `Use the ${template.title} template to create professional presentations with AXIVA's AI deck generator.`}
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

          {/* Hero section */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="text-[11px] px-3 py-1 font-bold text-white border-0" style={{ backgroundColor: style.accent }}>
                {style.label}
              </Badge>
              {template.is_featured && (
                <Badge className="text-[11px] px-3 py-1 font-bold bg-amber-500/90 text-white border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">{template.title}</h1>
            {template.description && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">{template.description}</p>
            )}
          </div>

          {/* Main slide preview */}
          <div className="mb-6">
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-xl shadow-black/10">
              <div className="aspect-video">
                {slides.length > 0 ? (
                  <TemplatePreview blocks={slides[activeSlide]} className="shadow-none border-0 rounded-none w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading slides...</div>
                )}
              </div>
            </div>
          </div>

          {/* Slide gallery strip */}
          {slides.length > 1 && (
            <div className="mb-10 overflow-x-auto pb-2">
              <div className="flex gap-3">
                {slides.map((slideBlocks, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={cn(
                      'relative shrink-0 w-36 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all duration-200',
                      i === activeSlide
                        ? 'border-accent ring-1 ring-accent/30 shadow-md'
                        : 'border-border/30 opacity-60 hover:opacity-100 hover:border-border'
                    )}
                  >
                    <TemplatePreview blocks={slideBlocks} className="shadow-none border-0 rounded-none w-full h-full" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-0.5">
                      <span className="text-[10px] text-white font-medium">Slide {i + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA + Details grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Left: CTA + Trust signals */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-5">
                <Button
                  size="lg"
                  onClick={handleUseTemplate}
                  disabled={creating}
                  className="w-full gap-2"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Use This Template
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/create">Create from Scratch</Link>
                </Button>

                {/* Trust signals */}
                <div className="space-y-3 pt-3 border-t border-border/30">
                  {[
                    { icon: Zap, text: 'Fully customizable with AI' },
                    { icon: Download, text: 'Export to PowerPoint (PPTX)' },
                    { icon: Layers, text: `${slides.length} professionally designed slides` },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-accent" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 text-xs bg-muted/50 text-muted-foreground rounded-lg border border-border/30">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: What's Included */}
            <div className="lg:col-span-2">
              {blockBreakdown.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <h2 className="text-lg font-semibold mb-4 text-foreground">What's Included</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {blockBreakdown.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/20 border border-border/20">
                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4 text-accent" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{item.label}</div>
                            <div className="text-[11px] text-muted-foreground">{item.count} {item.count > 1 ? 'blocks' : 'block'}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Templates */}
          {relatedTemplates.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold tracking-tight mb-6 text-foreground">Related Templates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedTemplates.map((t) => (
                  <Link
                    key={t.id}
                    to={`/template/${t.slug}`}
                    className="group rounded-2xl overflow-hidden border border-border/50 bg-card hover:border-accent/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      {t.preview_blocks && t.preview_blocks.length > 0 ? (
                        <TemplatePreview
                          blocks={t.preview_blocks.slice(0, 3)}
                          className="shadow-none border-0 rounded-none w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                          <LayoutGrid className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-3 border-t border-border/30">
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors text-sm tracking-tight">
                        {t.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky CTA bar on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{template.title}</div>
          <div className="text-[11px] text-muted-foreground">{slides.length} slides · PPTX</div>
        </div>
        <Button size="sm" onClick={handleUseTemplate} disabled={creating} className="gap-1.5 shrink-0">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Use Template
        </Button>
      </div>

      <MarketingFooter />
    </>
  );
}
