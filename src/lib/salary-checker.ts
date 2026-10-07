import { salaryTables } from "./salary-guide-2026-tables";

export type CheckerRole = {
  id: string;
  title: string;
  section: string;
  sectionId: string;
  lower: number;
  typical: number;
  upper: number;
  upperOpen: boolean;
  labels: string[];
};

export const normaliseRoleSearch = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Derived from the rendered tables, never maintained as a second salary dataset.
export const checkerRoles: CheckerRole[] = salaryTables
  .filter((table) => table.id !== "fractional")
  .flatMap((table) =>
    table.rows.map((row) => {
      const labels = ["Lower", "Typical", "Upper"].map(
        (key) => row[table.headers.indexOf(key)],
      );
      const [lower, typical, upper] = labels.map((value) =>
        Number(value.replace(/[£,+]/g, "")),
      );
      if (
        ![lower, typical, upper].every(Number.isFinite) ||
        lower > typical ||
        typical > upper
      ) {
        throw new Error("Invalid approved salary planning points");
      }
      return {
        id: `${table.id}:${normaliseRoleSearch(row[0]).replaceAll(" ", "-")}`,
        title: row[0],
        section: table.title.replace(/ salaries$/i, ""),
        sectionId: table.id,
        lower,
        typical,
        upper,
        upperOpen: labels[2].endsWith("+"),
        labels,
      };
    }),
  );

export function searchCheckerRoles(query: string) {
  const terms = normaliseRoleSearch(query).split(" ").filter(Boolean);
  if (!terms.length) return checkerRoles;
  return checkerRoles.filter((role) => {
    const text = normaliseRoleSearch(`${role.title} ${role.section}`);
    return terms.every((term) => text.includes(term));
  });
}

export function parseAnnualSalary(input: string): number | null {
  const text = input.trim().replace(/^£\s*/, "");
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) return null;
  const value = Number(text.replaceAll(",", ""));
  return Number.isFinite(value) && value > 0 && value <= 100_000_000
    ? value
    : null;
}

export type ResultBand =
  | "below_lower"
  | "lower_to_typical"
  | "around_typical"
  | "typical_to_upper"
  | "above_upper";

export function salaryResultBand(
  role: CheckerRole,
  salary: number,
): ResultBand {
  // +/-5% is a plain-language UX tolerance, not a statistical interval.
  // Actual Lower/Upper boundaries take precedence, including at narrow ranges.
  if (salary < role.lower) return "below_lower";
  if (salary > role.upper) return "above_upper";
  if (Math.abs(salary - role.typical) <= role.typical * 0.05)
    return "around_typical";
  return salary < role.typical ? "lower_to_typical" : "typical_to_upper";
}

export const resultCopy: Record<ResultBand, { heading: string; text: string }> =
  {
    below_lower: {
      heading: "Below our Lower planning point",
      text: "That might be worth a closer look, but it doesn't automatically mean the salary is wrong. Scope, experience, location, hours and what you actually own all matter.",
    },
    lower_to_typical: {
      heading: "Between our Lower and Typical planning points",
      text: "That's within the planning range for this title, but where you sit depends on the actual scope, not just the title.",
    },
    around_typical: {
      heading: "Around our Typical planning point",
      text: "That's the middle planning point I'd use to start a salary conversation, not a claim that everybody with this title should earn exactly the same.",
    },
    typical_to_upper: {
      heading: "Between our Typical and Upper planning points",
      text: "That can make complete sense where the role carries broader scope, stronger experience, leadership or greater commercial responsibility.",
    },
    above_upper: {
      heading: "Above our Upper planning point",
      text: "That doesn't automatically mean you're being paid above market. Your job may simply be bigger than the title suggests. And frankly, marketing job titles are quite good at doing that.",
    },
  };

export function comparisonRoles(role: CheckerRole, salary: number) {
  // Overlapping ranges or Typical within 15% of input; closest Typical first.
  // Same discipline breaks equal-distance ties. Never fabricate 4 results if fewer qualify.
  return checkerRoles
    .filter(
      (candidate) =>
        candidate.id !== role.id &&
        ((salary >= candidate.lower && salary <= candidate.upper) ||
          Math.abs(candidate.typical - salary) <= salary * 0.15),
    )
    .sort(
      (a, b) =>
        Math.abs(a.typical - salary) - Math.abs(b.typical - salary) ||
        Number(b.sectionId === role.sectionId) -
          Number(a.sectionId === role.sectionId) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, 6);
}

export function salaryScale(role: CheckerRole, salary: number) {
  const min = Math.min(role.lower, salary);
  const max = Math.max(role.upper, salary);
  const padding = Math.max((max - min) * 0.08, 1000);
  const start = Math.max(0, min - padding);
  const end = max + padding;
  return {
    start,
    end,
    position: (value: number) => (100 * (value - start)) / (end - start),
  };
}

export const formatSalary = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
