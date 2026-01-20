import { useState, useEffect } from "react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { TemplatesGrid } from "@/components/templates/TemplatesGrid";
import { fetchTemplates, type Template } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";

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
        title="Presentation Templates | AXORA - AI Deck Generator"
        description="60+ professional presentation templates for board decks, executive summaries, product roadmaps, and sales playbooks. Start with a template and customize with AI."
        canonicalPath="/templates"
        keywords="presentation templates, executive deck templates, board deck template, pitch deck template, AI presentation templates"
      />

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Template Gallery
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with a professionally designed template. Customize with AI or edit manually.
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
