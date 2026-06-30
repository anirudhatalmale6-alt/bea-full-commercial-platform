# BEA/BEA API Endpoint Map

## Public
- `GET /api/health`
- `GET /api/catalog/courses`
- `GET /api/catalog/courses/:courseIdOrSlug`
- `GET /api/products`
- `GET /api/legal`
- `GET /api/legal/:slug`

## Auth and relationship
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/parent/children`

## Payments and entitlements
- `POST /api/payments/checkout`
- `POST /api/payments/confirm`

Production replacement: replace `/api/payments/confirm` with Stripe webhook confirmation. The webhook must create order, payment, entitlement and enrolment records.

## Placement
- `GET /api/placement/questions`
- `POST /api/placement/submit`

## LMS
- `GET /api/dashboard/learner`
- `GET /api/lms/courses/:courseId`
- `GET /api/lms/lessons/:lessonId`
- `POST /api/lms/activities/attempt`
- `POST /api/lms/lessons/:lessonId/production`
- `POST /api/resources/access`

## Dashboards and reports
- `GET /api/dashboard/parent`
- `GET /api/dashboard/teacher`
- `GET /api/reports/learner/:learnerId`
- `GET /api/admin/overview`
