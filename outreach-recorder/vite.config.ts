import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { randomUUID } from "node:crypto";
import react from "@vitejs/plugin-react";
import {
  defineConfig,
  type Plugin,
  type PreviewServer,
  type ViteDevServer,
} from "vite";

function runFfmpeg(args: string[]): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", args);
    let stderr = "";

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code: code ?? 1, stderr });
    });
  });
}

function checkFfmpeg(): Promise<{ available: boolean; version?: string }> {
  return new Promise((resolve) => {
    const child = spawn("ffmpeg", ["-version"]);
    let output = "";

    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });

    child.on("error", () => resolve({ available: false }));
    child.on("close", (code) => {
      const firstLine = output.split("\n")[0]?.trim();
      resolve({
        available: code === 0,
        version: code === 0 && firstLine ? firstLine : undefined,
      });
    });
  });
}

function attachConversionMiddlewares(
  server: Pick<ViteDevServer | PreviewServer, "middlewares">,
) {
  server.middlewares.use("/api/ffmpeg-status", async (_req, res) => {
    const status = await checkFfmpeg();
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(status));
  });

  server.middlewares.use("/api/convert-to-mp4", async (req, res) => {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.end("Method not allowed");
      return;
    }

    const ffmpeg = await checkFfmpeg();
    if (!ffmpeg.available) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          message:
            "ffmpeg is not installed or is not available on this machine.",
        }),
      );
      return;
    }

    const jobId = randomUUID();
    const workDir = join(tmpdir(), `essential-outreach-${jobId}`);
    const inputPath = join(workDir, "input.webm");
    const outputPath = join(workDir, "output.mp4");

    try {
      await mkdir(workDir, { recursive: true });
      await pipeline(req, createWriteStream(inputPath));

      const result = await runFfmpeg([
        "-y",
        "-i",
        inputPath,
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        outputPath,
      ]);

      if (result.code !== 0) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            message: "MP4 conversion failed.",
            detail: result.stderr.slice(-2000),
          }),
        );
        return;
      }

      const mp4Stats = await stat(outputPath);
      res.statusCode = 200;
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Length", String(mp4Stats.size));
      await pipeline(createReadStream(outputPath), res);
    } catch (error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          message:
            error instanceof Error ? error.message : "MP4 conversion failed.",
        }),
      );
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  });
}

function localConversionPlugin(): Plugin {
  return {
    name: "local-ffmpeg-conversion",
    configureServer(server) {
      attachConversionMiddlewares(server);
    },
    configurePreviewServer(server) {
      attachConversionMiddlewares(server);
    },
  };
}

export default defineConfig({
  plugins: [react(), localConversionPlugin()],
  server: {
    port: 5174,
    strictPort: false,
  },
});
