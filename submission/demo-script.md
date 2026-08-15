# Demo script — target 2:42

**0:00–0:18 — Problem**  
“Client operations rarely fail because nobody wrote something down. They fail because decisions, preferences, and promises are scattered—and nobody can tell what is current or why it changed.”

**0:18–0:34 — Product**  
Open ClientOps Memory AI and load Magnum Roofing Demo. “This is not chat history. It is typed organizational memory backed by CockroachDB and reasoned over with Amazon Bedrock.”

**0:34–0:58 — Remember**  
Enter the Angi instruction. Show three extracted memories: assignment, follower decision, unanswered-call commitment. Open timeline briefly.

**0:58–1:18 — New-session recall**  
Click New session. Ask what was decided about roofing leads. Show accurate answer and evidence drawer with source, type, time, relevance, and status.

**1:18–1:38 — Semantic retrieval**  
Ask what happens when a prospect does not pick up. Show the paraphrased match and retrieval trace. “Titan V2 embeddings are stored in CockroachDB VECTOR and ranked with its vector index.”

**1:38–2:04 — Decision evolution**  
Ask to reuse the workflow without Matt, then ask why Matt is not added. Open decision history: current exception connected to preserved historical guidance.

**2:04–2:24 — Trust**  
Show confidence, source visibility, mark inaccurate/delete controls, commitments, and stored-fact versus inference label.

**2:24–2:37 — Architecture**  
Show Browser → Next.js Agent API → Bedrock → Memory Orchestrator → CockroachDB, plus observability trace.

**2:37–2:42 — Close**  
“ClientOps gives every team member the context of the last decision—not just the last message.”
