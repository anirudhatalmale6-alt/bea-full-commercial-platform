import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { query } from '@/lib/db';

const CheckoutSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2)
});

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PLACEMENT_PRICE_ID) {
    return NextResponse.json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PLACEMENT_PRICE_ID.' }, { status: 500 });
  }
  const parsed = CheckoutSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Valid candidate name and email are required before payment.' }, { status: 400 });
  const { email, fullName } = parsed.data;

  const candidateRows = await query<{ id: string }>(
    `INSERT INTO candidates (email, full_name) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name RETURNING id`, [email, fullName]
  );
  const candidateId = candidateRows[0].id;
  const sessionRows = await query<{ id: string }>(
    `INSERT INTO test_sessions (candidate_id, status, theta, standard_error, cefr_level)
     VALUES ($1, 'PENDING_PAYMENT', 0, 99, 'B1') RETURNING id`, [candidateId]
  );
  const testSessionId = sessionRows[0].id;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: [{ price: process.env.STRIPE_PLACEMENT_PRICE_ID, quantity: 1 }],
    success_url: `${site}/placement-test?paid=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/placement-test?cancelled=true`,
    metadata: { product: 'cefr-placement-test', candidateId, testSessionId, fullName }
  });

  await query(`UPDATE test_sessions SET stripe_session_id=$1 WHERE id=$2`, [checkout.id, testSessionId]);
  return NextResponse.json({ checkoutUrl: checkout.url });
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST with candidate fullName and email to create a paid checkout session.' }, { status: 405 });
}
