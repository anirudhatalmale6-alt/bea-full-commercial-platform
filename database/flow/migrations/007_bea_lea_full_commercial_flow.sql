CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS bea_users_shadow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  display_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('learner','parent','teacher','institution_admin','platform_admin','finance_admin','content_admin')),
  auth_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bea_courses (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  title TEXT NOT NULL,
  description TEXT,
  launch_price_pence INTEGER NOT NULL DEFAULT 2700,
  standard_price_pence INTEGER NOT NULL DEFAULT 4900,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bea_course_modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES bea_courses(id) ON DELETE CASCADE,
  module_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  UNIQUE(course_id, module_number)
);

CREATE TABLE IF NOT EXISTS bea_lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES bea_courses(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES bea_course_modules(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  lesson_type TEXT NOT NULL DEFAULT 'standard',
  content_json JSONB NOT NULL DEFAULT '{}',
  is_trial BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(module_id, lesson_number)
);

CREATE TABLE IF NOT EXISTS bea_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('level_test','single_course','bundle','subscription','institution_licence')),
  product_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled','refunded')),
  amount_pence INTEGER,
  currency TEXT NOT NULL DEFAULT 'gbp',
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS bea_level_test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_user_id UUID NOT NULL,
  payment_id UUID REFERENCES bea_payments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked','unlocked','in_progress','completed')),
  raw_score INTEGER DEFAULT 0,
  mapped_cefr_level TEXT CHECK (mapped_cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  recommended_course_id TEXT REFERENCES bea_courses(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bea_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_user_id UUID NOT NULL,
  level_test_session_id UUID REFERENCES bea_level_test_sessions(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('diagnostic','progress','final')),
  title TEXT NOT NULL,
  report_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bea_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_user_id UUID NOT NULL,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('diagnostic','course_completion')),
  title TEXT NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  related_course_id TEXT REFERENCES bea_courses(id) ON DELETE SET NULL,
  level_test_session_id UUID REFERENCES bea_level_test_sessions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued','revoked')),
  verification_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bea_appetiser_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_user_id UUID NOT NULL,
  course_id TEXT NOT NULL REFERENCES bea_courses(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES bea_lessons(id) ON DELETE CASCADE,
  level_test_session_id UUID REFERENCES bea_level_test_sessions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'unlocked' CHECK (status IN ('unlocked','completed','revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(learner_user_id, course_id)
);

CREATE TABLE IF NOT EXISTS bea_enrolments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_user_id UUID NOT NULL,
  course_id TEXT NOT NULL REFERENCES bea_courses(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('single_course_payment','bundle_payment','subscription','institution_licence','admin_manual')),
  payment_id UUID REFERENCES bea_payments(id) ON DELETE SET NULL,
  institution_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','revoked','completed')),
  access_starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  access_expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(learner_user_id, course_id, source)
);

CREATE TABLE IF NOT EXISTS bea_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_user_id UUID NOT NULL,
  course_id TEXT NOT NULL REFERENCES bea_courses(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES bea_course_modules(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES bea_lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  score INTEGER,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(learner_user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS bea_activity_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_user_id UUID NOT NULL,
  lesson_id TEXT NOT NULL REFERENCES bea_lessons(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL,
  score INTEGER,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','passed','failed','review_required')),
  answer_json JSONB NOT NULL DEFAULT '{}',
  feedback_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bea_parent_child_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL,
  learner_user_id UUID NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'parent_guardian',
  consent_status TEXT NOT NULL DEFAULT 'pending' CHECK (consent_status IN ('pending','verified','revoked')),
  invite_status TEXT NOT NULL DEFAULT 'sent' CHECK (invite_status IN ('sent','accepted','expired','revoked')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parent_user_id, learner_user_id)
);

CREATE TABLE IF NOT EXISTS bea_institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  licence_plan TEXT NOT NULL DEFAULT 'starter',
  licence_status TEXT NOT NULL DEFAULT 'active' CHECK (licence_status IN ('pending','active','expired','cancelled')),
  learner_limit INTEGER,
  teacher_limit INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bea_institution_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES bea_institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('institution_admin','teacher','learner')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(institution_id, user_id, role)
);

CREATE TABLE IF NOT EXISTS bea_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES bea_institutions(id) ON DELETE CASCADE,
  teacher_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  cefr_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bea_class_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES bea_classes(id) ON DELETE CASCADE,
  learner_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, learner_user_id)
);

CREATE TABLE IF NOT EXISTS bea_teacher_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id UUID NOT NULL,
  learner_user_id UUID NOT NULL,
  course_id TEXT REFERENCES bea_courses(id) ON DELETE SET NULL,
  lesson_id TEXT REFERENCES bea_lessons(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL DEFAULT 'general',
  visible_to_parent BOOLEAN NOT NULL DEFAULT TRUE,
  feedback_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bea_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bea_payments_user_status ON bea_payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bea_level_test_learner ON bea_level_test_sessions(learner_user_id, status);
CREATE INDEX IF NOT EXISTS idx_bea_enrolments_learner_course ON bea_enrolments(learner_user_id, course_id, status);
CREATE INDEX IF NOT EXISTS idx_bea_lesson_progress_learner ON bea_lesson_progress(learner_user_id, course_id, status);
CREATE INDEX IF NOT EXISTS idx_bea_parent_child_parent ON bea_parent_child_links(parent_user_id, consent_status);
