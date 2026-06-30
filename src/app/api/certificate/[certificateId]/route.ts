import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_: Request, { params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  const rows = await query<any>(
    `SELECT ic.id, ic.cefr_level, ic.verification_sha, ic.issued_at, ca.full_name
     FROM issued_certificates ic JOIN candidates ca ON ic.candidate_id = ca.id
     WHERE ic.id = $1`, [certificateId]
  );
  const row = rows[0];
  if (!row) return NextResponse.json({ error: 'Certificate not found.' }, { status: 404 });
  return NextResponse.json({
    certificateId: row.id,
    fullName: row.full_name,
    cefrLevel: row.cefr_level,
    verificationSha: row.verification_sha,
    issuedAt: row.issued_at
  });
}
