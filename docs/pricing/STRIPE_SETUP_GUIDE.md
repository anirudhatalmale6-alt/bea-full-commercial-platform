# Stripe Setup Guide

## Required Stripe Products and Prices

Create the following Stripe products and prices.

### Level Test

Product: `BEA Level Test, Score Report and Diagnostic Certificate`

Environment variable:

```text
STRIPE_PRICE_BEA_LEVEL_TEST
```

### Single Courses

Create launch and standard prices for each:

```text
STRIPE_PRICE_BEA_A1_STARTER_LAUNCH
STRIPE_PRICE_BEA_A1_STARTER_STANDARD
STRIPE_PRICE_BEA_A2_EVERYDAY_LAUNCH
STRIPE_PRICE_BEA_A2_EVERYDAY_STANDARD
STRIPE_PRICE_BEA_B1_INDEPENDENT_LAUNCH
STRIPE_PRICE_BEA_B1_INDEPENDENT_STANDARD
STRIPE_PRICE_BEA_B2_CONFIDENT_LAUNCH
STRIPE_PRICE_BEA_B2_CONFIDENT_STANDARD
STRIPE_PRICE_BEA_C1_ADVANCED_LAUNCH
STRIPE_PRICE_BEA_C1_ADVANCED_STANDARD
STRIPE_PRICE_BEA_C2_MASTERY_LAUNCH
STRIPE_PRICE_BEA_C2_MASTERY_STANDARD
```

### Bundles

```text
STRIPE_PRICE_BUNDLE_A1_B1_LAUNCH
STRIPE_PRICE_BUNDLE_A1_B1_STANDARD
STRIPE_PRICE_BUNDLE_B2_C2_LAUNCH
STRIPE_PRICE_BUNDLE_B2_C2_STANDARD
STRIPE_PRICE_BUNDLE_A1_C2_LAUNCH
STRIPE_PRICE_BUNDLE_A1_C2_STANDARD
```

### Subscriptions

```text
STRIPE_PRICE_SUB_MONTHLY_SELF_STUDY
STRIPE_PRICE_SUB_ANNUAL_SELF_STUDY
STRIPE_PRICE_SUB_PREMIUM_FEEDBACK
```

### Institutions

```text
STRIPE_PRICE_INST_STARTER_25
STRIPE_PRICE_INST_GROWTH_100
STRIPE_PRICE_INST_PRO_300
```

## Webhook actions

Handle:

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `charge.refunded`

## Unlock mapping

| Product type | Unlock action |
|---|---|
| level_test | unlock Level Test attempt |
| single_course | create course enrolment |
| course_bundle | create enrolments for all bundle courses |
| subscription | unlock all self-study access while active |
| institution_licence | create/update institution licence and learner allocation |
