const BASE = process.env.BEA_API || 'http://localhost:5055';

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.userId ? { 'x-user-id': options.userId } : {}),
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  console.log('BEA/BEA acceptance test started');

  const health = await api('/api/health');
  console.log('1 health:', health.ok, health.brand);

  const parentReg = await api('/api/auth/register', { method: 'POST', body: { role: 'parent', name: 'Demo Parent', email: `parent-${Date.now()}@demo.test` } });
  const parent = parentReg.user;
  console.log('2 parent registered:', parent.id);

  const childReg = await api('/api/parent/children', { method: 'POST', userId: parent.id, body: { name: 'Demo Child', age: 10, safeguardingConsent: true } });
  const child = childReg.child;
  console.log('3 child profile created:', child.id);

  const products = await api('/api/products');
  const placementProduct = products.products.find(p => p.id === 'PROD-PLACEMENT');
  const placementCheckout = await api('/api/payments/checkout', { method: 'POST', userId: parent.id, body: { productId: placementProduct.id, learnerId: child.id } });
  await api('/api/payments/confirm', { method: 'POST', userId: parent.id, body: { orderId: placementCheckout.order.id } });
  console.log('4 paid placement test unlocked for child');

  const placementQuestions = await api('/api/placement/questions', { userId: child.id });
  const answers = {};
  for (const q of placementQuestions.questions) {
    answers[q.id] = ['A1','A2'].includes(q.level) ? 0 : 1;
  }
  const placement = await api('/api/placement/submit', { method: 'POST', userId: child.id, body: { answers } });
  console.log('5 placement complete:', placement.attempt.recommendedLevel, placement.recommendedCourseId);

  const trial = await api(`/api/lms/lessons/${placement.attempt.trialLessonId}`, { userId: child.id });
  console.log('6 trial lesson unlocked:', trial.lesson.id);

  const courseProduct = products.products.find(p => p.type === 'course' && p.courseId === placement.recommendedCourseId);
  const courseCheckout = await api('/api/payments/checkout', { method: 'POST', userId: parent.id, body: { productId: courseProduct.id, learnerId: child.id } });
  const paidCourse = await api('/api/payments/confirm', { method: 'POST', userId: parent.id, body: { orderId: courseCheckout.order.id } });
  console.log('7 course paid and auto-enrolled:', paidCourse.enrolments.map(e => e.courseId).join(','));

  const course = await api(`/api/lms/courses/${placement.recommendedCourseId}`, { userId: child.id });
  console.log('8 course loaded:', course.course.title, `${course.lessons.length} lessons`);

  for (const lessonSummary of course.lessons) {
    const lesson = await api(`/api/lms/lessons/${lessonSummary.id}`, { userId: child.id });
    await api('/api/resources/access', { method: 'POST', userId: child.id, body: { resourceId: lesson.resources[0].id } });
    for (const activity of lesson.activities) {
      if (activity.type === 'multiple-choice') {
        await api('/api/lms/activities/attempt', { method: 'POST', userId: child.id, body: { activityId: activity.id, answer: 0 } });
      } else {
        await api('/api/lms/activities/attempt', { method: 'POST', userId: child.id, body: { activityId: activity.id, response: 'This is my completed learner response for the lesson.' } });
      }
    }
    await api(`/api/lms/lessons/${lesson.lesson.id}/production`, { method: 'POST', userId: child.id, body: { title: `${lesson.lesson.id} production`, text: 'I completed the writing or speaking production task for this lesson.' } });
  }
  console.log('9 all course lessons completed');

  const learnerDash = await api('/api/dashboard/learner', { userId: child.id });
  const enrol = learnerDash.enrolments.find(e => e.courseId === placement.recommendedCourseId);
  console.log('10 learner progress:', enrol.progress.percent + '%');

  const parentDash = await api('/api/dashboard/parent', { userId: parent.id });
  console.log('11 parent sees child reports:', parentDash.children.length);

  const teacherLogin = await api('/api/auth/login', { method: 'POST', body: { email: 'teacher@bea.demo' } });
  const teacherDash = await api('/api/dashboard/teacher', { userId: teacherLogin.user.id });
  console.log('12 teacher dashboard classes:', teacherDash.classes.length);

  const report = await api(`/api/reports/learner/${child.id}`, { userId: parent.id });
  console.log('13 learner report generated:', report.activitySummary.accuracy + '% accuracy');

  const admin = await api('/api/admin/overview', { userId: teacherLogin.user.id });
  console.log('14 admin overview counts:', admin.counts);

  const cert = learnerDash.certificates?.[0] || (await api('/api/dashboard/learner', { userId: child.id })).certificates[0];
  if (!cert || cert.status !== 'issued') throw new Error('Certificate was not issued after completion');
  console.log('15 certificate issued:', cert.verificationCode);

  console.log('SUCCESS: BEA/BEA commercial education engine flow works end-to-end.');
}

main().catch(err => {
  console.error('ACCEPTANCE TEST FAILED');
  console.error(err);
  process.exit(1);
});
