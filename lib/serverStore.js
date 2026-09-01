import "server-only";
import { db } from "./db";

let schemaPromise;

export async function ensureDatabase() {
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    const sql = db();

    await sql`
      CREATE TABLE IF NOT EXISTS site_store (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS adoption_applications (
        id TEXT PRIMARY KEY,
        animal_slug TEXT NOT NULL,
        animal_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'EM_ANALISE',
        applicant JSONB NOT NULL,
        internal_notes TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS adoption_applications_status_idx
      ON adoption_applications(status, created_at DESC)
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS site_feedback (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
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
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
        sender TEXT NOT NULL,
        text TEXT NOT NULL,
        read_by_client BOOLEAN NOT NULL DEFAULT FALSE,
        read_by_support BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS chat_messages_conversation_idx
      ON chat_messages(conversation_id, created_at ASC)
    `;
  })();

  try {
    await schemaPromise;
  } catch (error) {
    schemaPromise = null;
    throw error;
  }
}

export async function getSiteData(key, fallback) {
  await ensureDatabase();
  const sql = db();
  const rows = await sql`SELECT value FROM site_store WHERE key = ${key} LIMIT 1`;
  if (rows.length) return rows[0].value;

  if (fallback !== undefined) {
    await sql`
      INSERT INTO site_store (key, value)
      VALUES (${key}, ${JSON.stringify(fallback)}::jsonb)
      ON CONFLICT (key) DO NOTHING
    `;
    return fallback;
  }

  return null;
}

export async function setSiteData(key, value) {
  await ensureDatabase();
  const sql = db();
  await sql`
    INSERT INTO site_store (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW()
  `;
  return value;
}

export async function createApplication(application) {
  await ensureDatabase();
  const sql = db();
  await sql`
    INSERT INTO adoption_applications (
      id, animal_slug, animal_name, status, applicant, created_at, updated_at
    )
    VALUES (
      ${application.id},
      ${application.animalSlug},
      ${application.animalName},
      ${application.status || "EM_ANALISE"},
      ${JSON.stringify(application.applicant || {})}::jsonb,
      ${application.createdAt || new Date().toISOString()},
      NOW()
    )
    ON CONFLICT (id) DO NOTHING
  `;
  return application;
}

export async function listApplications() {
  await ensureDatabase();
  const sql = db();
  const rows = await sql`
    SELECT id, animal_slug, animal_name, status, applicant, internal_notes, created_at, updated_at
    FROM adoption_applications
    ORDER BY created_at DESC
  `;
  return rows.map((row) => ({
    id: row.id,
    animalSlug: row.animal_slug,
    animalName: row.animal_name,
    status: row.status,
    applicant: row.applicant,
    internalNotes: row.internal_notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function updateApplication(id, patch = {}) {
  await ensureDatabase();
  const sql = db();
  const current = await sql`
    SELECT status, internal_notes
    FROM adoption_applications
    WHERE id = ${id}
    LIMIT 1
  `;
  if (!current.length) return null;

  const status = patch.status ?? current[0].status;
  const internalNotes = patch.internalNotes ?? current[0].internal_notes ?? "";

  const rows = await sql`
    UPDATE adoption_applications
    SET status = ${status},
        internal_notes = ${internalNotes},
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, animal_slug, animal_name, status, applicant, internal_notes, created_at, updated_at
  `;
  const row = rows[0];
  return {
    id: row.id,
    animalSlug: row.animal_slug,
    animalName: row.animal_name,
    status: row.status,
    applicant: row.applicant,
    internalNotes: row.internal_notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createFeedback(data) {
  await ensureDatabase();
  const sql = db();
  const id = data.id || `feedback_${crypto.randomUUID()}`;
  const createdAt = data.createdAt || new Date().toISOString();
  await sql`
    INSERT INTO site_feedback (id, data, created_at)
    VALUES (${id}, ${JSON.stringify({ ...data, id, createdAt })}::jsonb, ${createdAt})
    ON CONFLICT (id) DO NOTHING
  `;
  return { ...data, id, createdAt };
}

export async function listFeedback() {
  await ensureDatabase();
  const sql = db();
  const rows = await sql`
    SELECT id, data, created_at
    FROM site_feedback
    ORDER BY created_at DESC
  `;
  return rows.map((row) => ({
    ...row.data,
    id: row.id,
    createdAt: row.data?.createdAt || row.created_at,
  }));
}

export async function createConversation(payload) {
  await ensureDatabase();
  const sql = db();
  const now = payload.createdAt || new Date().toISOString();

  await sql`
    INSERT INTO chat_conversations (
      id, site, channel, status, topic, page, visitor, created_at, updated_at
    )
    VALUES (
      ${payload.id},
      ${payload.site || "Onda Animal"},
      ${payload.channel || "SITE_ONDA"},
      ${payload.status || "ABERTA"},
      ${payload.topic || "Outro assunto"},
      ${payload.page || "/"},
      ${JSON.stringify(payload.visitor || {})}::jsonb,
      ${now},
      ${now}
    )
    ON CONFLICT (id) DO NOTHING
  `;

  if (payload.initialMessage) {
    await addMessage(payload.id, payload.initialMessage);
  }

  return getConversation(payload.id);
}

export async function addMessage(conversationId, message) {
  await ensureDatabase();
  const sql = db();
  const createdAt = message.date || message.createdAt || new Date().toISOString();

  await sql`
    INSERT INTO chat_messages (
      id, conversation_id, sender, text, read_by_client, read_by_support, created_at
    )
    VALUES (
      ${message.id || `msg_${crypto.randomUUID()}`},
      ${conversationId},
      ${message.from || message.sender},
      ${message.text},
      ${Boolean(message.readByClient)},
      ${Boolean(message.readBySupport)},
      ${createdAt}
    )
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    UPDATE chat_conversations
    SET status = 'ABERTA',
        updated_at = NOW()
    WHERE id = ${conversationId}
  `;
}

export async function markConversationRead(conversationId, reader) {
  await ensureDatabase();
  const sql = db();
  if (reader === "client") {
    await sql`
      UPDATE chat_messages
      SET read_by_client = TRUE
      WHERE conversation_id = ${conversationId}
        AND sender = 'support'
    `;
  } else {
    await sql`
      UPDATE chat_messages
      SET read_by_support = TRUE
      WHERE conversation_id = ${conversationId}
        AND sender = 'client'
    `;
  }
}

export async function setConversationStatus(conversationId, status) {
  await ensureDatabase();
  const sql = db();
  await sql`
    UPDATE chat_conversations
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${conversationId}
  `;
}

export async function getConversation(id) {
  await ensureDatabase();
  const sql = db();
  const rows = await sql`
    SELECT id, site, channel, status, topic, page, visitor, created_at, updated_at
    FROM chat_conversations
    WHERE id = ${id}
    LIMIT 1
  `;
  if (!rows.length) return null;
  const row = rows[0];
  const messages = await sql`
    SELECT id, sender, text, read_by_client, read_by_support, created_at
    FROM chat_messages
    WHERE conversation_id = ${id}
    ORDER BY created_at ASC
  `;
  return {
    id: row.id,
    site: row.site,
    channel: row.channel,
    status: row.status,
    topic: row.topic,
    page: row.page,
    visitor: row.visitor,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: messages.map((message) => ({
      id: message.id,
      from: message.sender,
      text: message.text,
      readByClient: message.read_by_client,
      readBySupport: message.read_by_support,
      date: message.created_at,
    })),
  };
}

export async function listConversations() {
  await ensureDatabase();
  const sql = db();
  const rows = await sql`
    SELECT id
    FROM chat_conversations
    ORDER BY updated_at DESC
  `;
  return Promise.all(rows.map((row) => getConversation(row.id)));
}
