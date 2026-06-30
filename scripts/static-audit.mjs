import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const fail = (message) => { throw new Error(message); };
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const exists = (file) => fs.existsSync(file);

const requiredFiles = [
  'package.json','next.config.ts','tsconfig.json','Dockerfile','docker-compose.yml','.do/app.yaml','.env.example',
  'src/app/page.tsx','src/app/checkout/placement/page.tsx','src/app/placement-test/page.tsx','src/app/report/[sessionId]/page.tsx','src/app/certificate/[certificateId]/page.tsx','src/app/verify-certificate/page.tsx',
  'src/app/courses/page.tsx','src/app/courses/[slug]/page.tsx','src/app/activities/page.tsx','src/app/downloads/page.tsx','src/app/dashboard/page.tsx','src/app/teacher-dashboard/page.tsx',
  'src/app/api/health/route.ts','src/app/api/checkout/test/route.ts','src/app/api/placement/start/route.ts','src/app/api/placement/unlock/route.ts','src/app/api/placement/answer/route.ts','src/app/api/report/[sessionId]/route.ts','src/app/api/certificate/[certificateId]/route.ts','src/app/api/webhooks/stripe/route.ts','src/app/api/downloadables/route.ts',
  'data/cefr-curriculum.json','data/course-catalog.json','data/activity-library.json','data/item-bank.json','data/lesson-library.json','data/downloadables.json','data/productive-skill-prompts.json',
  'db/migrations/001_init.sql','db/seed_item_bank.sql','db/seed_course_and_activity_library.sql','db/seed_lessons_and_downloadables.sql',
  'docs/COMMERCIAL_READINESS_AUDIT.md'
];
for (const file of requiredFiles) if (!exists(file)) fail(`Missing required file: ${file}`);

const curriculum = readJson('data/cefr-curriculum.json');
if (!Array.isArray(curriculum.levels) || curriculum.levels.length !== 6) fail('Curriculum must include exactly 6 CEFR levels.');
for (const level of curriculum.levels) {
  if (!level.modules || level.modules.length < 6) fail(`Curriculum level ${level.cefr} has fewer than 6 modules.`);
  for (const mod of level.modules) if (!mod.lesson_sequence || mod.lesson_sequence.length < 6) fail(`Module ${mod.module_id} has fewer than 6 lessons.`);
}

const courses = readJson('data/course-catalog.json');
if (courses.length < 6) fail('Course catalog must include at least 6 CEFR courses.');
for (const c of courses) {
  if (!c.slug || !c.cefr || !c.modules || c.modules.length < 6) fail(`Invalid course record: ${c.slug || 'unknown'}`);
}

const activities = readJson('data/activity-library.json');
if (activities.length < 216) fail('Activity library must include at least 216 activities.');
const activitySkills = new Set(activities.map((a) => a.skill));
for (const skill of ['Grammar','Vocabulary','Reading','Listening','Speaking','Writing']) if (!activitySkills.has(skill)) fail(`Missing activity skill: ${skill}`);

const lessons = readJson('data/lesson-library.json');
if (lessons.length < 216) fail('Lesson library must include at least 216 structured lessons.');

const items = readJson('data/item-bank.json');
if (items.length < 240) fail('Item bank must include at least 240 adaptive items.');
const itemSkills = new Set(items.map((i) => i.skill.toLowerCase()));
for (const skill of ['grammar','vocabulary','reading','listening','speaking','writing']) if (!itemSkills.has(skill)) fail(`Missing placement item skill: ${skill}`);
const levels = ['A1','A2','B1','B2','C1','C2'];
for (const level of levels) {
  const count = items.filter((i) => i.cefr === level).length;
  if (count < 40) fail(`Level ${level} has fewer than 40 item-bank records.`);
}
for (const item of items) {
  if (!/^[0-9a-f-]{36}$/i.test(item.id)) fail(`Invalid item UUID: ${item.id}`);
  if (!Array.isArray(item.question_data?.options) || typeof item.question_data.correctIndex !== 'number') fail(`Invalid item question_data: ${item.id}`);
}

const assets = readJson('data/downloadables.json');
if (assets.length < 18) fail('Downloadable assets must include checklists, trackers and writing frames for all levels.');
for (const asset of assets) if (asset.href.startsWith('/downloads/') && !exists('public' + asset.href)) fail(`Downloadable href missing public file: ${asset.href}`);

const env = fs.readFileSync('.env.example','utf8');
for (const key of ['NEXT_PUBLIC_SITE_URL','DATABASE_URL','CERTIFICATE_SIGNING_KEY','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_PLACEMENT_PRICE_ID','ALLOW_DEMO_ACCESS']) if (!env.includes(key + '=')) fail(`.env.example missing ${key}`);

const homepage = fs.readFileSync('src/app/page.tsx','utf8');
const internalLinks = [...homepage.matchAll(/href=\"(\/[A-Za-z0-9_?=&%\-\/]+)\"/g)].map((m) => m[1].split('?')[0]);
const expectedRoutes = new Set(['/','/courses','/checkout/placement','/sample-report','/subjects','/cefr-levels','/fitness-for-purpose','/verify-certificate','/schools','/employers']);
for (const route of expectedRoutes) {
  const pagePath = route === '/' ? 'src/app/page.tsx' : `src/app${route}/page.tsx`;
  if (!exists(pagePath)) fail(`Homepage-linked route has no page: ${route}`);
}

const migration = fs.readFileSync('db/migrations/001_init.sql','utf8');
for (const table of ['candidates','esl_item_bank','test_sessions','responses','issued_certificates','course_catalog','activity_library','course_lessons','downloadable_assets','enrollments','lesson_progress','activity_attempts']) if (!migration.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) fail(`Migration missing table: ${table}`);

const summary = {
  ok: true,
  checkedAt: new Date().toISOString(),
  filesChecked: requiredFiles.length,
  courses: courses.length,
  curriculumLevels: curriculum.levels.length,
  lessons: lessons.length,
  activities: activities.length,
  itemBank: items.length,
  downloadables: assets.length,
  checksum: crypto.createHash('sha256').update(JSON.stringify({courses, activities: activities.length, items: items.length, lessons: lessons.length})).digest('hex')
};
console.log(JSON.stringify(summary, null, 2));
