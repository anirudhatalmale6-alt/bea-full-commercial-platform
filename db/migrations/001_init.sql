CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS esl_item_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cefr_level VARCHAR(2) NOT NULL CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  skill TEXT NOT NULL,
  difficulty NUMERIC(5,3) NOT NULL,
  discrimination NUMERIC(5,3) NOT NULL,
  guessing NUMERIC(5,3) NOT NULL,
  question_data JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  stripe_session_id TEXT UNIQUE,
  paid_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT','IN_PROGRESS','COMPLETE','VOID')),
  theta NUMERIC(6,3) NOT NULL DEFAULT 0,
  standard_error NUMERIC(6,3) NOT NULL DEFAULT 99,
  cefr_level VARCHAR(2) NOT NULL DEFAULT 'B1',
  report_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_session_id UUID NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES esl_item_bank(id),
  choice_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(test_session_id, item_id)
);

CREATE TABLE IF NOT EXISTS issued_certificates (
  id VARCHAR(50) PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  test_session_id UUID UNIQUE NOT NULL REFERENCES test_sessions(id),
  cefr_level VARCHAR(2) NOT NULL,
  verification_sha VARCHAR(64) NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_item_bank_difficulty ON esl_item_bank(difficulty) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_responses_session ON responses(test_session_id, answered_at);
CREATE INDEX IF NOT EXISTS idx_certificate_session ON issued_certificates(test_session_id);


CREATE TABLE IF NOT EXISTS course_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  cefr_level VARCHAR(2) NOT NULL CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  title TEXT NOT NULL,
  level_label TEXT NOT NULL,
  summary TEXT NOT NULL,
  duration TEXT NOT NULL,
  lessons INTEGER NOT NULL,
  activities INTEGER NOT NULL,
  course_data JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cefr_level VARCHAR(2) NOT NULL CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  module INTEGER NOT NULL,
  skill TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  activity_data JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_catalog_cefr ON course_catalog(cefr_level) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_activity_library_filters ON activity_library(cefr_level, skill, activity_type) WHERE active = TRUE;


CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_key TEXT UNIQUE NOT NULL,
  cefr_level VARCHAR(2) NOT NULL CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  lesson_data JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS downloadable_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_key TEXT UNIQUE NOT NULL,
  cefr_level TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  title TEXT NOT NULL,
  href TEXT NOT NULL,
  asset_data JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  course_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','COMPLETED','PAUSED','CANCELLED')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(candidate_id, course_slug)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
  score NUMERIC(5,2),
  teacher_feedback TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(enrollment_id, lesson_key)
);

CREATE TABLE IF NOT EXISTS activity_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidates(id),
  activity_id TEXT NOT NULL,
  score NUMERIC(5,2),
  attempts INTEGER NOT NULL DEFAULT 1,
  evidence_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_lessons_filters ON course_lessons(cefr_level, module_id) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_downloadable_assets_filters ON downloadable_assets(cefr_level, asset_type) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_enrollments_candidate ON enrollments(candidate_id, status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment ON lesson_progress(enrollment_id, status);
