# AWS Bedrock implementation

Verified in account-scoped AWS Console, region `ap-south-1`:

- Nova Lite (`amazon.nova-lite-v1:0`) — serverless, live inference completed in 920 ms.
- Titan Text Embeddings V2 (`amazon.titan-embed-text-v2:0`) — serverless, live 1,024-dimensional normalized embedding generated through AWS CloudShell.

The app uses the AWS SDK credential chain and does not store access keys. `/api/agent` embeds the query, retrieves CockroachDB evidence, asks Nova Lite to answer only from that evidence, then records the agent run and retrieval trace.
