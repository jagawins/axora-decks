import { useState, useEffect } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

/* ── Testimonials data ─────────────────────────────────────── */
const testimonials = [
  {
    quote: "Had the board deck done in under 10 minutes. Our CFO thought it was made by McKinsey.",
    role: "VP of Strategy",
    company: "Series C Fintech",
    rating: 5,
  },
  {
    quote: "We switched from Gamma because AXIVA actually understands executive communication. The visual blocks are a game-changer.",
    role: "Head of Corporate Strategy",
    company: "Fortune 500 Healthcare",
    rating: 5,
  },
  {
    quote: "Finally, a tool that generates structure, not just pretty slides with no substance.",
    role: "Senior Consultant",
    company: "Big 4 Advisory",
    rating: 5,
  },
  {
    quote: "I used to spend 6 hours on investor updates. Now it's 20 minutes. My team thinks I hired a designer.",
    role: "CEO & Founder",
    company: "Series A SaaS",
    rating: 5,
  },
];

export default function SocialProof() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const prev = () => setActive((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setActive((i) => (i + 1) % testimonials.length);

  return (
    <section className="section-padding relative">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">
            What people say
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Loved by executives and strategists
          </h2>
        </div>

        {/* Featured testimonial — large card */}
        <div className="max-w-3xl mx-auto">
          <div className="relative glass-card p-8 sm:p-12 text-center overflow-hidden">
            {/* Quote icon */}
            <Quote className="h-8 w-8 text-accent/20 mx-auto mb-6" />

            {/* Quote text */}
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-8 min-h-[80px]">
              "{testimonials[active].quote}"
            </p>

            {/* Stars */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {Array.from({ length: testimonials[active].rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Attribution */}
            <p className="text-sm font-semibold text-foreground">
              {testimonials[active].role}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {testimonials[active].company}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prev}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted/50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === active ? "bg-accent w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted/50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Metric cards row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
          {[
            { value: "< 5 min", label: "Average deck creation" },
            { value: "88", label: "Executive templates" },
            { value: "50×", label: "Faster than manual" },
            { value: "99%", label: "Export success rate" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-5 rounded-xl border border-border/40 bg-card/30"
            >
              <div className="text-xl sm:text-2xl font-bold text-accent mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
