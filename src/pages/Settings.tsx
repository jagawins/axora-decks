import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HEADING_FONTS, BODY_FONTS, type HeadingFont, type BodyFont, type BrandKit } from "@/lib/brand";
import { THEMES, type ThemeId } from "@/lib/themes";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import {
  Settings as SettingsIcon,
  User,
  Palette,
  CreditCard,
  Key,
  Save,
  Loader2,
} from "lucide-react";

type SettingsTab = "overview" | "brand" | "billing";

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: SettingsIcon },
  { id: "brand", label: "Workspace Defaults", icon: Palette },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("free");
  const [brandKit, setBrandKit] = useState<BrandKit>({});

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setName(data.name || "");
        setEmail(data.email || "");
        setTier(data.tier || "free");
        setBrandKit((data.brand_kit as BrandKit) || {});
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name, brand_kit: brandKit as any })
        .eq("user_id", user.id);

      if (error) throw error;
      toast({ title: "Settings saved" });
    } catch (e) {
      console.error("Error saving:", e);
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <SeoHead title="Settings | AXIVA" description="Manage your workspace settings, brand defaults, and billing." canonicalPath="/settings" />
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Settings
          </h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Tab nav — horizontal scrollable on mobile, vertical on md+ */}
            <nav className="md:w-56 shrink-0 flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left whitespace-nowrap touch-target",
                      "md:w-full",
                      activeTab === tab.id
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              ) : (
                <>
                  {activeTab === "overview" && (
                    <OverviewTab
                      name={name}
                      setName={setName}
                      email={email}
                      tier={tier}
                      saving={saving}
                      onSave={saveProfile}
                    />
                  )}
                  {activeTab === "brand" && (
                    <BrandTab
                      brandKit={brandKit}
                      setBrandKit={setBrandKit}
                      saving={saving}
                      onSave={saveProfile}
                    />
                  )}
                  {activeTab === "billing" && <BillingTab tier={tier} />}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}

// ─── Overview Tab ─────────────────────────────────────────
function OverviewTab({
  name, setName, email, tier, saving, onSave,
}: {
  name: string; setName: (v: string) => void;
  email: string; tier: string;
  saving: boolean; onSave: () => void;
}) {
  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Basic Info</h2>
        <Separator className="my-4" />
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Workspace Name</Label>
          <p className="text-xs text-muted-foreground mb-1.5">e.g. your team or company name</p>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <Label>Email</Label>
          <p className="text-sm text-muted-foreground mt-1">{email}</p>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <Label>Plan</Label>
            <p className="text-sm text-muted-foreground mt-0.5">Your current subscription</p>
          </div>
          <Badge variant={tier === "free" ? "secondary" : "default"} className="capitalize">
            {tier}
          </Badge>
        </div>
      </div>

      <Button onClick={onSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </Button>
    </div>
  );
}

// ─── Brand Defaults Tab ───────────────────────────────────
function BrandTab({
  brandKit, setBrandKit, saving, onSave,
}: {
  brandKit: BrandKit;
  setBrandKit: (bk: BrandKit) => void;
  saving: boolean; onSave: () => void;
}) {
  const updateColors = (key: string, value: string) => {
    setBrandKit({
      ...brandKit,
      colors: { ...brandKit.colors, [key]: value },
    });
  };

  const updateTypography = (key: string, value: string) => {
    setBrandKit({
      ...brandKit,
      typography: { ...brandKit.typography, [key]: value } as any,
    });
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Workspace Defaults</h2>
        <p className="text-sm text-muted-foreground">Set default colors and fonts for new decks</p>
        <Separator className="my-4" />
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Brand Colors</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "primary", label: "Primary" },
            { key: "accent", label: "Accent" },
            { key: "background", label: "Background" },
            { key: "foreground", label: "Text" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="color"
                value={(brandKit.colors as any)?.[key] || "#3b82f6"}
                onChange={(e) => updateColors(key, e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Typography */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Typography</Label>

        <div>
          <Label className="text-xs text-muted-foreground">Heading Font</Label>
          <Select
            value={brandKit.typography?.headingFont || "Inter"}
            onValueChange={(v) => updateTypography("headingFont", v)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {HEADING_FONTS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  <span className="flex items-center gap-2">
                    {f.label}
                    <span className="text-xs text-muted-foreground">· {f.style}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Body Font</Label>
          <Select
            value={brandKit.typography?.bodyFont || "Inter"}
            onValueChange={(v) => updateTypography("bodyFont", v)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {BODY_FONTS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  <span className="flex items-center gap-2">
                    {f.label}
                    <span className="text-xs text-muted-foreground">· {f.style}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Default Theme */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Default Theme</Label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(THEMES) as [string, { label: string; preview: string }][]).map(([id, theme]) => (
            <button
              key={id}
              onClick={() => setBrandKit({ ...brandKit, colors: { ...brandKit.colors } })}
              className={cn(
                "rounded-lg p-1 border-2 transition-colors",
                "border-transparent hover:border-accent/40"
              )}
            >
              <div className={cn("h-8 rounded-md bg-gradient-to-br", theme.preview)} />
              <span className="text-[10px] text-muted-foreground mt-1 block text-center">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={onSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Defaults
      </Button>
    </div>
  );
}

// ─── Billing Tab ──────────────────────────────────────────
function BillingTab({ tier }: { tier: string }) {
  const { subscription, createCheckout, openCustomerPortal } = useSubscription();
  const { toast } = useToast();
  const [portalLoading, setPortalLoading] = useState(false);

  // Import usage data
  const [usage, setUsage] = useState<any>(null);
  useEffect(() => {
    import("@/lib/usage-gates").then(({ getUsageSummary }) => {
      setUsage(getUsageSummary(subscription.tier));
    });
  }, [subscription.tier]);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const url = await openCustomerPortal();
      if (url) {
        window.open(url, "_blank");
      } else {
        toast({ title: "Unable to open billing portal", variant: "destructive" });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCheckout = async (priceId: string) => {
    const url = await createCheckout(priceId);
    if (url) window.open(url, "_blank");
  };

  const isPaid = subscription.subscribed;
  const tierConfig = SUBSCRIPTION_TIERS[subscription.tier] || SUBSCRIPTION_TIERS.free;

  // Calculate next reset date (first of next month)
  const now = new Date();
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextResetLabel = nextReset.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Billing & Usage</h2>
        <p className="text-sm text-muted-foreground">Manage your plan and track usage</p>
        <Separator className="my-4" />
      </div>

      {/* Current plan card */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Plan</p>
            <p className="text-xl font-bold text-foreground mt-1 capitalize">{tierConfig.name}</p>
          </div>
          <Badge
            variant={isPaid ? "default" : "secondary"}
            className="capitalize text-sm px-3 py-1"
          >
            {isPaid ? "Active" : "Free"}
          </Badge>
        </div>

        {isPaid && subscription.subscriptionEnd && (
          <p className="text-xs text-muted-foreground">
            Renews {new Date(subscription.subscriptionEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        )}

        {/* Usage meters */}
        {usage && (
          <div className="space-y-3 pt-2">
            <UsageMeterRow
              label="Decks created"
              used={usage.decks.used}
              limit={usage.decks.limit}
              unlimited={usage.decks.unlimited}
            />
            <UsageMeterRow
              label="AI actions"
              used={usage.aiGens.used}
              limit={usage.aiGens.limit}
              unlimited={usage.aiGens.unlimited}
            />
            {!isPaid && (
              <p className="text-[11px] text-muted-foreground pt-1">
                Usage resets <span className="font-medium text-foreground">{nextResetLabel}</span>
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2">
          {isPaid ? (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="gap-2"
            >
              {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Manage Subscription
            </Button>
          ) : (
            <Button variant="hero" onClick={handleManageSubscription} disabled={portalLoading} className="gap-2">
              {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
              Upgrade Plan
            </Button>
          )}
        </div>
      </div>

      {/* Upgrade cards for free users */}
      {!isPaid && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Available Plans</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pro */}
            <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground">Pro</h4>
                <Badge className="bg-accent text-accent-foreground text-[10px]">Popular</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">
                $28<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-1.5">✓ Unlimited decks</li>
                <li className="flex items-center gap-1.5">✓ Unlimited AI actions</li>
                <li className="flex items-center gap-1.5">✓ PDF + PPTX export</li>
                <li className="flex items-center gap-1.5">✓ Custom themes</li>
              </ul>
              <Button
                variant="hero"
                size="sm"
                className="w-full"
                onClick={() => handleCheckout(SUBSCRIPTION_TIERS.pro.monthlyPriceId!)}
              >
                Start 14-Day Trial
              </Button>
              <button
                onClick={() => handleCheckout(SUBSCRIPTION_TIERS.pro.yearlyPriceId!)}
                className="w-full text-center text-[11px] text-accent hover:underline"
              >
                or $269/year (save 20%)
              </button>
            </div>

            {/* Team */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h4 className="font-bold text-foreground">Team</h4>
              <p className="text-2xl font-bold text-foreground">
                $78<span className="text-sm font-normal text-muted-foreground">/user/mo</span>
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-1.5">✓ Everything in Pro</li>
                <li className="flex items-center gap-1.5">✓ Team collaboration</li>
                <li className="flex items-center gap-1.5">✓ DOCX export</li>
                <li className="flex items-center gap-1.5">✓ Priority support</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleCheckout(SUBSCRIPTION_TIERS.team.monthlyPriceId!)}
              >
                Start 14-Day Trial
              </Button>
              <button
                onClick={() => handleCheckout(SUBSCRIPTION_TIERS.team.yearlyPriceId!)}
                className="w-full text-center text-[11px] text-muted-foreground hover:underline"
              >
                or $749/year (save 20%)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Usage Meter Row ─────────────────────────────────────
function UsageMeterRow({ label, used, limit, unlimited }: { label: string; used: number; limit: number; unlimited: boolean }) {
  const pct = unlimited ? 0 : Math.min(100, (used / limit) * 100);
  const isMaxed = !unlimited && used >= limit;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("text-sm font-semibold", isMaxed ? "text-destructive" : "text-foreground")}>
          {unlimited ? "Unlimited" : `${used} / ${limit}`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              backgroundColor: isMaxed ? "hsl(var(--destructive))" : pct >= 70 ? "hsl(35, 90%, 55%)" : "hsl(var(--accent))",
            }}
          />
        </div>
      )}
    </div>
  );
}
