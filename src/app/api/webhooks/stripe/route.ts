import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) return NextResponse.json({ error: 'Stripe webhook not configured.' }, { status: 500 });
  const stripe = new Stripe(key);
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature invalid: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const testSessionId = session.metadata?.testSessionId;
    const candidateId = session.metadata?.candidateId;
    if (testSessionId && candidateId) {
      await query(
        `UPDATE test_sessions
         SET stripe_session_id=$1, paid_at=COALESCE(paid_at, NOW()), status='IN_PROGRESS', updated_at=NOW()
         WHERE id=$2 AND candidate_id=$3`, [session.id, testSessionId, candidateId]
      );
    }
  }
  return NextResponse.json({ received: true });
}
