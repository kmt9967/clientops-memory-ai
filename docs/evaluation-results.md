# Evaluation results

Run: August 15, 2026. Harness: Vitest deterministic retrieval and state logic.

| Metric | Result |
|---|---:|
| Scenarios passing | 10 / 10 |
| Retrieval hit rate (5 retrieval cases) | 100% |
| Contradiction/supersede checks | 2 / 2 |
| Irrelevant rejection | Pass |
| Deleted-memory exclusion | Pass |

These are actual local harness results, not claims about model accuracy. Live CockroachDB vector smoke test: top-memory selection correct; absolute cosine relevance `0.245`.
