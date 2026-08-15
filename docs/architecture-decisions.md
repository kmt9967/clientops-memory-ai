# Architecture decisions

- Next.js 16 App Router keeps the UI and server API in one deployable unit.
- `pg` is used directly for transparent CockroachDB SQL and vector operators.
- Bedrock `Converse` provides grounded response generation; `InvokeModel` produces Titan embeddings.
- Relational records hold operational truth; vectors add semantic retrieval rather than replacing structure.
- Local-storage demo state is isolated, synthetic, resettable, and explicitly distinct from live mode.
- No Lambda, GPU, provisioned throughput, or always-on database was added for sponsor padding.
