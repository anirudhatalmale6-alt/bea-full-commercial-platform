import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = Number(process.env.PORT || 5055);

const CEFR_LEVELS = ['A1','A2','B1','B2','C1','C2'];
const DIFFICULTY = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
const BRAND = 'British English Academy';

function id(prefix) { return `${prefix}_${randomUUID().slice(0, 8)}`; }
function now() { return new Date().toISOString(); }
function pct(a, b) { return b === 0 ? 0 : Math.round((a / b) * 100); }

function generateContent() {
  const skillFocus = {
    A1: ['basic greetings','classroom words','present simple','phonics','short speaking'],
    A2: ['daily routines','past simple','functional vocabulary','short reading','guided writing'],
    B1: ['paragraph writing','story sequence','opinion language','listening detail','grammar accuracy'],
    B2: ['discussion','essay planning','academic vocabulary','inference reading','presentation skills'],
    C1: ['critical reading','formal register','argumentation','advanced grammar','seminar speaking'],
    C2: ['style control','nuanced vocabulary','advanced writing','rhetorical speaking','professional fluency']
  };

  const courses = CEFR_LEVELS.map((level, idx) => ({
    id: `BEA-${level}`,
    level,
    title: `${level} English Pathway`,
    slug: `${level.toLowerCase()}-english-pathway`,
    description: `${BRAND} ${level} course with adaptive ESL lessons, downloadable resources, progress reporting and certificate logic.`,
    audience: level === 'A1' || level === 'A2' ? 'Young learners, new English learners and adult beginners' : 'Teenage and adult English learners',
    priceGBP: [27, 37, 47, 57, 67, 77][idx],
    duration: '12 guided lessons plus review tasks',
    tags: ['ESL', 'CEFR', level, 'British English', 'adaptive learning', 'downloadable resources'],
    certificateTitle: `${BRAND} ${level} Completion Certificate`
  }));

  const lessons = [];
  const resources = [];
  const activities = [];

  for (const course of courses) {
    const focuses = skillFocus[course.level];
    for (let i = 1; i <= 12; i++) {
      const lessonId = `${course.id}-L${String(i).padStart(2,'0')}`;
      const focus = focuses[(i-1) % focuses.length];
      lessons.push({
        id: lessonId,
        courseId: course.id,
        level: course.level,
        order: i,
        title: `${course.level} Lesson ${i}: ${titleCase(focus)}`,
        aim: `Build ${focus} through listen-read-practise-produce sequence.`,
        outcomes: [
          `Understand key ${focus} language`,
          'Complete an interactive practice activity',
          'Submit a short speaking or writing response',
          'Review feedback and move to the next recommended step'
        ],
        estimatedMinutes: 25 + (i % 4) * 5,
        contentBlocks: [
          { type: 'warmup', title: 'Warm up', body: `Look at the prompt and say what you already know about ${focus}.` },
          { type: 'teach', title: 'Learn', body: `Study the model examples for ${focus}. Notice form, meaning and pronunciation.` },
          { type: 'practice', title: 'Practice', body: 'Complete the activity. You can retry once before moving on.' },
          { type: 'produce', title: 'Produce', body: 'Write or record your own response using today\'s language.' }
        ],
        unlockRule: i === 1 ? 'enrolled' : `complete ${course.id}-L${String(i-1).padStart(2,'0')}`,
      });

      ['worksheet','answer-key','speaking-card','writing-template','parent-card'].forEach((type, rIndex) => {
        resources.push({
          id: `${lessonId}-R${rIndex+1}`,
          courseId: course.id,
          lessonId,
          title: `${course.level} Lesson ${i} ${titleCase(type.replace('-', ' '))}`,
          type,
          access: 'course_entitlement',
          fileUrl: `/protected/resources/${lessonId}-${type}.pdf`
        });
      });

      activities.push({
        id: `${lessonId}-A1`,
        courseId: course.id,
        lessonId,
        type: 'multiple-choice',
        prompt: `Which option best matches the lesson focus: ${focus}?`,
        options: [
          `A correct ${course.level} example of ${focus}`,
          'A sentence with the wrong tense',
          'A sentence with missing meaning',
          'A sentence copied without context'
        ],
        answerIndex: 0,
        feedback: ['Correct. This matches form and meaning.', 'Check the tense.', 'Check meaning.', 'Use language in context.'],
        skill: focus,
        difficulty: DIFFICULTY[course.level]
      });
      activities.push({
        id: `${lessonId}-A2`,
        courseId: course.id,
        lessonId,
        type: 'short-response',
        prompt: `Write two sentences using ${focus}.`,
        modelAnswer: `I can use ${focus} clearly in a short response.`,
        skill: focus,
        difficulty: DIFFICULTY[course.level]
      });
    }
  }

  const placementQuestions = [];
  for (const level of CEFR_LEVELS) {
    for (let i = 1; i <= 10; i++) {
      const qid = `PL-${level}-${String(i).padStart(2,'0')}`;
      placementQuestions.push({
        id: qid,
        level,
        difficulty: DIFFICULTY[level],
        prompt: `${level} placement item ${i}: Choose the best English sentence.`,
        options: [
          `Correct ${level} sentence ${i}.`,
          `Incorrect word order ${i}.`,
          `Wrong tense ${i}.`,
          `Unclear meaning ${i}.`
        ],
        answerIndex: 0,
        skill: ['grammar','vocabulary','reading','functional language','writing readiness'][i % 5]
      });
    }
  }

  const products = [
    { id: 'PROD-PLACEMENT', type: 'placement_test', title: 'Paid CEFR Level Test', priceGBP: 7, grants: ['placement_access'] },
    ...courses.map(c => ({ id: `PROD-${c.id}`, type: 'course', courseId: c.id, title: c.title, priceGBP: c.priceGBP, grants: ['course_access'] })),
    { id: 'PROD-FULL-LIBRARY', type: 'bundle', title: 'Full BEA ESL Library', priceGBP: 197, courseIds: courses.map(c => c.id), grants: ['course_access'] },
    { id: 'PROD-TOOLKIT-LIBRARY', type: 'toolkit', title: 'Full Downloadable ESL Toolkit Library', priceGBP: 47, grants: ['toolkit_access'] }
  ];

  const legalPages = [
    'terms','privacy','cookies','refund','safeguarding','parent-consent','child-data-protection','acceptable-use','accessibility','ai-content-disclosure','complaints','teacher-tutor-terms'
  ].map(slug => ({ slug, title: titleCase(slug.replaceAll('-', ' ')), status: 'draft_ready_for_legal_review', url: `/legal/${slug}` }));

  return { courses, lessons, resources, activities, placementQuestions, products, legalPages };
}

function titleCase(s) { return s.replace(/\w\S*/g, t => t[0].toUpperCase() + t.slice(1)); }
const content = generateContent();
const db = {
  users: [], children: [], parentChild: [], institutions: [], classes: [], classLearners: [], teacherClasses: [],
  orders: [], payments: [], entitlements: [], enrolments: [], placementAttempts: [], lessonProgress: [], activityAttempts: [],
  reports: [], certificates: [], downloads: [], evidence: [], adminEvents: [], cmsPages: [],
  ...content
};

// Seed institution, teacher and class for tracking demonstration.
const teacher = { id: 'user_teacher_001', role: 'teacher', name: 'Demo Teacher', email: 'teacher@bea.demo', createdAt: now() };
db.users.push(teacher);
db.institutions.push({ id: 'inst_001', name: 'Demo British English Academy School', createdAt: now() });
db.classes.push({ id: 'class_001', institutionId: 'inst_001', teacherId: teacher.id, title: 'A1-A2 Young Learners Group', courseIds: ['BEA-A1','BEA-A2'], createdAt: now() });
db.teacherClasses.push({ teacherId: teacher.id, classId: 'class_001' });

function json(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS', 'access-control-allow-headers': 'content-type,x-user-id' });
  res.end(JSON.stringify(payload, null, 2));
}
async function body(req) {
  let data = '';
  for await (const chunk of req) data += chunk;
  if (!data) return {};
  try { return JSON.parse(data); } catch { return { raw: data }; }
}
function getUser(req) {
  const userId = req.headers['x-user-id'];
  return db.users.find(u => u.id === userId);
}
function requireUser(req, res) {
  const user = getUser(req);
  if (!user) { json(res, 401, { error: 'AUTH_REQUIRED', message: 'Use x-user-id header from /api/auth/register or /api/auth/login.' }); return null; }
  return user;
}
function pathParts(req) { return new URL(req.url, `http://localhost:${PORT}`).pathname.split('/').filter(Boolean); }
function routeKey(req) { return `${req.method} ${new URL(req.url, `http://localhost:${PORT}`).pathname}`; }
function hasEntitlement(userId, productType, targetId = null) {
  return db.entitlements.some(e => e.userId === userId && e.status === 'active' && e.productType === productType && (!targetId || e.targetId === targetId || e.targetId === 'ALL'));
}
function createEntitlement(userId, productType, targetId, sourceOrderId) {
  const existing = db.entitlements.find(e => e.userId === userId && e.productType === productType && e.targetId === targetId && e.status === 'active');
  if (existing) return existing;
  const ent = { id: id('ent'), userId, productType, targetId, sourceOrderId, status: 'active', createdAt: now() };
  db.entitlements.push(ent);
  return ent;
}
function enrolUser(userId, courseId, sourceOrderId) {
  const existing = db.enrolments.find(e => e.userId === userId && e.courseId === courseId && e.status === 'active');
  if (existing) return existing;
  const course = db.courses.find(c => c.id === courseId);
  if (!course) throw new Error(`Course not found: ${courseId}`);
  const enrol = { id: id('enrol'), userId, courseId, sourceOrderId, status: 'active', progressPercent: 0, currentLessonId: `${courseId}-L01`, createdAt: now() };
  db.enrolments.push(enrol);
  assignToDemoClass(userId, courseId);
  return enrol;
}
function assignToDemoClass(userId, courseId) {
  const classMatch = db.classes.find(c => c.courseIds.includes(courseId));
  if (classMatch && !db.classLearners.some(x => x.classId === classMatch.id && x.userId === userId)) {
    db.classLearners.push({ classId: classMatch.id, userId, assignedAt: now() });
  }
}
function calculateLessonProgress(userId, courseId) {
  const lessons = db.lessons.filter(l => l.courseId === courseId);
  const completed = lessons.filter(l => db.lessonProgress.some(p => p.userId === userId && p.lessonId === l.id && p.status === 'complete')).length;
  const percent = pct(completed, lessons.length);
  const enrol = db.enrolments.find(e => e.userId === userId && e.courseId === courseId);
  if (enrol) {
    enrol.progressPercent = percent;
    const next = lessons.find(l => !db.lessonProgress.some(p => p.userId === userId && p.lessonId === l.id && p.status === 'complete'));
    enrol.currentLessonId = next?.id || null;
  }
  if (percent === 100) ensureCertificate(userId, courseId);
  return { totalLessons: lessons.length, completedLessons: completed, percent };
}
function ensureCertificate(userId, courseId) {
  let cert = db.certificates.find(c => c.userId === userId && c.courseId === courseId);
  if (!cert) {
    const course = db.courses.find(c => c.id === courseId);
    const user = db.users.find(u => u.id === userId);
    cert = {
      id: id('cert'), userId, courseId, learnerName: user?.name || user?.email || 'Learner',
      certificateTitle: course?.certificateTitle || 'Course Completion Certificate',
      status: 'issued', verificationCode: randomUUID().slice(0, 12).toUpperCase(), issuedAt: now(),
      pdfUrl: `/protected/certificates/${courseId}-${userId}.pdf`
    };
    db.certificates.push(cert);
  }
  return cert;
}
function recommendLevel(scorePercent, maxDifficultyReached) {
  if (scorePercent < 25) return 'A1';
  if (scorePercent < 40) return 'A2';
  if (scorePercent < 55) return 'B1';
  if (scorePercent < 70) return 'B2';
  if (scorePercent < 85) return maxDifficultyReached >= 5 ? 'C1' : 'B2';
  return maxDifficultyReached >= 6 ? 'C2' : 'C1';
}
function buildReport(userId) {
  const user = db.users.find(u => u.id === userId);
  const enrolments = db.enrolments.filter(e => e.userId === userId && e.status === 'active').map(e => {
    const course = db.courses.find(c => c.id === e.courseId);
    const progress = calculateLessonProgress(userId, e.courseId);
    return { courseId: e.courseId, courseTitle: course?.title, progress, currentLessonId: e.currentLessonId, certificate: db.certificates.find(c => c.userId === userId && c.courseId === e.courseId) || null };
  });
  const activitySummary = db.activityAttempts.filter(a => a.userId === userId).reduce((acc, a) => {
    acc.total += 1; if (a.correct) acc.correct += 1; return acc;
  }, { total: 0, correct: 0 });
  const accuracy = pct(activitySummary.correct, activitySummary.total);
  return { learner: { id: user?.id, name: user?.name, email: user?.email }, enrolments, activitySummary: { ...activitySummary, accuracy }, generatedAt: now() };
}

async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true });
  const parts = pathParts(req);
  const method = req.method;

  try {
    // Public / CMS / legal.
    if (method === 'GET' && parts.join('/') === 'api/health') return json(res, 200, { ok: true, brand: BRAND, time: now() });
    if (method === 'GET' && parts.join('/') === 'api/catalog/courses') return json(res, 200, { courses: db.courses, filters: ['CEFR','A1','A2','B1','B2','C1','C2','children','adults','grammar','speaking','writing','reading','listening'] });
    if (method === 'GET' && parts[0] === 'api' && parts[1] === 'catalog' && parts[2] === 'courses' && parts[3]) {
      const course = db.courses.find(c => c.id === parts[3] || c.slug === parts[3]);
      if (!course) return json(res, 404, { error: 'COURSE_NOT_FOUND' });
      return json(res, 200, { course, lessons: db.lessons.filter(l => l.courseId === course.id).map(l => ({ id: l.id, order: l.order, title: l.title, estimatedMinutes: l.estimatedMinutes })) });
    }
    if (method === 'GET' && parts.join('/') === 'api/products') return json(res, 200, { products: db.products });
    if (method === 'GET' && parts.join('/') === 'api/legal') return json(res, 200, { legalPages: db.legalPages });
    if (method === 'GET' && parts[0] === 'api' && parts[1] === 'legal' && parts[2]) {
      const page = db.legalPages.find(p => p.slug === parts[2]);
      if (!page) return json(res, 404, { error: 'LEGAL_PAGE_NOT_FOUND' });
      return json(res, 200, { ...page, body: `${page.title} starter copy. This must be reviewed by a qualified legal/compliance professional before launch.` });
    }

    // Auth and user relationships.
    if (method === 'POST' && parts.join('/') === 'api/auth/register') {
      const b = await body(req);
      const user = { id: id('user'), role: b.role || 'parent', name: b.name || 'New User', email: b.email, createdAt: now() };
      db.users.push(user);
      return json(res, 201, { user, token: `demo-token-${user.id}` });
    }
    if (method === 'POST' && parts.join('/') === 'api/auth/login') {
      const b = await body(req);
      const user = db.users.find(u => u.email === b.email);
      if (!user) return json(res, 404, { error: 'USER_NOT_FOUND' });
      return json(res, 200, { user, token: `demo-token-${user.id}` });
    }
    if (method === 'POST' && parts.join('/') === 'api/parent/children') {
      const parent = requireUser(req, res); if (!parent) return;
      const b = await body(req);
      const childUser = { id: id('child'), role: 'learner', name: b.name, email: b.email || `${b.name?.toLowerCase()?.replace(/\s+/g,'.')}@child.bea.demo`, age: b.age || null, createdAt: now() };
      db.users.push(childUser);
      db.children.push({ userId: childUser.id, parentId: parent.id, age: b.age || null, safeguardingConsent: Boolean(b.safeguardingConsent), createdAt: now() });
      db.parentChild.push({ parentId: parent.id, childId: childUser.id });
      return json(res, 201, { child: childUser });
    }

    // Payment: mock checkout and confirmation.
    if (method === 'POST' && parts.join('/') === 'api/payments/checkout') {
      const user = requireUser(req, res); if (!user) return;
      const b = await body(req);
      const product = db.products.find(p => p.id === b.productId);
      if (!product) return json(res, 404, { error: 'PRODUCT_NOT_FOUND' });
      const order = { id: id('order'), userId: user.id, learnerId: b.learnerId || user.id, productId: product.id, amountGBP: product.priceGBP, status: 'pending', createdAt: now() };
      db.orders.push(order);
      const payment = { id: id('pay'), orderId: order.id, provider: 'mock', status: 'pending', createdAt: now() };
      db.payments.push(payment);
      return json(res, 201, { checkoutUrl: `/mock-checkout/${order.id}`, order, payment });
    }
    if (method === 'POST' && parts[0] === 'api' && parts[1] === 'payments' && parts[2] === 'confirm') {
      const user = requireUser(req, res); if (!user) return;
      const b = await body(req);
      const order = db.orders.find(o => o.id === b.orderId);
      if (!order) return json(res, 404, { error: 'ORDER_NOT_FOUND' });
      const product = db.products.find(p => p.id === order.productId);
      order.status = 'paid'; order.paidAt = now();
      const payment = db.payments.find(p => p.orderId === order.id); if (payment) { payment.status = 'paid'; payment.paidAt = now(); }
      const learnerId = order.learnerId || order.userId;
      if (product.type === 'placement_test') createEntitlement(learnerId, 'placement_access', 'PLACEMENT', order.id);
      if (product.type === 'course') { createEntitlement(learnerId, 'course_access', product.courseId, order.id); enrolUser(learnerId, product.courseId, order.id); }
      if (product.type === 'bundle') { for (const cid of product.courseIds) { createEntitlement(learnerId, 'course_access', cid, order.id); enrolUser(learnerId, cid, order.id); } }
      if (product.type === 'toolkit') createEntitlement(learnerId, 'toolkit_access', 'ALL', order.id);
      db.adminEvents.push({ id: id('event'), type: 'payment_confirmed', userId: user.id, learnerId, productId: product.id, createdAt: now() });
      return json(res, 200, { order, payment, entitlements: db.entitlements.filter(e => e.userId === learnerId), enrolments: db.enrolments.filter(e => e.userId === learnerId) });
    }

    // Placement test.
    if (method === 'GET' && parts.join('/') === 'api/placement/questions') {
      const user = requireUser(req, res); if (!user) return;
      if (!hasEntitlement(user.id, 'placement_access', 'PLACEMENT')) return json(res, 403, { error: 'PLACEMENT_PAYMENT_REQUIRED' });
      // Adaptive start: 3 questions from A1, A2, B1, B2, C1, C2. Production can serve in bands.
      return json(res, 200, { questions: db.placementQuestions.map(q => ({ id: q.id, level: q.level, prompt: q.prompt, options: q.options, skill: q.skill })) });
    }
    if (method === 'POST' && parts.join('/') === 'api/placement/submit') {
      const user = requireUser(req, res); if (!user) return;
      if (!hasEntitlement(user.id, 'placement_access', 'PLACEMENT')) return json(res, 403, { error: 'PLACEMENT_PAYMENT_REQUIRED' });
      const b = await body(req);
      const answers = b.answers || {};
      let correct = 0, total = 0, maxDifficultyCorrect = 1;
      for (const q of db.placementQuestions) {
        if (answers[q.id] === undefined) continue;
        total++;
        if (Number(answers[q.id]) === q.answerIndex) { correct++; maxDifficultyCorrect = Math.max(maxDifficultyCorrect, q.difficulty); }
      }
      const scorePercent = pct(correct, total || db.placementQuestions.length);
      const recommendedLevel = recommendLevel(scorePercent, maxDifficultyCorrect);
      const attempt = { id: id('placement'), userId: user.id, total, correct, scorePercent, recommendedLevel, trialLessonId: `BEA-${recommendedLevel}-L01`, status: 'complete', createdAt: now() };
      db.placementAttempts.push(attempt);
      createEntitlement(user.id, 'trial_lesson_access', attempt.trialLessonId, attempt.id);
      return json(res, 200, { attempt, recommendedCourseId: `BEA-${recommendedLevel}` });
    }

    // Learner dashboard, course and lessons.
    if (method === 'GET' && parts.join('/') === 'api/dashboard/learner') {
      const user = requireUser(req, res); if (!user) return;
      const enrolments = db.enrolments.filter(e => e.userId === user.id).map(e => ({ ...e, course: db.courses.find(c => c.id === e.courseId), progress: calculateLessonProgress(user.id, e.courseId) }));
      const placement = db.placementAttempts.filter(a => a.userId === user.id).at(-1) || null;
      const certificates = db.certificates.filter(c => c.userId === user.id);
      return json(res, 200, { user, placement, enrolments, certificates, downloads: db.downloads.filter(d => d.userId === user.id) });
    }
    if (method === 'GET' && parts[0] === 'api' && parts[1] === 'lms' && parts[2] === 'courses' && parts[3]) {
      const user = requireUser(req, res); if (!user) return;
      const courseId = parts[3];
      if (!hasEntitlement(user.id, 'course_access', courseId)) return json(res, 403, { error: 'COURSE_PAYMENT_REQUIRED' });
      const course = db.courses.find(c => c.id === courseId);
      const lessons = db.lessons.filter(l => l.courseId === courseId).map(l => ({ ...l, progress: db.lessonProgress.find(p => p.userId === user.id && p.lessonId === l.id) || { status: 'not_started' } }));
      return json(res, 200, { course, lessons, progress: calculateLessonProgress(user.id, courseId) });
    }
    if (method === 'GET' && parts[0] === 'api' && parts[1] === 'lms' && parts[2] === 'lessons' && parts[3]) {
      const user = requireUser(req, res); if (!user) return;
      const lessonId = parts[3];
      const lesson = db.lessons.find(l => l.id === lessonId);
      if (!lesson) return json(res, 404, { error: 'LESSON_NOT_FOUND' });
      const canAccess = hasEntitlement(user.id, 'course_access', lesson.courseId) || hasEntitlement(user.id, 'trial_lesson_access', lesson.id);
      if (!canAccess) return json(res, 403, { error: 'LESSON_LOCKED' });
      let progress = db.lessonProgress.find(p => p.userId === user.id && p.lessonId === lessonId);
      if (!progress) { progress = { id: id('progress'), userId: user.id, courseId: lesson.courseId, lessonId, status: 'in_progress', contentOpened: true, resourcesAccessed: false, activitiesComplete: false, productionSubmitted: false, scorePercent: 0, createdAt: now(), updatedAt: now() }; db.lessonProgress.push(progress); }
      else { progress.contentOpened = true; progress.updatedAt = now(); }
      return json(res, 200, { lesson, resources: db.resources.filter(r => r.lessonId === lessonId), activities: db.activities.filter(a => a.lessonId === lessonId), progress });
    }
    if (method === 'POST' && parts[0] === 'api' && parts[1] === 'lms' && parts[2] === 'activities' && parts[3] === 'attempt') {
      const user = requireUser(req, res); if (!user) return;
      const b = await body(req);
      const activity = db.activities.find(a => a.id === b.activityId);
      if (!activity) return json(res, 404, { error: 'ACTIVITY_NOT_FOUND' });
      const lesson = db.lessons.find(l => l.id === activity.lessonId);
      if (!hasEntitlement(user.id, 'course_access', activity.courseId) && !hasEntitlement(user.id, 'trial_lesson_access', activity.lessonId)) return json(res, 403, { error: 'ACTIVITY_LOCKED' });
      const correct = activity.type === 'multiple-choice' ? Number(b.answer) === activity.answerIndex : String(b.response || '').trim().length >= 10;
      const attempt = { id: id('attempt'), userId: user.id, activityId: activity.id, courseId: activity.courseId, lessonId: activity.lessonId, answer: b.answer, response: b.response, correct, createdAt: now() };
      db.activityAttempts.push(attempt);
      updateLessonCompletion(user.id, lesson.courseId, lesson.id);
      const adaptive = nextAdaptiveRecommendation(user.id, lesson.courseId);
      return json(res, 200, { attempt, feedback: activity.feedback?.[Number(b.answer)] || (correct ? 'Accepted.' : 'Needs more detail.'), progress: db.lessonProgress.find(p => p.userId === user.id && p.lessonId === lesson.id), adaptive });
    }
    if (method === 'POST' && parts[0] === 'api' && parts[1] === 'lms' && parts[2] === 'lessons' && parts[3] && parts[4] === 'production') {
      const user = requireUser(req, res); if (!user) return;
      const lessonId = parts[3]; const lesson = db.lessons.find(l => l.id === lessonId);
      if (!lesson) return json(res, 404, { error: 'LESSON_NOT_FOUND' });
      const b = await body(req);
      const evidence = { id: id('evidence'), userId: user.id, courseId: lesson.courseId, lessonId, title: b.title || 'Learner production', text: b.text || '', fileUrl: b.fileUrl || null, status: 'submitted', createdAt: now() };
      db.evidence.push(evidence);
      let progress = db.lessonProgress.find(p => p.userId === user.id && p.lessonId === lessonId);
      if (!progress) { progress = { id: id('progress'), userId: user.id, courseId: lesson.courseId, lessonId, status: 'in_progress', contentOpened: true, resourcesAccessed: false, activitiesComplete: false, productionSubmitted: true, scorePercent: 0, createdAt: now(), updatedAt: now() }; db.lessonProgress.push(progress); }
      progress.productionSubmitted = true; progress.updatedAt = now();
      updateLessonCompletion(user.id, lesson.courseId, lessonId);
      return json(res, 200, { evidence, progress: db.lessonProgress.find(p => p.userId === user.id && p.lessonId === lessonId), courseProgress: calculateLessonProgress(user.id, lesson.courseId) });
    }

    // Protected resource and toolkit access.
    if (method === 'POST' && parts.join('/') === 'api/resources/access') {
      const user = requireUser(req, res); if (!user) return;
      const b = await body(req);
      const resource = db.resources.find(r => r.id === b.resourceId);
      if (!resource) return json(res, 404, { error: 'RESOURCE_NOT_FOUND' });
      const courseAllowed = hasEntitlement(user.id, 'course_access', resource.courseId) || hasEntitlement(user.id, 'trial_lesson_access', resource.lessonId);
      const toolkitAllowed = hasEntitlement(user.id, 'toolkit_access', 'ALL');
      if (!courseAllowed && !toolkitAllowed) return json(res, 403, { error: 'RESOURCE_LOCKED' });
      db.downloads.push({ id: id('dl'), userId: user.id, resourceId: resource.id, courseId: resource.courseId, lessonId: resource.lessonId, createdAt: now() });
      let progress = db.lessonProgress.find(p => p.userId === user.id && p.lessonId === resource.lessonId);
      if (progress) { progress.resourcesAccessed = true; progress.updatedAt = now(); updateLessonCompletion(user.id, resource.courseId, resource.lessonId); }
      return json(res, 200, { resource, protectedUrl: resource.fileUrl, downloadRecorded: true, progress });
    }

    // Parent, teacher, institution and admin dashboards.
    if (method === 'GET' && parts.join('/') === 'api/dashboard/parent') {
      const parent = requireUser(req, res); if (!parent) return;
      const children = db.parentChild.filter(pc => pc.parentId === parent.id).map(pc => ({ child: db.users.find(u => u.id === pc.childId), report: buildReport(pc.childId), placement: db.placementAttempts.filter(a => a.userId === pc.childId).at(-1) || null }));
      return json(res, 200, { parent, children });
    }
    if (method === 'GET' && parts.join('/') === 'api/dashboard/teacher') {
      const teacherUser = requireUser(req, res); if (!teacherUser) return;
      const classIds = db.teacherClasses.filter(tc => tc.teacherId === teacherUser.id).map(tc => tc.classId);
      const classes = db.classes.filter(c => classIds.includes(c.id)).map(c => ({ ...c, learners: db.classLearners.filter(cl => cl.classId === c.id).map(cl => ({ learner: db.users.find(u => u.id === cl.userId), report: buildReport(cl.userId) })) }));
      return json(res, 200, { teacher: teacherUser, classes });
    }
    if (method === 'GET' && parts[0] === 'api' && parts[1] === 'reports' && parts[2] === 'learner' && parts[3]) {
      const viewer = requireUser(req, res); if (!viewer) return;
      const learnerId = parts[3];
      const allowed = viewer.id === learnerId || db.parentChild.some(pc => pc.parentId === viewer.id && pc.childId === learnerId) || viewer.role === 'teacher' || viewer.role === 'admin';
      if (!allowed) return json(res, 403, { error: 'REPORT_FORBIDDEN' });
      return json(res, 200, buildReport(learnerId));
    }
    if (method === 'GET' && parts.join('/') === 'api/admin/overview') {
      const viewer = requireUser(req, res); if (!viewer) return;
      if (!['admin','teacher'].includes(viewer.role)) return json(res, 403, { error: 'ADMIN_FORBIDDEN' });
      return json(res, 200, {
        counts: Object.fromEntries(['users','orders','payments','entitlements','enrolments','placementAttempts','lessonProgress','activityAttempts','evidence','certificates','downloads'].map(k => [k, db[k].length])),
        paidOrders: db.orders.filter(o => o.status === 'paid').length,
        pendingOrders: db.orders.filter(o => o.status === 'pending').length,
        recentEvents: db.adminEvents.slice(-10)
      });
    }

    return json(res, 404, { error: 'NOT_FOUND', route: routeKey(req) });
  } catch (err) {
    return json(res, 500, { error: 'SERVER_ERROR', message: err.message, stack: process.env.NODE_ENV === 'production' ? undefined : err.stack });
  }
}

function updateLessonCompletion(userId, courseId, lessonId) {
  const activities = db.activities.filter(a => a.lessonId === lessonId);
  const attempts = db.activityAttempts.filter(a => a.userId === userId && a.lessonId === lessonId);
  const completedActivityIds = new Set(attempts.filter(a => a.correct).map(a => a.activityId));
  const allActivitiesComplete = activities.every(a => completedActivityIds.has(a.id));
  const evidenceSubmitted = db.evidence.some(e => e.userId === userId && e.lessonId === lessonId && e.status === 'submitted');
  let progress = db.lessonProgress.find(p => p.userId === userId && p.lessonId === lessonId);
  if (!progress) return null;
  progress.activitiesComplete = allActivitiesComplete;
  progress.productionSubmitted = progress.productionSubmitted || evidenceSubmitted;
  progress.scorePercent = pct(completedActivityIds.size, activities.length);
  if (progress.contentOpened && progress.resourcesAccessed && progress.activitiesComplete && progress.productionSubmitted) progress.status = 'complete';
  else progress.status = 'in_progress';
  progress.updatedAt = now();
  calculateLessonProgress(userId, courseId);
  return progress;
}

function nextAdaptiveRecommendation(userId, courseId) {
  const course = db.courses.find(c => c.id === courseId);
  const lessons = db.lessons.filter(l => l.courseId === courseId);
  const attempts = db.activityAttempts.filter(a => a.userId === userId && a.courseId === courseId).slice(-10);
  const accuracy = pct(attempts.filter(a => a.correct).length, attempts.length);
  const nextLesson = lessons.find(l => !db.lessonProgress.some(p => p.userId === userId && p.lessonId === l.id && p.status === 'complete'));
  let recommendation = 'continue_current_path';
  if (attempts.length >= 3 && accuracy < 50) recommendation = 'review_easier_practice';
  if (attempts.length >= 3 && accuracy >= 85) recommendation = 'unlock_challenge_task';
  return { courseId, level: course?.level, recentAccuracy: accuracy, recommendation, nextLessonId: nextLesson?.id || null };
}

const server = http.createServer(handler);
server.listen(PORT, () => {
  console.log(`${BRAND} commercial education engine running on http://localhost:${PORT}`);
  console.log(`Run: node tests/acceptance-flow.mjs`);
});
