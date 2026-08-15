import "server-only";
import { Pool } from "pg";

let pool: Pool | undefined;

export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5, ssl: { rejectUnauthorized: true } });
  return pool;
}

export async function healthcheck() {
  const started = performance.now();
  const result = await getPool().query("SELECT current_database() AS database, version() AS version");
  return { ...result.rows[0], durationMs: Math.round(performance.now() - started) };
}

export async function semanticSearch(workspaceId: string, embedding: number[], limit = 6) {
  const started = performance.now();
  const vector = `[${embedding.join(",")}]`;
  const result = await getPool().query(
    `SELECT m.id, m.memory_type, m.title, m.content, m.status, m.confidence, m.source,
       m.created_at, 1 - (e.embedding <=> $2::VECTOR) AS relevance
     FROM memory_embeddings e JOIN memories m ON m.id = e.memory_id
     WHERE m.workspace_id = $1 AND m.status <> 'inaccurate'
     ORDER BY e.embedding <=> $2::VECTOR LIMIT $3`,
    [workspaceId, vector, limit],
  );
  return { rows: result.rows, durationMs: Math.round(performance.now() - started) };
}
