import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "data/lea_pricing_catalog.json",
  "data/lea_pricing_catalog.csv",
  "src/data/leaPricingCatalog.ts",
  "src/lib/pricingRules.ts",
  "src/lib/stripePricingMap.ts",
  "src/app/api/pricing/route.ts",
  "src/app/api/commerce/checkout/route.ts",
  "src/app/api/admin/pricing/route.ts",
  "src/app/pricing/page.tsx",
  "src/components/pricing/PricingCards.tsx",
  "database/migrations/006_pricing_commerce_structure.sql",
  "database/seeds/seed_lea_pricing.sql",
  ".env.pricing.example",
  "docs/PRICING_STRATEGY.md",
  "docs/STRIPE_SETUP_GUIDE.md",
  "docs/ACCESS_AND_REFUND_RULES.md",
  "docs/ADMIN_PRICING_DASHBOARD_SPEC.md",
  "docs/DEVELOPER_DEPLOYMENT_CHECKLIST.md"
];

const failures = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required file: ${file}`);
}

const catalogPath = path.join(root, "data/lea_pricing_catalog.json");
if (fs.existsSync(catalogPath)) {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  if (catalog.currency !== "GBP") failures.push("Pricing currency must be GBP");
  if (!catalog.products.find((p) => p.product_id === "lea_level_test" && p.price_pence === 999)) failures.push("Level Test price missing or incorrect");
  if (catalog.courses.length !== 6) failures.push(`Expected 6 single course prices, found ${catalog.courses.length}`);
  if (catalog.bundles.length < 3) failures.push("Expected at least 3 bundles");
  if (catalog.subscriptions.length < 3) failures.push("Expected at least 3 subscription plans");
  if (catalog.institution_licences.length < 4) failures.push("Expected at least 4 institution licence plans");

  for (const course of catalog.courses) {
    if (course.launch_price_pence !== 2700) failures.push(`Course ${course.course_id} launch price must be £27`);
    if (!course.requires_level_test_first) failures.push(`Course ${course.course_id} must require Level Test first`);
    if (!course.stripe_price_env_launch || !course.stripe_price_env_standard) failures.push(`Course ${course.course_id} missing Stripe env mapping`);
  }

  for (const sub of catalog.subscriptions) {
    if (!sub.stripe_price_env) failures.push(`Subscription ${sub.subscription_id} missing Stripe env mapping`);
  }
}

const combined = requiredFiles
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

for (const marker of [
  "Paid Level Test",
  "Short Trial Lesson",
  "Start Full Course After Payment",
  "institution_licence",
  "refund_policy_rules",
  "STRIPE_PRICE_BEA_LEVEL_TEST",
  "LEAFOUNDERS30",
  "unlock_course_after_payment_or_active_subscription_or_institution_licence"
]) {
  if (!combined.includes(marker)) failures.push(`Missing required marker: ${marker}`);
}

for (const forbidden of ["Official CEFR certificate", "Cambridge certificate", "Guaranteed level"]) {
  if (combined.includes(forbidden)) failures.push(`Forbidden pricing/certificate claim found: ${forbidden}`);
}

const result = {
  ok: failures.length === 0,
  checkedAt: new Date().toISOString(),
  requiredFiles: requiredFiles.length,
  failures
};

fs.mkdirSync(path.join(root, "audit"), { recursive: true });
fs.writeFileSync(path.join(root, "audit/audit-results.json"), JSON.stringify(result, null, 2));
fs.writeFileSync(path.join(root, "audit/AUDIT_REPORT.md"), [
  "# BEA Pricing Pack Static Audit",
  "",
  `Checked at: ${result.checkedAt}`,
  "",
  `Status: ${result.ok ? "PASS" : "FAIL"}`,
  "",
  "## Files checked",
  ...requiredFiles.map((file) => `- ${file}`),
  "",
  "## Failures",
  ...(failures.length ? failures.map((item) => `- ${item}`) : ["None"]),
  "",
  "## Production note",
  "This static audit checks pricing files, price values, Stripe environment mappings and commercial access markers. The developer must still run the final application build and live/test Stripe checkouts inside the full BEA repository."
].join("\n"));

if (!result.ok) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(result, null, 2));
