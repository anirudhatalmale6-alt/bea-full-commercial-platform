import { NextRequest, NextResponse } from "next/server";
import { getStripeMode, getStripePriceId } from "@/lib/stripePricingMap";
import type { PricingProductType } from "@/lib/pricingRules";

/**
 * Production integration:
 * 1. Require authenticated learner/institution admin.
 * 2. Validate product type and ID.
 * 3. Create pending payment/subscription row.
 * 4. Create Stripe Checkout Session using price ID.
 * 5. Redirect user to Stripe.
 * 6. Webhook unlocks Level Test, course, bundle, subscription or institution licence.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const productType = body.productType as PricingProductType;
  const id = body.id as string;

  try {
    const priceId = getStripePriceId(productType, id);
    const mode = getStripeMode(productType);

    return NextResponse.json({
      ok: true,
      status: "TODO_CREATE_STRIPE_CHECKOUT_SESSION",
      productType,
      id,
      stripePriceId: priceId,
      mode,
      successUrl: body.successUrl ?? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
      cancelUrl: body.cancelUrl ?? `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?checkout=cancelled`,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown pricing error",
    }, { status: 400 });
  }
}
