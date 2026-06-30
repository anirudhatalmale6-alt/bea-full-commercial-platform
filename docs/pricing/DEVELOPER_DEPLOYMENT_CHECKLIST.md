# Developer Deployment Checklist

## Database

- [ ] Run pricing migration.
- [ ] Run pricing seed.
- [ ] Confirm pricing tables populated.
- [ ] Confirm product codes match course codes.
- [ ] Confirm coupons seeded.
- [ ] Confirm refund rules seeded.

## Stripe

- [ ] Create Stripe products.
- [ ] Create one-time prices.
- [ ] Create recurring subscription prices.
- [ ] Create institution licence prices.
- [ ] Add price IDs to environment variables.
- [ ] Configure Stripe webhook.
- [ ] Test Level Test checkout.
- [ ] Test course checkout.
- [ ] Test subscription checkout.
- [ ] Test institution licence checkout.
- [ ] Test refund.

## LMS access

- [ ] Public previews stay public.
- [ ] Level Test locked until payment.
- [ ] Short trial unlocks after paid/completed Level Test.
- [ ] Course unlocks after payment.
- [ ] Bundle unlocks all included courses.
- [ ] Subscription unlocks all self-study courses.
- [ ] Institution licence unlocks assigned learner access.
- [ ] Access is revoked according to refund/cancellation policy.

## Build

- [ ] Run `node scripts/audit-pricing-pack.mjs`.
- [ ] Run `npm run build`.
- [ ] Run end-to-end payment tests.
