import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import { useToast } from "@/hooks/use-toast";

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
    popular: false,
    tier: "free" as const,
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
    popular: true,
    tier: "pro" as const,
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
    popular: false,
    tier: "executive" as const,
  }
];

const Pricing = () => {
  const { user } = useAuth();
  const { subscription, createCheckout } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handlePlanClick = async (tier: "free" | "pro" | "executive") => {
    // If not logged in, redirect to auth
    if (!user) {
      navigate('/auth');
      return;
    }

    // If free tier, just go to dashboard
    if (tier === 'free') {
      navigate('/dashboard');
      return;
    }

    // If already on this tier, go to dashboard
    if (subscription.tier === tier) {
      navigate('/dashboard');
      return;
    }

    // For executive, contact sales for now
    if (tier === 'executive') {
      toast({
        title: "Contact Sales",
        description: "Please reach out to our sales team for Executive plan.",
      });
      return;
    }

    // Create checkout session
    const priceId = SUBSCRIPTION_TIERS[tier].priceId;
    if (!priceId) return;

    setLoadingTier(tier);
    try {
      const url = await createCheckout(priceId);
      if (url) {
        window.open(url, '_blank');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create checkout session. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoadingTier(null);
    }
  };

  const getButtonText = (plan: typeof plans[0]) => {
    if (loadingTier === plan.tier) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (user && subscription.tier === plan.tier) {
      return "Current Plan";
    }
    
    return plan.cta;
  };

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
              } ${user && subscription.tier === plan.tier ? "ring-2 ring-accent" : ""}`}
            >
              {/* Current plan badge */}
              {user && subscription.tier === plan.tier && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-success text-success-foreground text-xs font-semibold rounded-full">
                  Your Plan
                </div>
              )}

              {/* Popular badge */}
              {plan.popular && !(user && subscription.tier === plan.tier) && (
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
              <Button 
                variant={plan.variant} 
                className="w-full" 
                size="lg"
                onClick={() => handlePlanClick(plan.tier)}
                disabled={loadingTier === plan.tier || (user && subscription.tier === plan.tier)}
              >
                {getButtonText(plan)}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
