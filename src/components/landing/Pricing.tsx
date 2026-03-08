import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const plans = [
  {
    name: "Free",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    description: "Perfect for trying AXIVA",
    features: [
      "3 projects",
      "Basic AI generation",
      "Standard block types",
      "Web sharing links",
      "Community support"
    ],
    cta: "Get Started",
    variant: "outline" as const,
    popular: false,
    tier: "free" as const,
    perUser: false,
  },
  {
    name: "Pro",
    monthlyPrice: "$28",
    yearlyPrice: "$269",
    yearlySavings: "Save 20%",
    description: "For professionals and small teams",
    features: [
      "Unlimited projects",
      "PDF & PowerPoint export",
      "Brand kit & custom themes",
      "Interactive blocks (tabs, toggles)",
      "AI image generation",
      "Advanced AI actions",
      "Priority support"
    ],
    cta: "Start 14-Day Free Trial",
    variant: "hero" as const,
    popular: true,
    tier: "pro" as const,
    perUser: false,
    hasTrial: true,
  },
  {
    name: "Team",
    monthlyPrice: "$78",
    yearlyPrice: "$749",
    yearlySavings: "Save 20%",
    description: "For companies and departments",
    features: [
      "Everything in Pro",
      "Shared workspaces",
      "Governance controls",
      "Centralized billing",
      "Admin dashboard",
      "Workspace settings & defaults"
    ],
    cta: "Start 14-Day Free Trial",
    variant: "outline" as const,
    popular: false,
    tier: "team" as const,
    perUser: true,
    hasTrial: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    description: "SSO, SAML & dedicated support",
    features: [
      "Everything in Team",
      "SSO & SAML authentication",
      "Audit logs & compliance",
      "Dedicated account manager",
      "Custom integrations & API",
      "SLA & uptime guarantee"
    ],
    cta: "Contact Sales",
    variant: "outline" as const,
    popular: false,
    tier: "enterprise" as const,
    perUser: false,
  }
];

const Pricing = () => {
  const { user } = useAuth();
  const { subscription, createCheckout } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const handlePlanClick = async (tier: "free" | "pro" | "team" | "enterprise") => {
    if (tier === "enterprise") {
      navigate("/enterprise");
      return;
    }
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

    // Get the correct price ID based on billing interval
    const tierConfig = SUBSCRIPTION_TIERS[tier];
    const priceId = isAnnual ? tierConfig.yearlyPriceId : tierConfig.monthlyPriceId;
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
        <div className="text-center mb-12">
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Choose your plan
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Start free, scale as you grow. Every plan includes our core AI engine.
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-accent"
            />
            <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="ml-2 px-2 py-0.5 bg-accent/20 text-accent text-xs font-semibold rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 max-w-6xl mx-auto">
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
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">
                    {isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  {plan.tier !== "enterprise" && (
                    <span className="text-muted-foreground">
                      /{isAnnual ? 'year' : 'month'}
                      {plan.perUser && '/user'}
                    </span>
                  )}
                </div>
                {isAnnual && plan.yearlySavings && (
                  <p className="text-xs text-accent font-medium">{plan.yearlySavings}</p>
                )}
                {plan.hasTrial && (
                  <p className="text-xs text-success font-medium mt-1">14-day free trial included</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
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
