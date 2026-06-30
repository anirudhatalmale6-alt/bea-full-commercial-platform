export type Role = 'parent' | 'learner' | 'teacher' | 'admin' | 'institution_admin';
export type CheckoutProductType = 'placement_test' | 'course' | 'bundle' | 'toolkit';

const API_BASE = process.env.NEXT_PUBLIC_BEA_API_BASE || '';

async function request<T>(path: string, options: { method?: string; userId?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.userId ? { 'x-user-id': options.userId } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `Request failed: ${path}`);
  return data as T;
}

export const beaApi = {
  health: () => request('/api/health'),
  courses: () => request('/api/catalog/courses'),
  course: (courseId: string) => request(`/api/catalog/courses/${courseId}`),
  products: () => request('/api/products'),
  legal: () => request('/api/legal'),

  register: (payload: { role: Role; name: string; email: string }) =>
    request('/api/auth/register', { method: 'POST', body: payload }),

  addChild: (parentUserId: string, payload: { name: string; age?: number; safeguardingConsent: boolean }) =>
    request('/api/parent/children', { method: 'POST', userId: parentUserId, body: payload }),

  createCheckout: (userId: string, payload: { productId: string; learnerId?: string }) =>
    request('/api/payments/checkout', { method: 'POST', userId, body: payload }),

  confirmMockPayment: (userId: string, orderId: string) =>
    request('/api/payments/confirm', { method: 'POST', userId, body: { orderId } }),

  placementQuestions: (learnerUserId: string) =>
    request('/api/placement/questions', { userId: learnerUserId }),

  submitPlacement: (learnerUserId: string, answers: Record<string, number>) =>
    request('/api/placement/submit', { method: 'POST', userId: learnerUserId, body: { answers } }),

  learnerDashboard: (learnerUserId: string) =>
    request('/api/dashboard/learner', { userId: learnerUserId }),

  parentDashboard: (parentUserId: string) =>
    request('/api/dashboard/parent', { userId: parentUserId }),

  teacherDashboard: (teacherUserId: string) =>
    request('/api/dashboard/teacher', { userId: teacherUserId }),

  lmsCourse: (learnerUserId: string, courseId: string) =>
    request(`/api/lms/courses/${courseId}`, { userId: learnerUserId }),

  lmsLesson: (learnerUserId: string, lessonId: string) =>
    request(`/api/lms/lessons/${lessonId}`, { userId: learnerUserId }),

  resourceAccess: (learnerUserId: string, resourceId: string) =>
    request('/api/resources/access', { method: 'POST', userId: learnerUserId, body: { resourceId } }),

  submitActivity: (learnerUserId: string, payload: { activityId: string; answer?: number; response?: string }) =>
    request('/api/lms/activities/attempt', { method: 'POST', userId: learnerUserId, body: payload }),

  submitProduction: (learnerUserId: string, lessonId: string, payload: { title: string; text?: string; fileUrl?: string }) =>
    request(`/api/lms/lessons/${lessonId}/production`, { method: 'POST', userId: learnerUserId, body: payload }),

  learnerReport: (viewerUserId: string, learnerUserId: string) =>
    request(`/api/reports/learner/${learnerUserId}`, { userId: viewerUserId }),

  adminOverview: (adminUserId: string) =>
    request('/api/admin/overview', { userId: adminUserId })
};
