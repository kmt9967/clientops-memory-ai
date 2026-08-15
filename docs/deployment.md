# Deployment

Public demo: https://main.dmr37ghkod94i.amplifyapp.com

AWS Amplify app ID: `dmr37ghkod94i`

Region: `ap-south-1`

Latest manual deployment: **Deployment 8**, deployed August 15, 2026 at 12:09 PM (Asia/Karachi), build duration 8 seconds.

Static release commands:

```bash
npm run build:static
npm run package:amplify
```

The packaging script writes every file as a normalized ZIP entry and verifies that `index.html`, `_next/static/*.css`, and `_next/static/*.js` are present. Upload `clientops-memory-ai-amplify.zip` to the existing `main` branch manual deployment. `amplify.yml` contains the equivalent build settings for a future repository-connected deployment.

The public deployment is a static export of the complete synthetic judging flow. Its memory persists in browser local storage, so it needs no credentials and is accessible without application authentication. The checked-in Next.js server routes are the production integration path for CockroachDB and Amazon Bedrock.

To deploy the server-backed path, use an AWS service that runs Next.js with a runtime IAM role limited to `bedrock:InvokeModel` for the selected model IDs. Configure `DATABASE_URL`, `AWS_REGION`, `BEDROCK_MODEL_ID`, and `BEDROCK_EMBEDDING_MODEL_ID` as encrypted service variables, then verify `/api/health`.

Do not paste secrets into build logs, screenshots, repository settings visible to collaborators, or Devpost.
