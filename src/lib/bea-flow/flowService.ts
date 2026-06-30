import crypto from 'crypto';
import { one, query } from './db';
import { auditLog } from './audit';
import { courseForLevel, courseById } from '@/data/beaFlowConfig';
import type { CefrLevel, FlowStatus } from '@/types/beaFlow';
function mapScoreToLevel(score:number):CefrLevel{ if(score<=20)return 'A1'; if(score<=35)return 'A2'; if(score<=55)return 'B1'; if(score<=70)return 'B2'; if(score<=85)return 'C1'; return 'C2'; }
function certificateHash(number:string, userId:string){ return crypto.createHmac('sha256', process.env.CERTIFICATE_SIGNING_SECRET || 'dev-change-me').update(number+':'+userId).digest('hex'); }
export async function getFlowStatus(learnerUserId:string):Promise<FlowStatus>{
  const latest = await one<any>(`SELECT id,status,mapped_cefr_level,recommended_course_id FROM bea_level_test_sessions WHERE learner_user_id=$1 ORDER BY created_at DESC LIMIT 1`, [learnerUserId]);
  const paid = await one<any>(`SELECT id FROM bea_payments WHERE user_id=$1 AND product_type='level_test' AND status='paid' LIMIT 1`, [learnerUserId]);
  const report = latest ? await one<any>(`SELECT id FROM bea_reports WHERE level_test_session_id=$1 LIMIT 1`, [latest.id]) : null;
  const cert = latest ? await one<any>(`SELECT id FROM bea_certificates WHERE level_test_session_id=$1 AND status='issued' LIMIT 1`, [latest.id]) : null;
  const trial = await one<any>(`SELECT lesson_id,course_id FROM bea_appetiser_unlocks WHERE learner_user_id=$1 ORDER BY created_at DESC LIMIT 1`, [learnerUserId]);
  const enrol = await one<any>(`SELECT course_id FROM bea_enrolments WHERE learner_user_id=$1 AND status='active' ORDER BY access_starts_at DESC LIMIT 1`, [learnerUserId]);
  let nextActionLabel='Take Paid Level Test', nextActionHref='/checkout/placement';
  if(paid && latest?.status!=='completed'){ nextActionLabel='Complete Level Test'; nextActionHref='/placement-test/start'; }
  else if(latest?.status==='completed' && !trial){ nextActionLabel='Unlock Short Trial Lesson'; nextActionHref=`/appetiser/unlock?courseId=${latest.recommended_course_id}`; }
  else if(trial && !enrol){ nextActionLabel='Start Full Course After Payment'; nextActionHref=`/checkout/course?courseId=${trial.course_id}`; }
  else if(enrol){ nextActionLabel='Continue LMS Module'; nextActionHref=`/lms/courses/${enrol.course_id}/modules/${enrol.course_id}_m1/lessons/${enrol.course_id}_m1_l1`; }
  return { learnerUserId, hasPaidLevelTest:Boolean(paid), hasCompletedLevelTest:latest?.status==='completed', mappedLevel:latest?.mapped_cefr_level ?? null, recommendedCourseId:latest?.recommended_course_id ?? null, diagnosticReportId:report?.id ?? null, diagnosticCertificateId:cert?.id ?? null, hasUnlockedTrial:Boolean(trial), trialLessonId:trial?.lesson_id ?? null, hasPaidFullCourse:Boolean(enrol), activeCourseId:enrol?.course_id ?? null, nextActionLabel, nextActionHref };
}
export async function markLevelTestPaid(input:{learnerUserId:string; paymentId?:string; stripeCheckoutSessionId?:string}){
  const p = input.paymentId ? await one<any>(`UPDATE bea_payments SET status='paid', paid_at=NOW() WHERE id=$1 RETURNING *`, [input.paymentId]) : await one<any>(`UPDATE bea_payments SET status='paid', paid_at=NOW() WHERE stripe_checkout_session_id=$1 RETURNING *`, [input.stripeCheckoutSessionId]);
  await query(`INSERT INTO bea_level_test_sessions (learner_user_id,payment_id,status) VALUES ($1,$2,'unlocked')`, [input.learnerUserId, p?.id ?? input.paymentId ?? null]);
  await auditLog({actorUserId:input.learnerUserId, action:'level_test_unlocked', entityType:'payment', entityId:String(p?.id ?? input.paymentId ?? '')});
}
export async function completePlacementTest(input:{learnerUserId:string; rawScore:number}){
  const mappedLevel = mapScoreToLevel(input.rawScore); const course = courseForLevel(mappedLevel);
  let session = await one<any>(`UPDATE bea_level_test_sessions SET status='completed', raw_score=$2, mapped_cefr_level=$3, recommended_course_id=$4, completed_at=NOW() WHERE id=(SELECT id FROM bea_level_test_sessions WHERE learner_user_id=$1 ORDER BY created_at DESC LIMIT 1) RETURNING *`, [input.learnerUserId, input.rawScore, mappedLevel, course.id]);
  if(!session) session = await one<any>(`INSERT INTO bea_level_test_sessions (learner_user_id,status,raw_score,mapped_cefr_level,recommended_course_id,completed_at) VALUES ($1,'completed',$2,$3,$4,NOW()) RETURNING *`, [input.learnerUserId,input.rawScore,mappedLevel,course.id]);
  const report = await one<any>(`INSERT INTO bea_reports (learner_user_id,level_test_session_id,report_type,title,report_json) VALUES ($1,$2,'diagnostic',$3,$4::jsonb) RETURNING *`, [input.learnerUserId, session.id, `BEA/BEA ${mappedLevel} Diagnostic Report`, JSON.stringify({rawScore:input.rawScore,mappedLevel,recommendedCourse:course,nextStep:'Unlock Short Trial Lesson'})]);
  const number = `BEA-DIAG-${mappedLevel}-${Date.now()}`; const cert = await one<any>(`INSERT INTO bea_certificates (learner_user_id,certificate_type,title,certificate_number,level_test_session_id,verification_hash) VALUES ($1,'diagnostic',$2,$3,$4,$5) RETURNING *`, [input.learnerUserId, `BEA/BEA ${mappedLevel} Diagnostic Certificate`, number, session.id, certificateHash(number,input.learnerUserId)]);
  await auditLog({actorUserId:input.learnerUserId, action:'placement_completed', entityType:'level_test_session', entityId:session.id, metadata:{mappedLevel}});
  return { session, report, certificate:cert, mappedLevel, recommendedCourse:course };
}
export async function unlockAppetiser(input:{learnerUserId:string; courseId:string}){
  const s = await one<any>(`SELECT id,recommended_course_id FROM bea_level_test_sessions WHERE learner_user_id=$1 AND status='completed' ORDER BY completed_at DESC LIMIT 1`, [input.learnerUserId]);
  if(!s) throw new Error('LEVEL_TEST_REQUIRED'); if(s.recommended_course_id!==input.courseId) throw new Error('COURSE_DOES_NOT_MATCH_MAPPED_PATHWAY');
  const lesson = await one<any>(`SELECT id FROM bea_lessons WHERE course_id=$1 AND is_trial=true LIMIT 1`, [input.courseId]); if(!lesson) throw new Error('TRIAL_LESSON_NOT_FOUND');
  const u = await one<any>(`INSERT INTO bea_appetiser_unlocks (learner_user_id,course_id,lesson_id,level_test_session_id,status) VALUES ($1,$2,$3,$4,'unlocked') ON CONFLICT (learner_user_id,course_id) DO UPDATE SET status='unlocked' RETURNING *`, [input.learnerUserId,input.courseId,lesson.id,s.id]);
  await auditLog({actorUserId:input.learnerUserId, action:'appetiser_unlocked', entityType:'course', entityId:input.courseId}); return u;
}
export async function enrolLearnerInCourse(input:{learnerUserId:string; courseId:string; source:'single_course_payment'|'bundle_payment'|'subscription'|'institution_licence'|'admin_manual'; paymentId?:string|null; institutionId?:string|null}){
  if(!courseById(input.courseId)) throw new Error('COURSE_NOT_FOUND');
  const e = await one<any>(`INSERT INTO bea_enrolments (learner_user_id,course_id,source,payment_id,institution_id,status) VALUES ($1,$2,$3,$4,$5,'active') ON CONFLICT (learner_user_id,course_id,source) DO UPDATE SET status='active', access_starts_at=NOW() RETURNING *`, [input.learnerUserId,input.courseId,input.source,input.paymentId ?? null,input.institutionId ?? null]);
  await auditLog({actorUserId:input.learnerUserId, action:'course_enrolled', entityType:'course', entityId:input.courseId, metadata:{source:input.source}}); return e;
}
export async function saveLessonProgress(input:{learnerUserId:string; courseId:string; moduleId:string; lessonId:string; status:'not_started'|'in_progress'|'completed'; score?:number; timeSpentSeconds?:number}){
  const enrol = await one<any>(`SELECT id FROM bea_enrolments WHERE learner_user_id=$1 AND course_id=$2 AND status='active' LIMIT 1`, [input.learnerUserId,input.courseId]);
  const trial = await one<any>(`SELECT id FROM bea_appetiser_unlocks WHERE learner_user_id=$1 AND lesson_id=$2 AND status IN ('unlocked','completed') LIMIT 1`, [input.learnerUserId,input.lessonId]);
  if(!enrol && !trial) throw new Error('COURSE_ACCESS_REQUIRED');
  const p = await one<any>(`INSERT INTO bea_lesson_progress (learner_user_id,course_id,module_id,lesson_id,status,score,time_spent_seconds,started_at,completed_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,CASE WHEN $5 IN ('in_progress','completed') THEN NOW() ELSE NULL END,CASE WHEN $5='completed' THEN NOW() ELSE NULL END,NOW()) ON CONFLICT (learner_user_id,lesson_id) DO UPDATE SET status=EXCLUDED.status, score=COALESCE(EXCLUDED.score, bea_lesson_progress.score), time_spent_seconds=bea_lesson_progress.time_spent_seconds+EXCLUDED.time_spent_seconds, completed_at=CASE WHEN EXCLUDED.status='completed' THEN NOW() ELSE bea_lesson_progress.completed_at END, updated_at=NOW() RETURNING *`, [input.learnerUserId,input.courseId,input.moduleId,input.lessonId,input.status,input.score ?? null,input.timeSpentSeconds ?? 0]);
  if(trial && input.status==='completed') await query(`UPDATE bea_appetiser_unlocks SET status='completed', completed_at=NOW() WHERE learner_user_id=$1 AND lesson_id=$2`, [input.learnerUserId,input.lessonId]);
  return p;
}
