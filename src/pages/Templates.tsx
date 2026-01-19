import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
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
      <Helmet>
        <title>Templates | AXORA - AI Presentation Generator</title>
        <meta
          name="description"
          content="Browse 60+ professional presentation templates for executive summaries, board decks, product roadmaps, sales playbooks, and more. Start with a template and customize with AI."
        />
        <meta
          name="keywords"
          content="presentation templates, executive deck templates, board deck template, product roadmap template, sales playbook template, pitch deck template"
        />
        <link rel="canonical" href="https://axora.lovable.app/templates" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Template Gallery
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with a professionally designed template. Customize with AI or edit manually.
            </p>
          </div>

          {/* Templates Grid */}
          <TemplatesGrid
            templates={templates}
            loading={loading}
            onRefresh={loadTemplates}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
