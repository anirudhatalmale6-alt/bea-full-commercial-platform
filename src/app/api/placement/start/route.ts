import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';

const StartSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  demoAccess: z.boolean().optional()
});

export async function POST(req: NextRequest) {
  const parsed = StartSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Valid name and email are required.' }, { status: 400 });
  const { email, fullName, demoAccess } = parsed.data;
  const demoAllowed = process.env.ALLOW_DEMO_ACCESS === 'true' && demoAccess;
  if (!demoAllowed) {
    return NextResponse.json({ error: 'Payment is required before the placement test. Use the Stripe checkout route.' }, { status: 402 });
  }
  const candidates = await query<{ id: string }>(
    `INSERT INTO candidates (email, full_name) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
     RETURNING id`, [email, fullName]
  );
  const candidateId = candidates[0].id;
  const sessions = await query<{ id: string }>(
    `INSERT INTO test_sessions (candidate_id, paid_at, status, theta, standard_error, cefr_level)
     VALUES ($1, NOW(), 'IN_PROGRESS', 0, 99, 'B1') RETURNING id`, [candidateId]
  );
  const sessionId = sessions[0].id;
  const items = await query<any>(
    `SELECT id, question_data, difficulty, discrimination, guessing
     FROM esl_item_bank WHERE active = true ORDER BY ABS(difficulty - 0) ASC LIMIT 1`
  );
  return NextResponse.json({
    sessionId,
    message: 'Demo access started. Production access must be unlocked through Stripe.',
    nextItem: {
      id: items[0].id,
      content: items[0].question_data,
      difficulty: Number(items[0].difficulty),
      discrimination: Number(items[0].discrimination),
      guessing: Number(items[0].guessing)
    }
  });
}
