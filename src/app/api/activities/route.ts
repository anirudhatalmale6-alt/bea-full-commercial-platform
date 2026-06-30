import { NextRequest, NextResponse } from 'next/server';
import activities from '../../../../data/activity-library.json';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level');
  const skill = searchParams.get('skill');
  const type = searchParams.get('type');
  const results = (activities as any[]).filter((a) => (!level || a.cefr === level) && (!skill || a.skill === skill) && (!type || a.type === type));
  return NextResponse.json({ activities: results, count: results.length });
}
