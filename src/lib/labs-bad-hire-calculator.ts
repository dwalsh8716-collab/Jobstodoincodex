import "server-only";

import type { OperationsBackendStatus } from "./operations/types";

type LabsBadHireEnv = Record<string, string | undefined>;

export const labsBadHireCalculatorFeatureFlag = "FEATURE_BAD_HIRE_CALCULATOR";
export const labsBadHireCalculatorAdminRoute =
  "/admin/labs/bad-hire-calculator";

export const labsBadHireCalculatorInputs = [
  "role salary or interim rate",
  "seniority",
  "time to hire",
  "time in role before failure",
  "management time wasted",
  "recruitment cost",
  "lost revenue or opportunity",
  "team disruption",
  "agency/client impact",
  "interim gap cover",
  "delayed campaign or commercial impact",
  "replacement hiring time",
] as const;

export const labsBadHireCalculatorOutputs = [
  "conservative estimate",
  "realistic estimate",
  "high-risk estimate",
  "hidden costs breakdown",
  "recommended action",
  "CTA to sense-check the brief",
] as const;

export const labsBadHireCalculatorAssumptions = {
  currency: "GBP",
  workingDaysPerYear: 260,
  recruitmentFeeRate: 0.22,
  directRecruitmentCostFallback: 7500,
  productivityLossRate: 0.45,
  managementDayCost: 650,
  vacancyCostMultiplier: 0.35,
  teamDisruptionRate: 0.08,
  agencyClientImpactRate: 0.06,
  opportunityCostMultiplier: 0.5,
  interimDayRate: 700,
  replacementSearchWeeks: 8,
  scenarioMultipliers: {
    conservative: 0.7,
    realistic: 1,
    highRisk: 1.45,
  },
  sourceNotes: [
    "CIPD reports recruitment-cost benchmarks, but these are broad medians rather than senior-marketing-specific truth.",
    "Oxford Economics/Unum modelled replacement cost as recruitment/logistical cost plus lost output while the replacement reaches optimal productivity.",
    "SHRM benchmarking gives useful cost-per-hire context, including higher executive-hire costs, but it is US data and must be caveated for UK use.",
  ],
} as const;

export const labsBadHireCalculatorExampleInput = {
  roleTitle: "Senior marketing leader",
  salary: 90000,
  seniority: "Senior leadership",
  timeToHireWeeks: 8,
  timeInRoleBeforeFailureMonths: 6,
  managementDaysWasted: 12,
  recruitmentCost: 0,
  lostOpportunityEstimate: 25000,
  interimCoverDays: 30,
  delayedImpactMonths: 3,
} as const;

type BadHireCalculatorInput = typeof labsBadHireCalculatorExampleInput;
type ScenarioName = "conservative" | "realistic" | "highRisk";

type CostBreakdown = {
  recruitment: number;
  failedProductivity: number;
  managementTime: number;
  vacancyDrag: number;
  teamDisruption: number;
  agencyClientImpact: number;
  interimCover: number;
  delayedOpportunity: number;
  replacementSearch: number;
};

export type BadHireScenario = {
  name: ScenarioName;
  label: string;
  total: number;
  breakdown: CostBreakdown;
  recommendation: string;
};

function operationsStatusFromEnv(
  env: LabsBadHireEnv = process.env,
): OperationsBackendStatus {
  const enabled = env.OPERATIONS_DB_ENABLED === "true";
  const configured = Boolean(env.DATABASE_URL);

  if (!enabled) {
    return {
      enabled,
      configured,
      state: "disabled",
      message:
        "Private operations database is staged but not enabled. Bad-hire leads and editable assumptions cannot be saved yet.",
    };
  }

  if (!configured) {
    return {
      enabled,
      configured,
      state: "missing_database_url",
      message: "OPERATIONS_DB_ENABLED is true, but DATABASE_URL is missing.",
    };
  }

  return {
    enabled,
    configured,
    state: "ready",
    message: "Private operations database is configured.",
  };
}

function roundCurrency(value: number) {
  return Math.round(value / 100) * 100;
}

function scaleBreakdown(breakdown: CostBreakdown, multiplier: number) {
  return Object.fromEntries(
    Object.entries(breakdown).map(([key, value]) => [
      key,
      roundCurrency(value * multiplier),
    ]),
  ) as CostBreakdown;
}

function totalBreakdown(breakdown: CostBreakdown) {
  return Object.values(breakdown).reduce((total, value) => total + value, 0);
}

export function calculateBadHireCost(
  input: BadHireCalculatorInput = labsBadHireCalculatorExampleInput,
) {
  const assumptions = labsBadHireCalculatorAssumptions;
  const dailySalaryCost = input.salary / assumptions.workingDaysPerYear;
  const monthlySalaryCost = input.salary / 12;
  const recruitment =
    input.recruitmentCost > 0
      ? input.recruitmentCost
      : Math.max(
          input.salary * assumptions.recruitmentFeeRate,
          assumptions.directRecruitmentCostFallback,
        );

  const baseBreakdown: CostBreakdown = {
    recruitment,
    failedProductivity:
      monthlySalaryCost *
      input.timeInRoleBeforeFailureMonths *
      assumptions.productivityLossRate,
    managementTime: input.managementDaysWasted * assumptions.managementDayCost,
    vacancyDrag:
      dailySalaryCost *
      input.timeToHireWeeks *
      5 *
      assumptions.vacancyCostMultiplier,
    teamDisruption: input.salary * assumptions.teamDisruptionRate,
    agencyClientImpact: input.salary * assumptions.agencyClientImpactRate,
    interimCover: input.interimCoverDays * assumptions.interimDayRate,
    delayedOpportunity:
      input.lostOpportunityEstimate +
      monthlySalaryCost *
        input.delayedImpactMonths *
        assumptions.opportunityCostMultiplier,
    replacementSearch:
      dailySalaryCost *
      assumptions.replacementSearchWeeks *
      5 *
      assumptions.vacancyCostMultiplier,
  };

  const scenarioInputs = [
    {
      name: "conservative",
      label: "Conservative estimate",
      breakdown: scaleBreakdown(
        baseBreakdown,
        assumptions.scenarioMultipliers.conservative,
      ),
      recommendation:
        "Sense-check the must-haves before the brief reaches the market.",
    },
    {
      name: "realistic",
      label: "Realistic estimate",
      breakdown: scaleBreakdown(
        baseBreakdown,
        assumptions.scenarioMultipliers.realistic,
      ),
      recommendation:
        "Tighten the role, search criteria and decision process before hiring again.",
    },
    {
      name: "highRisk",
      label: "High-risk estimate",
      breakdown: scaleBreakdown(
        baseBreakdown,
        assumptions.scenarioMultipliers.highRisk,
      ),
      recommendation:
        "Pause and rebuild the brief with David before spending more time or money.",
    },
  ] satisfies Array<Omit<BadHireScenario, "total">>;

  const scenarios: BadHireScenario[] = scenarioInputs.map((scenario) => ({
    ...scenario,
    total: totalBreakdown(scenario.breakdown),
  }));

  return {
    input,
    assumptions,
    scenarios,
    caveat:
      "These are directional estimates for a conversation. They are not financial advice.",
  };
}

export function getLabsBadHireCalculatorStatus(
  env: LabsBadHireEnv = process.env,
) {
  const featureEnabled = env[labsBadHireCalculatorFeatureFlag] === "true";
  const databaseStatus = operationsStatusFromEnv(env);

  return {
    featureFlag: labsBadHireCalculatorFeatureFlag,
    featureEnabled,
    adminRoute: labsBadHireCalculatorAdminRoute,
    noIndex: true,
    databaseStatus,
    canStoreLeads:
      featureEnabled &&
      databaseStatus.enabled &&
      databaseStatus.configured &&
      databaseStatus.state === "ready",
    readyForPublicLaunch: false,
  };
}

export function getLabsBadHireCalculatorPreview(
  env: LabsBadHireEnv = process.env,
) {
  return {
    status: getLabsBadHireCalculatorStatus(env),
    inputs: labsBadHireCalculatorInputs,
    outputs: labsBadHireCalculatorOutputs,
    result: calculateBadHireCost(),
    cta: "Sense-check the brief with David",
    leadCaptureActions: [
      "Email me the results",
      "WhatsApp David",
      "Book a 15-minute call",
      "Sense-check the brief",
    ],
  };
}
