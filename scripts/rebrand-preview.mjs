import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { assertLocalPreview, previewDecision, previewHeaders } from "./rebrand-preview-safety.mjs";

assertLocalPreview();
if (process.argv.includes("--check")) {
  console.log("Local rebrand isolation checks passed.");
} else {
  const credentials = JSON.parse(readFileSync(".rebrand-preview-access.json", "utf8"));
  if (!credentials.username || credentials.password?.length < 24) throw new Error("Preview credentials are missing or too short.");
  const dev = process.argv.includes("--dev");
  process.env.NODE_ENV = dev ? "development" : "production";
  const { default: next } = await import("next");
  const app = next({ dev, hostname: "127.0.0.1", port: 3027, webpack: true });
  await app.prepare();
  const handle = app.getRequestHandler();
  const server = createServer(async (req, res) => {
    for (const [key, value] of Object.entries(previewHeaders)) res.setHeader(key, value);
    const decision = previewDecision({ method: req.method, url: req.url, host: req.headers.host, authorization: req.headers.authorization }, credentials);
    if (decision) {
      res.statusCode = decision.status;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      if (decision.authenticate) res.setHeader("WWW-Authenticate", 'Basic realm="David Walsh Recruitment private preview", charset="UTF-8"');
      res.end(req.method === "HEAD" ? undefined : decision.body);
      return;
    }
    delete req.headers.authorization;
    try { await handle(req, res); }
    catch { if (!res.headersSent) res.statusCode = 500; res.end("Preview unavailable."); }
  });
  server.listen(3027, "127.0.0.1", () => console.log("Protected local rebrand preview: http://127.0.0.1:3027"));
  async function stop() { server.close(); await app.close(); process.exit(0); }
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}
