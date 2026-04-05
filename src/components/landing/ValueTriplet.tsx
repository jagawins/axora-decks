import { Link } from "react-router-dom";
import { MessageSquare, Wand2, Download } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: MessageSquare,
    title: "Describe your goal",
    description: "Paste meeting notes, an outline, or just type a one-liner. Our AI understands executive context.",
    color: "#2563EB",
  },
  {
    num: "02",
    icon: Wand2,
    title: "AI builds the deck",
    description: "Structured slides with visual blocks like charts, KPIs, timelines, comparisons, not generic bullet points.",
    color: "#7C3AED",
  },
  {
    num: "03",
    icon: Download,
    title: "Present & export",
    description: "Present live, export to PowerPoint or PDF, or share a link. Apply your brand kit with one click.",
    color: "#059669",
  },
];

const ValueTriplet = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.015] to-transparent" />

      <div className="container-wide relative">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Three steps to a polished deck
          </h2>
        </div>

        {/* Steps — horizontal with connecting line */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-[#3B82F6]/30 via-[#8B5CF6]/30 to-[#10B981]/30" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center group">
                {/* Number circle */}
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-transform group-hover:scale-110 duration-300"
                  style={{ background: `${step.color}15` }}
                >
                  <step.icon className="h-7 w-7" style={{ color: step.color }} />
                  {/* Step number badge */}
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ background: step.color }}
                  >
                    {step.num}
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SEO link */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Our{" "}
            <Link to="/ai-deck-generator" className="text-accent hover:underline">
              AI deck generator
            </Link>
            {" "}converts intent into structured presentation blocks.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ValueTriplet;
