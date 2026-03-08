import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiEngine } from "@/lib/ai-engine";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axivaWordmark from "@/assets/axiva-wordmark-dark.svg";

const Onboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genStage, setGenStage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Check if user already has projects — if so, send to dashboard
  useEffect(() => {
    if (!user) return;
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => {
        if (count && count > 0) {
          navigate("/dashboard", { replace: true });
        }
      });
  }, [user, navigate]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;

    setGenerating(true);
    setGenStage("Creating project…");
    try {
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({ title: prompt.trim().slice(0, 80), user_id: user.id })
        .select()
        .single();

      if (projectError || !newProject) throw new Error("Failed to create project");

      setGenStage("Building outline…");
      const result = await aiEngine.generateFromPrompt({
        topic: prompt.trim(),
        tone: "executive",
      });

      setGenStage("Assembling slides…");
      if (result.blocks.length > 0) {
        const blocksToInsert = result.blocks.map((block, index) => ({
          project_id: newProject.id,
          type: block.type,
          content: block.content as Record<string, unknown>,
          order_index: index,
        }));
        await supabase.from("blocks").insert(blocksToInsert as any);
      }

      setGenStage("Finalising…");
      toast({
        title: "Your first deck is ready!",
        description: "AI generated a complete draft for you.",
      });
      navigate(`/editor/${newProject.id}`);
    } catch (error) {
      console.error("Onboarding deck generation error:", error);
      toast({
        title: "Generation failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-xl px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center justify-center mb-6">
            <img src={axivaWordmark} alt="AXIVA" className="h-8 w-auto" />
          </a>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Create your first deck</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            What are you presenting?
          </h1>
          <p className="text-muted-foreground text-lg">
            Describe your deck in one sentence. We'll build a polished first draft in under 2 minutes.
          </p>
        </div>

        {/* Prompt input */}
        <div className="glass-card p-6 space-y-5">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 'Seed round pitch for an AI recruiting startup' or 'Q4 board update with revenue metrics'"
            className="bg-muted/50 resize-none text-base min-h-[100px]"
            rows={3}
            disabled={generating}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />

          <Button
            variant="hero"
            size="xl"
            className="w-full group"
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Generating your deck…
              </>
            ) : (
              <>
                Generate My Deck
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>

        {/* Skip */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            Skip — I'll start from scratch
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
