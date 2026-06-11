import "server-only";

export const labsStatuses = [
  "idea",
  "researching",
  "scoped",
  "in_build",
  "private_preview",
  "ready_to_launch",
  "launched",
  "parked",
  "rejected",
] as const;

export const labsFeatureFlagDefinitions = [
  {
    name: "FEATURE_LABS_ENABLED",
    label: "Labs admin planning",
    description:
      "Shows the protected Labs planning surface. It does not publish any public feature.",
  },
  {
    name: "FEATURE_SALARY_GUIDE_GATE",
    label: "Gated salary guides",
    description: "Future B2B lead-capture flow for downloadable salary guides.",
  },
  {
    name: "FEATURE_SALARY_BENCHMARK_ASSET",
    label: "Salary benchmark asset builder",
    description:
      "Future bespoke salary benchmarking asset for client conversations.",
  },
  {
    name: "FEATURE_MARKET_MAPPING",
    label: "Market mapping visuals",
    description:
      "Future visual map of search reach, talent pools and market coverage.",
  },
  {
    name: "FEATURE_BAD_HIRE_CALCULATOR",
    label: "Bad hire calculator",
    description:
      "Future commercial calculator for the cost of poor senior hiring.",
  },
  {
    name: "FEATURE_FUNCTIONAL_MATRIX",
    label: "Functional matrix",
    description:
      "Future role requirement and search-shape mapping for client briefs.",
  },
  {
    name: "FEATURE_CLIENT_SHORTLIST_PORTAL",
    label: "Client shortlist portal",
    description:
      "Future protected client presentation and feedback experience.",
  },
  {
    name: "FEATURE_AI_BRIEF_BUILDER",
    label: "AI brief builder",
    description:
      "Future AI-assisted job brief draft tool with David review before use.",
  },
  {
    name: "FEATURE_INTERIM_BENCH_PORTAL",
    label: "Strategic Interim bench",
    description:
      "Future private availability and matching workflow for interim talent.",
  },
  {
    name: "FEATURE_INTERIM_AVAILABILITY_TOGGLE",
    label: "Interim availability toggle",
    description:
      "Future magic-link route for senior interim candidates to update availability.",
  },
  {
    name: "FEATURE_LIVE_MARKET_DASHBOARDS",
    label: "Live market dashboards",
    description:
      "Future interactive market intelligence dashboards for clients.",
  },
] as const;

export type LabsFeatureFlagName =
  (typeof labsFeatureFlagDefinitions)[number]["name"];

export type LabsIdeaStatus = (typeof labsStatuses)[number];

export type LabsRiskLevel = "low" | "medium" | "high" | "critical";

export type LabsIdea = {
  title: string;
  category: string;
  status: LabsIdeaStatus;
  priority: "future" | "important" | "critical";
  targetUser: string;
  commercialPurpose: string;
  privacyRisk: LabsRiskLevel;
  complexity: "low" | "medium" | "high";
  dependencies: string[];
  featureFlagName: LabsFeatureFlagName;
  relatedGitHubIssue?: string;
  relatedRoute?: string;
  launchRule: string;
};

export type LabsRoadmapPhase = {
  phase: number;
  months: string;
  title: string;
  focus: string;
  doNow: string[];
  doLater: string[];
  dependencies: string[];
  relatedIssues: string[];
  codexReasoning: "medium" | "high";
};

type LabsEnv = Record<string, string | undefined>;

export const labsIdeas: LabsIdea[] = [
  {
    title: "Gated salary guides",
    category: "Salary intelligence",
    status: "idea",
    priority: "future",
    targetUser: "Hiring leaders and agency owners",
    commercialPurpose:
      "Capture serious B2B demand around salary and market intelligence.",
    privacyRisk: "medium",
    complexity: "medium",
    dependencies: ["Consent-aware lead capture", "PDF delivery workflow"],
    featureFlagName: "FEATURE_SALARY_GUIDE_GATE",
    relatedGitHubIssue: "#58",
    launchRule:
      "Launch only after consent, delivery and CRM routing are reviewed.",
  },
  {
    title: "Bespoke salary benchmarking asset builder",
    category: "Salary intelligence",
    status: "private_preview",
    priority: "future",
    targetUser: "Clients considering a senior hire",
    commercialPurpose:
      "Turn market knowledge into a practical, paid-feeling client asset.",
    privacyRisk: "medium",
    complexity: "high",
    dependencies: ["Salary data model", "Download asset generation"],
    featureFlagName: "FEATURE_SALARY_BENCHMARK_ASSET",
    relatedGitHubIssue: "#59",
    relatedRoute: "/admin/labs/salary-benchmark",
    launchRule:
      "Launch only with sourced, reviewed salary data and clear caveats.",
  },
  {
    title: "Market mapping visualisations",
    category: "Client search",
    status: "private_preview",
    priority: "future",
    targetUser: "Retained search clients",
    commercialPurpose:
      "Show search reach and talent-market shape without exposing private names.",
    privacyRisk: "high",
    complexity: "high",
    dependencies: ["Anonymised data model", "Private client context rules"],
    featureFlagName: "FEATURE_MARKET_MAPPING",
    relatedGitHubIssue: "#60",
    relatedRoute: "/admin/labs/market-mapping",
    launchRule:
      "Never expose identifiable candidate or client data in public visuals.",
  },
  {
    title: "Bad hire calculator",
    category: "Lead generation",
    status: "private_preview",
    priority: "future",
    targetUser: "Founders, MDs and marketing leaders",
    commercialPurpose:
      "Make the commercial cost of weak hiring decisions tangible.",
    privacyRisk: "low",
    complexity: "medium",
    dependencies: ["Calculator assumptions", "Plain-English caveats"],
    featureFlagName: "FEATURE_BAD_HIRE_CALCULATOR",
    relatedGitHubIssue: "#61",
    relatedRoute: "/admin/labs/bad-hire-calculator",
    launchRule:
      "Launch only when assumptions are transparent and not gimmicky.",
  },
  {
    title: "Functional matrix mapping",
    category: "Client search",
    status: "private_preview",
    priority: "future",
    targetUser: "Clients shaping a senior brief",
    commercialPurpose:
      "Help clients understand the role they really need before going to market.",
    privacyRisk: "low",
    complexity: "medium",
    dependencies: ["Role taxonomy", "Service page alignment"],
    featureFlagName: "FEATURE_FUNCTIONAL_MATRIX",
    relatedGitHubIssue: "#62",
    relatedRoute: "/admin/labs/functional-matrix",
    launchRule:
      "Launch as a guidance tool, not as an automated hiring decision tool.",
  },
  {
    title: "Passwordless client shortlists",
    category: "Client portal",
    status: "idea",
    priority: "future",
    targetUser: "Active retained-search clients",
    commercialPurpose:
      "Present shortlists professionally and collect useful feedback quickly.",
    privacyRisk: "critical",
    complexity: "high",
    dependencies: [
      "Magic links",
      "Private candidate profiles",
      "Audit logging",
    ],
    featureFlagName: "FEATURE_CLIENT_SHORTLIST_PORTAL",
    relatedGitHubIssue: "#63",
    launchRule:
      "Launch only behind signed access, audit logs and explicit candidate consent.",
  },
  {
    title: "AI-assisted job brief builder",
    category: "AI support",
    status: "idea",
    priority: "future",
    targetUser: "Clients with unclear briefs",
    commercialPurpose:
      "Compress first-call thinking while keeping David in control of the advice.",
    privacyRisk: "high",
    complexity: "high",
    dependencies: [
      "AI safety rules",
      "Human review workflow",
      "No PII prompts",
    ],
    featureFlagName: "FEATURE_AI_BRIEF_BUILDER",
    relatedGitHubIssue: "#64/#109",
    launchRule:
      "Launch only with human review, privacy controls, no PII analytics and no automated candidate evaluation.",
  },
  {
    title: "Strategic Interim bench portal",
    category: "Interim",
    status: "idea",
    priority: "future",
    targetUser: "Senior interim candidates and David",
    commercialPurpose:
      "Keep interim availability current without creating admin drag.",
    privacyRisk: "high",
    complexity: "high",
    dependencies: ["Magic links", "Consent model", "Availability data rules"],
    featureFlagName: "FEATURE_INTERIM_AVAILABILITY_TOGGLE",
    relatedGitHubIssue: "#107",
    launchRule:
      "Launch only when candidate privacy, consent and access boundaries are signed off.",
  },
  {
    title: "Live market dashboards",
    category: "Market intelligence",
    status: "idea",
    priority: "future",
    targetUser: "Hiring leaders and retained clients",
    commercialPurpose:
      "Build authority through useful market data rather than generic content.",
    privacyRisk: "medium",
    complexity: "high",
    dependencies: ["Reviewed data sources", "Performance budget", "Caveats"],
    featureFlagName: "FEATURE_LIVE_MARKET_DASHBOARDS",
    relatedGitHubIssue: "#66",
    launchRule:
      "Launch only with sourced data, clear methodology and fast rendering.",
  },
];

export const labsRoadmapPhases: LabsRoadmapPhase[] = [
  {
    phase: 1,
    months: "0-1",
    title: "Labs foundation",
    focus: "Keep the future-work area private, documented and feature-flagged.",
    doNow: [
      "Protect /admin/labs",
      "Keep Labs flags server-side",
      "Document noindex and no-public-route rules",
    ],
    doLater: ["Public Labs storytelling"],
    dependencies: ["CMS admin session gate", "Feature flag discipline"],
    relatedIssues: ["#67"],
    codexReasoning: "medium",
  },
  {
    phase: 2,
    months: "1-2",
    title: "Lead capture assets",
    focus:
      "Build useful public conversion routes before touching private candidate workflows.",
    doNow: [
      "Gated salary guides",
      "Salary benchmark request flow",
      "Hiring health-check framing",
    ],
    doLater: ["Live salary data products"],
    dependencies: ["Consent-aware forms", "CRM routing", "Clear follow-up copy"],
    relatedIssues: ["#58", "#59"],
    codexReasoning: "medium",
  },
  {
    phase: 3,
    months: "2-4",
    title: "Advisory tools",
    focus:
      "Create high-value guidance tools that prove David's thinking without storing sensitive records.",
    doNow: [
      "Bad hire calculator",
      "Functional matrix mapping",
      "AI brief builder prototype using safe inputs",
    ],
    doLater: ["Automated brief scoring", "Candidate matching"],
    dependencies: ["Plain-English assumptions", "No automated hiring decisions"],
    relatedIssues: ["#61", "#62", "#64"],
    codexReasoning: "high",
  },
  {
    phase: 4,
    months: "3-6",
    title: "Private data infrastructure",
    focus:
      "Make the operational backend safe before private portals or candidate data go near clients.",
    doNow: [
      "Railway Postgres",
      "Audit logging",
      "DSAR and retention checks",
      "Admin dashboard foundations",
    ],
    doLater: ["Private CV access until storage and legal review are ready"],
    dependencies: ["DATABASE_URL", "Admin auth", "Retention policy"],
    relatedIssues: ["#69", "#70"],
    codexReasoning: "high",
  },
  {
    phase: 5,
    months: "5-8",
    title: "Client portal features",
    focus:
      "Move shortlists and feedback into one secure branded client experience.",
    doNow: [
      "Passwordless shortlists",
      "Client feedback",
      "Market mapping with anonymised data only",
    ],
    doLater: ["Real client links until private beta is approved"],
    dependencies: ["Magic links", "Candidate consent", "Audit proof"],
    relatedIssues: ["#60", "#63", "#69"],
    codexReasoning: "high",
  },
  {
    phase: 6,
    months: "7-10",
    title: "Interim bench",
    focus:
      "Keep Strategic Interim availability current without making candidate data public.",
    doNow: [
      "Availability toggle",
      "Private interim profile model",
      "Consent and retention workflow",
    ],
    doLater: ["Client-visible matching views"],
    dependencies: ["Magic links", "Candidate consent", "Private Postgres"],
    relatedIssues: ["#65"],
    codexReasoning: "high",
  },
  {
    phase: 7,
    months: "9-12",
    title: "Market intelligence",
    focus:
      "Turn reviewed market knowledge into data-led authority and digital PR assets.",
    doNow: [
      "Live market dashboards with sourced data",
      "Salary intelligence products",
      "Public data assets with caveats",
    ],
    doLater: ["Automated live feeds until data quality is proven"],
    dependencies: ["Verified data", "Performance budget", "Methodology notes"],
    relatedIssues: ["#66"],
    codexReasoning: "high",
  },
];

export function isLabsFeatureEnabled(
  flagName: LabsFeatureFlagName,
  env: LabsEnv = process.env,
) {
  return env[flagName] === "true";
}

export function getLabsFeatureFlags(env: LabsEnv = process.env) {
  return labsFeatureFlagDefinitions.map((flag) => ({
    ...flag,
    enabled: isLabsFeatureEnabled(flag.name, env),
    scope: "server-only" as const,
  }));
}

export function getLabsOverview(env: LabsEnv = process.env) {
  const flags = getLabsFeatureFlags(env);
  const flagState = new Map(flags.map((flag) => [flag.name, flag.enabled]));
  const ideas = labsIdeas.map((idea) => ({
    ...idea,
    flagEnabled: flagState.get(idea.featureFlagName) || false,
  }));

  return {
    flags,
    ideas,
    roadmapPhases: labsRoadmapPhases,
    stats: {
      totalIdeas: ideas.length,
      totalRoadmapPhases: labsRoadmapPhases.length,
      enabledFlags: flags.filter((flag) => flag.enabled).length,
      highRiskIdeas: ideas.filter(
        (idea) =>
          idea.privacyRisk === "high" || idea.privacyRisk === "critical",
      ).length,
      readyForLaunch: ideas.filter((idea) => idea.status === "ready_to_launch")
        .length,
    },
  };
}
