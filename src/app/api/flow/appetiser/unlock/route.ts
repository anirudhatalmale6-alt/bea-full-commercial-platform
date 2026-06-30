import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/bea-flow/auth';
import { unlockAppetiser } from '@/lib/bea-flow/flowService';
export async function POST(req:NextRequest){ const user=await getCurrentUser(req); if(!user) return NextResponse.json({ok:false,error:'AUTH_REQUIRED'},{status:401}); const body=await req.json(); try{ return NextResponse.json({ok:true,unlock:await unlockAppetiser({learnerUserId:body.learnerUserId ?? user.id, courseId:body.courseId})}); }catch(error){ return NextResponse.json({ok:false,error:error instanceof Error?error.message:'Unlock failed'},{status:400}); } }
