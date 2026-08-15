import "server-only";
import { Pool, type PoolClient } from "pg";

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

export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      const retryable = typeof error === "object" && error !== null && "code" in error && error.code === "40001";
      if (!retryable || attempt === maxAttempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 40 * 2 ** (attempt - 1) + Math.random() * 40));
    } finally {
      client.release();
    }
  }
  throw new Error("Transaction retry budget exhausted");
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
