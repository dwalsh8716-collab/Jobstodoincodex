import "server-only";

export const recruiterLabsFlagDefinitions = [
  {
    name: "FEATURE_RECRUITER_LABS_ENABLED",
    label: "Recruiter Labs foundation",
    description:
      "Enables protected admin planning for the future client pipeline system.",
  },
  {
    name: "FEATURE_CLIENT_PRESENTATION_PORTAL",
    label: "Client presentation portal",
    description: "Future magic-link shortlist portal for client review.",
  },
  {
    name: "FEATURE_BRANDED_CANDIDATE_PROFILES",
    label: "Branded candidate profiles",
    description:
      "Future David-approved candidate profile cards built from private data.",
  },
  {
    name: "FEATURE_SHORTLIST_FEEDBACK_TRACKING",
    label: "Shortlist feedback tracking",
    description:
      "Future client feedback actions and private engagement tracking.",
  },
  {
    name: "FEATURE_INTERVIEW_REQUEST_WORKFLOW",
    label: "Interview request workflow",
    description:
      "Future client interview requests from the protected shortlist view.",
  },
  {
    name: "FEATURE_WHATSAPP_INTERVIEW_SCHEDULING",
    label: "WhatsApp interview scheduling",
    description:
      "Future transactional interview logistics through WhatsApp Business.",
  },
  {
    name: "FEATURE_GOOGLE_MEET_INTERVIEW_SCHEDULING",
    label: "Google Meet interview scheduling",
    description:
      "Future Google Calendar and Meet orchestration for interview slots.",
  },
  {
    name: "FEATURE_AI_CANDIDATE_SUMMARIES",
    label: "AI candidate summary drafts",
    description:
      "Future AI-assisted drafts only, with David verification before client view.",
  },
] as const;

export type RecruiterLabsFlagName =
  (typeof recruiterLabsFlagDefinitions)[number]["name"];

type RecruiterLabsEnv = Record<string, string | undefined>;

export const recruiterLabsDependencies = [
  {
    label: "Railway Postgres backend",
    status: "staged",
    detail:
      "Schema and scripts exist. Production DATABASE_URL still needs setup.",
  },
  {
    label: "Admin authentication",
    status: "staged",
    detail: "Protected admin routes use the CMS session gate.",
  },
  {
    label: "Private CV storage",
    status: "blocked",
    detail: "No public or private CV upload/storage flow is live yet.",
  },
  {
    label: "Candidate consent model",
    status: "staged",
    detail: "Candidate privacy and consent records exist for future workflows.",
  },
  {
    label: "Audit logging",
    status: "staged",
    detail: "Append-only audit logging is ready when Postgres is enabled.",
  },
  {
    label: "DSAR and retention framework",
    status: "staged",
    detail: "DSAR route and retention review engine are staged.",
  },
  {
    label: "WhatsApp and Google scheduling",
    status: "disabled",
    detail: "Both must remain disabled unless configured and approved.",
  },
] as const;

export const recruiterLabsBuildPhases = [
  {
    title: "Private foundation",
    status: "current",
    detail:
      "Flags, private route, database model, docs and launch rules are staged.",
  },
  {
    title: "Shortlist data model",
    status: "next",
    detail:
      "Store shortlists, candidate profile review status, hashed tokens and feedback in Postgres.",
  },
  {
    title: "Magic-link portal",
    status: "blocked",
    detail:
      "Requires signed token validation, expiry, revocation and no token analytics/logging.",
  },
  {
    title: "Interview workflow",
    status: "blocked",
    detail:
      "Requires shortlist feedback, candidate consent, WhatsApp and Google Calendar approvals.",
  },
  {
    title: "AI-assisted drafts",
    status: "blocked",
    detail:
      "Only safe after human review workflow, privacy controls and no automated candidate evaluation rules.",
  },
] as const;

export function isRecruiterLabsFeatureEnabled(
  flagName: RecruiterLabsFlagName,
  env: RecruiterLabsEnv = process.env,
) {
  return env[flagName] === "true";
}

export function getRecruiterLabsFeatureFlags(
  env: RecruiterLabsEnv = process.env,
) {
  return recruiterLabsFlagDefinitions.map((flag) => ({
    ...flag,
    enabled: isRecruiterLabsFeatureEnabled(flag.name, env),
    scope: "server-only" as const,
  }));
}

export function getRecruiterLabsOverview(env: RecruiterLabsEnv = process.env) {
  const flags = getRecruiterLabsFeatureFlags(env);

  return {
    flags,
    dependencies: recruiterLabsDependencies,
    phases: recruiterLabsBuildPhases,
    stats: {
      totalFlags: flags.length,
      enabledFlags: flags.filter((flag) => flag.enabled).length,
      blockedDependencies: recruiterLabsDependencies.filter(
        (dependency) => dependency.status === "blocked",
      ).length,
      publicRoutes: 0,
    },
  };
}
