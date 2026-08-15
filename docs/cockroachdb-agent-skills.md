# CockroachDB Agent Skills integration

ClientOps uses two tools from the official [CockroachDB Agent Skills repository](https://github.com/cockroachlabs/cockroachdb-skills), installed project-locally under `.agent-skills/`:

- `cockroachdb-sql` reviewed the schema, vector query, UUID primary keys, explicit projections, JSONB usage, and distributed-index patterns.
- `designing-application-transactions` shaped the server write path: Amazon Bedrock calls remain outside the database transaction, while `agent_runs` and `retrieval_events` are committed atomically in a short transaction with bounded exponential-backoff retries for CockroachDB SQLSTATE `40001`.

This is a real build-time integration, not an MCP claim. The skills and their supporting references are checked into the repository so judges can inspect the exact operational guidance used.
