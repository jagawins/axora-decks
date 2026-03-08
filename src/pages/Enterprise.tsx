import { Helmet } from "react-helmet-async";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, FileCheck, Users, Headphones, Lock, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const features = [
  {
    icon: Shield,
    title: "SSO & SAML 2.0",
    description: "Connect your identity provider — Okta, Azure AD, OneLogin, Google Workspace. One-click access for every employee, zero password fatigue.",
  },
  {
    icon: FileCheck,
    title: "Audit Logs & Compliance",
    description: "Full activity trail for every deck created, shared, and exported. Meet SOC 2, HIPAA, and GDPR requirements with confidence.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support & SLA",
    description: "Named account manager, priority response times, and a guaranteed uptime SLA tailored to your operational needs.",
  },
  {
    icon: Users,
    title: "Custom Onboarding",
    description: "White-glove rollout with training sessions, template migration, and brand kit setup so your team is productive from day one.",
  },
  {
    icon: Lock,
    title: "Advanced Permissions",
    description: "Granular role-based access control. Define who can create, edit, share, and export across teams and departments.",
  },
  {
    icon: Building2,
    title: "Custom Integrations",
    description: "API access and webhook support to connect AXIVA with your existing workflow — Slack, Teams, Confluence, and more.",
  },
];

const trustedBy = [
  "Fortune 500 strategy teams",
  "Global consulting firms",
  "Healthcare systems & NHS trusts",
  "Government agencies",
  "Financial institutions",
];

const Enterprise = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", teamSize: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.company.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    // mailto fallback
    const subject = encodeURIComponent(`AXIVA Enterprise Inquiry — ${form.company}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\nTeam size: ${form.teamSize}\n\n${form.message}`
    );
    window.location.href = `mailto:jagawins@gmail.com?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  };

  return (
    <>
      <Helmet>
        <title>Enterprise — SSO, SAML & Governance | AXIVA</title>
        <meta name="description" content="AXIVA Enterprise: SSO/SAML authentication, audit logs, dedicated support, custom onboarding, and advanced governance for large organisations." />
        <link rel="canonical" href="https://axiva.ai/enterprise" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "AXIVA Enterprise",
          description: "Enterprise-grade AI deck generation with SSO, SAML, audit logs, and dedicated support.",
          url: "https://axiva.ai/enterprise",
        })}</script>
      </Helmet>

      <MarketingHeader />

      <main className="pt-24 pb-0">
        {/* Hero */}
        <section className="section-padding relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="container-wide max-w-5xl relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Enterprise
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Built for teams that <br className="hidden sm:block" />
              <span className="text-accent">can't afford to compromise</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              SSO/SAML, audit logs, dedicated support, and custom onboarding — everything your security and procurement teams need to say yes.
            </p>
            <Button variant="hero" size="lg" className="text-base px-8" asChild>
              <a href="#contact-form">
                Talk to Sales <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>

        {/* Trusted by */}
        <section className="py-12 border-y border-border/50">
          <div className="container-wide">
            <p className="text-center text-sm text-muted-foreground uppercase tracking-wider mb-6">Trusted by</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
              {trustedBy.map((org) => (
                <span key={org} className="text-sm font-medium text-foreground/70">{org}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="section-padding">
          <div className="container-wide max-w-6xl">
            <div className="text-center mb-14">
              <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">Capabilities</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Enterprise-grade from the ground up
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Every feature your IT, security, and compliance teams require — built in, not bolted on.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {features.map((f) => (
                <div key={f.title} className="group p-6 rounded-2xl border border-border bg-card hover:border-accent/30 transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <f.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lead capture form */}
        <section id="contact-form" className="section-padding bg-muted/30">
          <div className="container-wide max-w-2xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Let's talk
              </h2>
              <p className="text-muted-foreground text-lg">
                Tell us about your team and we'll set up a personalised demo within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-16 px-6 rounded-2xl border border-border bg-card">
                <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">We've received your inquiry</h3>
                <p className="text-muted-foreground">Our enterprise team will be in touch within one business day.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 p-8 rounded-2xl border border-border bg-card">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="ent-name">Full name *</Label>
                    <Input id="ent-name" placeholder="Jane Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ent-email">Work email *</Label>
                    <Input id="ent-email" type="email" placeholder="jane@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} required />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="ent-company">Company *</Label>
                    <Input id="ent-company" placeholder="Acme Corp" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} maxLength={100} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ent-size">Team size</Label>
                    <Input id="ent-size" placeholder="e.g. 50–200" value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} maxLength={50} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ent-message">Anything else we should know?</Label>
                  <Textarea id="ent-message" placeholder="Requirements, timeline, integrations…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={1000} rows={4} />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Request a Demo"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">No spam. We'll respond within one business day.</p>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Enterprise;
