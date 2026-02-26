/**
 * Brand Kit Resolution
 * Resolves theme + brand_kit overrides into CSS custom properties
 */

export interface BrandKit {
  colors?: {
    primary?: string;
    accent?: string;
    background?: string;
    foreground?: string;
    muted?: string;
  };
  typography?: {
    headingFont?: HeadingFont;
    bodyFont?: BodyFont;
    scale?: TypographyScale;
  };
  logo?: {
    url?: string | null;
    placement?: LogoPlacement;
  };
}

export type HeadingFont =
  | "Inter"
  | "Playfair Display"
  | "Space Grotesk"
  | "DM Sans"
  | "Outfit"
  | "Sora"
  | "Clash Display"
  | "Cabinet Grotesk";

export type BodyFont =
  | "Inter"
  | "Source Sans Pro"
  | "IBM Plex Sans"
  | "DM Sans"
  | "Outfit"
  | "Nunito Sans";

export type TypographyScale = "compact" | "default" | "spacious";
export type LogoPlacement = "top-left" | "top-right" | "none";

export const HEADING_FONTS: { value: HeadingFont; label: string; style: string }[] = [
  { value: "Inter", label: "Inter", style: "Modern & clean" },
  { value: "Playfair Display", label: "Playfair Display", style: "Elegant serif" },
  { value: "Space Grotesk", label: "Space Grotesk", style: "Technical" },
  { value: "DM Sans", label: "DM Sans", style: "Geometric" },
  { value: "Outfit", label: "Outfit", style: "Friendly" },
  { value: "Sora", label: "Sora", style: "Futuristic" },
  { value: "Clash Display", label: "Clash Display", style: "Bold statement" },
  { value: "Cabinet Grotesk", label: "Cabinet Grotesk", style: "Contemporary" },
];

export const BODY_FONTS: { value: BodyFont; label: string; style: string }[] = [
  { value: "Inter", label: "Inter", style: "Universal" },
  { value: "Source Sans Pro", label: "Source Sans Pro", style: "Professional" },
  { value: "IBM Plex Sans", label: "IBM Plex Sans", style: "Corporate" },
  { value: "DM Sans", label: "DM Sans", style: "Geometric" },
  { value: "Outfit", label: "Outfit", style: "Friendly" },
  { value: "Nunito Sans", label: "Nunito Sans", style: "Rounded" },
];

export const TYPOGRAPHY_SCALES: { value: TypographyScale; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "default", label: "Default" },
  { value: "spacious", label: "Spacious" },
];

const SCALE_MULTIPLIERS: Record<TypographyScale, number> = {
  compact: 0.9,
  default: 1,
  spacious: 1.15,
};

/**
 * Resolve brand kit overrides into inline CSS custom properties
 */
export function resolveBrandStyles(brandKit?: BrandKit | null): React.CSSProperties {
  if (!brandKit) return {};

  const style: Record<string, string> = {};

  // Color overrides
  if (brandKit.colors?.background) style["--deck-bg"] = brandKit.colors.background;
  if (brandKit.colors?.foreground) style["--deck-fg"] = brandKit.colors.foreground;
  if (brandKit.colors?.accent) style["--deck-accent"] = brandKit.colors.accent;
  if (brandKit.colors?.muted) style["--deck-muted"] = brandKit.colors.muted;
  if (brandKit.colors?.primary) style["--deck-primary"] = brandKit.colors.primary;

  // Typography
  if (brandKit.typography?.headingFont) {
    style["--brand-heading-font"] = `'${brandKit.typography.headingFont}', sans-serif`;
  }
  if (brandKit.typography?.bodyFont) {
    style["--brand-body-font"] = `'${brandKit.typography.bodyFont}', sans-serif`;
  }
  if (brandKit.typography?.scale) {
    const mult = SCALE_MULTIPLIERS[brandKit.typography.scale];
    style["--brand-scale"] = String(mult);
  }

  return style as unknown as React.CSSProperties;
}

/**
 * Get Google Fonts import URL for brand kit fonts
 */
export function getBrandFontImports(brandKit?: BrandKit | null): string[] {
  if (!brandKit?.typography) return [];
  const fonts: string[] = [];
  const { headingFont, bodyFont } = brandKit.typography;

  if (headingFont && headingFont !== "Inter") {
    fonts.push(headingFont.replace(/ /g, "+"));
  }
  if (bodyFont && bodyFont !== "Inter" && (bodyFont as string) !== (headingFont as string)) {
    fonts.push(bodyFont.replace(/ /g, "+"));
  }
  return fonts;
}

export const EMPTY_BRAND_KIT: BrandKit = {};
