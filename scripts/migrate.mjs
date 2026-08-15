import { readFile } from "node:fs/promises";
import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before running migrations");
const sql = await readFile(new URL("../migrations/001_initial.sql", import.meta.url), "utf8");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
await client.connect();
try {
  await client.query(sql);
  console.log("CockroachDB migration complete: clientops_memory");
} finally {
  await client.end();
}
