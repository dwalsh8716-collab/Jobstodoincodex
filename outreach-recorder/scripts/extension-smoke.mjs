import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const extensionPath = resolve("chrome-extension");
const userDataDir = await mkdtemp(join(tmpdir(), "er-video-outreach-extension-"));
const headed = process.env.EXTENSION_SMOKE_HEADED === "1";

const launch = async (channel) =>
  chromium.launchPersistentContext(userDataDir, {
    channel,
    headless: !headed,
    ignoreDefaultArgs: ["--disable-extensions"],
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

const launchChrome = async () => {
  try {
    return await launch(undefined);
  } catch {
    return launch("chrome");
  }
};

const readExtensionIdFromProfile = async () => {
  let securePreferences;
  try {
    securePreferences = JSON.parse(
      await readFile(join(userDataDir, "Default", "Secure Preferences"), "utf8")
    );
  } catch {
    return null;
  }

  const settings = securePreferences.extensions?.settings || {};
  const match = Object.entries(settings).find(([, value]) => {
    return value?.path === extensionPath || value?.manifest?.name === "Essential Resourcing Video Outreach";
  });

  return match?.[0] || null;
};

const getExtensionId = async (context) => {
  const [worker] = context.serviceWorkers();
  if (worker) {
    return new URL(worker.url()).hostname;
  }

  try {
    const startedWorker = await context.waitForEvent("serviceworker", { timeout: 5000 });
    return new URL(startedWorker.url()).hostname;
  } catch {
    return null;
  }
};

let context;
try {
  context = await launchChrome();

  let extensionId = await getExtensionId(context);
  if (!extensionId) {
    await context.close();
    context = null;
    extensionId = await readExtensionIdFromProfile();
  }

  if (!extensionId) {
    if (!headed) {
      console.log(
        JSON.stringify(
          {
            ok: true,
            skipped: true,
            reason: "Headless Chrome did not register the unpacked extension. Run with EXTENSION_SMOKE_HEADED=1 for a headed Chrome extension smoke test."
          },
          null,
          2
        )
      );
    } else {
      throw new Error("Chrome did not register the unpacked extension.");
    }
  } else {

  context = context || (await launchChrome());
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  const title = await page.locator("h1").textContent({ timeout: 5000 });
  if (title?.trim() !== "Video Outreach") {
    throw new Error("Extension popup did not render the expected heading.");
  }

  const startButton = page.locator("#startButton");
  if ((await startButton.textContent())?.trim() !== "Start on this tab") {
    throw new Error("Extension popup did not render the start button.");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        extensionId,
        popup: "loaded",
        headed
      },
      null,
      2
    )
  );
  }
} finally {
  await context?.close().catch(() => {});
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
}
