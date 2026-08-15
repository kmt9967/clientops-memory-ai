# ClientOps Memory AI

ClientOps Memory AI is an operations agent with durable organizational memory for agencies and service businesses. It converts conversations into episodic, semantic, decision, and commitment memory; stores that memory in CockroachDB; retrieves semantically related history with a distributed vector index; and grounds Amazon Bedrock responses in explicit evidence.

The centerpiece demo follows Magnum Roofing, a fully synthetic client. An operator records a lead-routing workflow, starts a fresh session, recalls the decision, adapts it with an exception, and then asks why the behavior changed. The agent cites both current and superseded decisions instead of silently rewriting history.

CockroachDB is the system of record for memory, embeddings, relationships, tasks, decisions, agent runs, and retrieval traces. Amazon Nova Lite performs agent reasoning, while Titan Text Embeddings V2 creates normalized vectors. Trust controls show confidence, sources, timestamps, status, and answer relationships; users can mark inaccurate, delete, complete, or supersede records.
