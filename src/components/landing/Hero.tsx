import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import SampleDeckExplorer from "@/components/sample/SampleDeckExplorer";
import {
  saveCreateDraft,
  MAX_PROMPT_LENGTH,
  isDraftStorageAvailable,
} from "@/lib/create-draft";
import { trackProductEvent } from "@/lib/product-events";
import { trackABEvent } from "@/lib/ab-testing";

/** Starters fill the brief field with a real, editable starting point. */
const STARTERS: { id: string; label: string; text: string }[] = [
  {
    id: "board_update",
    label: "Board update",
    text:
      "Quarterly board update. We finished ahead of plan and I need approval to shift spend from mid-market into enterprise next year. Cover the recommendation, the evidence behind it, the risks, and what happens if the board approves.",
  },
  {
    id: "investor_pitch",
    label: "Investor pitch",
    text:
      "Series A pitch. We are raising to expand a product that already works in one segment into three more. Make the ask explicit, show traction and retention, name the risks honestly, and end with the process from here.",
  },
  {
    id: "strategy_review",
    label: "Strategy review",
    text:
      "Strategy review for the executive committee. We must choose between concentrating on regulated verticals or continuing a broad mid-market motion. Give a clear recommendation, the evidence for it, what we are giving up, and the first thirty days.",
  },
];

const Hero = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [brief, setBrief] = useState("");
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    trackABEvent("hero_headline", "impression");
  }, []);

  const noteStart = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackProductEvent("brief_started", { source: "home_hero" });
  };

  const applyStarter = (starter: (typeof STARTERS)[number]) => {
    noteStart();
    setBrief(starter.text);
    trackProductEvent("brief_started", { source: "home_hero", starter: starter.id });
    textareaRef.current?.focus();
  };

  const chars = brief.trim().length;
  const tooLong = chars > MAX_PROMPT_LENGTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const text = brief.trim();
    if (!text) {
      textareaRef.current?.focus();
      return;
    }
    if (tooLong) {
      setError(
        `Your brief is ${chars.toLocaleString()} characters. Please shorten it to ${MAX_PROMPT_LENGTH.toLocaleString()} or fewer.`
      );
      textareaRef.current?.focus();
      return;
    }
    const saved = saveCreateDraft(text);
    if (!saved.ok) {
      // We cannot carry the brief to the next page, so we stay here and say so
      // rather than claiming it was saved.
      setError(
        saved.reason === "storage"
          ? "This browser is blocking storage, so we cannot carry your brief to the next step. Copy it first, then continue — or open AXIVA in a normal (non-private) window."
          : "We could not keep your brief. Please check it and try again."
      );
      textareaRef.current?.focus();
      return;
    }
    trackProductEvent("create_intent_stored", {
      source: "home_hero",
      prompt_length: text.length,
      signed_in: !!user,
    });
    trackProductEvent("brief_submitted", { source: "home_hero" });
    trackABEvent("hero_headline", "click", "brief_submit");
    if (user) {
      navigate("/create");
    } else {
      navigate("/auth?mode=signup&next=%2Fcreate");
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-border/40 px-4 pb-14 pt-24 sm:pb-20 sm:pt-28">
      {/* Restrained background: one soft field, no multi-colour gradients */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[900px] max-w-none -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[140px]" />
      </div>

      <div className="container-wide relative">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          {/* ── Left column: the promise and the brief ── */}
          <div className="max-w-xl">
            <p className="mb-5 inline-flex items-center gap-2 border-l-2 border-accent pl-3 text-[13px] font-medium uppercase tracking-[0.16em] text-accent">
              AI executive presentation builder
            </p>

            <h1 className="text-[2.1rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Make the case.
              <br />
              <span className="text-accent">Move the decision.</span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Turn your notes into a structured deck with a clear recommendation,
              the evidence behind it, and the next steps — then prepare to present
              it with speaker notes and likely questions.
            </p>

            <form onSubmit={handleSubmit} className="mt-8">
              <label
                htmlFor="hero-brief"
                className="block text-sm font-medium text-foreground"
              >
                What do you need to present?
              </label>
              <p id="hero-brief-help" className="mt-1 text-[13px] text-muted-foreground">
                Your audience, the decision at stake, and anything that must be included.
              </p>
              <Textarea
                id="hero-brief"
                ref={textareaRef}
                value={brief}
                aria-describedby="hero-brief-help hero-brief-status"
                aria-invalid={tooLong || undefined}
                onChange={(e) => {
                  noteStart();
                  setBrief(e.target.value);
                }}
                rows={4}
                placeholder="e.g. Board update for our Q4 results — I need approval to move spend into enterprise next year."
                className="mt-3 min-h-[112px] resize-y bg-card/60 text-base"
              />

              <p
                id="hero-brief-status"
                className={
                  tooLong
                    ? "mt-2 text-[13px] text-destructive"
                    : "mt-2 text-[13px] text-muted-foreground"
                }
              >
                {chars.toLocaleString()} / {MAX_PROMPT_LENGTH.toLocaleString()} characters
              </p>

              {error && (
                <p
                  role="alert"
                  className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 px-3.5 py-2.5 text-[13px] text-foreground"
                >
                  {error}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[13px] text-muted-foreground">Start from:</span>
                {STARTERS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => applyStarter(s)}
                    className="min-h-[38px] rounded-full border border-border/60 px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="h-12 w-full gap-2 text-base sm:w-auto"
                >
                  Build my deck
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 w-full text-base sm:w-auto"
                >
                  <Link to="/demo">Explore a sample deck</Link>
                </Button>
              </div>

              <p className="mt-3 text-[13px] text-muted-foreground">
                {loading || user
                  ? "Your brief is carried straight into the builder in this tab."
                  : "You will create a free account before generating — your brief is kept in this tab and carried through."}
                {!isDraftStorageAvailable() &&
                  " This browser is blocking storage, so copy your brief before continuing."}
              </p>
            </form>
          </div>

          {/* ── Right column: real, inspectable product proof ── */}
          <div className="lg:pt-2">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                What the output looks like
              </h2>
              <Link
                to="/demo"
                className="text-[13px] font-medium text-accent underline-offset-4 hover:underline"
              >
                Open full sample
              </Link>
            </div>
            <SampleDeckExplorer compact showDeckTabs={false} />
            <p className="mt-3 text-[13px] text-muted-foreground">
              Sample deck with fictional companies and figures, shown to
              demonstrate structure. Use the controls to move through the slides.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
