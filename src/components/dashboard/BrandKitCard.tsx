import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BrandKit, isBrandKitConfigured } from "@/lib/brand";
import { Palette, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BrandKitCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("brand_kit")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.brand_kit) setBrandKit(data.brand_kit as BrandKit);
      });
  }, [user]);

  const configured = isBrandKitConfigured(brandKit);
  const colors = brandKit?.colors;

  return (
    <button
      onClick={() => navigate("/brand-kit")}
      className="w-full text-left bg-card/50 border border-border/50 rounded-xl p-4 hover:border-accent/40 hover:bg-card/80 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Brand Kit</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {configured ? "Brand configured" : "Set up your brand identity"}
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors mt-1" />
      </div>

      {/* Mini preview */}
      {configured && (
        <div className="mt-3 flex items-center gap-3">
          {brandKit?.logo?.url && (
            <img src={brandKit.logo.url} alt="" className="h-5 object-contain" />
          )}
          <div className="flex gap-1">
            {[colors?.primary, colors?.accent, colors?.secondary]
              .filter(Boolean)
              .map((c, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded border border-border/50"
                  style={{ backgroundColor: c }}
                />
              ))}
          </div>
          {brandKit?.typography?.headingFont && (
            <span className="text-[10px] text-muted-foreground font-medium">
              {brandKit.typography.headingFont}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
