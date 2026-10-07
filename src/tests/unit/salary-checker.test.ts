import { describe, expect, it } from "vitest";
import {
  checkerRoles,
  comparisonRoles,
  parseAnnualSalary,
  salaryResultBand,
  salaryScale,
  searchCheckerRoles,
} from "@/lib/salary-checker";
import { salaryTables } from "@/lib/salary-guide-2026-tables";

const manager = checkerRoles.find(
  (role) => role.title === "Marketing Manager",
)!;
describe("salary checker: approved data only", () => {
  it("derives every annual role and every label directly from the unchanged table source", () => {
    const annual = salaryTables.filter((table) => table.id !== "fractional");
    expect(checkerRoles).toHaveLength(
      annual.reduce((sum, table) => sum + table.rows.length, 0),
    );
    expect(new Set(checkerRoles.map((role) => role.id)).size).toBe(
      checkerRoles.length,
    );
    for (const table of annual)
      for (const row of table.rows) {
        const role = checkerRoles.find(
          (item) => item.sectionId === table.id && item.title === row[0],
        )!;
        expect(role.labels).toEqual(row.slice(1));
        expect(role.lower).toBeLessThanOrEqual(role.typical);
        expect(role.typical).toBeLessThanOrEqual(role.upper);
      }
    expect(checkerRoles.some((role) => role.sectionId === "fractional")).toBe(
      false,
    );
  });
  it.each([
    ["50000", 50000],
    ["50,000", 50000],
    ["£50,000", 50000],
    [" £50,000.50 ", 50000.5],
    ["1000000", 1000000],
    ["", null],
    ["0", null],
    ["-50000", null],
    ["50k", null],
    ["50,00", null],
    ["50 000", null],
    ["NaN", null],
    ["1e5", null],
    ["50.001", null],
    ["99999999999999999999", null],
    ["££50000", null],
    ["five", null],
  ])("parses %s safely", (input, expected) =>
    expect(parseAnnualSalary(input)).toBe(expected),
  );
  it.each([
    [39999, "below_lower"],
    [40000, "lower_to_typical"],
    [45000, "lower_to_typical"],
    [47500, "around_typical"],
    [50000, "around_typical"],
    [52500, "around_typical"],
    [52501, "typical_to_upper"],
    [60000, "typical_to_upper"],
    [65000, "typical_to_upper"],
    [65001, "above_upper"],
    [1000000, "above_upper"],
  ])("classifies %i without implying statistical rank", (salary, band) =>
    expect(salaryResultBand(manager, salary)).toBe(band),
  );
  it("preserves half-thousand values and the open upper qualification", () => {
    const product = checkerRoles.find(
      (role) => role.title === "Senior Product Marketing Manager",
    )!;
    expect(product.typical).toBe(72500);
    expect(salaryResultBand(product, 72500)).toBe("around_typical");
    const cmo = checkerRoles.find((role) => role.upperOpen)!;
    expect(cmo.labels[2]).toBe("£225,000+");
  });
  it("searches punctuation, case, combined-role aliases and context, without inventing roles", () => {
    expect(
      searchCheckerRoles(" paid SOCIAL ").some(
        (r) => r.title === "Paid Social Manager",
      ),
    ).toBe(true);
    expect(searchCheckerRoles("CMO").length).toBeGreaterThan(0);
    expect(searchCheckerRoles("account director").length).toBeGreaterThan(1);
    expect(searchCheckerRoles("not a real job zzzz")).toEqual([]);
  });
  it("returns deterministic, relevant comparisons, preserving sections and ranges", () => {
    const roles = comparisonRoles(manager, 50000);
    expect(roles.length).toBeGreaterThanOrEqual(4);
    expect(roles.length).toBeLessThanOrEqual(6);
    expect(roles).toEqual(comparisonRoles(manager, 50000));
    expect(
      roles.some((r) => r.id === manager.id || r.sectionId === "fractional"),
    ).toBe(false);
    expect(comparisonRoles(manager, 1000000)).toEqual([]);
    for (const role of roles) expect(checkerRoles).toContainEqual(role);
  });
  it.each([1, 40000, 50000, 65000, 1000000, 100000000])(
    "keeps all markers in a linear domain at %i",
    (salary) => {
      const scale = salaryScale(manager, salary);
      for (const number of [
        salary,
        manager.lower,
        manager.typical,
        manager.upper,
      ]) {
        expect(scale.position(number)).toBeGreaterThanOrEqual(0);
        expect(scale.position(number)).toBeLessThanOrEqual(100);
      }
      expect(scale.position(50000) - scale.position(40000)).toBeCloseTo(
        2 * (scale.position(65000) - scale.position(60000)),
        5,
      );
    },
  );
});
