import { NextRequest, NextResponse } from 'next/server';
import assets from '../../../../data/downloadables.json';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level');
  const type = searchParams.get('type');
  const results = (assets as any[]).filter((a) => (!level || a.cefr === level || a.cefr === 'A1-C2') && (!type || a.type === type));
  return NextResponse.json({ assets: results, count: results.length });
}
