import { writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const baseUrl = "https://essentialresourcing.co.uk";
const outputPath = "docs/LEGAL-PRIVACY-COPY-DECK.md";
const legalPages = [
  { name: "Privacy Policy", path: "/privacy-policy" },
  { name: "Candidate Privacy Notice", path: "/candidate-privacy" },
  { name: "Cookie Policy", path: "/cookie-policy" },
  { name: "Terms of Website Use", path: "/terms" },
];

function clean(value = "") {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function fence(value) {
  return `\`\`\`text\n${clean(value)}\n\`\`\``;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "en-GB" });
const page = await context.newPage();
const exported = [];

try {
  for (const legalPage of legalPages) {
    const url = `${baseUrl}${legalPage.path}`;
    await page.goto(url, { waitUntil: "networkidle" });

    const copy = await page.evaluate(() => ({
      title: document.title,
      description:
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "",
      canonical:
        document.querySelector('link[rel="canonical"]')?.getAttribute("href") ||
        "",
      headings: Array.from(document.querySelectorAll("main h1, main h2, main h3"))
        .map((heading) => ({
          level: heading.tagName.toUpperCase(),
          text: heading.textContent?.trim() || "",
        }))
        .filter((heading) => heading.text),
      body: document.querySelector("main")?.innerText || "",
    }));

    exported.push({ ...legalPage, url, copy });
  }
} finally {
  await browser.close();
}

const lines = [
  "# Essential Resourcing Legal And Privacy Copy Deck",
  "",
  "Prepared for manual legal and copy review.",
  "",
  "Last exported from the live website: 22 September 2026.",
  "",
  "## Review Notes",
  "",
  "- This document contains only the four public legal and privacy pages requested.",
  "- Edit the wording beneath each page heading while keeping the route and page name intact.",
  "- Any change to legal identity, address, ICO registration, retention or regulatory status should be checked against the operational facts before publication.",
  "- This is a practical copy-review document, not a substitute for advice from a qualified UK solicitor.",
  "",
  "---",
  "",
];

for (const [index, item] of exported.entries()) {
  lines.push(`## ${index + 1}. ${item.name}`);
  lines.push("");
  lines.push(`**Route:** \`${item.path}\``);
  lines.push("");
  lines.push(`**Live page:** ${item.url}`);
  lines.push("");
  lines.push("### SEO Copy");
  lines.push("");
  lines.push(`- **Title:** ${clean(item.copy.title)}`);
  lines.push(`- **Meta description:** ${clean(item.copy.description)}`);
  lines.push(`- **Canonical:** ${clean(item.copy.canonical || item.url)}`);
  lines.push("");
  lines.push("### Heading Structure");
  lines.push("");
  for (const heading of item.copy.headings) {
    lines.push(`- **${heading.level}:** ${clean(heading.text)}`);
  }
  lines.push("");
  lines.push("### Published Copy");
  lines.push("");
  lines.push(fence(item.copy.body));
  lines.push("");
  lines.push("---");
  lines.push("");
}

await writeFile(outputPath, `${lines.join("\n").trim()}\n`, "utf8");
process.stdout.write(`Wrote ${outputPath} with ${exported.length} legal pages.\n`);
