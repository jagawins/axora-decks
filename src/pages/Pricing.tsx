import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const { user } = useAuth();
  const { subscription, createCheckout } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      description: "For trying the product",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      period: "forever",
      features: [
        "Limited deck generation",
        "Basic export",
        "Standard themes"
      ],
      cta: "Get Started",
      featured: false,
      tier: "free" as const,
      perUser: false,
    },
    {
      name: "Pro",
      description: "For operators, leaders, consultants",
      monthlyPrice: "$28",
      yearlyPrice: "$269",
      yearlySavings: "Save 20%",
      features: [
        "Unlimited deck generation",
        "PPTX export",
        "Advanced themes",
        "Priority AI processing"
      ],
      cta: "Start 14-Day Free Trial",
      featured: true,
      tier: "pro" as const,
      perUser: false,
      hasTrial: true,
    },
    {
      name: "Team",
      description: "For companies and departments",
      monthlyPrice: "$78",
      yearlyPrice: "$749",
      yearlySavings: "Save 20%",
      features: [
        "Everything in Pro",
        "Shared workspaces",
        "Governance controls",
        "Centralized billing",
        "Admin dashboard"
      ],
      cta: "Start 14-Day Free Trial",
      featured: false,
      tier: "team" as const,
      perUser: true,
      hasTrial: true,
    }
  ];

  const handlePlanClick = async (tier: "free" | "pro" | "team") => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (tier === 'free') {
      navigate('/dashboard');
      return;
    }

    if (subscription.tier === tier) {
      navigate('/dashboard');
      return;
    }

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

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-60" />
          </div>
          
          <div className="container-narrow relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4" />
                <span>Pricing</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Simple pricing built for{" "}
                <span className="text-gradient">professionals and teams</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                Start free. Upgrade when you're ready for more power.
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
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, i) => (
                <div 
                  key={i} 
                  className={`glass-card p-8 relative ${plan.featured ? 'border-accent/50 ring-1 ring-accent/20' : ''} ${user && subscription.tier === plan.tier ? 'ring-2 ring-success' : ''}`}
                >
                  {plan.featured && !(user && subscription.tier === plan.tier) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  
                  {user && subscription.tier === plan.tier && (
                    <div className="absolute -top-3 right-4 px-3 py-1 bg-success text-success-foreground text-xs font-semibold rounded-full">
                      Your Plan
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  
                  <div className="mb-2">
                    <span className="text-4xl font-bold">
                      {isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">
                      /{isAnnual ? 'year' : 'month'}
                      {plan.perUser && '/user'}
                    </span>
                  </div>
                  {isAnnual && plan.yearlySavings && (
                    <p className="text-xs text-accent font-medium">{plan.yearlySavings}</p>
                  )}
                  {'hasTrial' in plan && plan.hasTrial && (
                    <p className="text-xs text-success font-medium mt-1">14-day free trial included</p>
                  )}
                  {!plan.yearlySavings && !('hasTrial' in plan && plan.hasTrial) && <div className="mb-4" />}
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-accent shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={plan.featured ? "hero" : "outline"} 
                    className="w-full"
                    onClick={() => handlePlanClick(plan.tier)}
                    disabled={loadingTier === plan.tier || (user && subscription.tier === plan.tier)}
                  >
                    {loadingTier === plan.tier ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user && subscription.tier === plan.tier ? (
                      "Current Plan"
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ or Trust */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow text-center">
            <p className="text-muted-foreground mb-8">
              Questions? Contact us at{" "}
              <a href="mailto:jagawins@gmail.com" className="text-accent hover:underline">
                jagawins@gmail.com
              </a>
            </p>
            <p className="text-muted-foreground">
              Explore our{" "}
              <a href="/ai-deck-generator" className="text-accent hover:underline">
                features designed for executive AI deck generation
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
