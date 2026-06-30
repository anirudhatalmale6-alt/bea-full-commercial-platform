import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const exists = (p) => fs.existsSync(path.join(root,p));
const read = (p) => fs.readFileSync(path.join(root,p),'utf8');
const readJson = (p) => JSON.parse(read(p));
const failures=[];
const requiredFiles=[
 'package.json','.env.example','src/config/brand.ts','src/app/page.tsx','src/app/landing/page.tsx','src/app/find-course/page.tsx','src/app/teachers-educators/page.tsx','src/app/pricing/page.tsx',
 'src/app/api/landing/course-previews/route.ts','src/app/api/flow/status/route.ts','src/app/api/flow/checkout/level-test/route.ts','src/app/api/flow/checkout/course/route.ts','src/app/api/flow/webhooks/stripe/route.ts','src/app/api/flow/placement/complete/route.ts','src/app/api/flow/appetiser/unlock/route.ts','src/app/api/flow/progress/update/route.ts','src/app/api/flow/parent/link-child/route.ts','src/app/api/flow/teacher/assign-course/route.ts','src/app/api/flow/institution/enrol-learner/route.ts',
 'src/app/dashboard/page.tsx','src/app/parent-dashboard/page.tsx','src/app/teacher-dashboard/page.tsx','src/app/institution-dashboard/page.tsx','src/app/lms/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/page.tsx',
 'src/lib/bea-flow/flowService.ts','src/lib/bea-flow/checkoutService.ts','src/lib/bea-flow/linkingService.ts','src/lib/bea-flow/dashboardService.ts',
 'data/commercial-content/lea_full_course_content.json','data/commercial-content/interactive_activities.json','data/commercial-content/answer_keys.json','data/commercial-content/audio_listening_manifest.json','data/early-years-adaptive-engine-spec.json',
 'database/flow/migrations/007_bea_lea_full_commercial_flow.sql','database/pricing/migrations/006_pricing_commerce_structure.sql','docs/SOURCE_REVIEW_AND_CONSOLIDATION_REPORT.md'
];
for (const f of requiredFiles) if (!exists(f)) failures.push(`Missing required file: ${f}`);
const brand = exists('src/config/brand.ts') ? read('src/config/brand.ts') : '';
for (const marker of ['British English Academy','BEA','Take Paid Level Test','Start Full Course After Payment']) if (!brand.includes(marker)) failures.push(`Brand marker missing: ${marker}`);
const flow = ['markLevelTestPaid','completePlacementTest','unlockAppetiser','enrolLearnerInCourse','saveLessonProgress','getParentDashboard','getTeacherDashboard','getInstitutionDashboard'];
const combinedFlow = ['src/lib/bea-flow/flowService.ts','src/lib/bea-flow/dashboardService.ts','src/lib/bea-flow/linkingService.ts'].filter(exists).map(read).join('\n');
for (const marker of flow) if (!combinedFlow.includes(marker)) failures.push(`Flow function missing: ${marker}`);
const migration = exists('database/flow/migrations/007_bea_lea_full_commercial_flow.sql') ? read('database/flow/migrations/007_bea_lea_full_commercial_flow.sql') : '';
for (const table of ['bea_payments','bea_level_test_sessions','bea_reports','bea_certificates','bea_appetiser_unlocks','bea_enrolments','bea_lesson_progress','bea_parent_child_links','bea_institutions','bea_classes','bea_teacher_feedback']) if (!migration.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) failures.push(`Flow migration missing table: ${table}`);
if (exists('data/commercial-content/lea_full_course_content.json')) {
 const content=readJson('data/commercial-content/lea_full_course_content.json');
 const lessons=JSON.stringify(content).match(/lesson_id/g)?.length ?? 0;
 if (lessons < 200) failures.push(`Expected 200+ lesson records in commercial content, found ${lessons}`);
}
if (exists('data/commercial-content/interactive_activities.json')) {
 const activities=readJson('data/commercial-content/interactive_activities.json');
 if (!Array.isArray(activities) || activities.length < 200) failures.push(`Expected 200+ interactive activities, found ${Array.isArray(activities)?activities.length:'not array'}`);
}
const env = exists('.env.example') ? read('.env.example') : '';
for (const key of ['DATABASE_URL','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_PRICE_BEA_LEVEL_TEST','ALLOW_MOCK_PAYMENTS','CERTIFICATE_SIGNING_SECRET']) if (!env.includes(key+'=')) failures.push(`Environment template missing ${key}`);
const appFiles = ['src/app/page.tsx','src/app/pricing/page.tsx','src/app/find-course/page.tsx','src/app/teachers-educators/page.tsx','src/app/dashboard/page.tsx','src/app/parent-dashboard/page.tsx','src/app/teacher-dashboard/page.tsx','src/app/institution-dashboard/page.tsx'].filter(exists).map(read).join('\n');
for (const old of ['London English Academy','Cambridge Oxford']) if (appFiles.includes(old)) failures.push(`Old public brand found in app pages: ${old}`);
const result={ok:failures.length===0, checkedAt:new Date().toISOString(), requiredFiles:requiredFiles.length, failures, checksum: crypto.createHash('sha256').update(requiredFiles.join('|')+combinedFlow.length).digest('hex')};
fs.mkdirSync(path.join(root,'audit'),{recursive:true});
fs.writeFileSync(path.join(root,'audit/BEA_LIVE_READY_AUDIT.json'),JSON.stringify(result,null,2));
fs.writeFileSync(path.join(root,'audit/BEA_LIVE_READY_AUDIT.md'),['# BEA Live-Ready Consolidated Platform Audit','',`Checked at: ${result.checkedAt}`,'',`Status: ${result.ok?'PASS':'FAIL'}`,'','## Failures',...(failures.length?failures.map(f=>`- ${f}`):['None']),'','## Note','This static audit confirms the consolidated code/data contracts are present. Final commercial launch still requires dependency installation, production database migration, Stripe webhook testing and `npm run build` on the deployment server.'].join('\n'));
if (!result.ok) { console.error(JSON.stringify(result,null,2)); process.exit(1); }
console.log(JSON.stringify(result,null,2));
