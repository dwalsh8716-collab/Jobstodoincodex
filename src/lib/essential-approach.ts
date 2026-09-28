import type { ServiceRoute } from "@/components/FourRouteSelector";

export const comparisonDimensions = [
  "Starting point",
  "Primary outcome",
  "Search depth",
  "Market mapping",
  "Ongoing calibration",
  "Does it have to end in a hire?",
] as const;

export const essentialRoutes = [
  {
    title: "Permanent Recruitment",
    href: "/services/permanent-recruitment",
    thought: "We know what we need and need somebody permanently.",
    description:
      "Specialist, success-based recruitment with a proper brief, market search and focused shortlist.",
    summary: "For specialist permanent hires.",
    comparison: [
      "Permanent hire",
      "Appointment",
      "Focused specialist search",
      "As required",
      "Throughout the search",
      "Usually",
    ],
  },
  {
    title: "Retained Search",
    href: "/services/retained-search",
    thought:
      "This hire really matters and we need to search the market properly.",
    description:
      "A committed, research-led search for senior, confidential, difficult or commercially important appointments.",
    summary: "For senior, critical or confidential appointments.",
    comparison: [
      "Senior / critical / confidential hire",
      "Appointment after committed market search",
      "Comprehensive research-led search",
      "Core part of the mandate",
      "Formal and transparent throughout",
      "That's the search mandate",
    ],
  },
  {
    title: "Fractional Leadership",
    href: "/services/fractional",
    thought:
      "We need senior capability, but another full-time permanent hire isn't necessarily the answer.",
    description:
      "Define what leadership the business actually needs, then find the right person to deliver it.",
    summary:
      "For senior capability without necessarily making another full-time hire.",
    comparison: [
      "Leadership problem",
      "Embedded senior leader",
      "Senior leadership search",
      "Targeted to the leadership need",
      "Scope and engagement reviews",
      "Usually an engagement",
    ],
  },
  {
    title: "Market Intelligence & Advisory",
    href: "/services/market-intelligence-advisory",
    thought:
      "We're not ready to search yet. We need to understand the market first.",
    description:
      "Salary intelligence, talent mapping, competitor insight, brief design and practical hiring advice before you commit.",
    summary: "For the market evidence you need before deciding.",
    comparison: [
      "Market / hiring question",
      "Better hiring decision",
      "Research-led; may not involve candidate search",
      "Often the actual product",
      "Research findings shape the recommendation",
      "No",
    ],
  },
] as const satisfies readonly (ServiceRoute & {
  summary: string;
  comparison: readonly [string, string, string, string, string, string];
})[];

export const essentialPrinciples = [
  {
    title: "Get underneath the problem",
    paragraphs: [
      "The job title isn't the brief.",
      "Why are you hiring? What's not working now? What needs to have changed in 12 months?",
      "Before we talk candidates, we need to understand the actual problem.",
    ],
  },
  {
    title: "Reality-check the market",
    paragraphs: [
      "Does the person you're describing actually exist? Does the salary stack up? Where does the relevant talent sit?",
      "If the market is telling us something different from the original brief, I'd rather tell you now.",
    ],
  },
  {
    title: "Look beyond who's available",
    paragraphs: [
      "A job advert has its place. So does LinkedIn. So does AI. So does my network.",
      "The point isn't which tool found the person. It's whether we're looking in the right market and talking to the right people.",
    ],
  },
  {
    title: "Get behind the evidence",
    paragraphs: [
      "A CV tells me where somebody worked. I'm much more interested in what they actually did when they got there.",
      "What did they inherit? What did they change? What happened? What was genuinely theirs?",
    ],
  },
  {
    title: "Help you make the decision",
    paragraphs: [
      "My job doesn't end when I introduce somebody.",
      "Interview structure, candidate feedback, concerns, salary, offers, awkward conversations and market reality all matter.",
      "Finding somebody is only useful if you ultimately make the right decision.",
    ],
  },
] as const;

export const commonSearchStages = [
  {
    id: "get-underneath-the-brief",
    title: "Get underneath the brief",
    paragraphs: [
      "The job title isn't the brief.",
      "What does the business actually need this person to change, deliver or improve?",
    ],
  },
  {
    id: "map-the-market",
    title: "Work out where the good people are",
    paragraphs: ["Build the market. Don't just post the job and hope."],
  },
  {
    id: "approach-people-properly",
    title: "Approach people properly",
    paragraphs: [
      "The best person might not be looking. Give them a genuine reason to listen.",
      "Recruitment is a two-way sell.",
    ],
  },
  {
    id: "get-behind-the-cv",
    title: "Get behind the CV",
    paragraphs: ["What did they actually deliver? What was genuinely theirs?"],
  },
  {
    id: "focused-shortlist",
    title: "Fewer people. More context.",
    paragraphs: [
      "I'm not interested in winning the award for Most CVs Sent Before Lunch.",
      "A focused shortlist. Proper context. No padding.",
    ],
  },
  {
    id: "help-you-assess",
    title: "Help you make the decision",
    paragraphs: [
      "Structured conversations, useful evidence and honest feedback.",
    ],
  },
  {
    id: "get-it-over-the-line",
    title: "Get the bloody thing over the line",
    paragraphs: [
      "Good candidates get lost in bad processes.",
      "Keep momentum, manage the awkward conversations and make sure both sides know where they stand.",
    ],
  },
] as const;
