# Architecture summary

Browser → Next.js Agent API → Amazon Bedrock Nova Lite → memory orchestrator → Titan V2 embeddings → CockroachDB relational + vector memory → ranked evidence → grounded answer.

Write flow: classify → extract → compare → conflict/supersede → embed → persist → link.  
Read flow: infer intent → structured filter → vector rank → status-aware evidence selection → grounded answer → trace.
