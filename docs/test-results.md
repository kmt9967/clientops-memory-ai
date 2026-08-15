# Test results

August 15, 2026:

- `npm test`: 16/16 passing across two files.
- `npm run lint`: pass, zero findings.
- `npm run build`: pass; static `/` plus dynamic `/api/agent` and `/api/health`.
- `npm audit`: zero known vulnerabilities after initial install.

Styling repair regression run, August 15, 2026:

- `npm ci`: pass; 441 packages installed, zero vulnerabilities.
- `npm run lint`: pass, zero findings.
- `npx tsc --noEmit`: pass.
- `npm test`: 16/16 passing across two files.
- `npm run build`: pass; static `/` plus dynamic `/api/agent` and `/api/health`.
- `npm run build:static`: pass; static `/` artifact produced while server routes were preserved and restored.
- `npm audit --audit-level=moderate`: zero vulnerabilities.
- Public asset checks: CSS `200 text/css` (26,231 bytes); JavaScript `200 text/javascript` (182,678 bytes).
- Public console: zero warnings or errors.
- Responsive widths 1440, 1280, 1024, 768, and 390: correct viewport, loaded stylesheet, no horizontal overflow.
- Core demo: extraction, evidence, new session, paraphrased recall, superseding, explorer, decision history, refresh persistence all pass.
