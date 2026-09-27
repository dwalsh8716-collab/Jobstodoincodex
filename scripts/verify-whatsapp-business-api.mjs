import { existsSync, readFileSync } from "node:fs";

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split("=");
    return [key, rest.join("=") || "true"];
  }),
);

loadEnvFile(".env");
loadEnvFile(".env.local");

const apiVersion = env("WHATSAPP_BUSINESS_API_VERSION") || "v23.0";
const enabled = env("WHATSAPP_BUSINESS_ENABLED") === "true";
const phoneNumberId = env("WHATSAPP_BUSINESS_PHONE_NUMBER_ID");
const accessToken = env("WHATSAPP_BUSINESS_ACCESS_TOKEN");
const verifyToken = env("WHATSAPP_BUSINESS_VERIFY_TOKEN");
const appSecret = env("WHATSAPP_BUSINESS_APP_SECRET");
const requireLive = args.has("--require-live");
const testTo = args.get("--send-test-to") || env("WHATSAPP_TEST_TO");
const testTemplate =
  args.get("--template") ||
  env("WHATSAPP_TEST_TEMPLATE") ||
  env("WHATSAPP_BUSINESS_DEFAULT_TEMPLATE") ||
  "hello_world";
const templateLanguage =
  args.get("--language") || env("WHATSAPP_BUSINESS_TEMPLATE_LANGUAGE") || "en_GB";

const missing = [
  ["WHATSAPP_BUSINESS_ENABLED", enabled ? "true" : undefined],
  ["WHATSAPP_BUSINESS_PHONE_NUMBER_ID", phoneNumberId],
  ["WHATSAPP_BUSINESS_ACCESS_TOKEN", accessToken],
  ["WHATSAPP_BUSINESS_VERIFY_TOKEN", verifyToken],
  ["WHATSAPP_BUSINESS_APP_SECRET", appSecret],
].filter(([, value]) => !value);

console.log("WhatsApp Business API verification");
console.log(`API version: ${apiVersion}`);
console.log(`Enabled: ${enabled ? "yes" : "no"}`);
console.log(`Phone number ID: ${phoneNumberId ? "set" : "missing"}`);
console.log(`Access token: ${accessToken ? "set" : "missing"}`);
console.log(`Webhook verify token: ${verifyToken ? "set" : "missing"}`);
console.log(`App secret: ${appSecret ? "set" : "missing"}`);

if (missing.length > 0) {
  console.log("");
  console.log("Not live yet. Missing:");
  for (const [name] of missing) console.log(`- ${name}`);
  console.log("");
  console.log(
    "Add those values in Railway before enabling WhatsApp Business API sends.",
  );
  process.exitCode = requireLive ? 1 : 0;
  process.exit();
}

const phoneUrl = new URL(
  `https://graph.facebook.com/${apiVersion}/${phoneNumberId}`,
);
phoneUrl.searchParams.set(
  "fields",
  "id,display_phone_number,verified_name,quality_rating",
);
phoneUrl.searchParams.set("access_token", accessToken);

const phoneResponse = await fetch(phoneUrl, {
  signal: AbortSignal.timeout(15_000),
});
const phoneText = await phoneResponse.text();

console.log("");
console.log(`Meta phone-number check: ${phoneResponse.status}`);

if (!phoneResponse.ok) {
  printMetaError(phoneText);
  process.exit(1);
}

const phoneData = JSON.parse(phoneText);
console.log(`Verified name: ${phoneData.verified_name || "not returned"}`);
console.log(`Display number: ${phoneData.display_phone_number || "not returned"}`);
console.log(`Quality rating: ${phoneData.quality_rating || "not returned"}`);

if (!testTo) {
  console.log("");
  console.log(
    "No test message sent. Add --send-test-to=447700900000 to send an explicit template test.",
  );
  process.exit(0);
}

const sendResponse = await fetch(
  `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalisePhone(testTo),
      type: "template",
      template: {
        name: testTemplate,
        language: { code: templateLanguage },
      },
    }),
    signal: AbortSignal.timeout(15_000),
  },
);

const sendText = await sendResponse.text();
console.log("");
console.log(`Meta test send: ${sendResponse.status}`);

if (!sendResponse.ok) {
  printMetaError(sendText);
  process.exit(1);
}

const sendData = JSON.parse(sendText);
const messageId = sendData.messages?.[0]?.id;
console.log(`Test template accepted: ${messageId ? "yes" : "accepted"}`);
if (messageId) console.log(`Message ID: ${messageId}`);

function env(name) {
  return process.env[name]?.trim();
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;

  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function normalisePhone(value) {
  return value.replace(/[^\d]/g, "");
}

function printMetaError(text) {
  try {
    const parsed = JSON.parse(text);
    const message = parsed.error?.message || "Meta returned an error.";
    const code = parsed.error?.code ? ` code ${parsed.error.code}` : "";
    const type = parsed.error?.type ? ` (${parsed.error.type})` : "";
    console.log(`Meta error${code}${type}: ${message}`);
  } catch {
    console.log(text.slice(0, 500));
  }
}
