import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const FAQS = [
  {
    q: "What does AXIVA actually produce?",
    a: "A structured deck built around a decision: the recommendation, the evidence behind it, the risks, and the next steps. You can edit every slide afterwards, and generate speaker notes and likely questions for delivery.",
  },
  {
    q: "Do I need an account to look around?",
    a: "No. The sample decks are readable without signing in. You need a free account only when you want to generate and edit a deck of your own.",
  },
  {
    q: "Is PowerPoint export included on the free plan?",
    a: "No. PowerPoint export is part of Pro, along with brand kits. The free plan covers AI generation and editing in the app.",
  },
  {
    q: "Can I start from my own notes or documents?",
    a: "Yes. You can paste notes or an outline, or import a file, and AXIVA will structure it rather than rewrite it from scratch.",
  },
  {
    q: "Can I use my own brand styling?",
    a: "Yes, on Pro. A brand kit applies your colours, fonts and logo across the deck and exports.",
  },
];

export default function HomeFaq() {
  return (
    <section className="section-padding border-t border-border/40">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
      </Helmet>

      <div className="container-wide">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <p className="mb-4 border-l-2 border-accent pl-3 text-[13px] font-medium uppercase tracking-[0.16em] text-accent">
              Questions
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Straight answers
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              More detail on the{" "}
              <Link to="/faq" className="text-accent underline-offset-4 hover:underline">
                full FAQ page
              </Link>
              , or email{" "}
              <a href="mailto:jag@axiva.ai" className="text-accent underline-offset-4 hover:underline">
                jag@axiva.ai
              </a>
              .
            </p>
          </div>

          <dl className="divide-y divide-border/60">
            {FAQS.map((f) => (
              <div key={f.q} className="py-5 first:pt-0">
                <dt className="text-base font-medium text-foreground">{f.q}</dt>
                <dd className="mt-2 text-base leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
