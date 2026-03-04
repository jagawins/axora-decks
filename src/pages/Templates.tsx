import { useState, useEffect } from "react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { TemplatesGrid } from "@/components/templates/TemplatesGrid";
import { fetchTemplates, type Template } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";
import ExampleDecks from "@/components/landing/ExampleDecks";
import InfographicGenerator from "@/components/infographics/InfographicGenerator";
import { cn } from "@/lib/utils";
import { LayoutTemplate, Sparkles, Image as ImageIcon } from "lucide-react";

type TabId = "templates" | "infographics";

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

  const TABS: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "templates", label: "Templates", icon: <LayoutTemplate className="h-4 w-4" /> },
    { id: "infographics", label: "AI Infographics", icon: <Sparkles className="h-4 w-4" />, badge: "BETA" },
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
              {/* Example Decks */}
              <div className="mb-12">
                <div className="mb-6">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    Complete Example Decks
                  </h1>
                  <p className="text-muted-foreground mt-1 text-lg">
                    Browse full slide decks — no sign-up required
                  </p>
                </div>
                <ExampleDecks />
              </div>

              {/* Template library */}
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
        </div>
      </main>

      <MarketingFooter />
    </>
  );
}
