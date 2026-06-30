# BEA / BEA Commercial Education Engine - Developer Handoff

This pack is a working, no-dependency Node.js commercial ESL platform engine that sits behind the BEA/BEA design.

It implements the required flow:

Landing page/course catalogue -> paid Level Test -> placement -> trial lesson unlock -> full course payment -> automatic LMS enrolment -> learner dashboard -> adaptive lessons -> downloadable resources -> parent/teacher tracking -> progress reports -> certificates -> legal/CMS/admin controls.

## Quick start

```bash
cd bea-lea-commercial-education-engine
node demo/server.mjs
```

Open a second terminal:

```bash
node tests/acceptance-flow.mjs
```

The acceptance test proves:

1. Parent registration
2. Child profile creation
3. Paid placement test checkout
4. Payment confirmation
5. Placement test completion
6. CEFR level recommendation
7. Trial lesson unlock
8. Full course purchase
9. Automatic course enrolment
10. Learner dashboard access
11. Teacher/class visibility
12. Lesson activity completion
13. Adaptive next-lesson recommendation
14. Parent progress report
15. Certificate generation after course completion
16. Protected toolkit/resource access
17. Admin overview

## Important production note

The demo uses mock payments and in-memory storage so the developer can test the complete commercial logic immediately. For production, replace the mock payment provider with Stripe Checkout/webhooks, move storage to PostgreSQL and protected file storage, and connect authentication to the platform session/JWT.

## Brand/name

Default public brand: **British English Academy (BEA)**. The code keeps LEA-compatible naming in comments and API labels where helpful because the platform was previously British English Academy.

## Main folders

- `demo/server.mjs` - working API engine
- `tests/acceptance-flow.mjs` - end-to-end commercial flow test
- `frontend/` - copy-paste frontend API client and React wiring examples
- `seed/` - generated CEFR A1-C2 course, lesson, question and resource content
- `docs/` - API, schema, access rules, acceptance criteria and legal-page map
- `resources/legal/` - legal/compliance page starter copy
- `resources/downloads/` - protected sample download placeholders

