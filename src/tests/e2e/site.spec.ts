import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  expect(errors).toEqual([]);
});

test("homepage loads with accessible hero and navigation", async ({ page }) => {
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "No faff. No dickheads.",
    }),
  ).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);

  const servicesLink = page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Services", exact: true });

  if (!(await servicesLink.isVisible())) {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }

  await servicesLink.click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Marketing and comms hiring",
  );
});

test("mobile menu opens and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Open navigation" });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toHaveClass(/is-open/);
  await page.getByRole("link", { name: "Jobs" }).click();
  await expect(page).toHaveURL(/\/jobs$/);
});

test("contact form validates and returns a safe success state", async ({
  page,
}) => {
  await page.goto("/contact");

  const contactForm = page.locator("#contact-form form");

  await contactForm.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.locator("input:invalid, textarea:invalid")).not.toHaveCount(
    0,
  );

  await contactForm.locator('input[name="startedAt"]').evaluate((input) => {
    (input as HTMLInputElement).value = String(Date.now() - 5_000);
  });
  await contactForm.getByLabel("Name").fill("Phase Test");
  await contactForm.getByLabel("Email").fill("phase-test@example.com");
  await contactForm.getByLabel("Company").fill("Essential Resourcing");
  await contactForm
    .locator('textarea[name="message"]')
    .fill("I need help testing the enquiry flow before launch.");
  await contactForm.getByLabel(/I agree to be contacted/).check();
  await contactForm.getByRole("button", { name: "Send enquiry" }).click();

  await expect(contactForm.getByRole("status")).toContainText("validated");
  await expect(contactForm.getByRole("status")).not.toContainText(
    "phase-test@example.com",
  );
});

test("key public pages load", async ({ page }) => {
  const paths = [
    "/services/leadership-search",
    "/services/strategic-interim",
    "/jobs",
    "/jobs/senior-account-director-draft",
    "/insights/what-is-a-strategic-interim-marketing-leader",
    "/case-studies",
    "/salary-snapshots",
  ];

  for (const path of paths) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("key public pages have no obvious WCAG AA violations", async ({
  page,
}) => {
  const paths = [
    "/",
    "/services",
    "/services/leadership-search",
    "/clients",
    "/candidates",
    "/jobs",
    "/contact",
    "/cookie-policy",
    "/privacy-policy",
  ];

  for (const path of paths) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations, path).toEqual([]);
  }
});

test("search control routes respond and exclude private areas", async ({
  request,
}) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapXml = await sitemap.text();
  expect(sitemapXml).toContain("/services");
  expect(sitemapXml).not.toContain("/admin");
  expect(sitemapXml).not.toContain("/client/shortlist");
  expect(sitemapXml).not.toContain("/labs");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  const robotsTxt = await robots.text();
  expect(robotsTxt).toContain("Sitemap:");
  expect(robotsTxt).toContain("Disallow: /admin");
  expect(robotsTxt).toContain("Disallow: /api");
  expect(robotsTxt).toContain("Disallow: /candidate/");
  expect(robotsTxt).not.toContain("Disallow: /candidate\n");
});

test("common short launch URLs redirect to canonical pages", async ({
  request,
}) => {
  const redirects = [
    ["/about-david", "/about-david-walsh"],
    ["/strategic-interim", "/services/strategic-interim"],
    ["/leadership-search", "/services/leadership-search"],
    ["/marketing-recruitment", "/services/client-side-marketing-recruitment"],
    ["/privacy", "/privacy-policy"],
    ["/cookies", "/cookie-policy"],
  ];

  for (const [source, destination] of redirects) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(destination);
  }
});

test("404 page displays correctly", async ({ page }) => {
  await page.goto("/definitely-not-a-real-page");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "That page has gone missing.",
  );
  await expect(
    page.locator("#main").getByRole("link", { name: "Talk to David" }),
  ).toBeVisible();
});
