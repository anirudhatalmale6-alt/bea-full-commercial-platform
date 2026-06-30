-- British English Academy Early Years Interactive Engine v1.2
-- PostgreSQL logical data model for live implementation.

CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  default_locale TEXT NOT NULL DEFAULT 'en-GB',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE schools (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  role TEXT NOT NULL CHECK (role IN ('admin','teacher','parent','learner')),
  display_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE classes (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id),
  teacher_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  grade_band TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES classes(id),
  teacher_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('intervention','extension','practice','assessment')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE learners (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id),
  class_id TEXT REFERENCES classes(id),
  parent_user_id TEXT REFERENCES users(id),
  grade_band TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE strands (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL CHECK (subject IN ('Literacy','Maths','Wellbeing','Learning Habits','Digital Citizenship')),
  name TEXT NOT NULL
);

CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  strand_id TEXT NOT NULL REFERENCES strands(id),
  skill_code TEXT UNIQUE NOT NULL,
  grade_band TEXT NOT NULL,
  name TEXT NOT NULL,
  prerequisite_skill_code TEXT
);

CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL REFERENCES skills(id),
  title TEXT NOT NULL,
  mechanic TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_band TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE activity_versions (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES activities(id),
  version TEXT NOT NULL,
  schema_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(activity_id, version)
);

CREATE TABLE items (
  id TEXT PRIMARY KEY,
  activity_version_id TEXT NOT NULL REFERENCES activity_versions(id),
  prompt_json JSONB NOT NULL,
  correct_answer_json JSONB NOT NULL,
  target_error_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5)
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id),
  activity_id TEXT NOT NULL REFERENCES activities(id),
  activity_version_id TEXT NOT NULL REFERENCES activity_versions(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  device TEXT NOT NULL CHECK (device IN ('web','tablet','mobile')),
  locale TEXT NOT NULL DEFAULT 'en-GB'
);

CREATE TABLE attempts (
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
  error_type TEXT CHECK (error_type IN ('phonological_awareness','letter_sound_correspondence','phonemic_blending','cvc_decoding','digraph_decoding','vowel_pattern_confusion','print_concept','sight_word_recognition','fluency_hesitation','listening_comprehension','vocabulary_meaning','sentence_order','number_sequence','one_to_one_counting','quantity_comparison','shape_recognition','operation_strategy','fine_motor_tracing','attention_task_completion')),
  hint_count INTEGER NOT NULL DEFAULT 0 CHECK (hint_count >= 0),
  audio_replay_count INTEGER NOT NULL DEFAULT 0 CHECK (audio_replay_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mastery_evidence (
  id BIGSERIAL PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id),
  skill_id TEXT NOT NULL REFERENCES skills(id),
  rolling_accuracy NUMERIC(4,3) NOT NULL CHECK (rolling_accuracy >= 0 AND rolling_accuracy <= 1),
  skill_session_count_meeting_mastery_threshold INTEGER NOT NULL DEFAULT 0,
  max_prompt_level_last_two_sessions INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL CHECK (status IN ('not_started','introduced','practising','needs_support','nearly_mastered','mastered','extension_ready')),
  last_mastery_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(learner_id, skill_id)
);

CREATE TABLE assignments (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('class','group','learner')),
  target_id TEXT NOT NULL,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('activity','strand','skill','intervention_path','extension_path')),
  payload_json JSONB NOT NULL,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rewards (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('star','badge','certificate','streak')),
  source_activity_id TEXT REFERENCES activities(id),
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dashboard_events (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  learner_id TEXT REFERENCES learners(id),
  actor_user_id TEXT REFERENCES users(id),
  event_type TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attempts_learner_session ON attempts(learner_id, session_id);
CREATE INDEX idx_attempts_error_type ON attempts(error_type);
CREATE INDEX idx_mastery_learner_status ON mastery_evidence(learner_id, status);
CREATE INDEX idx_assignments_target ON assignments(target_type, target_id);
CREATE INDEX idx_dashboard_events_tenant_created ON dashboard_events(tenant_id, created_at DESC);
