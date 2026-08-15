# Devpost field draft

**Project name:** ClientOps Memory AI  
**Tagline:** An AI operations agent with persistent organizational memory.  
**Built with:** Next.js, TypeScript, React, CockroachDB Cloud, CockroachDB Distributed Vector Indexing, CockroachDB Agent Skills Repo, Amazon Bedrock, Amazon Nova Lite, Amazon Titan Text Embeddings V2, AWS Amplify, AWS SDK, Zod

**Source:** https://github.com/kmt9967/clientops-memory-ai

**Demo:** https://main.dmr37ghkod94i.amplifyapp.com

**Video:** `PUBLIC_YOUTUBE_OR_VIMEO_URL`

## Inspiration
Agencies repeatedly lose the reasoning behind client decisions as work moves across chats, meetings, tools, and staff handoffs.

## What it does
ClientOps extracts typed memory, reconciles conflicts, persists provenance, retrieves relevant history across sessions, and cites the evidence that shaped each answer.

## How we built it
CockroachDB stores relational truth plus Titan embeddings in `VECTOR(1024)` with a distributed vector index. The official CockroachDB Agent Skills repository guided schema validation and the retry-safe transaction that atomically records retrieval traces and agent runs. A Next.js agent API uses Bedrock for embeddings and grounded reasoning.

## Challenges
Preserving historical truth while applying new instructions required explicit superseding relationships, status-aware ranking, and user-visible evidence rather than mutating prior decisions.

## Accomplishments
Live CockroachDB schema/vector migration, live Bedrock reasoning and embeddings, cross-session demo flow, evidence drawer, responsible-memory controls, and a ten-scenario evaluation harness.

## What we learned
Useful agent memory is a data-modeling and trust problem as much as an LLM problem. Relational state and semantic search work best together.

## What’s next
Authenticated multi-workspace collaboration, source connectors, batch embedding backfill, reviewer approvals, and richer MCP-powered diagnostics.

**AI disclosure:** AI-assisted development was used. All demo data is synthetic.  
**Final submission performed:** NO.
