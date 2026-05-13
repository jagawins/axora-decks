import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Check, X, Sparkles, Loader2, Shield, Zap,
  Users, Download, MessageSquare
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
      { name: "Custom themes (Ocean, Rose, Forest, Sunset…)", free: false, pro: true, team: true, enterprise: true },
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
  const [isAnnual, setIsAnnual] = useState(false);
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
        toast({ title: "Error", description: "Failed to create checkout session.", variant: "destructive" });
      }
    } finally {
      setLoadingTier(null);
    }
  };

  const renderFeatureValue = (val: boolean | string) => {
    if (val === true) return <Check className="h-4 w-4 text-success mx-auto" />;
    if (val === false) return <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />;
    return <span className="text-sm text-foreground">{val}</span>;
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AXIVA Pricing — Free, Pro $28, Team $78 per user</title>
        <meta name="description" content="Simple AXIVA pricing. Free forever for 3 decks. Pro $28/mo unlocks unlimited decks, PPTX export, and Brand Kit. Team $78/user. 14-day free trial." />
        <link rel="canonical" href="https://axiva.ai/pricing" />
        <meta property="og:title" content="AXIVA Pricing — Free, Pro, and Team plans" />
        <meta property="og:description" content="Free forever for 3 decks. Pro $28/mo unlocks unlimited generations, PPTX export, and Brand Kit. 14-day free trial." />
        <meta property="og:url" content="https://axiva.ai/pricing" />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <MarketingHeader />

      <main>
        {/* ═══ Hero ═══ */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-60" />
          </div>

          <div className="container-narrow relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4" />
                <span>Simple, Transparent Pricing</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Build executive decks{" "}
                <span className="text-gradient">10x faster</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
                Start free. Upgrade when you need unlimited generations, brand kits, interactive blocks, and PowerPoint export.
              </p>

              <p className="text-sm text-success font-medium mb-8">
                ✦ 14-day free trial on all paid plans — no credit card required
              </p>

              {/* Billing toggle */}
              <div className="flex items-center justify-center gap-3">
                <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
                <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-accent" />
                <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
                {isAnnual && (
                  <span className="ml-2 px-2 py-0.5 bg-success/20 text-success text-xs font-bold rounded-full">
                    Save 20%
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Social Proof Stats Bar ═══ */}
        <section className="pb-12">
          <div className="container-narrow">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 rounded-2xl border border-border/50 bg-card/50 p-6 lg:p-8">
              {SOCIAL_PROOF.map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold text-accent mb-1">{item.metric}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Pricing Cards ═══ */}
        <section className="py-16">
          <div className="container-wide">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {plans.map((plan, i) => {
                const isCurrentPlan = user && subscription.tier === plan.tier;
                const Icon = plan.icon;

                return (
                  <div
                    key={i}
                    className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                      plan.featured
                        ? "border-accent/50 bg-accent/[0.03] ring-1 ring-accent/20 scale-[1.02] shadow-xl shadow-accent/5"
                        : "border-border bg-card/50"
                    } ${isCurrentPlan ? "ring-2 ring-success" : ""}`}
                  >
                    {plan.featured && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-foreground text-sm font-bold rounded-full">
                        Most Popular
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-4 px-3 py-1 bg-success text-success-foreground text-xs font-bold rounded-full">
                        Your Plan
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.featured ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="text-xs text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>

                    <div className="mb-1">
                      <span className="text-4xl font-bold">{isAnnual ? plan.yearlyPrice : plan.monthlyPrice}</span>
                      {plan.tier !== "enterprise" && (
                        <span className="text-muted-foreground text-sm">
                          /{isAnnual ? "year" : "month"}
                          {plan.perUser && "/user"}
                        </span>
                      )}
                    </div>

                    {isAnnual && plan.yearlySavings && (
                      <p className="text-xs text-success font-semibold mb-1">{plan.yearlySavings}</p>
                    )}
                    {plan.hasTrial && (
                      <p className="text-xs text-accent font-medium mb-1">14-day free trial</p>
                    )}

                    <div className="h-px bg-border my-5" />

                    <ul className="space-y-3 mb-8">
                      {plan.highlights.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2.5">
                          <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.featured ? "text-accent" : "text-success"}`} />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.featured ? "hero" : "outline"}
                      className="w-full"
                      size="lg"
                      onClick={() => handlePlanClick(plan.tier)}
                      disabled={loadingTier === plan.tier || !!isCurrentPlan}
                    >
                      {loadingTier === plan.tier ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isCurrentPlan ? (
                        "Current Plan"
                      ) : (
                        <>
                          {plan.cta}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>



        {/* ═══ Feature Comparison Table ═══ */}
        <section className="py-20 border-t border-border/30">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Compare every feature</h2>
              <p className="text-muted-foreground text-lg">See exactly what you get on each plan</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground w-[35%]">Feature</th>
                    <th className="text-center py-4 px-4 text-sm font-bold w-[16%]">Free</th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-accent w-[16%]">
                      Pro
                      <span className="block text-xs font-normal text-muted-foreground">Most popular</span>
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-bold w-[16%]">Team</th>
                    <th className="text-center py-4 px-4 text-sm font-bold w-[16%]">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_CATEGORIES.map((cat) => (
                    <>
                      <tr key={cat.category}>
                        <td colSpan={4} className="pt-8 pb-3 px-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-accent">{cat.category}</span>
                        </td>
                      </tr>
                      {cat.features.map((f) => (
                        <tr key={f.name} className="border-b border-border/30 hover:bg-accent/[0.02] transition-colors">
                          <td className="py-3 px-4 text-sm text-foreground">{f.name}</td>
                          <td className="py-3 px-4 text-center">{renderFeatureValue(f.free)}</td>
                          <td className="py-3 px-4 text-center bg-accent/[0.02]">{renderFeatureValue(f.pro)}</td>
                          <td className="py-3 px-4 text-center">{renderFeatureValue(f.team)}</td>
                          <td className="py-3 px-4 text-center">{renderFeatureValue((f as any).enterprise)}</td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CTA under table */}
            <div className="text-center mt-12">
              <Button variant="hero" size="xl" onClick={() => handlePlanClick("pro")} className="group">
                {user ? "Start Pro Free Trial" : "Get Started Free"}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <p className="text-xs text-muted-foreground mt-3">No credit card required to start your trial</p>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-20 border-t border-border/30">
          <div className="container-narrow">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently asked questions</h2>
            </div>

            <div className="max-w-2xl mx-auto space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full text-left rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 transition-colors"
                >
                  <div className="px-6 py-4 flex items-center justify-between gap-4">
                    <span className="font-medium text-foreground">{item.q}</span>
                    <span className="text-muted-foreground text-lg shrink-0">{expandedFaq === i ? "−" : "+"}</span>
                  </div>
                  {expandedFaq === i && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Final CTA ═══ */}
        <section className="py-20 border-t border-border/30">
          <div className="container-narrow">
            <div className="text-center glass-card p-12 md:p-16">
              <Shield className="h-10 w-10 text-accent mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Risk-free. Cancel anytime.
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                14-day free trial on all paid plans. Full refund guarantee within the first 14 days. Your data is always yours.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" size="xl" onClick={() => handlePlanClick("pro")} className="group">
                  Start Building for Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Questions?{" "}
                <a href="mailto:jagawins@gmail.com" className="text-accent hover:underline">jagawins@gmail.com</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
