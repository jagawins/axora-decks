import { useState, useEffect } from "react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { TemplatesGrid } from "@/components/templates/TemplatesGrid";
import { fetchTemplates, type Template } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";
import ExampleDecks from "@/components/landing/ExampleDecks";

export default function Templates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <SeoHead
        title="Presentation Templates | Axora — AI Deck Generator"
        description="60+ professional presentation templates for board decks, executive summaries, product roadmaps, and sales playbooks. Start with a template and customize with AI."
        canonicalPath="/templates"
        keywords="presentation templates, executive deck templates, board deck template, pitch deck template, AI presentation templates"
      />

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          {/* Example Decks — front and center, no sign-up needed */}
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
        </div>
      </main>

      <MarketingFooter />
    </>
  );
}
