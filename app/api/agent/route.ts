import { randomUUID } from "crypto";
import { embed, reason, reasoningModel } from "@/lib/bedrock";
import { semanticSearch, withTransaction } from "@/lib/db";
import { memoryExtractionSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const runId = randomUUID();
  const started = performance.now();
  try {
    const { workspaceId, message } = await request.json();
    if (!workspaceId || typeof message !== "string") return Response.json({ error: "workspaceId and message are required" }, { status: 400 });
    if (!process.env.DATABASE_URL) return Response.json({ error: "Live memory is not configured", mode: "demo", runId }, { status: 503 });

    const queryEmbedding = await embed(message);
    const retrieval = await semanticSearch(workspaceId, queryEmbedding);
    const context = retrieval.rows.map((m, index) => `[${index + 1}] ${m.memory_type}/${m.status}: ${m.content}`).join("\n");
    const answer = await reason(message, context || "No relevant stored memory.");
    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO agent_runs (id, workspace_id, model_id, input, output, duration_ms, context_count, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [runId, workspaceId, reasoningModel, message, answer, Math.round(performance.now() - started), retrieval.rows.length, JSON.stringify({ retrievalMs: retrieval.durationMs })],
      );
      await client.query(
        `INSERT INTO retrieval_events (workspace_id, agent_run_id, query, query_embedding, selected_memory_ids, duration_ms)
         VALUES ($1,$2,$3,$4::VECTOR,$5,$6)`,
        [workspaceId, runId, message, `[${queryEmbedding.join(",")}]`, retrieval.rows.map((m) => m.id), retrieval.durationMs],
      );
    });
    return Response.json({ answer, evidence: retrieval.rows, runId, model: reasoningModel, durationMs: Math.round(performance.now() - started) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Agent unavailable", runId }, { status: 503 });
  }
}

export { memoryExtractionSchema };
