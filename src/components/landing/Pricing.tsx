import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying AXORA",
    features: [
      "3 projects",
      "Basic AI generation",
      "Standard block types",
      "Community support"
    ],
    cta: "Get Started",
    variant: "outline" as const,
    popular: false
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For professionals and small teams",
    features: [
      "Unlimited projects",
      "PDF & Slide export",
      "Brand kit integration",
      "Advanced AI actions",
      "Priority support"
    ],
    cta: "Start Pro Trial",
    variant: "hero" as const,
    popular: true
  },
  {
    name: "Executive",
    price: "$149",
    period: "/month",
    description: "For leaders who need the best",
    features: [
      "Everything in Pro",
      "Premium framework packs",
      "Vertical templates",
      "Priority AI processing",
      "Dedicated account manager",
      "Custom integrations"
    ],
    cta: "Contact Sales",
    variant: "outline" as const,
    popular: false
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="section-padding relative">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Choose your plan
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free, scale as you grow. Every plan includes our core AI engine.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.popular 
                  ? "border-accent bg-gradient-to-b from-accent/10 to-accent/5 scale-105 shadow-lg shadow-accent/10" 
                  : "border-border bg-card hover:border-accent/20"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/auth" className="block">
                <Button 
                  variant={plan.variant} 
                  className="w-full" 
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
