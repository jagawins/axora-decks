import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BrandKit as BrandKitType,
  HEADING_FONTS,
  BODY_FONTS,
  TYPOGRAPHY_SCALES,
  isBrandKitConfigured,
} from "@/lib/brand";
import {
  Palette,
  Save,
  Loader2,
  Upload,
  X,
  Type,
  Image as ImageIcon,
  Building2,
  RotateCcw,
} from "lucide-react";

export default function BrandKitPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKitType>({});

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadBrandKit();
  }, [user]);

  const loadBrandKit = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("brand_kit")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      if (data?.brand_kit) setBrandKit(data.brand_kit as BrandKitType);
    } catch (e) {
      console.error("Error loading brand kit:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveBrandKit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ brand_kit: brandKit as any })
        .eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Brand Kit saved" });
    } catch (e) {
      console.error("Error saving:", e);
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validTypes = ["image/png", "image/svg+xml", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Upload PNG, SVG, JPG, or WebP.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("brand-logos")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("brand-logos")
        .getPublicUrl(path);

      setBrandKit({
        ...brandKit,
        logo: { ...brandKit.logo, url: urlData.publicUrl },
      });
      toast({ title: "Logo uploaded" });
    } catch (e) {
      console.error("Upload error:", e);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeLogo = () => {
    setBrandKit({ ...brandKit, logo: { ...brandKit.logo, url: null } });
  };

  const updateColor = (key: string, value: string) => {
    setBrandKit({ ...brandKit, colors: { ...brandKit.colors, [key]: value } });
  };

  const updateTypography = (key: string, value: string) => {
    setBrandKit({ ...brandKit, typography: { ...brandKit.typography, [key]: value } as any });
  };

  if (!user) return null;

  const colors = brandKit.colors || {};
  const typography = brandKit.typography || {};

  const COLOR_FIELDS = [
    { key: "primary", label: "Primary", default: "#6C2BD9" },
    { key: "secondary", label: "Secondary", default: "#3b82f6" },
    { key: "accent", label: "Accent", default: "#f59e0b" },
    { key: "background", label: "Background", default: "#ffffff" },
    { key: "foreground", label: "Text", default: "#1a1a2e" },
    { key: "muted", label: "Muted", default: "#94a3b8" },
  ];

  return (
    <>
      <SeoHead
        title="Brand Kit | AXORA"
        description="Customize your brand identity — colors, fonts, logo, and company name for all generated decks."
        canonicalPath="/brand-kit"
      />
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Palette className="h-8 w-8 text-accent" />
                Brand Kit
              </h1>
              <p className="text-muted-foreground mt-1">
                Define your brand identity. These settings apply to all generated decks.
              </p>
            </div>
            <Button onClick={saveBrandKit} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Brand Kit
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="grid md:grid-cols-[1fr,320px] gap-8">
              {/* Left: Settings */}
              <div className="space-y-8">
                {/* Brand Name */}
                <section className="space-y-4 bg-card/50 border border-border/50 rounded-xl p-6">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-semibold">Brand Name</h2>
                  </div>
                  <Input
                    placeholder="e.g. Acme Corp"
                    value={brandKit.brandName || ""}
                    onChange={(e) => setBrandKit({ ...brandKit, brandName: e.target.value })}
                    className="max-w-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-populates title slides, headers, and footers in generated decks.
                  </p>
                </section>

                {/* Logo */}
                <section className="space-y-4 bg-card/50 border border-border/50 rounded-xl p-6">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-semibold">Logo</h2>
                  </div>

                  {brandKit.logo?.url ? (
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-20 border border-border rounded-lg flex items-center justify-center bg-muted/30 p-2">
                        <img
                          src={brandKit.logo.url}
                          alt="Brand logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-3.5 w-3.5 mr-1.5" />
                          Replace
                        </Button>
                        <Button variant="ghost" size="sm" onClick={removeLogo} className="text-destructive">
                          <X className="h-3.5 w-3.5 mr-1.5" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full max-w-sm border-2 border-dashed border-border/60 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-accent/50 hover:bg-accent/5 transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-accent" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Upload logo</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, SVG, JPG · Max 2 MB</p>
                      </div>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />

                  <div className="max-w-[200px]">
                    <Label className="text-xs text-muted-foreground">Logo Placement</Label>
                    <Select
                      value={brandKit.logo?.placement || "top-left"}
                      onValueChange={(v) =>
                        setBrandKit({ ...brandKit, logo: { ...brandKit.logo, placement: v as any } })
                      }
                    >
                      <SelectTrigger className="h-9 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="none">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </section>

                {/* Colors */}
                <section className="space-y-4 bg-card/50 border border-border/50 rounded-xl p-6">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-semibold">Colors</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {COLOR_FIELDS.map(({ key, label, default: def }) => (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{label}</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={(colors as any)[key] || def}
                            onChange={(e) => updateColor(key, e.target.value)}
                            className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent shrink-0"
                          />
                          <Input
                            value={(colors as any)[key] || def}
                            onChange={(e) => updateColor(key, e.target.value)}
                            className="h-9 text-xs font-mono uppercase"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Typography */}
                <section className="space-y-4 bg-card/50 border border-border/50 rounded-xl p-6">
                  <div className="flex items-center gap-2">
                    <Type className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-semibold">Typography</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Heading Font</Label>
                      <Select
                        value={typography.headingFont || "Inter"}
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
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Body Font</Label>
                      <Select
                        value={typography.bodyFont || "Inter"}
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
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Scale</Label>
                      <Select
                        value={typography.scale || "default"}
                        onValueChange={(v) => updateTypography("scale", v)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TYPOGRAPHY_SCALES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                {/* Reset */}
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setBrandKit({})} className="gap-2 text-muted-foreground">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Brand Kit
                  </Button>
                </div>
              </div>

              {/* Right: Live Preview */}
              <div className="hidden md:block">
                <div className="sticky top-28 space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Live Preview
                  </h3>
                  <BrandPreviewCard brandKit={brandKit} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}

/** Compact preview card showing brand identity at a glance */
function BrandPreviewCard({ brandKit }: { brandKit: BrandKitType }) {
  const colors = brandKit.colors || {};
  const headingFont = brandKit.typography?.headingFont || "Inter";
  const bodyFont = brandKit.typography?.bodyFont || "Inter";

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Mini slide preview */}
      <div
        className="aspect-video p-5 flex flex-col justify-between"
        style={{ backgroundColor: colors.background || "#ffffff" }}
      >
        {/* Logo */}
        {brandKit.logo?.url && (
          <div className="flex" style={{ justifyContent: brandKit.logo.placement === "top-right" ? "flex-end" : "flex-start" }}>
            <img src={brandKit.logo.url} alt="" className="h-6 object-contain" />
          </div>
        )}
        <div className="mt-auto space-y-1.5">
          <div
            className="text-sm font-bold leading-tight"
            style={{
              color: colors.foreground || "#1a1a2e",
              fontFamily: `'${headingFont}', sans-serif`,
            }}
          >
            {brandKit.brandName || "Your Brand"}
          </div>
          <div
            className="text-[10px] leading-snug opacity-70"
            style={{
              color: colors.foreground || "#1a1a2e",
              fontFamily: `'${bodyFont}', sans-serif`,
            }}
          >
            Executive presentation preview
          </div>
          <div className="flex gap-1 mt-2">
            <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: colors.primary || "#6C2BD9" }} />
            <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: colors.accent || "#f59e0b" }} />
          </div>
        </div>
      </div>

      {/* Swatches row */}
      <div className="p-3 border-t border-border space-y-2">
        <div className="flex gap-1.5">
          {[colors.primary, colors.secondary, colors.accent, colors.foreground, colors.muted]
            .filter(Boolean)
            .map((c, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-md border border-border/50"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          {!colors.primary && (
            <span className="text-xs text-muted-foreground italic">No colors set</span>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground">
          <span className="font-medium">{headingFont}</span>
          {bodyFont !== headingFont && <> / {bodyFont}</>}
        </div>
      </div>
    </div>
  );
}
