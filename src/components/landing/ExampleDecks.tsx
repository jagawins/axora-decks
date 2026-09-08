import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchExampleDecks, type Template, createDeckFromTemplate } from "@/lib/templates";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SAMPLE_DECKS } from "@/data/sample-decks";
import SampleSlideRenderer from "@/components/sample/SampleSlideRenderer";
import { trackProductEvent } from "@/lib/product-events";

/**
 * Landing examples.
 *
 * Every card opens the local sample explorer at /demo?deck=<id> — no seeded
 * database records required, so there are no disabled dead ends. When a real
 * template record happens to exist for the same story, an extra "Use as
 * template" action appears; otherwise it is simply absent.
 */
const TEMPLATE_SLUG_BY_SAMPLE: Record<string, string> = {
  "board-update": "example-fintech-board-update",
  "investor-pitch": "example-mediflow-investor-pitch",
  "strategy-review": "example-cloudsync-gtm-strategy",
  "quarterly-review": "example-city-innovation-quarterly",
};

export default function ExampleDecks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  // Optional, lazy: templates only enrich the cards, they never gate them.
  useEffect(() => {
    if (fetchedRef.current || !sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fetchedRef.current) {
          fetchedRef.current = true;
          fetchExampleDecks().then(setTemplates).catch(() => setTemplates([]));
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleUseTemplate = useCallback(
    async (templateId: string) => {
      if (!user) {
        navigate("/auth?mode=signup&next=%2Ftemplates");
        return;
      }
      try {
        const { projectId } = await createDeckFromTemplate(templateId, user.id);
        toast({ title: "Deck created", description: "A copy of the example is in your editor." });
        navigate(`/editor/${projectId}`);
      } catch {
        toast({ title: "Could not create the deck", description: "Please try again.", variant: "destructive" });
      }
    },
    [user, navigate, toast]
  );

  return (
    <section ref={sectionRef} className="section-padding border-t border-border/40">
      <div className="container-wide">
        <div className="max-w-2xl">
          <p className="mb-4 border-l-2 border-accent pl-3 text-[13px] font-medium uppercase tracking-[0.16em] text-accent">
            Sample output
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            Four decisions, four decks
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Open any of these and read them slide by slide. The companies and
            figures are fictional, chosen to show how a recommendation, its
            evidence, the risks and the next steps hold together.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {SAMPLE_DECKS.map((deck) => {
            const templateSlug = TEMPLATE_SLUG_BY_SAMPLE[deck.id];
            const template = templates.find((t) => t.slug === templateSlug) ?? null;
            const cover = deck.slides[0];

            return (
              <article
                key={deck.id}
                className="group overflow-hidden rounded-2xl border border-border/60 bg-card/40"
              >
                <Link
                  to={`/demo?deck=${deck.id}`}
                  onClick={() => trackProductEvent("sample_opened", { deck_id: deck.id, source: "landing_examples" })}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={`Open the ${deck.title} sample deck`}
                >
                  <div
                    className="sample-dark relative w-full overflow-hidden border-b border-[hsl(var(--sample-border))]"
                    style={{ aspectRatio: "16 / 9", background: deck.surface, "--sample-deck-accent": deck.accent } as React.CSSProperties}
                  >
                    <SampleSlideRenderer body={cover.body} accent={deck.accent} compact />
                  </div>
                </Link>

                <div className="flex flex-wrap items-end justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                      {deck.title}
                    </h3>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {deck.audience} · {deck.deckType}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground/80">
                      <Layers className="h-3.5 w-3.5" />
                      {deck.slides.length} sample slides
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="min-h-[40px]">
                      <Link to={`/demo?deck=${deck.id}`}>Open sample</Link>
                    </Button>
                    {template && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="min-h-[40px]"
                        onClick={() => handleUseTemplate(template.id)}
                      >
                        Use as template
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10">
          <Button asChild variant="outline" size="lg" className="h-12 gap-2 text-base">
            <Link to="/templates">
              Browse the template library
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
