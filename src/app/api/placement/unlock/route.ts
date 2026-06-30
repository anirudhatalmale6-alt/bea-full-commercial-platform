import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { query } from '@/lib/db';

const UnlockSchema = z.object({ checkoutSessionId: z.string().min(10) });

export async function POST(req: NextRequest) {
  const parsed = UnlockSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Checkout session ID is required.' }, { status: 400 });
  const { checkoutSessionId } = parsed.data;

  let sessionRows = await query<any>(
    `SELECT id, status, paid_at FROM test_sessions WHERE stripe_session_id=$1`, [checkoutSessionId]
  );
  let testSession = sessionRows[0];

  if ((!testSession || !testSession.paid_at) && process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const checkout = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    if (checkout.payment_status === 'paid' && checkout.metadata?.testSessionId && checkout.metadata?.candidateId) {
      await query(
        `UPDATE test_sessions SET stripe_session_id=$1, paid_at=COALESCE(paid_at, NOW()), status='IN_PROGRESS', updated_at=NOW()
         WHERE id=$2 AND candidate_id=$3`, [checkoutSessionId, checkout.metadata.testSessionId, checkout.metadata.candidateId]
      );
      sessionRows = await query<any>(`SELECT id, status, paid_at FROM test_sessions WHERE id=$1`, [checkout.metadata.testSessionId]);
      testSession = sessionRows[0];
    }
  }

  if (!testSession) return NextResponse.json({ error: 'Paid test session was not found.' }, { status: 404 });
  if (!testSession.paid_at) return NextResponse.json({ error: 'Payment has not been confirmed yet.' }, { status: 402 });
  if (testSession.status === 'COMPLETE') return NextResponse.json({ reportUrl: `/report/${testSession.id}`, status: 'COMPLETE' });

  const existingResponses = await query<any>(
    `SELECT r.item_id, r.is_correct, i.difficulty, i.discrimination, i.guessing
     FROM responses r JOIN esl_item_bank i ON r.item_id=i.id
     WHERE r.test_session_id=$1 ORDER BY r.answered_at`, [testSession.id]
  );
  const servedIds = existingResponses.map((r) => r.item_id);
  const items = servedIds.length
    ? await query<any>(`SELECT id, question_data, difficulty, discrimination, guessing FROM esl_item_bank WHERE active=true AND NOT (id = ANY($1::uuid[])) ORDER BY ABS(difficulty - 0) ASC LIMIT 1`, [servedIds])
    : await query<any>(`SELECT id, question_data, difficulty, discrimination, guessing FROM esl_item_bank WHERE active=true ORDER BY ABS(difficulty - 0) ASC LIMIT 1`);

  const item = items[0];
  return NextResponse.json({
    status: 'UNLOCKED',
    sessionId: testSession.id,
    message: 'Paid access confirmed. Adaptive test unlocked.',
    nextItem: {
      id: item.id,
      content: item.question_data,
      difficulty: Number(item.difficulty),
      discrimination: Number(item.discrimination),
      guessing: Number(item.guessing)
    }
  });
}
