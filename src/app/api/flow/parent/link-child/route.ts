import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/bea-flow/auth';
import { linkParentToChild } from '@/lib/bea-flow/linkingService';
export async function POST(req:NextRequest){ const user=requireRole(await getCurrentUser(req), ['parent','platform_admin']); const body=await req.json(); const link=await linkParentToChild({parentUserId:body.parentUserId ?? user.id, learnerUserId:body.learnerUserId, relationshipType:body.relationshipType, verified:user.role==='platform_admin'||body.verified===true}); return NextResponse.json({ok:true,link}); }
