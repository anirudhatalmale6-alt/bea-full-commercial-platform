import { getCheckoutPriceEnv, type PricingProductType } from "@/lib/pricingRules";

export function getStripePriceId(productType: PricingProductType, id: string): string {
  const envKey = getCheckoutPriceEnv(productType, id);
  if (!envKey) throw new Error(`No Stripe price environment variable configured for ${productType}:${id}`);

  const priceId = process.env[envKey];
  if (!priceId) {
    throw new Error(`Missing Stripe price ID: ${envKey}`);
  }

  return priceId;
}

export function getStripeMode(productType: PricingProductType): "payment" | "subscription" {
  if (productType === "subscription" || productType === "institution_licence") return "subscription";
  return "payment";
}
