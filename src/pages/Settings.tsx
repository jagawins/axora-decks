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
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Billing</h2>
        <p className="text-sm text-muted-foreground">Manage your subscription</p>
        <Separator className="my-4" />
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
        <div>
          <p className="font-medium text-foreground">Current Plan</p>
          <p className="text-sm text-muted-foreground">
            {tier === "free" ? "Free plan with basic features" : `${tier} plan with full features`}
          </p>
        </div>
        <Badge variant={tier === "free" ? "secondary" : "default"} className="capitalize text-sm">
          {tier}
        </Badge>
      </div>

      <Button variant="outline" asChild>
        <a href="/pricing">View Plans & Upgrade</a>
      </Button>
    </div>
  );
}
