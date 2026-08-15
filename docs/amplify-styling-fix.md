# Amplify styling repair

Date: August 15, 2026

## Root cause

The source styling was healthy: `app/layout.tsx` imported `app/globals.css`, Tailwind v4 compiled successfully through PostCSS, and the local production/static build rendered the intended design.

The broken manual Amplify artifact had been post-processed from Next.js `_next` URLs to `/assets/...` and packaged with directory records that Amplify did not publish recursively. Amplify served root files such as `index.html` and `file.svg`, but every nested CSS and JavaScript request returned `404 text/html`. The browser therefore rendered server-produced markup with Times New Roman, a transparent background, default buttons, and no hydration.

Observed before repair:

- `/assets/static/chunks/2tz_v_44ta5vf.css` returned `404 text/html`
- `/assets/static/chunks/3l04zcqx63h3y.js` returned `404 text/html`
- computed body font was `Times New Roman`
- computed body background was transparent

## Fix

- Added a repeatable `npm run build:static` command that excludes dynamic API routes only during the static export and restores them in `finally`.
- Kept Next.js-native `/_next/static/...` asset URLs; no asset-path rewriting.
- Added a Python standard-library packaging script that writes files only, uses POSIX relative paths, forbids `./` and backslash entry names, and asserts CSS/JavaScript bundles exist.
- Added `amplify.yml` with `npm ci`, `npm run build:static`, and `out` as the artifact directory.
- Redeployed the normalized artifact to the existing Amplify app and `main` branch.

Changed implementation files:

- `package.json`
- `.gitignore`
- `amplify.yml`
- `scripts/build-static.mjs`
- `scripts/package-amplify-static.py`

## Deployment

- Amplify app ID: `dmr37ghkod94i`
- Branch: `main`
- Deployment: `8`
- Status: Deployed
- Build duration: 8 seconds
- Started: August 15, 2026, 12:09 PM Asia/Karachi
- URL: https://main.dmr37ghkod94i.amplifyapp.com/

## After repair

- `/_next/static/chunks/2dfepdj0srya0.css` returned `200 text/css`, 26,231 bytes
- `/_next/static/chunks/3gl48aymp4s13.js` returned `200 text/javascript`, 182,678 bytes
- computed body font is the intended Inter/system stack
- computed body background is `rgb(245, 247, 245)`
- 245 compiled CSS rules loaded in isolated responsive QA
- no public console warnings or errors

| Width | Document width | Overflow | Mobile media query |
|---:|---:|---|---|
| 1440 | 1440 | No | No |
| 1280 | 1280 | No | No |
| 1024 | 1024 | No | No |
| 768 | 753 | No | No |
| 390 | 375 | No | Yes |

## Core-demo regression

The public deployment successfully loaded Magnum Roofing, extracted three memory records, opened evidence, retained nine memories in a new session, answered a paraphrased unanswered-call query, superseded the follower rule, opened the explorer and decision history, and retained the replacement decision after refresh and re-entering the demo.

## Remaining issues

No styling or asset-serving issues remain. The public demo intentionally uses browser local storage; the checked-in dynamic API routes remain available for a server-backed deployment.
