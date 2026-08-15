# Deployment

Target: AWS Amplify Hosting or App Runner in `ap-south-1`, using a runtime IAM role with only `bedrock:InvokeModel` for the selected model IDs. Configure `DATABASE_URL`, `AWS_REGION`, `BEDROCK_MODEL_ID`, and `BEDROCK_EMBEDDING_MODEL_ID` as encrypted service variables.

Do not paste secrets into build logs, screenshots, repository settings visible to collaborators, or Devpost. Signed-out access and `/api/health` must be verified after deployment.
