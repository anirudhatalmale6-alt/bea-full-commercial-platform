# British English Academy (BEA) — Full Commercial Live-Ready Platform Pack v3.0

## What this is

This is the consolidated BEA platform package assembled from the uploaded BEA/LEA commercial integration files and the full conversation thread requirements.

It includes the working Next.js platform shell plus integrated contracts/code for:

- BEA Splash-style commercial landing page
- Find Course navigation and Teachers & Educators route
- course previews and public snippets
- paid Level Test checkout
- Level Test completion and CEFR pathway mapping
- diagnostic report and diagnostic certificate flow
- short trial/appetiser unlock
- full course checkout
- automatic LMS enrolment
- learner dashboard
- parent dashboard and parent-child linking
- teacher dashboard and class/course assignment
- institution dashboard and licence/learner linkage
- LMS module/lesson route and progress tracking
- pricing model and admin pricing contracts
- A1-C2 course content completion pack
- Amazon Polly SSML/audio scripts and import tooling
- HeyGen/media completion suite references
- early-years adaptive game engine specification
- SCORM/LMS/CMS infrastructure reference
- PostgreSQL migrations and seed data
- deployment checklists and acceptance tests

## Main commercial journey

```text
Landing Page
→ Course Preview
→ Register/Login
→ Pay for Level Test
→ Complete Level Test
→ Mapped A1-C2 Pathway
→ Report + Diagnostic Certificate
→ Short Trial Lesson
→ Pay for Full Course
→ LMS Enrolment Created
→ Dashboard Unlock
→ Module 1 Opens
→ Progress Saves
→ Parent/Teacher/Institution Dashboards Update
```

## Run locally

```bash
npm install
cp .env.example .env.local
# set DATABASE_URL and Stripe variables or set ALLOW_MOCK_PAYMENTS=true for staging
npm run audit:static
npm run audit:bea-live
npm run build
npm run start
```

## Database deployment

Run the original LMS migration first, then the BEA flow/pricing/content migrations:

```bash
psql "$DATABASE_URL" -f db/migrations/001_init.sql
psql "$DATABASE_URL" -f database/flow/migrations/007_bea_lea_full_commercial_flow.sql
psql "$DATABASE_URL" -f database/pricing/migrations/006_pricing_commerce_structure.sql
psql "$DATABASE_URL" -f database/audio/migrations/007_bea_audio_assets.sql
```

Then seed content:

```bash
npm run seed
psql "$DATABASE_URL" -f database/flow/seeds/seed_bea_lea_flow_courses.sql
psql "$DATABASE_URL" -f database/pricing/seeds/seed_lea_pricing.sql
```

## Production rule

Payment success must trigger server-side access unlock automatically:

```text
Stripe webhook
→ payment marked paid
→ Level Test or course enrolment created
→ dashboard updates
→ LMS module opens
```

A success page alone is not a completed commercial flow.

## Final launch checks

- run all audits
- run `npm run build`
- test Stripe Level Test payment
- test Stripe full-course payment
- test webhook unlock
- test parent-child link
- test teacher class assignment
- test institution licence assignment
- test LMS lesson progress
- test certificate/report generation
- test mobile landing page
