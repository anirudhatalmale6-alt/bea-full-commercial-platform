import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/bea-flow/auth';
import { getFlowStatus } from '@/lib/bea-flow/flowService';
export async function GET(req:NextRequest){ const user=await getCurrentUser(req); const learnerUserId=req.nextUrl.searchParams.get('learnerUserId') || user?.id; if(!learnerUserId) return NextResponse.json({ok:false,error:'AUTH_REQUIRED'},{status:401}); return NextResponse.json({ok:true,status:await getFlowStatus(learnerUserId)}); }
