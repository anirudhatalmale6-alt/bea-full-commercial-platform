import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const rows = await query<any>(
    `SELECT ts.report_json, ts.theta, ts.standard_error, ts.cefr_level, c.id AS certificate_id
     FROM test_sessions ts
     LEFT JOIN issued_certificates c ON c.test_session_id = ts.id
     WHERE ts.id = $1 AND ts.status = 'COMPLETE'`, [sessionId]
  );
  const row = rows[0];
  if (!row) return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
  return NextResponse.json({ ...row.report_json, certificateId: row.certificate_id });
}
