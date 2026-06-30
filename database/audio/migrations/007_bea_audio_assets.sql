CREATE TABLE IF NOT EXISTS bea_audio_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_code TEXT NOT NULL UNIQUE,
  legacy_lesson_id TEXT,
  bea_lesson_id TEXT,
  cefr_level TEXT NOT NULL,
  module_number INTEGER,
  lesson_number INTEGER,
  asset_type TEXT NOT NULL,
  title TEXT NOT NULL,
  skill TEXT,
  ssml_file TEXT NOT NULL,
  transcript_file TEXT,
  caption_file TEXT,
  polly_voice_id TEXT NOT NULL,
  polly_engine TEXT NOT NULL DEFAULT 'neural',
  fallback_voice_id TEXT,
  fallback_engine TEXT DEFAULT 'standard',
  language_code TEXT NOT NULL DEFAULT 'en-GB',
  output_format TEXT NOT NULL DEFAULT 'mp3',
  s3_key TEXT NOT NULL,
  media_asset_id UUID,
  qa_status TEXT NOT NULL DEFAULT 'generated_pending_audio_qa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bea_audio_assets_level ON bea_audio_assets(cefr_level, asset_type);
CREATE INDEX IF NOT EXISTS idx_bea_audio_assets_lesson ON bea_audio_assets(bea_lesson_id);
