import { healthcheck } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const services = { database: "not_configured", bedrock: process.env.AWS_REGION ? "configured" : "not_configured" };
  if (!process.env.DATABASE_URL) return Response.json({ ok: false, mode: "demo", services }, { status: 503 });
  try {
    const database = await healthcheck();
    return Response.json({ ok: true, mode: "live", services: { ...services, database: "connected" }, database });
  } catch (error) {
    return Response.json({ ok: false, mode: "degraded", services, error: error instanceof Error ? error.message : "Database unavailable" }, { status: 503 });
  }
}
