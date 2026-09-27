import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const PORT = 5199;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(
          new Error(
            `${command} ${args.join(" ")} failed with code ${code}\n${stdout}\n${stderr}`,
          ),
        );
      }
    });
  });
}

async function waitForServer(url, timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Keep polling until Vite is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function ffprobeJson(filePath) {
  const { stdout } = await run("ffprobe", [
    "-v",
    "error",
    "-show_streams",
    "-of",
    "json",
    filePath,
  ]);
  return JSON.parse(stdout);
}

async function frameContainsWebcamColours(filePath) {
  const child = spawn("ffmpeg", [
    "-v",
    "error",
    "-ss",
    "1",
    "-i",
    filePath,
    "-vf",
    "scale=80:-1,format=rgb24",
    "-frames:v",
    "1",
    "-f",
    "rawvideo",
    "pipe:1",
  ]);

  const chunks = [];
  child.stdout.on("data", (chunk) => chunks.push(chunk));

  await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Could not sample webcam bubble pixels, ffmpeg code ${code}`));
    });
  });

  const pixels = Buffer.concat(chunks);
  let webcamPixelCount = 0;
  for (let index = 0; index + 2 < pixels.length; index += 3) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const looksYellow = red > 180 && green > 120 && blue < 120;
    const looksRed = red > 140 && green < 90 && blue < 90;
    if (looksYellow || looksRed) webcamPixelCount += 1;
  }

  return webcamPixelCount > 20;
}

async function installFakeMedia(page, options = {}) {
  await page.addInitScript(({ denyUserMedia = false } = {}) => {
    function makeVideoStream(kind) {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");
      let frame = 0;

      const draw = () => {
        frame += 1;
        if (kind === "screen") {
          ctx.fillStyle = "#103b52";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#4fd1a5";
          ctx.fillRect(24 + (frame % 160), 54, 230, 118);
          ctx.fillStyle = "#ffffff";
          ctx.font = "32px sans-serif";
          ctx.fillText("QA SCREEN", 42, 122);
        } else {
          ctx.fillStyle = "#f9d44a";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#d71920";
          ctx.beginPath();
          ctx.arc(320, 180, 120, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "40px sans-serif";
          ctx.fillText("QA CAM", 220, 195);
        }
      };

      draw();
      const interval = window.setInterval(draw, 33);
      const stream = canvas.captureStream(30);
      for (const track of stream.getTracks()) {
        const originalStop = track.stop.bind(track);
        track.stop = () => {
          window.clearInterval(interval);
          window.__qaStoppedTracks = (window.__qaStoppedTracks || 0) + 1;
          originalStop();
        };
      }
      return stream;
    }

    function makeAudioStream() {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextCtor();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const destination = audioContext.createMediaStreamDestination();
      oscillator.frequency.value = 440;
      gain.gain.value = 0.05;
      oscillator.connect(gain).connect(destination);
      oscillator.start();

      for (const track of destination.stream.getTracks()) {
        const originalStop = track.stop.bind(track);
        track.stop = () => {
          originalStop();
          oscillator.stop();
          audioContext.close();
          window.__qaStoppedTracks = (window.__qaStoppedTracks || 0) + 1;
        };
      }

      return destination.stream;
    }

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getDisplayMedia: async () => {
          window.__qaDisplayRequested = true;
          return makeVideoStream("screen");
        },
        getUserMedia: async (constraints) => {
          window.__qaUserRequested = true;
          if (denyUserMedia) {
            throw new DOMException("QA denied user media", "NotAllowedError");
          }

          const tracks = [];
          if (constraints?.video) {
            tracks.push(...makeVideoStream("camera").getVideoTracks());
          }
          if (constraints?.audio) {
            tracks.push(...makeAudioStream().getAudioTracks());
          }
          return new MediaStream(tracks);
        },
      },
    });
  }, options);
}

async function runHappyPath(browser, downloadDir) {
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();
  const consoleMessages = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => consoleMessages.push(`pageerror: ${error.message}`));

  await installFakeMedia(page);
  await page.goto(BASE_URL, { waitUntil: "load" });

  await expectDisabledStartUntilProspect(page);
  await page.getByPlaceholder("e.g. Sarah Thompson").fill("QA Prospect");
  await page.getByPlaceholder("e.g. Northstar Digital").fill("Acme & Co");
  await page.getByPlaceholder("e.g. CMO").fill("Head of Marketing");
  await page.getByPlaceholder("Paste your short reminder here.").fill("QA note.");
  await page.getByRole("button", { name: "LinkedIn profile" }).click();

  await page.getByRole("button", { name: "Large" }).click();
  await page.getByRole("button", { name: "Start recording" }).click();
  await page.waitForSelector(".bubble-handle", { timeout: 7000 });
  const initialBubbleStyle = await page.locator(".bubble-handle").evaluate((element) => ({
    left: parseFloat(element.style.left) / 100,
    top: parseFloat(element.style.top) / 100,
    width: parseFloat(element.style.width) / 100,
  }));
  await page.locator(".bubble-handle").dragTo(page.locator(".stage"), {
    targetPosition: { x: 530, y: 300 },
  });
  const movedBubbleStyle = await page.locator(".bubble-handle").evaluate((element) => ({
    left: parseFloat(element.style.left) / 100,
    top: parseFloat(element.style.top) / 100,
    width: parseFloat(element.style.width) / 100,
  }));
  assert(
    Math.abs(initialBubbleStyle.left - movedBubbleStyle.left) > 0.01 ||
      Math.abs(initialBubbleStyle.top - movedBubbleStyle.top) > 0.01,
    "Dragging the webcam bubble did not change its position.",
  );
  await page.locator(".recording-dot.is-live").waitFor({ timeout: 9000 });
  await page.waitForTimeout(1400);
  await page.getByRole("button", { name: "Pause" }).click();
  await page.waitForFunction(() => document.body.textContent?.includes("Paused"), {
    timeout: 3000,
  });
  await page.getByRole("button", { name: "Resume" }).click();
  await page.waitForTimeout(1200);
  await page.keyboard.press("Escape");
  await page.waitForSelector("video.recorded-preview[src^='blob:']", { timeout: 12000 });

  const [webmDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download WebM backup" }).click(),
  ]);
  const webmPath = join(downloadDir, webmDownload.suggestedFilename());
  await webmDownload.saveAs(webmPath);
  assert(
    webmDownload
      .suggestedFilename()
      .includes("qa-prospect-acme-and-co-david-walsh-essential-resourcing-video"),
    `Unexpected WebM filename: ${webmDownload.suggestedFilename()}`,
  );

  const webmStats = await stat(webmPath);
  assert(webmStats.size > 20_000, "Downloaded WebM is unexpectedly small.");
  const webmProbe = await ffprobeJson(webmPath);
  assert(
    webmProbe.streams.some((stream) => stream.codec_type === "video"),
    "WebM does not contain a video stream.",
  );
  assert(
    webmProbe.streams.some((stream) => stream.codec_type === "audio"),
    "WebM does not contain an audio stream.",
  );

  const finalVideoHasWebcamBubble = await frameContainsWebcamColours(webmPath);
  assert(
    finalVideoHasWebcamBubble,
    "Final WebM frame did not contain the fake webcam bubble colours.",
  );

  await page.getByRole("button", { name: "Convert to MP4" }).click();
  await page.waitForFunction(
    () => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.some(
        (button) => button.textContent?.includes("Download MP4") && !button.disabled,
      );
    },
    { timeout: 30000 },
  );

  const [mp4Download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download MP4" }).click(),
  ]);
  const mp4Path = join(downloadDir, mp4Download.suggestedFilename());
  await mp4Download.saveAs(mp4Path);
  const mp4Probe = await ffprobeJson(mp4Path);
  assert(
    mp4Probe.streams.some(
      (stream) => stream.codec_type === "video" && stream.codec_name === "h264",
    ),
    "MP4 does not contain H.264 video.",
  );
  assert(
    mp4Probe.streams.some(
      (stream) => stream.codec_type === "audio" && stream.codec_name === "aac",
    ),
    "MP4 does not contain AAC audio.",
  );

  const [pageDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download branded landing page" }).click(),
  ]);
  const landingPath = join(downloadDir, pageDownload.suggestedFilename());
  await pageDownload.saveAs(landingPath);
  const landingHtml = await readFile(landingPath, "utf8");
  assert(landingHtml.includes("data:video/mp4"), "Landing page did not embed the MP4.");
  assert(landingHtml.includes("noindex,nofollow"), "Landing page is missing noindex.");

  await page.getByRole("button", { name: "Save local activity note" }).click();
  await page.waitForFunction(() => document.body.textContent?.includes("QA Prospect"), {
    timeout: 3000,
  });

  const hiddenWebcamPath = await runHiddenWebcamPath(page, downloadDir);
  const importedMp4Path = await runImportedWebmPath(page, downloadDir, webmPath);

  const desktopOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  assert(!desktopOverflow, "Desktop layout has horizontal overflow.");

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  assert(!mobileOverflow, "Mobile layout has horizontal overflow.");

  const seriousMessages = consoleMessages.filter(
    (message) =>
      !message.includes("Download the React DevTools") &&
      !message.includes("[vite]"),
  );
  assert(seriousMessages.length === 0, `Console errors found: ${seriousMessages.join("\n")}`);

  await context.close();
  return { webmPath, mp4Path, landingPath, hiddenWebcamPath, importedMp4Path };
}

async function runHiddenWebcamPath(page, downloadDir) {
  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByPlaceholder("e.g. Sarah Thompson").fill("Ava O'Neil / Test");
  await page.getByPlaceholder("e.g. Northstar Digital").fill("Acme & Sons, Ltd.");
  await page.getByPlaceholder("e.g. CMO").fill("CEO/Founder");

  const webcamToggle = page
    .locator("label.toggle-row")
    .filter({ hasText: "Webcam bubble" })
    .locator("input");
  await webcamToggle.uncheck();

  await page.getByRole("button", { name: "Start recording" }).click();
  await page.locator(".recording-dot.is-live").waitFor({ timeout: 9000 });
  assert(
    (await page.locator(".bubble-handle").count()) === 0,
    "Webcam bubble handle was visible while webcam bubble was disabled.",
  );
  await page.waitForTimeout(2200);
  await page.locator(".controls").getByRole("button", { name: "Stop" }).click();
  await page.waitForSelector("video.recorded-preview[src^='blob:']", { timeout: 12000 });

  const [hiddenDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download WebM backup" }).click(),
  ]);
  const hiddenWebcamPath = join(downloadDir, hiddenDownload.suggestedFilename());
  await hiddenDownload.saveAs(hiddenWebcamPath);
  assert(
    hiddenDownload
      .suggestedFilename()
      .includes("ava-o-neil-test-acme-and-sons-ltd-david-walsh-essential-resourcing-video"),
    `Unexpected hidden-webcam filename: ${hiddenDownload.suggestedFilename()}`,
  );

  const probe = await ffprobeJson(hiddenWebcamPath);
  assert(
    probe.streams.some((stream) => stream.codec_type === "video"),
    "Hidden-webcam WebM does not contain a video stream.",
  );
  assert(
    probe.streams.some((stream) => stream.codec_type === "audio"),
    "Hidden-webcam WebM does not contain an audio stream.",
  );
  assert(
    !(await frameContainsWebcamColours(hiddenWebcamPath)),
    "Hidden-webcam recording still contained the fake webcam bubble colours.",
  );

  return hiddenWebcamPath;
}

async function expectDisabledStartUntilProspect(page) {
  const startButton = page.getByRole("button", { name: "Start recording" });
  assert(await startButton.isDisabled(), "Start recording should be disabled until prospect name is filled.");
  await page.getByPlaceholder("e.g. Sarah Thompson").fill("Temporary Name");
  assert(!(await startButton.isDisabled()), "Start recording should be enabled after prospect name is filled.");
  await page.getByPlaceholder("e.g. Sarah Thompson").fill("");
  assert(await startButton.isDisabled(), "Start recording should be disabled again when prospect name is cleared.");
}

async function runImportedWebmPath(page, downloadDir, webmPath) {
  await page.getByRole("button", { name: "Reset" }).click();
  await page.locator('input[type="file"][accept*="webm"]').setInputFiles(webmPath);
  await page.waitForSelector("video.recorded-preview[src^='blob:']", { timeout: 7000 });
  await page.waitForFunction(() => document.body.textContent?.includes("Loaded: qa-prospect"), {
    timeout: 3000,
  });

  await page.getByRole("button", { name: "Convert to MP4" }).click();
  await page.waitForFunction(
    () => {
      const buttons = Array.from(document.querySelectorAll("button"));
      return buttons.some(
        (button) => button.textContent?.includes("Download MP4") && !button.disabled,
      );
    },
    { timeout: 30000 },
  );

  const [importedMp4Download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download MP4" }).click(),
  ]);
  const importedMp4Path = join(downloadDir, importedMp4Download.suggestedFilename());
  await importedMp4Download.saveAs(importedMp4Path);
  assert(
    importedMp4Download.suggestedFilename().endsWith(".mp4"),
    `Imported WebM MP4 filename was wrong: ${importedMp4Download.suggestedFilename()}`,
  );

  const mp4Probe = await ffprobeJson(importedMp4Path);
  assert(
    mp4Probe.streams.some(
      (stream) => stream.codec_type === "video" && stream.codec_name === "h264",
    ),
    "Imported WebM MP4 does not contain H.264 video.",
  );
  assert(
    mp4Probe.streams.some(
      (stream) => stream.codec_type === "audio" && stream.codec_name === "aac",
    ),
    "Imported WebM MP4 does not contain AAC audio.",
  );

  return importedMp4Path;
}

async function runPermissionDeniedPath(browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();
  await installFakeMedia(page, { denyUserMedia: true });
  await page.goto(BASE_URL, { waitUntil: "load" });
  await page.getByPlaceholder("e.g. Sarah Thompson").fill("Permission Test");
  await page.getByRole("button", { name: "Start recording" }).click();
  await page.waitForSelector(".error-box", { timeout: 7000 });
  const errorText = await page.locator(".error-box").textContent();
  assert(
    errorText?.includes("Permission was denied"),
    `Permission denial message was not clear: ${errorText}`,
  );
  const stoppedTracks = await page.evaluate(() => window.__qaStoppedTracks || 0);
  assert(
    stoppedTracks > 0,
    "Screen stream was not cleaned up after camera/microphone permission denial.",
  );
  await context.close();
}

async function main() {
  const downloadDir = await mkdtemp(join(tmpdir(), "outreach-recorder-qa-"));
  let browser;
  const vite = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["vite", "--host", "127.0.0.1", "--port", String(PORT), "--strictPort"],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, BROWSER: "none" },
    },
  );

  let viteOutput = "";
  vite.stdout.on("data", (chunk) => {
    viteOutput += chunk.toString();
  });
  vite.stderr.on("data", (chunk) => {
    viteOutput += chunk.toString();
  });

  try {
    await waitForServer(`${BASE_URL}/api/ffmpeg-status`);
    const status = await fetch(`${BASE_URL}/api/ffmpeg-status`).then((response) =>
      response.json(),
    );
    assert(status.available, "ffmpeg is not available to the local converter.");

    const badConversion = await fetch(`${BASE_URL}/api/convert-to-mp4`, {
      method: "POST",
      headers: { "Content-Type": "video/webm" },
      body: new Blob(["not a real webm"], { type: "video/webm" }),
    });
    assert(!badConversion.ok, "Invalid WebM conversion unexpectedly succeeded.");
    const badConversionBody = await badConversion.json();
    assert(
      String(badConversionBody.message || "").includes("MP4 conversion failed"),
      "Invalid WebM conversion did not return a clear failure message.",
    );

    browser = await chromium.launch({
      headless: true,
      args: ["--autoplay-policy=no-user-gesture-required"],
    });

    const happyPath = await runHappyPath(browser, downloadDir);
    await runPermissionDeniedPath(browser);
    await browser.close();
    browser = undefined;

    console.log(
      JSON.stringify(
        {
          ok: true,
          downloads: happyPath,
          artifactsKept: process.env.KEEP_QA_ARTIFACTS === "1",
          ffmpeg: status.version,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(viteOutput);
    throw error;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    vite.kill("SIGTERM");
    if (process.env.KEEP_QA_ARTIFACTS !== "1") {
      await rm(downloadDir, { recursive: true, force: true });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
