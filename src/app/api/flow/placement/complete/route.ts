import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/bea-flow/auth';
import { completePlacementTest } from '@/lib/bea-flow/flowService';
export async function POST(req:NextRequest){ const user=await getCurrentUser(req); if(!user) return NextResponse.json({ok:false,error:'AUTH_REQUIRED'},{status:401}); const body=await req.json(); const result=await completePlacementTest({learnerUserId:body.learnerUserId ?? user.id, rawScore:Number(body.rawScore ?? 50)}); return NextResponse.json({ok:true,result}); }
