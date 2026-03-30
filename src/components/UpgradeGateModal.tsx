import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Check, ArrowRight, Crown, Zap, Image, Download, Palette, BarChart3, Briefcase } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getVariant, trackABEvent } from "@/lib/ab-testing";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import { useNavigate } from "react-router-dom";
import { getUsageSummary } from "@/lib/usage-gates";

interface UpgradeGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

/* ── Feature-specific messaging for higher conversion ── */
const FEATURE_CONTEXTS: Record<string, {
  icon: typeof Lock;
  headline: string;
  subtext: string;
  highlight: string;
}> = {
  "PowerPoint Export": {
    icon: Download,
    headline: "Export to PowerPoint",
    subtext: "Download your deck as a .pptx file — editable in PowerPoint, Google Slides, or Keynote.",
    highlight: "Most popular Pro feature — used by 89% of paid users",
  },
  "PDF Export": {
    icon: Download,
    headline: "Export to PDF",
    subtext: "Generate a print-ready PDF with your brand colors and fonts preserved.",
    highlight: "Perfect for investor data rooms and board packets",
  },
  "AI Image Generation": {
    icon: Image,
    headline: "AI Image Generation",
    subtext: "Generate custom visuals for your slides — charts, diagrams, and illustrations.",
    highlight: "Pro users create 3× more engaging decks with AI images",
  },
  "Premium Templates": {
    icon: Palette,
    headline: "Premium Templates",
    subtext: "Access all 68+ executive templates — board updates, investor pitches, strategy decks.",
    highlight: "Templates designed by ex-McKinsey and ex-BCG consultants",
  },
  "Premium Themes": {
    icon: Palette,
    headline: "Premium Themes",
    subtext: "Apply professionally designed themes with custom typography and color systems.",
    highlight: "One-click brand consistency across every slide",
  },
  "Interactive Blocks": {
    icon: Zap,
    headline: "Interactive Blocks",
    subtext: "Add tabs, toggles, reveals, and interactive elements that bring data to life.",
    highlight: "Interactive decks get 2.4× more engagement",
  },
  "Brand Kit": {
    icon: Crown,
    headline: "Custom Brand Kit",
    subtext: "Set your logo, fonts, and colors once — applied automatically to every new deck.",
    highlight: "Save 30 minutes per deck on manual formatting",
  },
  "Analytics": {
    icon: BarChart3,
    headline: "Deck Analytics",
    subtext: "Track views, time per slide, and engagement metrics on shared decks.",
    highlight: "Know exactly which slides resonate with your audience",
  },
};

const DEFAULT_CONTEXT = {
  icon: Lock,
  headline: "Generation Limit Reached",
  subtext: "You've used all your free deck generations. Upgrade to continue creating.",
  highlight: "Pro users generate unlimited decks with zero restrictions",
};

const VARIANT_CTA = {
  control: { cta: "Start 14-Day Free Trial", subCta: "No credit card required" },
  trial_emphasis: { cta: "Try Pro Free for 14 Days", subCta: "Cancel anytime — no commitment" },
  feature_preview: { cta: "Unlock Executive Features", subCta: "Board decks, investor updates, brand kits" },
};

const PRO_FEATURES = [
  "Unlimited board & strategy decks",
  "PowerPoint & PDF export",
  "AI image generation",
  "68+ executive templates",
  "Brand Kit (fonts, colors, logo)",
  "Interactive blocks & KPI dashboards",
  "Presenter view & deck analytics",
  "Priority support",
];

export function UpgradeGateModal({ open, onOpenChange, feature }: UpgradeGateModalProps) {
  const { subscription, createCheckout } = useSubscription();
  const navigate = useNavigate();
  const variant = getVariant("upgrade_gate_cta") as keyof typeof VARIANT_CTA;
  const ctaCopy = VARIANT_CTA[variant] || VARIANT_CTA.control;

  const ctx = feature ? (FEATURE_CONTEXTS[feature] || { ...DEFAULT_CONTEXT, headline: `${feature} is a Pro Feature` }) : DEFAULT_CONTEXT;
  const Icon = ctx.icon;
  const usage = getUsageSummary(subscription.tier);

  useEffect(() => {
    if (open) trackABEvent("upgrade_gate_cta", "impression", feature);
  }, [open, feature]);

  const handleUpgrade = async () => {
    trackABEvent("upgrade_gate_cta", "click", feature);
    const priceId = SUBSCRIPTION_TIERS.pro.monthlyPriceId;
    if (!priceId) return;
    const url = await createCheckout(priceId);
    if (url) window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10 border border-accent/20">
              <Icon className="h-4 w-4 text-accent" />
            </div>
            {ctx.headline}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {ctx.subtext}
          </DialogDescription>
        </DialogHeader>

        {/* Social proof highlight */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/5 border border-accent/10">
          <Sparkles className="h-3.5 w-3.5 text-accent shrink-0" />
          <p className="text-xs text-accent font-medium">{ctx.highlight}</p>
        </div>

        {/* Usage meter for free users */}
        {subscription.tier === "free" && (
          <div className="space-y-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your usage today</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Decks", used: usage.decks.used, limit: usage.decks.limit },
                { label: "AI Actions", used: usage.aiGens.used, limit: usage.aiGens.limit },
                { label: "AI Images", used: usage.aiImages.used, limit: usage.aiImages.limit },
              ].map(m => (
                <div key={m.label} className="rounded-lg border border-border/50 p-2.5 text-center">
                  <div className="text-sm font-bold text-foreground">{m.used}<span className="text-muted-foreground font-normal">/{m.limit}</span></div>
                  <div className="text-[10px] text-muted-foreground">{m.label}</div>
                  <div className="mt-1.5 h-1 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (m.used / m.limit) * 100)}%`,
                        backgroundColor: m.used >= m.limit ? "hsl(var(--destructive))" : "hsl(var(--accent))",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pro features */}
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-foreground">Everything in Pro</p>
            <span className="text-sm font-bold text-accent">$28/mo</span>
          </div>
          <ul className="grid grid-cols-2 gap-1.5">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Check className="h-3 w-3 text-accent mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button variant="hero" onClick={handleUpgrade} className="group flex-1">
            {ctaCopy.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </DialogFooter>

        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span>{ctaCopy.subCta}</span>
          <span>•</span>
          <span>Cancel anytime</span>
          <span>•</span>
          <button
            onClick={() => { onOpenChange(false); navigate("/pricing"); }}
            className="text-accent hover:underline"
          >
            Compare all plans
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Re-export from usage-gates for backward compat ── */
export { getDeckGenCount, incrementDeckGenCount, canGenerateDeck } from "@/lib/usage-gates";
