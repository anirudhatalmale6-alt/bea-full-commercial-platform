import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  BEA_COURSE_PRICE_CONFIG,
  getCourseCheckoutMetadata,
  getStripePriceIdForLevel,
  normalizeCefrLevel
} from '@/lib/stripe-course-price-map';

export const runtime = 'nodejs';

function getBaseUrl(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    const level = normalizeCefrLevel(body?.level);

    if (!level) {
      return NextResponse.json({ error: 'Invalid or missing CEFR level. Expected A1, A2, B1, B2, C1 or C2.' }, { status: 400 });
    }

    const email = typeof body?.email === 'string' ? body.email : undefined;
    const learnerId = typeof body?.learnerId === 'string' ? body.learnerId : undefined;
    const config = BEA_COURSE_PRICE_CONFIG[level];
    const price = getStripePriceIdForLevel(level);
    const baseUrl = getBaseUrl(req);

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20' as any
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price,
          quantity: 1
        }
      ],
      allow_promotion_codes: true,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&level=${level}`,
      cancel_url: `${baseUrl}/courses/${config.courseSlug}?checkout=cancelled`,
      metadata: getCourseCheckoutMetadata({ level, learnerId, email }),
      payment_intent_data: {
        metadata: getCourseCheckoutMetadata({ level, learnerId, email })
      }
    });

    return NextResponse.json({
      sessionId: session.id,
      checkoutUrl: session.url,
      level,
      productName: config.productName,
      displayPrice: config.displayPrice
    });
  } catch (error) {
    console.error('BEA course checkout failed', error);
    return NextResponse.json({ error: 'Unable to create checkout session.' }, { status: 500 });
  }
}
