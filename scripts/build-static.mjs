import { existsSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const apiDir = join(projectRoot, "app", "api");
const holdDir = join(projectRoot, ".amplify-static-api-hold");

if (!existsSync(apiDir)) throw new Error(`API route directory not found: ${apiDir}`);
if (existsSync(holdDir)) throw new Error(`Static-build hold directory already exists: ${holdDir}`);

let buildStatus = 1;
renameSync(apiDir, holdDir);
try {
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args = process.platform === "win32" ? ["/d", "/s", "/c", "npm run build"] : ["run", "build"];
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: { ...process.env, STATIC_EXPORT: "1" },
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  buildStatus = result.status ?? 1;
} finally {
  if (existsSync(holdDir)) renameSync(holdDir, apiDir);
}

if (buildStatus !== 0) process.exit(buildStatus);
if (!existsSync(apiDir)) throw new Error("API route restoration failed after static build");
