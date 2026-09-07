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
  promptLength,
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

  // Count the full text (whitespace included) so the bound cannot be evaded.
  const chars = promptLength(brief);
  const tooLong = chars > MAX_PROMPT_LENGTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const text = brief;
    if (!text.trim()) {
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
        "reason" in saved && saved.reason === "storage"
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
    <section className="relative overflow-hidden border-b border-border/40 px-4 pb-12 pt-20 sm:pb-16 sm:pt-24">
      {/* Restrained background: one soft field, no multi-colour gradients */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[900px] max-w-none -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[140px]" />
      </div>

      <div className="container-wide relative">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          {/* ── Left column: the promise and the brief ── */}
          <div className="max-w-xl">
            <p className="mb-5 inline-flex items-center gap-2 border-l-2 border-accent pl-3 text-[13px] font-medium uppercase tracking-[0.16em] text-accent">
              AI presentations
            </p>

            <h1 className="text-[2.1rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Make the case.
              <br />
              <span className="text-accent">Move the decision.</span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Turn your notes into a clear, presentation-ready deck.
            </p>

            <form onSubmit={handleSubmit} className="mt-8">
              <label
                htmlFor="hero-brief"
                className="block text-sm font-medium text-foreground"
              >
                What do you need to present?
              </label>
              <Textarea
                id="hero-brief"
                ref={textareaRef}
                value={brief}
                aria-describedby={
                  [brief ? "hero-brief-status" : "", error ? "hero-brief-error" : ""]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                aria-invalid={tooLong || undefined}
                onChange={(e) => {
                  noteStart();
                  setBrief(e.target.value);
                }}
                rows={4}
                placeholder="e.g. A board update on Q4 results and next quarter’s priorities."
                className="mt-3 min-h-[112px] resize-y bg-card/60 text-base"
              />

              {brief && (
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
              )}

              {error && (
                <p
                  id="hero-brief-error"
                  role="alert"
                  className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 px-3.5 py-2.5 text-[13px] text-foreground"
                >
                  {error}
                </p>
              )}

              <div className="mt-5 flex items-center gap-5">
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="h-12 w-full gap-2 text-base sm:w-auto"
                >
                  Build my deck
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Link
                  to="/demo"
                  className="min-h-[44px] py-3 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  View sample
                </Link>
              </div>

              <p className="mt-3 text-[13px] text-muted-foreground">
                {loading || user
                  ? "Your brief carries over."
                  : "Free account required. Your brief carries over."}
                {!isDraftStorageAvailable() &&
                  " This browser is blocking storage, so copy your brief before continuing."}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
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
            </form>
          </div>

          {/* ── Right column: real, inspectable product proof ── */}
          <div className="lg:pt-2">
            <SampleDeckExplorer compact showDeckTabs={false} initialSlide={2} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
