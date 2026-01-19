import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Sparkles, FileText, Link2, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateDeckModal } from "@/components/CreateDeckModal";
import { ImportContentModal } from "@/components/ImportContentModal";
import Navbar from "@/components/landing/Navbar";

interface CreateCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function CreateCard({ icon, title, description, onClick }: CreateCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center p-8 rounded-2xl border border-border/50",
        "bg-card/50 backdrop-blur-sm transition-all duration-300",
        "hover:border-accent/50 hover:bg-card/80 hover:shadow-xl hover:shadow-accent/5",
        "hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent/50"
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent mb-5 group-hover:bg-accent/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center leading-relaxed">
        {description}
      </p>
    </button>
  );
}

export default function Create() {
  const navigate = useNavigate();
  const [generateOpen, setGenerateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const cards = [
    {
      icon: <Sparkles className="h-7 w-7" />,
      title: "Generate",
      description: "Describe your topic and let AI create a complete deck for you.",
      onClick: () => setGenerateOpen(true),
    },
    {
      icon: <FileText className="h-7 w-7" />,
      title: "Paste in text",
      description: "Paste notes, articles, or outlines to convert into slides.",
      onClick: () => setImportOpen(true),
    },
    {
      icon: <Link2 className="h-7 w-7" />,
      title: "Import file or URL",
      description: "Upload a document or paste a URL to import content.",
      onClick: () => setImportOpen(true),
    },
    {
      icon: <LayoutTemplate className="h-7 w-7" />,
      title: "Generate from template",
      description: "Start with a professional template tailored to your use case.",
      onClick: () => navigate("/dashboard?tab=templates"),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Create with AI | AXORA</title>
        <meta
          name="description"
          content="Create executive-grade presentations with AI. Generate from scratch, paste text, import files, or use templates."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-accent/8 rounded-full blur-[100px] opacity-50" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-success/5 rounded-full blur-[80px]" />
        </div>

        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Create with AI
            </h1>
            <p className="text-lg text-muted-foreground">
              How would you like to get started?
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {cards.map((card) => (
              <CreateCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateDeckModal open={generateOpen} onOpenChange={setGenerateOpen} />
      <ImportContentModal open={importOpen} onOpenChange={setImportOpen} />
    </>
  );
}
