CREATE DATABASE IF NOT EXISTS clientops_memory;
USE clientops_memory;

CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slug STRING UNIQUE NOT NULL,
  name STRING NOT NULL, is_demo BOOL NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  display_name STRING NOT NULL, role STRING NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name STRING NOT NULL, metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title STRING, session_key STRING NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role STRING NOT NULL, content STRING NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL, memory_type STRING NOT NULL CHECK (memory_type IN ('episodic','semantic','decision','commitment')),
  title STRING NOT NULL, content STRING NOT NULL, actor STRING NOT NULL, source STRING NOT NULL,
  status STRING NOT NULL DEFAULT 'active', confidence DECIMAL(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS memories_workspace_type_status_idx ON memories (workspace_id, memory_type, status, created_at DESC);
CREATE TABLE IF NOT EXISTS memory_embeddings (
  memory_id UUID PRIMARY KEY REFERENCES memories(id) ON DELETE CASCADE, embedding VECTOR(1024) NOT NULL,
  model_id STRING NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE VECTOR INDEX IF NOT EXISTS memory_embedding_vector_idx ON memory_embeddings (embedding);
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), memory_id UUID UNIQUE NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  approved_by STRING, rationale STRING, supersedes UUID REFERENCES decisions(id), state STRING NOT NULL DEFAULT 'current', decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), memory_id UUID UNIQUE NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  owner STRING, due_at TIMESTAMPTZ, status STRING NOT NULL DEFAULT 'open', originating_decision UUID REFERENCES decisions(id), completion_evidence STRING
);
CREATE TABLE IF NOT EXISTS memory_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), from_memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  to_memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE, relationship STRING NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_memory_id, to_memory_id, relationship)
);
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY, workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  model_id STRING NOT NULL, input STRING NOT NULL, output STRING, duration_ms INT, context_count INT,
  metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS retrieval_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  agent_run_id UUID REFERENCES agent_runs(id) ON DELETE SET NULL, query STRING NOT NULL, query_embedding VECTOR(1024),
  selected_memory_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[], duration_ms INT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
