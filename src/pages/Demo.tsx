import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingHeader from "@/components/MarketingHeader";
import SampleDeckExplorer from "@/components/sample/SampleDeckExplorer";
import { SAMPLE_DECKS, resolveSampleDeck } from "@/data/sample-decks";
import { trackProductEvent } from "@/lib/product-events";

/**
 * Sample deck explorer.
 *
 * No sign-in, no database, no simulated generation. Everything shown here is
 * prewritten illustrative content from src/data/sample-decks.ts.
 */
export default function Demo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deckId, setDeckId] = useState(() => resolveSampleDeck(searchParams.get("deck")).id);

  // Keep state and the validated URL parameter in step
  useEffect(() => {
    const fromUrl = resolveSampleDeck(searchParams.get("deck")).id;
    setDeckId((current) => (current === fromUrl ? current : fromUrl));
  }, [searchParams]);

  useEffect(() => {
    trackProductEvent("sample_opened", { deck_id: deckId, source: "demo_page" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeckChange = useCallback(
    (next: string) => {
      setDeckId(next);
      const params = new URLSearchParams(searchParams);
      params.set("deck", next);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const active = resolveSampleDeck(deckId);

  return (
    <>
      <Helmet>
        <title>Sample executive decks | AXIVA</title>
        <meta
          name="description"
          content="Explore four illustrative AXIVA sample decks — recommendation, evidence, risks and next steps — with sample speaker notes and anticipated questions. No sign-in needed."
        />
        <link rel="canonical" href="https://axiva.ai/demo" />
        <meta property="og:title" content="Sample executive decks | AXIVA" />
        <meta
          property="og:description"
          content="Four illustrative sample decks showing how AXIVA structures a recommendation, its evidence, the risks and the next steps."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <a
        href="#demo-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>

      <MarketingHeader />

      <main id="demo-main" className="min-h-screen bg-background px-4 pb-20 pt-24 sm:pt-28">
        <div className="container-wide">
          <header className="max-w-2xl">
            <p className="mb-4 border-l-2 border-accent pl-3 text-[13px] font-medium uppercase tracking-[0.16em] text-accent">
              Sample decks
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              See how a decision is presented
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Four complete sample decks you can read right now — no account, no
              generation. Every company, figure and quote is fictional and exists
              only to show the structure: the recommendation first, then the
              evidence, the risks, and the next steps.
            </p>
            <p className="mt-3 text-[15px] text-muted-foreground">
              Currently viewing: <span className="text-foreground">{active.premise}</span>
            </p>
          </header>

          <div className="mt-10">
            <SampleDeckExplorer
              deckId={deckId}
              onDeckChange={handleDeckChange}
              showNotes
            />
          </div>

          {/* Honest action row: no decorative export control */}
          <div className="mt-10 rounded-2xl border border-border/60 bg-card/40 p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 className="text-lg font-semibold tracking-tight">Build this with your own brief</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  These samples are read-only. To generate and edit a deck of your
                  own you will create a free account first. PowerPoint export is a
                  Pro feature, so it is not available on the free plan or for these
                  samples.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="hero" size="lg" className="h-12 gap-2 text-base">
                  <Link to="/create">
                    Start with my brief
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 gap-2 text-base">
                  <Link to="/pricing">
                    <FileDown className="h-4 w-4" />
                    See export plans
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Deep links for the other samples */}
          <div className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              All samples
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {SAMPLE_DECKS.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => handleDeckChange(d.id)}
                    aria-current={d.id === deckId ? "true" : undefined}
                    className={`w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      d.id === deckId
                        ? "border-accent/60 bg-accent/5"
                        : "border-border/60 hover:border-accent/30"
                    }`}
                  >
                    <span className="block text-[15px] font-medium text-foreground">{d.title}</span>
                    <span className="mt-1 block text-[13px] text-muted-foreground">
                      {d.organisation} · {d.slides.length} slides
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
