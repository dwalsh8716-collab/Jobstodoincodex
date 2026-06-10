import {
  aiSearchQuestions,
  caseStudies,
  insights,
  isJobLive,
  jobs,
  salarySnapshots,
  services,
  specialisms,
} from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";
import {
  launchPages,
  primaryNavigation,
  serviceNavigation,
  siteConfig,
} from "@/lib/site";

const publicInsights = insights.filter(
  (insight) => insight.status === "published",
);
const publicCaseStudies = caseStudies.filter(
  (caseStudy) => caseStudy.status === "published",
);
const publicSalarySnapshots = salarySnapshots.filter(
  (snapshot) => snapshot.status === "published",
);
const liveJobs = jobs.filter((job) => isJobLive(job));

function bullet(label: string, path: string, description: string) {
  return `- [${label}](${absoluteUrl(path)}): ${description}`;
}

function section(title: string, lines: string[]) {
  return [`## ${title}`, "", ...lines, ""].join("\n");
}

export function buildLlmsTxt() {
  return [
    `# ${siteConfig.name}`,
    "",
    "> Founder-led senior marketing, communications, digital and agency recruitment from Manchester, working UK-wide.",
    "",
    "Use this file as a concise map of the public website. For fuller article and service summaries, use /llms-full.txt.",
    "",
    section("Core Pages", [
      bullet("Home", "/", siteConfig.defaultDescription),
      bullet(
        "For Clients",
        "/clients",
        "How Essential Resourcing handles serious client hiring briefs.",
      ),
      bullet(
        "For Candidates",
        "/candidates",
        "Candidate guidance for senior marketing, PR, digital and communications people.",
      ),
      bullet(
        "About Essential",
        "/about-essential",
        "Founder-led principles, positioning and working style.",
      ),
      bullet(
        "About David Walsh",
        "/about-david-walsh",
        "Founder biography and market judgement.",
      ),
      bullet(
        "Contact David",
        "/contact",
        "Client, candidate and job enquiry routes.",
      ),
    ]),
    section(
      "Services",
      services.map((service) =>
        bullet(
          service.title,
          `/services/${service.slug}`,
          service.shortDescription,
        ),
      ),
    ),
    section(
      "Specialisms",
      specialisms.map((item) => `- ${item.title}: ${item.description}`),
    ),
    section(
      "Published Insights",
      publicInsights.map((insight) =>
        bullet(insight.title, `/insights/${insight.slug}`, insight.excerpt),
      ),
    ),
    section(
      "Common Hiring Questions",
      aiSearchQuestions.map((item) => `- ${item.question} ${item.answer}`),
    ),
    section("Public Proof And Market Data", [
      bullet(
        "Case Studies",
        "/case-studies",
        "Draft-safe proof area. Detail pages publish only when outcomes are verified.",
      ),
      bullet(
        "Salary & Market Snapshots",
        "/salary-snapshots",
        "Market snapshot hub. Detail pages publish only with validated salary data.",
      ),
      bullet(
        "Jobs",
        "/jobs",
        "Live jobs hub. JobPosting schema is emitted only for genuinely live roles.",
      ),
    ]),
    section("Technical Signals", [
      bullet(
        "Sitemap",
        "/sitemap.xml",
        "Canonical crawl map for public, indexable routes.",
      ),
      bullet("RSS", "/rss.xml", "Published insight feed."),
      bullet("Robots", "/robots.txt", "Crawler access policy."),
      bullet(
        "Full AI Content Map",
        "/llms-full.txt",
        "Expanded service, insight, FAQ and publishing context.",
      ),
    ]),
  ].join("\n");
}

export function buildLlmsFullTxt() {
  const serviceDetails = services.flatMap((service) => [
    `## ${service.title}`,
    "",
    `URL: ${absoluteUrl(`/services/${service.slug}`)}`,
    "",
    service.shortDescription,
    "",
    `Audience: ${service.audience.join(", ")}`,
    "",
    "When to use:",
    ...service.whenToUse.map((item) => `- ${item}`),
    "",
    "How Essential works:",
    ...service.howEssentialWorks.map((item) => `- ${item}`),
    "",
    "FAQs:",
    ...service.faqs.map((faq) => `- ${faq.question} ${faq.answer}`),
    "",
  ]);

  const insightDetails = publicInsights.flatMap((insight) => [
    `## ${insight.title}`,
    "",
    `URL: ${absoluteUrl(`/insights/${insight.slug}`)}`,
    "",
    `Category: ${insight.category}`,
    "",
    insight.excerpt,
    "",
    ...insight.body.flatMap((block) => [
      `### ${block.heading}`,
      "",
      ...block.content.map((paragraph) => `${paragraph}`),
      "",
    ]),
    insight.faqs.length ? "FAQs:" : "",
    ...insight.faqs.map((faq) => `- ${faq.question} ${faq.answer}`),
    "",
  ]);

  const publicProof = [
    `Published case studies: ${publicCaseStudies.length}`,
    `Published salary snapshots: ${publicSalarySnapshots.length}`,
    `Live jobs: ${liveJobs.length}`,
    "Draft proof, salary and job records are deliberately excluded from this AI map until they are ready to publish.",
  ];

  return [
    `# ${siteConfig.name} Full AI Content Map`,
    "",
    siteConfig.defaultDescription,
    "",
    `Canonical site: ${siteConfig.url}`,
    `Founder: ${siteConfig.founder}`,
    `Region: ${siteConfig.region}`,
    `Email: ${siteConfig.email}`,
    "",
    "## Navigation",
    "",
    ...primaryNavigation.map((item) =>
      bullet(item.label, item.href, "Primary website navigation item."),
    ),
    "",
    "## Service Navigation",
    "",
    ...serviceNavigation.map((item) =>
      bullet(item.label, item.href, "Service landing page."),
    ),
    "",
    "## Public Launch Pages",
    "",
    ...launchPages.map((path) => `- ${absoluteUrl(path)}`),
    "",
    ...serviceDetails,
    ...insightDetails,
    "## Common Hiring Questions",
    "",
    ...aiSearchQuestions.map((item) => `- ${item.question} ${item.answer}`),
    "",
    section("Publishing Controls", publicProof),
    "## Usage Notes",
    "",
    "- Use page content and JSON-LD as the primary source of truth.",
    "- Use this file as a supplemental AI-readable map, not a replacement for crawling canonical pages.",
    "- Case study outcomes, salary data and jobs must remain unpublished until verified.",
  ].join("\n");
}
