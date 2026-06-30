-- BEA Migration 005: commercial content import support

CREATE TABLE IF NOT EXISTS content_import_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_name TEXT NOT NULL,
  source_file TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  imported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_log JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lesson_qa_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  external_lesson_code TEXT,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  qa_status TEXT NOT NULL DEFAULT 'pending',
  cefr_validation_status TEXT NOT NULL DEFAULT 'mapped_pending_editorial_review',
  checklist JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS final_level_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_code TEXT NOT NULL UNIQUE,
  cefr_level TEXT NOT NULL,
  title TEXT NOT NULL,
  assessment_data JSONB NOT NULL,
  pass_score INTEGER NOT NULL DEFAULT 70,
  distinction_score INTEGER NOT NULL DEFAULT 85,
  status content_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
