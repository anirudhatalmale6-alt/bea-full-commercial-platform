import { NextResponse } from 'next/server';
import catalog from '../../../../data/course-catalog.json';

export async function GET() {
  return NextResponse.json({ courses: catalog, count: (catalog as any[]).length });
}
