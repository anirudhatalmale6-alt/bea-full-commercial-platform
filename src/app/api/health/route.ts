import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'british-english-academy-esl-platform', time: new Date().toISOString() });
}
