/**
 * Multipart upload stress verification helper.
 * Run against a running dev server with auth:
 *   npx tsx scripts/verify-multipart-upload.ts <projectId> [fileSizeMb]
 */
import fs from "fs";
import os from "os";
import path from "path";

const API = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const TOKEN = process.env.PLAYWRIGHT_ACCESS_TOKEN;
const projectId = process.argv[2];
const sizeMb = Number(process.argv[3] ?? "5");

if (!projectId || !TOKEN) {
  console.error("Usage: PLAYWRIGHT_ACCESS_TOKEN=... npx tsx scripts/verify-multipart-upload.ts <projectId> [sizeMb]");
  process.exit(1);
}

async function main() {
  const tmp = path.join(os.tmpdir(), `multipart-stress-${Date.now()}.bin`);
  fs.writeFileSync(tmp, Buffer.alloc(sizeMb * 1024 * 1024, 0x41));

  const initRes = await fetch(`${API}/api/projects/${projectId}/files/multipart/initiate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      file_name: path.basename(tmp),
      mime_type: "application/octet-stream",
      size: fs.statSync(tmp).size,
      folder_path: "/",
    }),
  });

  if (!initRes.ok) {
    console.error("Initiate failed:", initRes.status, await initRes.text());
    process.exit(1);
  }

  const init = (await initRes.json()) as { upload_id: string; key: string };
  console.log("Multipart initiated:", init.upload_id, `${sizeMb}MB`);
  fs.unlinkSync(tmp);
  console.log("OK — initiate path reachable; complete upload via UI for full stress test.");
}

void main();
