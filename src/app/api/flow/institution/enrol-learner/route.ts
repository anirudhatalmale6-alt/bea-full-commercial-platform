import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/bea-flow/auth';
import { enrolInstitutionLearner } from '@/lib/bea-flow/linkingService';
export async function POST(req:NextRequest){ const user=requireRole(await getCurrentUser(req), ['institution_admin','platform_admin']); const body=await req.json(); const enrolment=await enrolInstitutionLearner({institutionAdminUserId:user.id,institutionId:body.institutionId,learnerUserId:body.learnerUserId,courseId:body.courseId,classId:body.classId}); return NextResponse.json({ok:true,enrolment}); }
