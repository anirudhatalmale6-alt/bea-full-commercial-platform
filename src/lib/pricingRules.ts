import { leaPricingCatalog } from "@/data/leaPricingCatalog";

export type PricingProductType =
  | "level_test"
  | "trial_lesson"
  | "single_course"
  | "course_bundle"
  | "subscription"
  | "institution_licence";

export type PricingAccessDecision = {
  allowed: boolean;
  reason:
    | "public_preview"
    | "paid_level_test"
    | "mapped_trial"
    | "paid_course"
    | "active_subscription"
    | "institution_licence"
    | "admin_override"
    | "payment_required"
    | "test_required"
    | "not_found";
  checkoutPath?: string;
};

export function getAllPricingItems() {
  return {
    products: leaPricingCatalog.products,
    courses: leaPricingCatalog.courses,
    bundles: leaPricingCatalog.bundles,
    subscriptions: leaPricingCatalog.subscriptions,
    institutionLicences: leaPricingCatalog.institution_licences,
    coupons: leaPricingCatalog.coupons,
    refundRules: leaPricingCatalog.refund_policy_rules,
  };
}

export function getCoursePricing(courseId: string) {
  return leaPricingCatalog.courses.find((course) => course.course_id === courseId);
}

export function getBundlePricing(bundleId: string) {
  return leaPricingCatalog.bundles.find((bundle) => bundle.bundle_id === bundleId);
}

export function getSubscriptionPricing(subscriptionId: string) {
  return leaPricingCatalog.subscriptions.find((sub) => sub.subscription_id === subscriptionId);
}

export function getInstitutionLicencePricing(licenceId: string) {
  return leaPricingCatalog.institution_licences.find((licence) => licence.licence_id === licenceId);
}

export function getCheckoutPriceEnv(productType: PricingProductType, id: string): string | null {
  if (productType === "level_test") {
    const product = leaPricingCatalog.products.find((item) => item.product_id === id);
    return product?.stripe_price_env ?? null;
  }
  if (productType === "single_course") {
    const course = getCoursePricing(id);
    return course?.stripe_price_env_launch ?? null;
  }
  if (productType === "course_bundle") {
    const bundle = getBundlePricing(id);
    return bundle?.stripe_price_env_launch ?? null;
  }
  if (productType === "subscription") {
    const sub = getSubscriptionPricing(id);
    return sub?.stripe_price_env ?? null;
  }
  if (productType === "institution_licence") {
    const licence = getInstitutionLicencePricing(id);
    return licence?.stripe_price_env ?? null;
  }
  return null;
}

export function resolveCheckoutAmountPence(productType: PricingProductType, id: string): number | null {
  if (productType === "level_test") {
    const product = leaPricingCatalog.products.find((item) => item.product_id === id);
    return product?.price_pence ?? null;
  }
  if (productType === "single_course") return getCoursePricing(id)?.launch_price_pence ?? null;
  if (productType === "course_bundle") return getBundlePricing(id)?.launch_price_pence ?? null;
  if (productType === "subscription") return getSubscriptionPricing(id)?.price_pence ?? null;
  if (productType === "institution_licence") return getInstitutionLicencePricing(id)?.price_pence ?? null;
  return null;
}

export function validateCoupon(code: string, productType: PricingProductType) {
  const coupon = leaPricingCatalog.coupons.find((item) => item.code.toLowerCase() === code.toLowerCase() && item.active);
  if (!coupon) return { valid: false, discountPercent: 0 };
  if (!coupon.applies_to.includes(productType as never)) return { valid: false, discountPercent: 0 };
  return { valid: true, discountPercent: coupon.discount_percent ?? 0, coupon };
}

export function decideCoursePricingAccess(input: {
  isPublicPreview?: boolean;
  hasPaidLevelTest?: boolean;
  hasCompletedLevelTest?: boolean;
  hasMappedPathway?: boolean;
  hasUnlockedTrial?: boolean;
  hasPaidCourse?: boolean;
  hasActiveSubscription?: boolean;
  hasInstitutionLicence?: boolean;
  isAdmin?: boolean;
}): PricingAccessDecision {
  if (input.isPublicPreview) return { allowed: true, reason: "public_preview" };
  if (input.isAdmin) return { allowed: true, reason: "admin_override" };
  if (input.hasPaidCourse) return { allowed: true, reason: "paid_course" };
  if (input.hasActiveSubscription) return { allowed: true, reason: "active_subscription" };
  if (input.hasInstitutionLicence) return { allowed: true, reason: "institution_licence" };
  if (!input.hasPaidLevelTest || !input.hasCompletedLevelTest || !input.hasMappedPathway) {
    return { allowed: false, reason: "test_required", checkoutPath: "/checkout/placement?source=course-lock" };
  }
  if (input.hasUnlockedTrial) {
    return { allowed: false, reason: "payment_required", checkoutPath: "/checkout/course" };
  }
  return { allowed: false, reason: "payment_required", checkoutPath: "/appetiser/unlock" };
}
