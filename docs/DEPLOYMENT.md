# Live Deployment Guide

## DigitalOcean App Platform

1. Push the repository to GitHub.
2. Edit `.do/app.yaml` and replace `YOUR_GITHUB_ORG/british-english-academy-esl-platform` and `https://YOUR-LIVE-DOMAIN`.
3. Create the DigitalOcean app from the spec.
4. Add production secrets in the DigitalOcean dashboard.
5. Run database migration and item-bank seed from a secure machine:

```bash
DATABASE_URL="postgresql://..." npm run seed
```

6. Configure Stripe webhook URL:

```text
https://YOUR-LIVE-DOMAIN/api/webhooks/stripe
```

7. In Stripe, subscribe to `checkout.session.completed`.
8. Run a live health check:

```bash
curl https://YOUR-LIVE-DOMAIN/api/health
```

## Environment variables

- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`
- `CERTIFICATE_SIGNING_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PLACEMENT_PRICE_ID`
- `ALLOW_DEMO_ACCESS=false`

## Production hardening checklist

- Enable WAF or platform rate limiting.
- Add CAPTCHA or abuse prevention before checkout.
- Add privacy policy, terms and assessment-certificate disclaimer.
- Add data-retention policy for candidates and responses.
- Add item exposure controls and item refresh workflow.
- Add monitoring for failed webhooks and database latency.
- Run item-quality review before marketing the test as institution-ready.
