'use strict';
require('dotenv').config();
const { Pool } = require('pg');
const logger = require('../lib/logger');

function getDatabaseSslConfig() {
  return process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : false;
}

const SCHEMA = `
-- British English Academy v1.2 — PostgreSQL schema
-- Run: node src/db/migrate.js

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  default_locale TEXT NOT NULL DEFAULT 'en-GB',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin','teacher','parent','learner')),
  display_name TEXT NOT NULL,
  email TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  grade_band TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('intervention','extension','practice','assessment')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learners (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  class_id TEXT REFERENCES classes(id),
  parent_user_id TEXT REFERENCES users(id),
  grade_band TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS strands (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL CHECK (subject IN ('Literacy','Maths','Wellbeing','Learning Habits','Digital Citizenship')),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  strand_id TEXT NOT NULL REFERENCES strands(id),
  skill_code TEXT UNIQUE NOT NULL,
  grade_band TEXT NOT NULL,
  name TEXT NOT NULL,
  prerequisite_skill_code TEXT
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL REFERENCES skills(id),
  title TEXT NOT NULL,
  mechanic TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_band TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS activity_versions (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES activities(id),
  version TEXT NOT NULL,
  schema_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(activity_id, version)
);

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  activity_version_id TEXT NOT NULL REFERENCES activity_versions(id),
  prompt_json JSONB NOT NULL,
  correct_answer_json JSONB NOT NULL,
  target_error_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id),
  activity_id TEXT NOT NULL REFERENCES activities(id),
  activity_version_id TEXT NOT NULL REFERENCES activity_versions(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  device TEXT NOT NULL CHECK (device IN ('web','tablet','mobile')),
  locale TEXT NOT NULL DEFAULT 'en-GB',
  item_seed TEXT
);

CREATE TABLE IF NOT EXISTS attempts (
  id BIGSERIAL PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id),
  session_id TEXT NOT NULL REFERENCES sessions(id),
  activity_id TEXT NOT NULL REFERENCES activities(id),
  item_id TEXT NOT NULL REFERENCES items(id),
  accuracy NUMERIC(4,3) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1),
  prompt_level INTEGER NOT NULL CHECK (prompt_level BETWEEN 0 AND 4),
  response_time_seconds NUMERIC(8,3) NOT NULL CHECK (response_time_seconds >= 0),
  baseline_average_response_time_seconds NUMERIC(8,3) NOT NULL CHECK (baseline_average_response_time_seconds >= 0),
  attempt_count INTEGER NOT NULL CHECK (attempt_count >= 1),
  consecutive_same_error_count INTEGER NOT NULL CHECK (consecutive_same_error_count >= 0),
  error_type TEXT CHECK (error_type IN (
    'phonological_awareness','letter_sound_correspondence','phonemic_blending',
    'cvc_decoding','digraph_decoding','vowel_pattern_confusion','print_concept',
    'sight_word_recognition','fluency_hesitation','listening_comprehension',
    'vocabulary_meaning','sentence_order','number_sequence','one_to_one_counting',
    'quantity_comparison','shape_recognition','operation_strategy',
    'fine_motor_tracing','attention_task_completion'
  )),
  hint_count INTEGER NOT NULL DEFAULT 0 CHECK (hint_count >= 0),
  audio_replay_count INTEGER NOT NULL DEFAULT 0 CHECK (audio_replay_count >= 0),
  teacher_override BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mastery_evidence (
  id BIGSERIAL PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id),
  skill_id TEXT NOT NULL REFERENCES skills(id),
  rolling_accuracy NUMERIC(4,3) NOT NULL CHECK (rolling_accuracy >= 0 AND rolling_accuracy <= 1),
  skill_session_count_meeting_mastery_threshold INTEGER NOT NULL DEFAULT 0,
  max_prompt_level_last_two_sessions INTEGER NOT NULL DEFAULT 4,
  needs_support_session_count_rolling INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN (
    'not_started','introduced','practising','needs_support',
    'nearly_mastered','mastered','extension_ready'
  )),
  last_mastery_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(learner_id, skill_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('class','group','learner')),
  target_id TEXT NOT NULL,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN (
    'activity','strand','skill','intervention_path','extension_path'
  )),
  payload_json JSONB NOT NULL,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('star','badge','certificate','streak')),
  source_activity_id TEXT REFERENCES activities(id),
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dashboard_events (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  learner_id TEXT REFERENCES learners(id),
  actor_user_id TEXT REFERENCES users(id),
  event_type TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- CEFR A1–C2 Course System (from BEA_Full_Comprehensive_Curriculum_Depth_Pack)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS cefr_courses (
  id TEXT PRIMARY KEY,
  cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  course_name TEXT NOT NULL,
  learner_profile TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cefr_modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES cefr_courses(id) ON DELETE CASCADE,
  module_code TEXT UNIQUE NOT NULL,
  module_title TEXT NOT NULL,
  theme_summary TEXT,
  grammar TEXT,
  vocabulary TEXT,
  function_focus TEXT,
  lesson_path TEXT,
  assessment TEXT,
  adaptive_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  module_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cefr_module_resources (
  id TEXT PRIMARY KEY,
  module_code TEXT NOT NULL REFERENCES cefr_modules(module_code) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  title TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'DOCX/PDF/HTML',
  editable BOOLEAN NOT NULL DEFAULT true,
  adaptive_use TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CEFR enrolment & progress
CREATE TABLE IF NOT EXISTS cefr_enrolments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES cefr_courses(id),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS cefr_module_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL REFERENCES cefr_modules(module_code),
  quiz_score INTEGER CHECK (quiz_score BETWEEN 0 AND 100),
  speaking_rubric_score INTEGER CHECK (speaking_rubric_score BETWEEN 0 AND 100),
  writing_rubric_score INTEGER CHECK (writing_rubric_score BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started','intensive_support','guided_practice','targeted_review','mastered','extension'
  )),
  recommended_action TEXT,
  rule_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_code)
);

-- Early-years 36-week scope & sequence
CREATE TABLE IF NOT EXISTS scope_sequence (
  id BIGSERIAL PRIMARY KEY,
  grade_band TEXT NOT NULL,
  week INTEGER NOT NULL,
  unit TEXT NOT NULL,
  skill_focus TEXT,
  core_routine TEXT,
  downloadable TEXT,
  assessment TEXT,
  UNIQUE(grade_band, week, unit)
);

-- Early-years structured literacy resources
CREATE TABLE IF NOT EXISTS ey_resources (
  id TEXT PRIMARY KEY,
  grade_band TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  title TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'DOCX/PDF/HTML',
  editable BOOLEAN NOT NULL DEFAULT true,
  adaptive_use TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attempts_learner_session ON attempts(learner_id, session_id);
CREATE INDEX IF NOT EXISTS idx_attempts_error_type ON attempts(error_type);
CREATE INDEX IF NOT EXISTS idx_mastery_learner_status ON mastery_evidence(learner_id, status);
CREATE INDEX IF NOT EXISTS idx_assignments_target ON assignments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_events_tenant_created ON dashboard_events(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_learner ON sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_learners_class ON learners(class_id);
CREATE INDEX IF NOT EXISTS idx_cefr_modules_course ON cefr_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_cefr_resources_module ON cefr_module_resources(module_code);
CREATE INDEX IF NOT EXISTS idx_cefr_progress_user ON cefr_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_scope_grade ON scope_sequence(grade_band, week);
`;

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: getDatabaseSslConfig() });
  try {
    logger.info('Running migrations…');
    await pool.query(SCHEMA);
    logger.info('Migration complete.');
  } catch (err) {
    logger.error('Migration failed', { error: err.message });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
