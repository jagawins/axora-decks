// Stripe subscription tier configuration
export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    monthlyPriceId: null,
    yearlyPriceId: null,
    productId: null,
    limits: {
      projects: 3,
      aiGenerationsPerMonth: 10,
      exportFormats: ["png"],
      customThemes: false,
      teamCollaboration: false,
    },
  },
  pro: {
    name: "Pro",
    monthlyPrice: "$28",
    yearlyPrice: "$269",
    monthlyPriceId: "price_1Sr8V3Q6moo5x0SK85qbutky",
    yearlyPriceId: "price_1Sr8VnQ6moo5x0SKOtT54UPI",
    productId: "prod_Tom3u0hOZl3W1x",
    limits: {
      projects: -1, // unlimited
      aiGenerationsPerMonth: -1, // unlimited
      exportFormats: ["png", "pdf", "pptx"],
      customThemes: true,
      teamCollaboration: false,
    },
  },
  team: {
    name: "Team",
    monthlyPrice: "$78",
    yearlyPrice: "$749",
    monthlyPriceId: "price_1Sr8WEQ6moo5x0SKQr2wz73w",
    yearlyPriceId: "price_1Sr8X2Q6moo5x0SKwpWZWe8M",
    productId: "prod_Tom4q2CWLmIvbK",
    limits: {
      projects: -1, // unlimited
      aiGenerationsPerMonth: -1, // unlimited
      exportFormats: ["png", "pdf", "pptx", "docx"],
      customThemes: true,
      teamCollaboration: true,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export interface SubscriptionStatus {
  subscribed: boolean;
  tier: SubscriptionTier;
  productId: string | null;
  subscriptionEnd: string | null;
}

export function getTierFromProductId(productId: string | null): SubscriptionTier {
  if (!productId) return "free";
  
  for (const [tier, config] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (config.productId === productId) {
      return tier as SubscriptionTier;
    }
  }
  
  // Also check for annual product IDs (they share the same tier)
  if (productId === "prod_Tom3PNmumxhLNa") return "pro"; // Annual Pro
  if (productId === "prod_Tom5ILmCmZ2mAh") return "team"; // Annual Team
  
  return "free";
}

export function canUseFeature(tier: SubscriptionTier, feature: keyof typeof SUBSCRIPTION_TIERS.free.limits): boolean {
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  const value = tierConfig.limits[feature];
  
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === -1 || value > 0;
  if (Array.isArray(value)) return value.length > 0;
  
  return false;
}

export function getProjectLimit(tier: SubscriptionTier): number {
  return SUBSCRIPTION_TIERS[tier].limits.projects;
}

export function getAiGenerationLimit(tier: SubscriptionTier): number {
  return SUBSCRIPTION_TIERS[tier].limits.aiGenerationsPerMonth;
}
