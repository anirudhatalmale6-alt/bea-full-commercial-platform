-- BEA Migration 006: Course pricing, bundles, subscriptions and institution licence pricing

CREATE TABLE IF NOT EXISTS pricing_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_code TEXT NOT NULL UNIQUE,
  product_type TEXT NOT NULL,
  name TEXT NOT NULL,
  public_name TEXT,
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'gbp',
  price_pence INTEGER,
  billing_interval TEXT NOT NULL DEFAULT 'one_time',
  access_rule TEXT NOT NULL,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  stripe_price_env TEXT,
  is_recommended BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code TEXT NOT NULL UNIQUE,
  course_slug TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  title TEXT NOT NULL,
  launch_price_pence INTEGER NOT NULL,
  standard_price_pence INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'gbp',
  access_days INTEGER NOT NULL DEFAULT 180,
  requires_level_test_first BOOLEAN NOT NULL DEFAULT true,
  stripe_product_id TEXT,
  stripe_launch_price_id TEXT,
  stripe_standard_price_id TEXT,
  stripe_launch_price_env TEXT,
  stripe_standard_price_env TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  course_codes TEXT[] NOT NULL,
  launch_price_pence INTEGER NOT NULL,
  standard_price_pence INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'gbp',
  access_days INTEGER NOT NULL DEFAULT 365,
  stripe_launch_price_id TEXT,
  stripe_standard_price_id TEXT,
  stripe_launch_price_env TEXT,
  stripe_standard_price_env TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_pence INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'gbp',
  billing_interval TEXT NOT NULL,
  trial_days INTEGER NOT NULL DEFAULT 0,
  teacher_feedback_credits INTEGER NOT NULL DEFAULT 0,
  access_rule TEXT NOT NULL,
  stripe_price_id TEXT,
  stripe_price_env TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS institution_licence_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  learner_limit INTEGER,
  teacher_limit INTEGER,
  price_pence INTEGER,
  currency TEXT NOT NULL DEFAULT 'gbp',
  billing_interval TEXT NOT NULL,
  extra_learner_price_pence INTEGER,
  stripe_price_id TEXT,
  stripe_price_env TEXT,
  requires_sales_contact BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER,
  discount_amount_pence INTEGER,
  applies_to TEXT[] NOT NULL DEFAULT '{}',
  max_redemptions INTEGER,
  redeemed_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refund_policy_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_type TEXT NOT NULL UNIQUE,
  refund_window_days INTEGER NOT NULL,
  condition_text TEXT NOT NULL,
  auto_revoke_access TEXT NOT NULL DEFAULT 'true',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_products_type ON pricing_products(product_type, active);
CREATE INDEX IF NOT EXISTS idx_course_pricing_level ON course_pricing(cefr_level, active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(active);
CREATE INDEX IF NOT EXISTS idx_institution_licence_plans_active ON institution_licence_plans(active);
