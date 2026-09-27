import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("performance and Core Web Vitals audit", () => {
  it("keeps the performance audit documented and linked", () => {
    const auditPath = "docs/PERFORMANCE-CORE-WEB-VITALS-AUDIT.md";
    const audit = readFileSync(auditPath, "utf8");
    const readme = readFileSync("README.md", "utf8");

    expect(existsSync(auditPath)).toBe(true);
    expect(readme).toContain(auditPath);
    expect(audit).toContain("## 1. Performance Summary");
    expect(audit).toContain("## 2. Core Web Vitals Risks");
    expect(audit).toContain("## 3. Image Optimisation Recommendations");
    expect(audit).toContain("## 4. Font Optimisation Recommendations");
    expect(audit).toContain("## 5. JavaScript And CSS Improvements");
    expect(audit).toContain("## 6. Mobile Performance Issues");
    expect(audit).toContain("## 7. Prioritised Fixes");
    expect(audit).toContain("## 8. Final Performance Checklist");
  });

  it("keeps high-impact performance safeguards in code", () => {
    const homePage = readFileSync("app/page.tsx", "utf8");
    const globalStyles = readFileSync("app/globals.css", "utf8");
    const nextConfig = readFileSync("next.config.ts", "utf8");
    const reveal = readFileSync("src/components/Reveal.tsx", "utf8");
    const heroVideo = readFileSync(
      "src/components/HomeHeroVideo.tsx",
      "utf8",
    );
    const budget = readFileSync("scripts/performance-budget.mjs", "utf8");

    expect(homePage).toContain('fetchPriority="high"');
    expect(homePage).toContain('decoding="async"');
    expect(homePage).toContain("homepage-hero-mobile-poster-v3.webp");
    expect(globalStyles).toContain("content-visibility: auto");
    expect(heroVideo).not.toContain('"pointermove"');
    expect(heroVideo).toContain("12000");
    expect(nextConfig).toContain('formats: ["image/avif", "image/webp"]');
    expect(nextConfig).toContain("minimumCacheTTL: 31536000");
    expect(nextConfig).toContain("inlineCss: true");
    expect(reveal).not.toContain('"use client"');
    expect(heroVideo).toContain('preload="none"');
    expect(heroVideo).toContain("prefers-reduced-motion: reduce");
    expect(heroVideo).toContain("connection?.saveData");
    expect(budget).toContain("const maxRouteGzipBytes = 80 * 1024");
    expect(budget).toContain("const maxUniquePublicGzipBytes = 120 * 1024");
  });
});
