# British English Academy — Commercial Readiness Audit

## Status

This package has been hardened into a commercial-deployment candidate. It includes a complete platform scaffold, course marketplace homepage, paid placement-test flow, Stripe checkout/webhook routes, adaptive item selection, CEFR report generation, certificate verification, LMS dashboard pages, curriculum data, lesson data, activity library, downloadable assets, PostgreSQL migrations, seed scripts, Docker configuration and DigitalOcean app specification.

## What was fixed in this readiness pass

- Added missing user-facing checkout page: `/checkout/placement`.
- Added certificate verification page: `/verify-certificate`.
- Added sample report page: `/sample-report`.
- Added CEFR level guide page: `/cefr-levels`.
- Added CoursesOnline-style route family: `/courses` and `/courses/[slug]`.
- Added subject landing page: `/subjects`.
- Added institution pages: `/schools` and `/employers`.
- Added learner LMS dashboard: `/dashboard`.
- Added teacher/institution LMS dashboard: `/teacher-dashboard`.
- Added downloadable asset page and API: `/downloads`, `/api/downloadables`.
- Added LMS progress API: `/api/lms/progress`.
- Expanded placement item bank to 240 original objective items across grammar, vocabulary, reading, listening, speaking and writing.
- Added productive speaking/writing prompt bank with rubrics.
- Added 216 structured lesson records generated from the CEFR curriculum map.
- Added downloadable learner checklists, writing frames and teacher trackers.
- Added database tables for lessons, downloadables, enrolments, lesson progress and activity attempts.
- Added static audit script: `npm run audit:static`.
- Updated Next.js route props for asynchronous `params` and `searchParams` patterns.
- Rebranded certificate IDs to use `LEA-` prefix.

## Commercial deployment gates still required outside the code package

No software package can honestly be called “100% commercially live” until the production environment has been configured and verified. Before accepting real customers, complete these external gates:

1. Create live Stripe product and price for the placement test.
2. Configure Stripe webhook endpoint to `/api/webhooks/stripe`.
3. Configure production PostgreSQL and run `npm run seed`.
4. Set production environment variables and secrets.
5. Deploy to DigitalOcean, Vercel, or equivalent Node hosting.
6. Run `npm run audit:static` and `npm run build` in the production CI environment.
7. Run a live Stripe test-mode transaction and confirm the test unlocks.
8. Complete a placement test and confirm report/certificate generation.
9. Connect domain, SSL, privacy policy, terms, refund policy and cookie notices.
10. Conduct pilot validation before marketing the certificate for high-stakes institutional use.

## Ethical certification wording

Use: “British English Academy Diagnostic Certificate.”

Avoid claiming that the certificate is an official Cambridge, Pearson, Oxford University, McGraw Hill, Council of Europe, immigration or university-admission qualification unless separate formal recognition or accreditation is obtained.
