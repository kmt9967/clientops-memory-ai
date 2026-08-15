# Security and privacy

- Synthetic demo data only; no prior-client content was copied.
- `.env*`, build output, caches, and dependencies are ignored; `.env.example` is explicitly allowed.
- AWS keys and database credentials are never hardcoded.
- Memory deletion is workspace-scoped; demo reset only touches demo state.
- Prompt responses are grounded in retrieved evidence and expose provenance.
- Recommended production controls: authentication, workspace row authorization, rate limits, encrypted secret manager, audit retention policy, and data-subject deletion workflow.
