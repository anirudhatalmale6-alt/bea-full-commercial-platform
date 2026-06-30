-- BEA SCORM, LMS and CMS production schema v2.0
-- Apply after the base BEA v1.2 schema. Uses UUID primary keys and tenant isolation.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lea_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('learner','parent','teacher','content_editor','qa_reviewer','admin')),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE IF NOT EXISTS lms_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  course_key TEXT NOT NULL,
  title TEXT NOT NULL,
  cefr_level TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  sort_order INTEGER DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, course_key)
);

CREATE TABLE IF NOT EXISTS lms_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  grammar TEXT,
  vocabulary TEXT,
  communicative_function TEXT,
  assessment TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  sort_order INTEGER DEFAULT 0,
  completion_rules JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, module_code)
);

CREATE TABLE IF NOT EXISTS lms_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  module_id UUID REFERENCES lms_modules(id) ON DELETE CASCADE,
  lesson_key TEXT NOT NULL,
  title TEXT NOT NULL,
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('html','video','scorm','activity','assessment','download')),
  content_body JSONB NOT NULL DEFAULT '{}',
  required BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, lesson_key)
);

CREATE TABLE IF NOT EXISTS cms_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  content_key TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('page','course','module','lesson','resource','banner','navigation','legal')),
  locale TEXT NOT NULL DEFAULT 'en-GB',
  title TEXT NOT NULL,
  draft_body JSONB NOT NULL DEFAULT '{}',
  published_body JSONB,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','published','archived')),
  author_id UUID REFERENCES lea_users(id),
  reviewer_id UUID REFERENCES lea_users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, content_key, locale, version)
);

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  asset_key TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image','audio','video','caption','transcript','document','animation','thumbnail')),
  title TEXT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 's3',
  storage_path TEXT NOT NULL,
  cdn_url TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  alt_text TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, asset_key)
);

CREATE TABLE IF NOT EXISTS downloadable_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  course_id UUID REFERENCES lms_courses(id) ON DELETE SET NULL,
  module_id UUID REFERENCES lms_modules(id) ON DELETE SET NULL,
  resource_key TEXT NOT NULL,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  format TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'learner' CHECK (audience IN ('learner','teacher','parent','admin')),
  media_asset_id UUID REFERENCES media_assets(id),
  is_required BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, resource_key, format)
);

CREATE TABLE IF NOT EXISTS video_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  video_key TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'heygen',
  provider_video_id TEXT,
  title TEXT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  caption_url TEXT,
  transcript_url TEXT,
  duration_seconds INTEGER,
  completion_threshold_percent INTEGER NOT NULL DEFAULT 90,
  status TEXT NOT NULL DEFAULT 'draft',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, video_key)
);

CREATE TABLE IF NOT EXISTS scorm_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES lms_modules(id) ON DELETE CASCADE,
  package_key TEXT NOT NULL,
  scorm_version TEXT NOT NULL CHECK (scorm_version IN ('1.2','2004-4th')),
  title TEXT NOT NULL,
  mastery_score INTEGER NOT NULL DEFAULT 80,
  launch_path TEXT NOT NULL DEFAULT 'index.html',
  package_url TEXT,
  manifest_xml TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, package_key)
);

CREATE TABLE IF NOT EXISTS enrolments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  learner_id UUID REFERENCES lea_users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (tenant_id, learner_id, course_id)
);

CREATE TABLE IF NOT EXISTS progress_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  learner_id UUID REFERENCES lea_users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES lms_modules(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lms_lessons(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'lea-lms',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS completion_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  learner_id UUID REFERENCES lea_users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES lms_courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES lms_modules(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lms_lessons(id) ON DELETE SET NULL,
  completion_type TEXT NOT NULL CHECK (completion_type IN ('lesson','module','course','certificate')),
  status TEXT NOT NULL CHECK (status IN ('not_started','in_progress','completed','passed','failed')),
  score NUMERIC(5,2),
  evidence JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, learner_id, course_id, module_id, lesson_id, completion_type)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES lea_users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_value JSONB,
  after_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lms_courses_tenant_status ON lms_courses(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_lms_modules_course ON lms_modules(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lms_lessons(module_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_cms_status ON cms_content(tenant_id, content_type, status);
CREATE INDEX IF NOT EXISTS idx_progress_learner ON progress_events(tenant_id, learner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_completion_learner ON completion_records(tenant_id, learner_id, course_id);
