export const salaryGuideHiringInterests = [
  "hiring_this_quarter",
  "hiring_this_year",
  "salary_benchmarking",
  "team_planning",
  "agency_growth",
  "just_researching",
] as const;

export type SalaryGuideHiringInterest =
  (typeof salaryGuideHiringInterests)[number];

export const salaryGuideHiringInterestLabels = {
  hiring_this_quarter: "Hiring this quarter",
  hiring_this_year: "Hiring this year",
  salary_benchmarking: "Salary benchmarking",
  team_planning: "Team planning",
  agency_growth: "Agency growth",
  just_researching: "Just researching",
} as const satisfies Record<SalaryGuideHiringInterest, string>;
