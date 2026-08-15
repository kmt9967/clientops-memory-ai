# Deployment

Public demo: https://main.dmr37ghkod94i.amplifyapp.com

AWS Amplify app ID: `dmr37ghkod94i`

Region: `ap-south-1`

The public deployment is a static export of the complete synthetic judging flow. Its memory persists in browser local storage, so it needs no credentials and is accessible without application authentication. The checked-in Next.js server routes are the production integration path for CockroachDB and Amazon Bedrock.

To deploy the server-backed path, use an AWS service that runs Next.js with a runtime IAM role limited to `bedrock:InvokeModel` for the selected model IDs. Configure `DATABASE_URL`, `AWS_REGION`, `BEDROCK_MODEL_ID`, and `BEDROCK_EMBEDDING_MODEL_ID` as encrypted service variables, then verify `/api/health`.

Do not paste secrets into build logs, screenshots, repository settings visible to collaborators, or Devpost.
