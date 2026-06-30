import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';

const ProgressSchema = z.object({
  enrollmentId: z.string().uuid(),
  lessonKey: z.string().min(3),
  status: z.enum(['NOT_STARTED','IN_PROGRESS','COMPLETED']),
  score: z.number().min(0).max(100).optional(),
  teacherFeedback: z.string().max(2000).optional()
});

export async function POST(req: NextRequest) {
  const parsed = ProgressSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid progress payload.' }, { status: 400 });
  const p = parsed.data;
  const rows = await query(
    `INSERT INTO lesson_progress (enrollment_id, lesson_key, status, score, teacher_feedback, updated_at)
     VALUES ($1,$2,$3,$4,$5,NOW())
     ON CONFLICT (enrollment_id, lesson_key)
     DO UPDATE SET status=EXCLUDED.status, score=EXCLUDED.score, teacher_feedback=EXCLUDED.teacher_feedback, updated_at=NOW()
     RETURNING *`, [p.enrollmentId, p.lessonKey, p.status, p.score ?? null, p.teacherFeedback ?? null]
  );
  return NextResponse.json({ progress: rows[0] });
}
