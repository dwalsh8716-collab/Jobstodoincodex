import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "src/tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm start -- --hostname 127.0.0.1 --port 3100",
    env: {
      CONTACT_FROM_EMAIL: "",
      CONTACT_TO_EMAIL: "",
      RESEND_API_KEY: "",
      WHATSAPP_BUSINESS_ENABLED: "false",
    },
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
