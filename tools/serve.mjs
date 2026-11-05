// Serves the app at http://localhost:8080 so it can be previewed on this computer. It answers many requests at once
// (the previous PowerShell server took one at a time and dropped files when the browser asked for several together).
// Run from the project folder:  node tools/serve.mjs      (stop with Ctrl+C; another port: node tools/serve.mjs 8081)
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = +process.argv[2] || 8080;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript",
  ".json": "application/json", ".csv": "text/csv; charset=utf-8", ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json", ".md": "text/plain; charset=utf-8", ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8", ".png": "image/png",
};

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end(); return; }   // nothing outside the project
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain" }); res.end("Not found"); return; }
    // no-cache: the browser always checks for a newer copy, so edits show on the next reload.
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(data);
  });
}).listen(PORT, "127.0.0.1", () => console.log(`RadPhys Revise running at http://localhost:${PORT}/  (Ctrl+C to stop)`));
