CREATE TABLE IF NOT EXISTS site_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS adoption_applications (
  id TEXT PRIMARY KEY,
  animal_slug TEXT NOT NULL,
  animal_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'EM_ANALISE',
  applicant JSONB NOT NULL,
  internal_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS adoption_applications_status_idx
ON adoption_applications(status, created_at DESC);

CREATE TABLE IF NOT EXISTS site_feedback (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_conversations (
  id TEXT PRIMARY KEY,
  site TEXT NOT NULL DEFAULT 'Onda Animal',
  channel TEXT NOT NULL DEFAULT 'SITE_ONDA',
  status TEXT NOT NULL DEFAULT 'ABERTA',
  topic TEXT NOT NULL DEFAULT 'Outro assunto',
  page TEXT NOT NULL DEFAULT '/',
  visitor JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  read_by_client BOOLEAN NOT NULL DEFAULT FALSE,
  read_by_support BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_messages_conversation_idx
ON chat_messages(conversation_id, created_at ASC);


CREATE TABLE IF NOT EXISTS animal_profile_views (
  animal_slug TEXT PRIMARY KEY,
  total_views BIGINT NOT NULL DEFAULT 0,
  first_viewed_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS animal_profile_view_events (
  event_key TEXT PRIMARY KEY,
  animal_slug TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS animal_profile_view_events_slug_idx
ON animal_profile_view_events(animal_slug, viewed_at DESC);
