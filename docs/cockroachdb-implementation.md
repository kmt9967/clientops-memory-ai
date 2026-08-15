# CockroachDB implementation

Live cluster: `clientops-memory-ai`, Basic plan, AWS Mumbai (`ap-south-1`). Monthly limit was not changed. Database `clientops_memory` was created through the authenticated SQL Shell.

The migration creates UUID/timestamptz/JSONB relational tables and a `VECTOR(1024)` column. The vector index was created successfully with:

```sql
CREATE VECTOR INDEX IF NOT EXISTS memory_embedding_vector_idx
ON memory_embeddings (embedding);
```

The relational schema was applied separately because a multi-statement SQL Shell batch initially selected the legacy schema changer for the vector-index statement. No data existed to lose; the standalone declarative statement succeeded.

Synthetic Magnum Roofing rows and a real Titan V2 embedding were inserted. A paraphrased query—“What happens when a roofing prospect does not pick up the phone?”—returned **Angi outreach sequence** as the top row using cosine distance. Observed relevance was `0.245`; this low absolute score is reported honestly, and ranking quality should be evaluated with more than one embedded candidate before production use.
