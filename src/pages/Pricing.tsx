import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      description: "For trying the product",
      price: "$0",
      period: "forever",
      features: [
        "Limited deck generation",
        "Basic export",
        "Standard themes"
      ],
      cta: "Get Started",
      featured: false
    },
    {
      name: "Pro",
      description: "For operators, leaders, consultants",
      price: "$29",
      period: "/month",
      features: [
        "Unlimited deck generation",
        "PPTX export",
        "Advanced themes",
        "Priority AI processing"
      ],
      cta: "Start Pro Trial",
      featured: true
    },
    {
      name: "Team",
      description: "For companies and departments",
      price: "$79",
      period: "/user/month",
      features: [
        "Everything in Pro",
        "Shared workspaces",
        "Governance controls",
        "Centralized billing",
        "Admin dashboard"
      ],
      cta: "Contact Sales",
      featured: false
    }
  ];

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
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Start free. Upgrade when you're ready for more power.
              </p>
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
                  className={`glass-card p-8 relative ${plan.featured ? 'border-accent/50 ring-1 ring-accent/20' : ''}`}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-accent shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/auth" className="block">
                    <Button 
                      variant={plan.featured ? "hero" : "outline"} 
                      className="w-full"
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ or Trust */}
        <section className="py-20 border-t border-white/5">
          <div className="container-narrow text-center">
            <p className="text-muted-foreground">
              Questions? Contact us at{" "}
              <a href="mailto:hello@axor.verityaxis.com" className="text-accent hover:underline">
                hello@axor.verityaxis.com
              </a>
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;