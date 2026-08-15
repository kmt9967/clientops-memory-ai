import "server-only";
import { BedrockRuntimeClient, ConverseCommand, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const region = process.env.AWS_REGION ?? "ap-south-1";
const client = new BedrockRuntimeClient({ region });
export const reasoningModel = process.env.BEDROCK_MODEL_ID ?? "amazon.nova-lite-v1:0";
export const embeddingModel = process.env.BEDROCK_EMBEDDING_MODEL_ID ?? "amazon.titan-embed-text-v2:0";

export async function embed(text: string) {
  const response = await client.send(new InvokeModelCommand({
    modelId: embeddingModel,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({ inputText: text, dimensions: 1024, normalize: true }),
  }));
  const result = JSON.parse(new TextDecoder().decode(response.body));
  if (!Array.isArray(result.embedding)) throw new Error("Bedrock returned no embedding");
  return result.embedding as number[];
}

export async function reason(prompt: string, context: string) {
  const response = await client.send(new ConverseCommand({
    modelId: reasoningModel,
    system: [{ text: "You are ClientOps Memory AI. Answer only from provided memory evidence. Clearly label remembered facts, inferences, current tasks, and superseded history. If evidence is insufficient, say so." }],
    messages: [{ role: "user", content: [{ text: `MEMORY EVIDENCE:\n${context}\n\nUSER:\n${prompt}` }] }],
    inferenceConfig: { maxTokens: 700, temperature: 0.2 },
  }));
  return response.output?.message?.content?.map((item) => "text" in item ? item.text : "").join("") ?? "";
}
