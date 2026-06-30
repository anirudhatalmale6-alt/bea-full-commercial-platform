# Live Deployment Checklist

1. Create a PostgreSQL 16 database.
2. Run `db/migrations/001_init.sql`.
3. Seed `db/seed_item_bank.sql` and `db/seed_course_and_activity_library.sql`.
4. Create a Stripe product and price for the placement test.
5. Add environment variables in DigitalOcean/Vercel.
6. Configure Stripe webhook to `/api/webhooks/stripe`.
7. Set `ALLOW_DEMO_ACCESS=false` in production.
8. Run a paid test transaction in Stripe test mode.
9. Confirm report and certificate generation.
10. Review certificate wording before using with institutions.
11. Run pilot testing with real learners and update item parameters.
12. Start validation studies before making high-stakes acceptance claims.

Prepared by Teacher Jibril Moruthoane.
