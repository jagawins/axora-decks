import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HEADING_FONTS, BODY_FONTS, type BrandKit } from "@/lib/brand";
import { THEMES } from "@/lib/themes";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import {
  Settings as SettingsIcon,
  User,
  Palette,
  CreditCard,
  Shield,
  Bell,
  Gift,
  Key,
  Save,
  Loader2,
  Crown,
  Copy,
  Check,
  Lock,
  Camera,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";

type SettingsTab = "profile" | "brand" | "security" | "notifications" | "billing" | "referral" | "api";

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "brand", label: "Workspace Defaults", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "referral", label: "Invite & Earn", icon: Gift },
  { id: "api", label: "API Keys", icon: Key },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("free");
  const [brandKit, setBrandKit] = useState<BrandKit>({});
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
      // Get avatar from user metadata
      setAvatarUrl(user.user_metadata?.avatar_url || null);
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
      <SeoHead title="Settings | AXIVA" description="Manage your profile, workspace settings, security, and billing." canonicalPath="/settings" />
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Settings
          </h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Tab nav */}
            {/* Mobile: dropdown selector */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => {
                  const el = document.getElementById('settings-mobile-menu');
                  if (el) el.classList.toggle('hidden');
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground"
              >
                <span className="flex items-center gap-2.5">
                  {(() => { const Icon = TABS.find(t => t.id === activeTab)?.icon || User; return <Icon className="h-4 w-4" />; })()}
                  {TABS.find(t => t.id === activeTab)?.label}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              <div id="settings-mobile-menu" className="hidden mt-1 rounded-xl border border-border bg-card overflow-hidden">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        const el = document.getElementById('settings-mobile-menu');
                        if (el) el.classList.add('hidden');
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors text-left",
                        activeTab === tab.id
                          ? "bg-accent/10 text-accent"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                      {tab.id === "api" && tier === "free" && (
                        <Lock className="h-3 w-3 ml-auto text-muted-foreground/50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop: vertical tab nav */}
            <nav className="hidden md:flex md:w-56 shrink-0 md:flex-col gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full",
                      activeTab === tab.id
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {tab.id === "api" && tier === "free" && (
                      <Lock className="h-3 w-3 ml-auto text-muted-foreground/50" />
                    )}
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
                  {activeTab === "profile" && (
                    <ProfileTab
                      name={name}
                      setName={setName}
                      email={email}
                      tier={tier}
                      avatarUrl={avatarUrl}
                      userId={user.id}
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
                  {activeTab === "security" && (
                    <SecurityTab user={user} />
                  )}
                  {activeTab === "notifications" && (
                    <NotificationsTab />
                  )}
                  {activeTab === "billing" && <BillingTab tier={tier} />}
                  {activeTab === "referral" && <ReferralTab userId={user.id} />}
                  {activeTab === "api" && <ApiKeysTab tier={tier} />}
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

// ─── Profile Tab ──────────────────────────────────────────
function ProfileTab({
  name, setName, email, tier, avatarUrl, userId, saving, onSave,
}: {
  name: string; setName: (v: string) => void;
  email: string; tier: string;
  avatarUrl: string | null; userId: string;
  saving: boolean; onSave: () => void;
}) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(avatarUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Image must be under 2MB", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    try {
      // Upload to Supabase storage
      const ext = file.name.split(".").pop();
      const path = `avatars/${userId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("brand-logos")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("brand-logos")
        .getPublicUrl(path);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      setLocalAvatar(publicUrl);
      toast({ title: "Avatar updated" });
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast({ title: "Failed to upload avatar", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const initials = (name || email || "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">Your personal info and appearance</p>
        <Separator className="my-4" />
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative group">
          <div className="h-20 w-20 rounded-full bg-accent/10 border-2 border-border flex items-center justify-center overflow-hidden">
            {localAvatar ? (
              <img src={localAvatar} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-accent">{initials}</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            {uploadingAvatar ? (
              <Loader2 className="h-5 w-5 animate-spin text-foreground" />
            ) : (
              <Camera className="h-5 w-5 text-foreground" />
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{name || "No name set"}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
          <Badge variant={tier === "free" ? "secondary" : "default"} className="capitalize mt-1.5 text-[10px]">
            {tier} plan
          </Badge>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="display-name">Display Name</Label>
          <p className="text-xs text-muted-foreground mb-1.5">Visible on shared decks and team views</p>
          <Input id="display-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>

        <div>
          <Label>Email</Label>
          <div className="flex items-center gap-2 mt-1">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      </div>

      <Button onClick={onSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </Button>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────
function SecurityTab({ user }: { user: any }) {
  const { toast } = useToast();
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Determine auth provider
  const provider = user?.app_metadata?.provider || "email";
  const providers = user?.app_metadata?.providers || [provider];

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);
    } catch (err: any) {
      toast({ title: err.message || "Failed to update password", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const providerLabels: Record<string, { label: string; icon: string }> = {
    email: { label: "Email & Password", icon: "✉️" },
    google: { label: "Google", icon: "🔵" },
    apple: { label: "Apple", icon: "🍎" },
    azure: { label: "Microsoft", icon: "🟦" },
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground">Password and sign-in methods</p>
        <Separator className="my-4" />
      </div>

      {/* Connected accounts */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Connected Accounts</Label>
        <div className="space-y-2">
          {providers.map((p: string) => {
            const info = providerLabels[p] || { label: p, icon: "🔗" };
            return (
              <div key={p} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
                <span className="text-lg">{info.icon}</span>
                <span className="text-sm font-medium text-foreground">{info.label}</span>
                <Badge variant="secondary" className="ml-auto text-[10px]">Connected</Badge>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Password change */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Password</Label>
        {providers.includes("email") ? (
          <>
            {!changingPassword ? (
              <Button variant="outline" size="sm" onClick={() => setChangingPassword(true)} className="gap-2">
                <Shield className="h-4 w-4" />
                Change Password
              </Button>
            ) : (
              <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
                <div className="relative">
                  <Label htmlFor="new-pw" className="text-xs text-muted-foreground">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-pw"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-pw" className="text-xs text-muted-foreground">Confirm Password</Label>
                  <Input
                    id="confirm-pw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleChangePassword} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Update Password
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setChangingPassword(false); setNewPassword(""); setConfirmPassword(""); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            You signed in with {providerLabels[provider]?.label || provider}. Password management is handled by your identity provider.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────
function NotificationsTab() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState({
    deckShared: true,
    comments: true,
    weeklyDigest: false,
    productUpdates: true,
    tipsAndTricks: false,
  });

  const toggle = (key: keyof typeof prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    // Store locally for now — will sync to DB when collaboration ships
    try { localStorage.setItem("axiva_notification_prefs", JSON.stringify(updated)); } catch {}
    toast({ title: "Preference updated" });
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("axiva_notification_prefs");
      if (stored) setPrefs(JSON.parse(stored));
    } catch {}
  }, []);

  const items: { key: keyof typeof prefs; label: string; desc: string; comingSoon?: boolean }[] = [
    { key: "deckShared", label: "Deck shared with me", desc: "Get notified when someone shares a deck with you", comingSoon: true },
    { key: "comments", label: "Comments & mentions", desc: "Notifications for new comments on your decks", comingSoon: true },
    { key: "weeklyDigest", label: "Weekly analytics digest", desc: "Summary of views and engagement on your shared decks" },
    { key: "productUpdates", label: "Product updates", desc: "New features, improvements, and important changes" },
    { key: "tipsAndTricks", label: "Tips & best practices", desc: "Presentation tips and AXIVA usage guides" },
  ];

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground">Control what emails you receive</p>
        <Separator className="my-4" />
      </div>

      <div className="space-y-1">
        {items.map(({ key, label, desc, comingSoon }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
            <div className="flex-1 mr-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{label}</p>
                {comingSoon && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Soon</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <Switch
              checked={prefs[key]}
              onCheckedChange={() => toggle(key)}
              disabled={comingSoon}
            />
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border/50 bg-muted/20 p-3 flex items-start gap-2">
        <Bell className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Preferences are saved on this device only. They'll sync across devices once collaboration features launch.
        </p>
      </div>
    </div>
  );
}

// ─── Referral Tab ─────────────────────────────────────────
function ReferralTab({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [referralCredits, setReferralCredits] = useState(0);

  useEffect(() => {
    import("@/lib/usage-gates").then(({ getReferralCode, getReferralCount, getReferralCredits }) => {
      setReferralCode(getReferralCode(userId));
      setReferralCount(getReferralCount());
      setReferralCredits(getReferralCredits());
    });
  }, [userId]);

  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Invite & Earn</h2>
        <p className="text-sm text-muted-foreground">Share AXIVA and earn extra deck credits</p>
        <Separator className="my-4" />
      </div>

      {/* Stats — show empty state or live stats */}
      {referralCount === 0 && referralCredits === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-6 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <Gift className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No referrals yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Share your link below — when someone signs up and creates their first deck, you'll both earn a bonus credit. Your stats will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card/50 p-4 text-center">
            <p className="text-2xl font-bold text-accent">{referralCount}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Referrals</p>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-4 text-center">
            <p className="text-2xl font-bold text-accent">{referralCredits}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Credits Earned</p>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">+1</p>
            <p className="text-[11px] text-muted-foreground mt-1">Per Referral</p>
          </div>
        </div>
      )}

      {/* Referral link */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Your Referral Link</Label>
        <div className="flex gap-2">
          <Input value={referralLink} readOnly className="font-mono text-xs" />
          <Button variant="outline" size="icon" onClick={copyLink} className="shrink-0">
            {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Each person who signs up with your link earns you <span className="font-semibold text-accent">+1 bonus deck</span> generation.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-border bg-accent/5 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">How it works</h3>
        <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Share your referral link with colleagues</li>
          <li>They sign up and create their first deck</li>
          <li>You both get +1 bonus deck generation credit</li>
        </ol>
      </div>
    </div>
  );
}

// ─── API Keys Tab ─────────────────────────────────────────
function ApiKeysTab({ tier }: { tier: string }) {
  const isPro = tier !== "free";
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground">API Keys</h2>
        <p className="text-sm text-muted-foreground">Programmatic access to AXIVA</p>
        <Separator className="my-4" />
      </div>

      {isPro ? (
        <div className="rounded-xl border border-border bg-card/50 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Key className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">API Access</h3>
              <p className="text-xs text-muted-foreground">Coming soon — we're building this now</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate decks programmatically, integrate with your workflows, and automate presentations via the AXIVA API. You'll be among the first to access it.
          </p>
          <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border p-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
            <Lock className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Pro Feature</h3>
            <p className="text-sm text-muted-foreground mt-1">
              API access is available on the Pro plan and above. Generate decks programmatically, integrate with your tools, and automate at scale.
            </p>
          </div>
          <Button variant="hero" onClick={() => navigate("/pricing")} className="gap-2">
            <Crown className="h-4 w-4" />
            Upgrade to Pro
          </Button>
        </div>
      )}
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
  const { subscription, createCheckout, openCustomerPortal, cancelSubscription } = useSubscription();
  const { toast } = useToast();
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

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
          <Badge variant={isPaid ? "default" : "secondary"} className="capitalize text-sm px-3 py-1">
            {isPaid ? "Active" : "Free"}
          </Badge>
        </div>

        {isPaid && subscription.subscriptionEnd && (
          <p className="text-xs text-muted-foreground">
            Renews {new Date(subscription.subscriptionEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        )}

        {usage && (
          <div className="space-y-3 pt-2">
            <UsageMeterRow label="Decks created" used={usage.decks.used} limit={usage.decks.limit} unlimited={usage.decks.unlimited} />
            <UsageMeterRow label="AI actions" used={usage.aiGens.used} limit={usage.aiGens.limit} unlimited={usage.aiGens.unlimited} />
            {!isPaid && (
              <p className="text-[11px] text-muted-foreground pt-1">
                Usage resets <span className="font-medium text-foreground">{nextResetLabel}</span>
              </p>
            )}
          </div>
        )}

        <div className="pt-2 space-y-3">
          {isPaid ? (
            <>
              <Button variant="outline" onClick={handleManageSubscription} disabled={portalLoading} className="gap-2">
                {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Manage Subscription
              </Button>

              <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                >
                  Cancel Free Trial
                </Button>

                <CancelFeedbackModal
                  open={showCancelModal}
                  onOpenChange={setShowCancelModal}
                  cancelLoading={cancelLoading}
                  onConfirmCancel={async () => {
                    setCancelLoading(true);
                    try {
                      const success = await cancelSubscription();
                      if (success) {
                        toast({ title: "Subscription canceled", description: "You've been moved to the Free plan." });
                        setShowCancelModal(false);
                        return true;
                      } else {
                        toast({ title: "Unable to cancel", description: "Please try again or contact support.", variant: "destructive" });
                        return false;
                      }
                    } catch {
                      toast({ title: "Something went wrong", variant: "destructive" });
                      return false;
                    } finally {
                      setCancelLoading(false);
                    }
                  }}
                />
            </>
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
            <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground">Pro</h4>
                <Badge className="bg-accent text-accent-foreground text-[10px]">Popular</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">$28<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-1.5">✓ Unlimited decks</li>
                <li className="flex items-center gap-1.5">✓ Unlimited AI actions</li>
                <li className="flex items-center gap-1.5">✓ PDF + PPTX export</li>
                <li className="flex items-center gap-1.5">✓ Custom themes</li>
              </ul>
              <Button variant="hero" size="sm" className="w-full" onClick={() => handleCheckout(SUBSCRIPTION_TIERS.pro.monthlyPriceId!)}>
                Start 14-Day Trial
              </Button>
              <button onClick={() => handleCheckout(SUBSCRIPTION_TIERS.pro.yearlyPriceId!)} className="w-full text-center text-[11px] text-accent hover:underline">
                or $269/year (save 20%)
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h4 className="font-bold text-foreground">Team</h4>
              <p className="text-2xl font-bold text-foreground">$78<span className="text-sm font-normal text-muted-foreground">/user/mo</span></p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-1.5">✓ Everything in Pro</li>
                <li className="flex items-center gap-1.5">✓ Team collaboration</li>
                <li className="flex items-center gap-1.5">✓ DOCX export</li>
                <li className="flex items-center gap-1.5">✓ Priority support</li>
              </ul>
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleCheckout(SUBSCRIPTION_TIERS.team.monthlyPriceId!)}>
                Start 14-Day Trial
              </Button>
              <button onClick={() => handleCheckout(SUBSCRIPTION_TIERS.team.yearlyPriceId!)} className="w-full text-center text-[11px] text-muted-foreground hover:underline">
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
