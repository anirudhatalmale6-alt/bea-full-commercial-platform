# Admin Pricing Dashboard Specification

Route: `/admin/pricing`

## Admin must be able to manage

- Level Test price display
- Single course launch/standard prices
- Bundle prices
- Subscription plans
- Institution licence prices
- Active/inactive plan visibility
- Coupon codes
- Refund policy text
- Stripe price ID mapping
- Pricing page copy
- Audit log for every change

## Required warning in admin

Stripe prices are immutable. To change a real Stripe amount, create a new Stripe Price ID, update the platform mapping, and keep historical payments unchanged.

## Required admin fields

| Field | Editable |
|---|---|
| public name | yes |
| display description | yes |
| launch price | yes, with new Stripe price |
| standard price | yes, with new Stripe price |
| active status | yes |
| recommended flag | yes |
| Stripe price env/key | platform admin only |
| refund condition | platform admin only |
