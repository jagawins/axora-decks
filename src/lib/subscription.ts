// Stripe subscription tier configuration
export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    price: "$0",
    priceId: null,
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
    price: "$29",
    priceId: "price_1Sr4dFQ6moo5x0SKYW1vLUnc",
    productId: "prod_Toi3RAGTB6H3C3",
    limits: {
      projects: -1, // unlimited
      aiGenerationsPerMonth: -1, // unlimited
      exportFormats: ["png", "pdf", "pptx"],
      customThemes: true,
      teamCollaboration: false,
    },
  },
  executive: {
    name: "Executive",
    price: "$149",
    priceId: "price_1Sr4eVQ6moo5x0SKJpQRVbEL",
    productId: "prod_Toi4DgsyndvaAa",
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
