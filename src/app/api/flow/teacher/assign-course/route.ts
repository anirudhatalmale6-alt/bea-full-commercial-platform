import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/bea-flow/auth';
import { assignCourseToClass } from '@/lib/bea-flow/linkingService';
export async function POST(req:NextRequest){ const user=requireRole(await getCurrentUser(req), ['teacher','institution_admin','platform_admin']); const body=await req.json(); const result=await assignCourseToClass({teacherUserId:user.id,classId:body.classId,courseId:body.courseId}); return NextResponse.json({ok:true,result}); }
