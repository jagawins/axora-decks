import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  X,
  Sparkles,
  Loader2,
  Shield,
  Zap,
  Users,
  Download,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import { useToast } from "@/hooks/use-toast";

/* ── Feature comparison data ────────────────────── */

const FEATURE_CATEGORIES = [
  {
    category: "AI Generation",
    features: [
      { name: "Full deck generations", free: "3 total", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
      { name: "AI block refinements", free: "Unlimited", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
      { name: "AI image generation", free: false, pro: true, team: true, enterprise: true },
      { name: "Smart content structuring (MECE)", free: true, pro: true, team: true, enterprise: true },
      { name: "Document import & conversion", free: "1 per day", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
    ],
  },
  {
    category: "Templates & Themes",
    features: [
      { name: "Starter templates", free: true, pro: true, team: true, enterprise: true },
      { name: "Premium templates", free: false, pro: true, team: true, enterprise: true },
      { name: "Custom themes (Ocean, Rose, Forest, Sunset...)", free: false, pro: true, team: true, enterprise: true },
      { name: "Brand Kit (fonts, colors, logo)", free: false, pro: true, team: true, enterprise: true },
      { name: "Custom heading & body fonts", free: false, pro: true, team: true, enterprise: true },
    ],
  },
  {
    category: "Blocks & Interactivity",
    features: [
      { name: "25+ executive block types", free: true, pro: true, team: true, enterprise: true },
      { name: "Interactive blocks (Tabs, Toggle, Reveal)", free: false, pro: true, team: true, enterprise: true },
      { name: "Charts & data visualization", free: false, pro: true, team: true, enterprise: true },
      { name: "Decision frameworks & matrices", free: false, pro: true, team: true, enterprise: true },
      { name: "Quick AI actions (Shorter, Visual, Decision)", free: false, pro: true, team: true, enterprise: true },
    ],
  },
  {
    category: "Presentation & Sharing",
    features: [
      { name: "Deck mode (16:9 canvas)", free: true, pro: true, team: true, enterprise: true },
      { name: "Document mode (scroll)", free: true, pro: true, team: true, enterprise: true },
      { name: "Presenter view (dual-pane)", free: false, pro: true, team: true, enterprise: true },
      { name: "Share with passcode protection", free: false, pro: true, team: true, enterprise: true },
      { name: "Slide-level analytics", free: false, pro: true, team: true, enterprise: true },
    ],
  },
  {
    category: "Export",
    features: [
      { name: "PNG export", free: true, pro: true, team: true, enterprise: true },
      { name: "PDF export", free: false, pro: true, team: true, enterprise: true },
      { name: "PowerPoint (.pptx) export", free: false, pro: true, team: true, enterprise: true },
      { name: "Web link sharing", free: true, pro: true, team: true, enterprise: true },
    ],
  },
  {
    category: "Workspace & Team",
    features: [
      { name: "Projects", free: "10", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
      { name: "Workspace settings", free: false, pro: true, team: true, enterprise: true },
      { name: "Shared workspaces", free: false, pro: false, team: true, enterprise: true },
      { name: "Centralized billing", free: false, pro: false, team: true, enterprise: true },
      { name: "Admin dashboard & governance", free: false, pro: false, team: true, enterprise: true },
      { name: "SSO & SAML", free: false, pro: false, team: false, enterprise: true },
      { name: "Custom integrations & API", free: false, pro: false, team: false, enterprise: true },
      { name: "Dedicated account manager", free: false, pro: false, team: false, enterprise: true },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: "Can I try Pro before committing?",
    a: "Absolutely. Every Pro and Team plan starts with a 14-day free trial. No credit card required to start — you only pay if you decide to continue.",
  },
  {
    q: "What happens when my trial ends?",
    a: "You'll be asked to subscribe or your account reverts to the Free tier. All your projects and data are preserved — nothing is deleted.",
  },
  {
    q: "Can I switch from monthly to annual?",
    a: "Yes, anytime. Switch to annual billing and save 20%. Your remaining monthly balance is prorated.",
  },
  {
    q: "What counts as a 'deck generation'?",
    a: "A full deck generation is when you create a complete new deck from a prompt or imported document. Block-level AI refinements (Shorter, More visual, etc.) are always unlimited on every plan.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. If you're not satisfied within the first 14 days of a paid subscription, contact us for a full refund.",
  },
  {
    q: "Is my data secure?",
    a: "All data is encrypted at rest and in transit. We use enterprise-grade infrastructure with SOC 2 compliant providers.",
  },
];

const SOCIAL_PROOF = [
  { metric: "2,400+", label: "Decks created" },
  { metric: "94%", label: "Would recommend" },
  { metric: "<2 min", label: "Avg. deck creation" },
  { metric: "50+", label: "Enterprise teams" },
];

const Pricing = () => {
  const { user } = useAuth();
  const { subscription, createCheckout } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const plans = [
    {
      name: "Free",
      description: "Explore the platform",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      period: "forever",
      highlights: [
        "3 full deck generations",
        "10 projects",
        "25+ block types",
        "PNG & web link export",
        "Deck & document modes",
      ],
      cta: "Get Started Free",
      featured: false,
      tier: "free" as const,
      perUser: false,
      icon: Zap,
    },
    {
      name: "Pro",
      description: "For operators, leaders & consultants",
      monthlyPrice: "$28",
      yearlyPrice: "$269",
      yearlySavings: "Save $67",
      highlights: [
        "Unlimited deck generations",
        "AI images & smart refinements",
        "All templates & premium themes",
        "Brand Kit (fonts, colors, logo)",
        "Interactive blocks (Tabs, Toggle, Reveal)",
        "Presenter view & slide analytics",
        "PDF & PowerPoint export",
        "Passcode-protected sharing",
      ],
      cta: "Start 14-Day Free Trial",
      featured: true,
      tier: "pro" as const,
      perUser: false,
      hasTrial: true,
      icon: Sparkles,
    },
    {
      name: "Team",
      description: "For companies & departments",
      monthlyPrice: "$78",
      yearlyPrice: "$749",
      yearlySavings: "Save $187",
      highlights: [
        "Everything in Pro",
        "Shared workspaces",
        "Centralized billing",
        "Admin dashboard & governance",
        "Priority support",
      ],
      cta: "Start 14-Day Free Trial",
      featured: false,
      tier: "team" as const,
      perUser: true,
      hasTrial: true,
      icon: Users,
    },
    {
      name: "Enterprise",
      description: "Custom solutions at scale",
      monthlyPrice: "Custom",
      yearlyPrice: "Custom",
      highlights: [
        "Everything in Team",
        "SSO & SAML authentication",
        "Dedicated account manager",
        "Custom integrations & API",
        "SLA & uptime guarantee",
        "On-premise deployment option",
      ],
      cta: "Contact Sales",
      featured: false,
      tier: "enterprise" as const,
      perUser: false,
      icon: Shield,
    },
  ];

  const handlePlanClick = async (tier: "free" | "pro" | "team" | "enterprise") => {
    if (tier === "enterprise") {
      window.location.href = "mailto:jagawins@gmail.com?subject=AXIVA Enterprise Inquiry";
      return;
    }

    if (!user) {
      navigate("/auth");
      return;
    }

    if (tier === "free" || subscription.tier === tier) {
      navigate("/dashboard");
      return;
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier];
    const priceId = isAnnual ? tierConfig.yearlyPriceId : tierConfig.monthlyPriceId;

    if (!priceId) return;

    setLoadingTier(tier);
    try {
      const url = await createCheckout(priceId);
      if (url) {
        window.open(url, "_blank");
      } else {
        toast({
          title: "Error",
          description: "Failed to create checkout session.",
          variant: "destructive"
        });
      }
    } finally {
      setLoadingTier(null);
    }
  };

  const renderFeatureValue = (val: boolean | string) => {
    if (val === true) return <Check className="w-5 h-5 text-primary mx-auto" />;
    if (val === false) return <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />;
    return <span className="text-sm font-medium">{val}</span>;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MarketingHeader />

      {/* ─── Hero ─── */}
      <section className="pt-32 pb-16 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Build executive decks{" "}
            <span className="text-primary italic">10x faster</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Start free. Upgrade when you need unlimited generations, brand kits, interactive blocks, and PowerPoint export.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground/80">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              ✦ 14-day free trial on all paid plans — no credit card required
            </div>
          </div>
        </div>

        {/* Billing toggle */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <Switch 
            checked={isAnnual} 
            onCheckedChange={setIsAnnual}
            className="data-[state=checked]:bg-primary"
          />
          <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Annual</span>
          {isAnnual && (
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
              Save 20%
            </span>
          )}
        </div>
      </section>

      {/* ─── Social Proof Stats Bar ─── */}
      <div className="max-w-6xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm">
          {SOCIAL_PROOF.map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl font-bold text-foreground">{item.metric}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Pricing Cards ─── */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {plans.map((plan, i) => {
            const isCurrentPlan = user && subscription.tier === plan.tier;
            const Icon = plan.icon;
            
            return (
              <div 
                key={plan.name}
                className={`group relative p-8 rounded-3xl border transition-all duration-300 ${
                  plan.featured 
                    ? 'bg-card border-primary ring-1 ring-primary/20 shadow-2xl shadow-primary/10 scale-105 lg:scale-110 z-10' 
                    : 'bg-card/50 border-border/50 hover:border-border hover:bg-card hover:shadow-xl'
                }`}
              >
                {plan.featured && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-green-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg">
                    Your Plan
                  </div>
                )}

                <div className="mb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                    plan.featured ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed h-10">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{isAnnual ? plan.yearlyPrice : plan.monthlyPrice}</span>
                    {plan.tier !== "enterprise" && (
                      <span className="text-muted-foreground">/{isAnnual ? 'year' : 'month'}{plan.perUser && '/user'}</span>
                    )}
                  </div>
                  {isAnnual && plan.yearlySavings && (
                    <div className="mt-1 text-xs font-bold text-green-500 uppercase tracking-tight">
                      {plan.yearlySavings}
                    </div>
                  )}
                  {plan.hasTrial && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                      14-day free trial
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.highlights.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.featured ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full h-12 rounded-xl text-base font-semibold transition-all duration-300 ${
                    plan.featured 
                      ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  onClick={() => handlePlanClick(plan.tier)}
                  disabled={loadingTier === plan.tier || !!isCurrentPlan}
                >
                  {loadingTier === plan.tier ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Feature Comparison Table ─── */}
      <section className="px-6 py-32 bg-card/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Compare every feature</h2>
            <p className="text-muted-foreground">See exactly what you get on each plan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-6 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider w-1/3">Feature</th>
                  <th className="py-6 px-4 text-center text-sm font-semibold uppercase tracking-wider">Free</th>
                  <th className="py-6 px-4 text-center text-sm font-bold text-primary uppercase tracking-wider relative">
                    Pro
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">Most popular</span>
                  </th>
                  <th className="py-6 px-4 text-center text-sm font-semibold uppercase tracking-wider">Team</th>
                  <th className="py-6 px-4 text-center text-sm font-semibold uppercase tracking-wider">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_CATEGORIES.map((cat) => (
                  <React.Fragment key={cat.category}>
                    <tr className="bg-muted/30">
                      <td colSpan={5} className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">{cat.category}</td>
                    </tr>
                    {cat.features.map((f) => (
                      <tr key={f.name} className="border-b border-border/50 hover:bg-card/40 transition-colors">
                        <td className="py-4 px-4 text-sm font-medium">{f.name}</td>
                        <td className="py-4 px-4 text-center">{renderFeatureValue(f.free)}</td>
                        <td className="py-4 px-4 text-center bg-primary/5">{renderFeatureValue(f.pro)}</td>
                        <td className="py-4 px-4 text-center">{renderFeatureValue(f.team)}</td>
                        <td className="py-4 px-4 text-center">{renderFeatureValue((f as any).enterprise)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* CTA under table */}
          <div className="mt-16 text-center">
            <Button 
              size="lg" 
              onClick={() => handlePlanClick("pro")}
              className="group"
            >
              {user ? "Start Pro Free Trial" : "Get Started Free"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">No credit card required to start your trial</p>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-6 py-32 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Frequently asked questions</h2>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="group">
              <button 
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full text-left p-6 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 transition-colors flex items-center justify-between"
              >
                <span className="font-semibold">{item.q}</span>
                <span className="text-primary text-xl font-bold leading-none">{expandedFaq === i ? "−" : "+"}</span>
              </button>
              {expandedFaq === i && (
                <div className="p-6 pt-0 text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="px-6 pb-32">
        <div className="max-w-5xl mx-auto rounded-3xl p-12 md:p-24 bg-primary text-primary-foreground relative overflow-hidden text-center shadow-2xl shadow-primary/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Risk-free. Cancel anytime.</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
              14-day free trial on all paid plans. Full refund guarantee within the first 14 days. Your data is always yours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="h-14 px-8 text-lg font-bold group"
                onClick={() => handlePlanClick("pro")}
              >
                Start Building for Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <p className="mt-8 text-sm opacity-70">
              Questions?{" "}
              <a href="mailto:jagawins@gmail.com" className="underline underline-offset-4 hover:opacity-100 transition-opacity">
                jagawins@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
