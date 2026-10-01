import { getDb } from './_security.js';

export async function ensureSearchUsageTable(sql: ReturnType<typeof getDb>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS ai_search_usage (
      actor_id TEXT NOT NULL,
      usage_day DATE NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (actor_id, usage_day)
    );
  `;
}
