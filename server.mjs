import { createServer } from "http";
import { readFileSync, existsSync } from "fs";
import { extname, join, normalize } from "path";
import { fileURLToPath } from "url";
import { sendLead } from "./api/lead.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const envPath = join(root, ".env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/lead") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    let body = {};
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false }));
      return;
    }
    const result = await sendLead(body);
    res.writeHead(result.status, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: result.ok }));
    return;
  }

  const url = new URL(req.url || "/", "http://127.0.0.1");
  let relative = decodeURIComponent(url.pathname);
  if (relative === "/") relative = "/index.html";
  const file = normalize(join(root, relative));
  if (!file.startsWith(root) || !existsSync(file)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});

const port = Number(process.env.PORT || 8766);
server.listen(port, () => {
  process.stdout.write(`http://127.0.0.1:${port}\n`);
});
