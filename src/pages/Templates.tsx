import { useState, useEffect, useMemo } from "react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { TemplatesGrid } from "@/components/templates/TemplatesGrid";
import { fetchTemplates, type Template } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";
import ExampleDecks from "@/components/landing/ExampleDecks";
import InfographicGenerator from "@/components/infographics/InfographicGenerator";
import DataVisualsGenerator from "@/components/datavisuals/DataVisualsGenerator";
import TimelineGenerator from "@/components/timelines/TimelineGenerator";
import SlideInspiration from "@/components/slides/SlideInspiration";
import { cn } from "@/lib/utils";
import { LayoutTemplate, Sparkles, Crown, ArrowRight, Layers, Download, Zap, BarChart3, CalendarDays, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
type TabId = "templates" | "infographics" | "data-visuals" | "timelines" | "inspiration";

export default function Templates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("templates");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast({
        title: "Failed to load templates",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Staff Picks: featured templates
  const staffPicks = useMemo(
    () => templates.filter((t) => t.is_featured).slice(0, 3),
    [templates]
  );

  const TABS: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "templates", label: "Templates", icon: <LayoutTemplate className="h-4 w-4" /> },
    { id: "infographics", label: "AI Infographics", icon: <Sparkles className="h-4 w-4" />, badge: "BETA" },
    { id: "data-visuals", label: "Data & Visuals", icon: <BarChart3 className="h-4 w-4" />, badge: "NEW" },
    { id: "timelines", label: "Timelines", icon: <CalendarDays className="h-4 w-4" />, badge: "PRO" },
    { id: "inspiration", label: "Slide Library", icon: <Search className="h-4 w-4" />, badge: "NEW" },
  ];

  return (
    <>
      <SeoHead
        title="Presentation Templates | Axiva — AI Deck Generator"
        description="60+ professional presentation templates for board decks, executive summaries, product roadmaps, and sales playbooks. Start with a template and customize with AI."
        canonicalPath="/templates"
        keywords="presentation templates, executive deck templates, board deck template, pitch deck template, AI presentation templates, AI infographic generator"
      />

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mb-8 border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors relative",
                  activeTab === tab.id
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent uppercase">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <>
              {/* ── Premium Hero Section ── */}
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-accent/5 mb-12 p-8 sm:p-12">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="h-5 w-5 text-accent" />
                      <span className="text-xs font-bold uppercase tracking-widest text-accent">Premium Collection</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-3">
                      {templates.length}+ Executive Templates
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl">
                      Board-ready decks, investor pitches, and strategy presentations.
                      Every template is AI-customizable and exports to PowerPoint.
                    </p>
                    <div className="flex items-center gap-4 mt-5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-accent" />
                        AI Editable
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Download className="h-4 w-4 text-accent" />
                        PPTX Export
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-accent" />
                        Multi-slide
                      </span>
                    </div>
                  </div>
                  <Button size="lg" className="gap-2 shrink-0" asChild>
                    <Link to="/create">
                      Create from Scratch
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* ── Staff Picks ── */}
              {staffPicks.length >= 3 && (
                <div className="mb-14">
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Staff Picks</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {staffPicks.map((t) => (
                      <Link
                        key={t.id}
                        to={`/template/${t.slug}`}
                        className="group relative rounded-2xl overflow-hidden border border-border/50 bg-card hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 hover:scale-[1.01]"
                      >
                        <div className="aspect-[16/10] overflow-hidden">
                          {t.preview_blocks && t.preview_blocks.length > 0 ? (
                            <TemplatePreview
                              blocks={t.preview_blocks.slice(0, 3)}
                              className="shadow-none border-0 rounded-none w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                              <LayoutTemplate className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="px-5 py-4 border-t border-border/30">
                          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors text-[15px] tracking-tight">
                            {t.title}
                          </h3>
                          {t.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                          )}
                        </div>
                        <div className="absolute top-3 left-3">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-semibold backdrop-blur-sm shadow-sm">
                            <Sparkles className="h-3 w-3" />
                            Staff Pick
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Example Decks ── */}
              <div className="mb-12">
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Complete Example Decks
                  </h2>
                  <p className="text-muted-foreground mt-1 text-lg">
                    Browse full slide decks — no sign-up required
                  </p>
                </div>
                <ExampleDecks />
              </div>

              {/* ── All Templates ── */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  All Templates
                </h2>
                <p className="text-muted-foreground mt-1">
                  Start with a professionally designed template, or create your own
                </p>
              </div>

              <TemplatesGrid
                templates={templates}
                loading={loading}
                onRefresh={loadTemplates}
              />
            </>
          )}

          {/* AI Infographics Tab */}
          {activeTab === "infographics" && (
            <div className="py-4">
              <InfographicGenerator />
            </div>
          )}

          {/* Data & Visuals Tab */}
          {activeTab === "data-visuals" && (
            <div className="py-4">
              <DataVisualsGenerator />
            </div>
          )}

          {/* Timelines Tab */}
          {activeTab === "timelines" && (
            <div className="py-4">
              <TimelineGenerator />
            </div>
          )}

          {/* Slide Inspiration Library Tab */}
          {activeTab === "inspiration" && (
            <div className="py-4">
              <SlideInspiration />
            </div>
          )}
        </div>
      </main>

      <MarketingFooter />
    </>
  );
}
