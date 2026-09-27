import { describe, expect, it, vi } from "vitest";
import { salaryTables } from "@/lib/salary-guide-2026-tables";
import {
  salaryGuideInsight,
  salaryGuidePath,
  salaryGuideFaqs,
  salaryEditorial,
} from "@/lib/salary-guide-2026";
import { insights } from "@/lib/content";
import sitemap from "../../../app/sitemap";

vi.mock("server-only", () => ({}));

describe("public 2026 salary guide", () => {
  it("retains the 87 approved salary entries across ten navigable groups", () => {
    expect(salaryTables).toHaveLength(10);
    expect(salaryTables.flatMap((table) => table.rows)).toHaveLength(87);
    expect(new Set(salaryTables.map((table) => table.id)).size).toBe(10);
    for (const table of salaryTables) {
      for (const row of table.rows) {
        expect(row).toHaveLength(table.headers.length);
        const values = row
          .slice(-3)
          .map((value) => Number(value.replace(/[^0-9.]/g, "")));
        expect(values.every((value) => value > 0)).toBe(true);
        expect(values[0]).toBeLessThanOrEqual(values[1]);
        expect(values[1]).toBeLessThanOrEqual(values[2]);
      }
    }
  });
  it("makes the approved leadership ranges the first salary category", () => {
    expect(salaryTables[0].id).toBe("marketing-leadership");
    expect(salaryTables[0].rows).toEqual([
      ["Head of Marketing", "£60,000", "£75,000", "£100,000"],
      ["Marketing Director", "£75,000", "£95,000", "£125,000"],
      ["Group Marketing Director", "£90,000", "£110,000", "£140,000"],
      ["VP Marketing", "£100,000", "£125,000", "£160,000"],
      ["Chief Marketing Officer (CMO)", "£110,000", "£140,000", "£180,000"],
      ["Group / International CMO", "£140,000", "£175,000", "£225,000+"],
    ]);

    const clientSideRows = salaryTables.find(
      (table) => table.id === "client-side-marketing",
    )!.rows;
    expect(
      clientSideRows.some((row) =>
        ["Head of Marketing", "Marketing Director", "CMO"].includes(row[0]),
      ),
    ).toBe(false);
  });
  it("uses the approved leadership figures in the standalone FAQs", () => {
    const answerFor = (question: string) =>
      salaryGuideFaqs.find((faq) => faq.question === question)?.answer;

    expect(
      answerFor("What should a Head of Marketing earn in Manchester?"),
    ).toContain("£60,000–£100,000");
    expect(
      answerFor(
        "What does a Marketing Director earn in Manchester and the North West?",
      ),
    ).toContain("£75,000–£125,000");
    expect(answerFor("What does a CMO earn in Manchester?")).toContain(
      "£110,000–£180,000",
    );
    expect(answerFor("What does a CMO earn in Manchester?")).toContain(
      "£140,000 as the Typical planning point",
    );
  });
  it("includes the expanded eCommerce planning ranges", () => {
    const rows = salaryTables.find((table) => table.id === "ecommerce")!.rows;
    expect(rows).toHaveLength(8);
    expect(rows.find((row) => row[0] === "eCommerce Executive")).toEqual([
      "eCommerce Executive",
      "£27,000",
      "£30,000",
      "£35,000",
    ]);
    expect(rows.find((row) => row[0] === "eCommerce Director")).toEqual([
      "eCommerce Director",
      "£70,000",
      "£90,000",
      "£120,000",
    ]);
  });
  it("keeps client-side and agency PR ranges distinct and ordered", () => {
    const clientSidePr = salaryTables.find(
      (table) => table.id === "pr-communications",
    )!;
    expect(clientSidePr.title).toBe(
      "Client-side PR, communications & analytics salaries",
    );
    expect(clientSidePr.rows.find((row) => row[0] === "PR Manager")).toEqual([
      "PR Manager",
      "£40,000",
      "£47,500",
      "£60,000",
    ]);

    const agencyRows = salaryTables.find(
      (table) => table.id === "agency",
    )!.rows;
    expect(agencyRows.find((row) => row[0] === "PR Account Manager")).toEqual([
      "PR Account Manager",
      "£32,000",
      "£35,000",
      "£40,000",
    ]);
    expect(
      agencyRows.findIndex((row) => row[0] === "Group Account Director"),
    ).toBeLessThan(
      agencyRows.findIndex((row) => row[0] === "Business Director"),
    );
  });
  it("omits Fractional Managing Partner without changing Fractional Agency MD", () => {
    const rows = salaryTables.find((table) => table.id === "fractional")!.rows;
    expect(rows.some((row) => row[0] === "Fractional Managing Partner")).toBe(
      false,
    );
    expect(rows.find((row) => row[0] === "Fractional Agency MD")).toEqual([
      "Fractional Agency MD",
      "Candidate day rate",
      "£700",
      "£900",
      "£1,200",
    ]);
  });
  it("makes advisory-only billing monthly and preserves its approved rates", () => {
    const row = salaryTables
      .find((table) => table.id === "fractional")!
      .rows.find((row) => row[1].includes("Advisory-only"));
    expect(row).toEqual([
      "Fractional CMO",
      "Advisory-only (per month)",
      "£3,000",
      "£4,000",
      "£5,000",
    ]);
  });
  it("uses the confirmed experience and keeps the guide public", () => {
    expect(salaryEditorial.methodology.content.join(" ")).toContain(
      "more than a decade’s experience recruiting in the market",
    );
    expect(salaryGuideInsight.status).toBe("published");
    expect(salaryGuideInsight.noIndex).toBe(false);
    expect(salaryGuideFaqs).toHaveLength(14);
    expect(
      insights.filter((item) => item.slug === salaryGuideInsight.slug),
    ).toHaveLength(1);
  });
  it("includes one canonical guide URL in the public sitemap", async () => {
    const entries = await sitemap();
    expect(
      entries.filter(
        (entry) =>
          entry.url === `https://essentialresourcing.co.uk${salaryGuidePath}`,
      ),
    ).toHaveLength(1);
  });
});
