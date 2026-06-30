import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { optimizeTheta, shouldTerminate, fisherInformation, type AssessmentHistoryItem } from '@/lib/irt';
import { buildReport } from '@/lib/scoreReport';
import { certificateHash, certificateId } from '@/lib/certificate';

const AnswerSchema = z.object({
  sessionId: z.string().uuid(),
  itemId: z.string().uuid(),
  choiceIndex: z.number().int().min(0).max(10),
  clientHistory: z.array(z.object({
    itemId: z.string(), difficulty: z.number(), discrimination: z.number(), guessing: z.number(), isCorrect: z.boolean()
  })).optional()
});

export async function POST(req: NextRequest) {
  const parsed = AnswerSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid answer payload.' }, { status: 400 });
  const { sessionId, itemId, choiceIndex } = parsed.data;

  const sessionRows = await query<any>(`SELECT id, candidate_id, status, paid_at FROM test_sessions WHERE id = $1`, [sessionId]);
  const session = sessionRows[0];
  if (!session) return NextResponse.json({ error: 'Test session not found.' }, { status: 404 });
  if (!session.paid_at) return NextResponse.json({ error: 'Payment is required before answers can be submitted.' }, { status: 402 });
  if (session.status === 'COMPLETE') return NextResponse.json({ error: 'This test session is already complete.' }, { status: 409 });

  const itemRows = await query<any>(`SELECT id, question_data, difficulty, discrimination, guessing FROM esl_item_bank WHERE id = $1 AND active = true`, [itemId]);
  const item = itemRows[0];
  if (!item) return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
  const correctIndex = Number(item.question_data.correctIndex);
  const isCorrect = choiceIndex === correctIndex;

  await query(
    `INSERT INTO responses (test_session_id, item_id, choice_index, is_correct, answered_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (test_session_id, item_id) DO NOTHING`, [sessionId, itemId, choiceIndex, isCorrect]
  );

  const responseRows = await query<any>(
    `SELECT r.item_id, r.is_correct, i.difficulty, i.discrimination, i.guessing
     FROM responses r JOIN esl_item_bank i ON r.item_id = i.id
     WHERE r.test_session_id = $1 ORDER BY r.answered_at ASC`, [sessionId]
  );
  const history: AssessmentHistoryItem[] = responseRows.map((r) => ({
    itemId: r.item_id,
    difficulty: Number(r.difficulty),
    discrimination: Number(r.discrimination),
    guessing: Number(r.guessing),
    isCorrect: r.is_correct
  }));
  const irt = optimizeTheta(history);
  const itemsAnswered = history.length;
  await query(`UPDATE test_sessions SET theta=$1, standard_error=$2, cefr_level=$3, updated_at=NOW() WHERE id=$4`, [irt.theta, irt.standardError, irt.cefrLevel, sessionId]);

  if (shouldTerminate(itemsAnswered, irt.standardError)) {
    const correct = history.filter((h) => h.isCorrect).length;
    const report = buildReport(irt.cefrLevel, irt.theta, irt.standardError, correct, itemsAnswered);
    const issuedAt = new Date().toISOString();
    const id = certificateId();
    const hash = certificateHash({ userId: session.candidate_id, sessionId, cefrLevel: irt.cefrLevel, issuedAt });
    await query(`UPDATE test_sessions SET status='COMPLETE', completed_at=NOW(), report_json=$1 WHERE id=$2`, [report, sessionId]);
    await query(
      `INSERT INTO issued_certificates (id, candidate_id, test_session_id, cefr_level, verification_sha, issued_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (test_session_id) DO NOTHING`, [id, session.candidate_id, sessionId, irt.cefrLevel, hash, issuedAt]
    );
    return NextResponse.json({ status: 'COMPLETE', ...irt, itemsAnswered, history, reportUrl: `/report/${sessionId}` });
  }

  const servedIds = history.map((h) => h.itemId);
  const candidates = await query<any>(
    `SELECT id, question_data, difficulty, discrimination, guessing
     FROM esl_item_bank
     WHERE active = true AND NOT (id = ANY($1::uuid[]))
     ORDER BY ((discrimination * discrimination) / (1 + ABS(difficulty - $2))) DESC
     LIMIT 12`, [servedIds, irt.theta]
  );
  const best = candidates
    .map((row) => ({ row, info: fisherInformation(irt.theta, Number(row.difficulty), Number(row.discrimination), Number(row.guessing)) }))
    .sort((a, b) => b.info - a.info)[0]?.row;
  if (!best) {
    const correct = history.filter((h) => h.isCorrect).length;
    const report = buildReport(irt.cefrLevel, irt.theta, irt.standardError, correct, itemsAnswered);
    const issuedAt = new Date().toISOString();
    const id = certificateId();
    const hash = certificateHash({ userId: session.candidate_id, sessionId, cefrLevel: irt.cefrLevel, issuedAt });
    await query(`UPDATE test_sessions SET status='COMPLETE', completed_at=NOW(), report_json=$1 WHERE id=$2`, [report, sessionId]);
    await query(
      `INSERT INTO issued_certificates (id, candidate_id, test_session_id, cefr_level, verification_sha, issued_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (test_session_id) DO NOTHING`, [id, session.candidate_id, sessionId, irt.cefrLevel, hash, issuedAt]
    );
    return NextResponse.json({ status: 'COMPLETE', ...irt, itemsAnswered, history, reportUrl: `/report/${sessionId}` });
  }

  return NextResponse.json({
    status: 'CONTINUE',
    ...irt,
    itemsAnswered,
    history,
    nextItem: {
      id: best.id,
      content: best.question_data,
      difficulty: Number(best.difficulty),
      discrimination: Number(best.discrimination),
      guessing: Number(best.guessing)
    }
  });
}
