import type {
  CaseStudy,
  FAQ,
  Insight,
  Job,
  RichMedia,
  SalarySnapshot,
  Service,
} from "./types";

export const proofPoints = [
  "Trusted by agencies, brands and growth businesses",
  "Marketing, PR, digital and communications specialists",
  "Senior hires, retained search and strategic interim",
  "Manchester-led, UK-wide reach",
];

export const whyEssential = [
  "Fewer roles, deeper work",
  "Honest market advice",
  "No CV flinging",
  "Strong candidate relationships",
  "Hires that actually stick",
  "Proper understanding of agency and marketing teams",
];

export const specialisms = [
  {
    title: "Marketing Leadership",
    description:
      "CMO, Marketing Director, Head of Marketing and senior growth leadership roles.",
  },
  {
    title: "PR & Communications",
    description:
      "Senior PR, communications, reputation, social, content and earned media talent.",
  },
  {
    title: "Digital & Performance",
    description:
      "Digital, performance, eCommerce, CRM, analytics and demand generation specialists.",
  },
  {
    title: "Social & Content",
    description:
      "People who can connect channel craft, brand thinking and audience attention.",
  },
  {
    title: "Client Services",
    description:
      "Agency-side client leadership, account direction and commercially mature relationship roles.",
  },
  {
    title: "Growth & Commercial",
    description:
      "Senior hires who connect positioning, pipeline, revenue, customer growth and commercial rhythm.",
  },
  {
    title: "Agency Operations",
    description:
      "Operational and leadership roles that help agencies run better, not just look busier.",
  },
];

const serviceFaqs: FAQ[] = [
  {
    question: "How is this different from contingency recruitment?",
    answer:
      "Contingency recruitment can work for simple roles with a broad market. Senior or sensitive hiring usually needs deeper briefing, market mapping, direct candidate engagement and better process control.",
  },
  {
    question: "Can you challenge the brief before we go to market?",
    answer:
      "Yes. A useful recruiter should tell you if the role, salary, timing or process is likely to struggle before candidates start seeing the brief.",
  },
  {
    question: "Do you work outside Manchester and the North West?",
    answer:
      "Yes. Essential Resourcing is Manchester-led with UK-wide reach, especially across senior marketing, communications, digital and agency/client-side leadership roles.",
  },
];

export const services: Service[] = [
  {
    title: "Leadership Search",
    slug: "leadership-search",
    shortDescription:
      "Senior marketing, communications and agency leadership hiring where judgement matters more than CV volume.",
    heroHeadline:
      "Senior hires should change the business, not just the org chart.",
    heroSubheadline:
      "Senior roles shape growth, culture and commercial performance. The best people are usually not applying, so search needs proper briefing, market mapping, candidate engagement and process management.",
    audience: [
      "Founders",
      "CEOs",
      "MDs",
      "CMOs",
      "Marketing Directors",
      "Agency leaders",
    ],
    problemsSolved: [
      "The best senior candidates are usually not applying",
      "Leadership mis-hires are expensive and visible",
      "A weak process can damage the employer brand",
      "Confidential or retained mandates need sharper handling",
    ],
    whenToUse: [
      "The role is business-critical or board-visible",
      "You need retained or exclusive market mapping",
      "The candidate market is narrow or hard to reach",
      "You need someone to challenge and shape the brief",
    ],
    howEssentialWorks: [
      "Clarify the brief, commercial context and hiring reality",
      "Map the market and engage credible senior candidates directly",
      "Manage shortlist quality, process pace and candidate communication",
      "Give honest feedback throughout, even when it is awkward",
    ],
    mistakes: [
      "Treating senior search like advert response",
      "Moving slowly with strong candidates",
      "Over-selling the role and under-explaining the challenge",
    ],
    faqs: serviceFaqs,
    relatedServiceSlugs: ["strategic-interim", "senior-recruitment"],
    relatedInsightSlugs: [
      "when-should-an-agency-use-retained-search",
      "why-senior-marketing-hiring-goes-wrong",
    ],
    relatedCaseStudySlugs: ["independent-pr-agency-senior-account-director"],
    cta: {
      label: "Sense-check a senior brief",
      href: "/contact",
      variant: "primary",
    },
    seoTitle:
      "Leadership Search for Marketing & Communications Leaders | Essential Resourcing",
    metaDescription:
      "Founder-led leadership search for senior marketing, communications and agency leaders across Manchester, the North West and UK.",
  },
  {
    title: "Strategic Interim",
    slug: "strategic-interim",
    shortDescription:
      "Experienced operators embedded into your business without committing to another full-time salary.",
    heroHeadline:
      "Senior brains in the business. Without another full-time salary.",
    heroSubheadline:
      "Sometimes you do not need another permanent hire. You need an experienced operator to steady the ship, build the plan, challenge things and help the team move.",
    audience: [
      "Founders",
      "MDs",
      "CMOs",
      "Agency owners",
      "Growth businesses",
      "Post-investment teams",
    ],
    problemsSolved: [
      "No senior marketing leader is in place",
      "The founder or MD is still carrying too much",
      "The team has execution but lacks senior direction",
      "The business needs progress, not another slide deck",
    ],
    whenToUse: [
      "Full-time hiring feels too early or too expensive",
      "You need momentum during a leadership gap",
      "The agency needs commercial or operational rhythm",
      "The marketing team needs mentoring and direction",
    ],
    howEssentialWorks: [
      "Define the commercial outcome the interim needs to create",
      "Identify operators who can embed quickly and challenge usefully",
      "Keep scope, decision-making and weekly rhythm clear",
      "Review impact against the brief instead of vague activity",
    ],
    mistakes: [
      "Confusing interim leadership with detached consultancy",
      "Hiring a tactical freelancer when the issue is senior judgement",
      "Failing to define the outcome before the interim starts",
    ],
    faqs: [
      {
        question: "What is a strategic interim marketing leader?",
        answer:
          "A strategic interim marketing leader is an experienced senior operator who joins for a defined period to provide direction, build capability and get work moving inside the business.",
      },
      {
        question: "How is strategic interim different from consultancy?",
        answer:
          "Consultants often tell you what the problem is. A Strategic Interim helps fix it. They are embedded, attend leadership meetings, manage stakeholders and are still there next week when reality kicks in.",
      },
      {
        question: "What roles can be interim?",
        answer:
          "Common roles include Interim CMO, Interim Marketing Director, Interim Head of Marketing, Interim Growth Director, Interim Digital Director, Interim PR/Comms Lead and Interim Agency Operations Director.",
      },
    ],
    relatedServiceSlugs: [
      "leadership-search",
      "client-side-marketing-recruitment",
    ],
    relatedInsightSlugs: [
      "what-is-a-strategic-interim-marketing-leader",
      "strategic-interim-vs-consultant",
    ],
    relatedCaseStudySlugs: ["integrated-agency-strategic-interim"],
    cta: {
      label: "Discuss Strategic Interim",
      href: "/contact",
      variant: "primary",
    },
    seoTitle: "Strategic Interim Marketing Leaders | Essential Resourcing",
    metaDescription:
      "Strategic interim marketing, digital and agency leadership support for teams that need senior direction without another full-time hire.",
  },
  {
    title: "Agency Recruitment",
    slug: "agency-recruitment",
    shortDescription:
      "Specialist recruitment for PR, digital, creative, integrated, performance and marketing agencies.",
    heroHeadline: "Agency hires need to do more than look good on paper.",
    heroSubheadline:
      "Wrong agency hires hit clients, team, margin and momentum. The real brief is rarely just the job title.",
    audience: [
      "Agency founders",
      "Agency MDs",
      "Client services leaders",
      "PR and digital agency teams",
    ],
    problemsSolved: [
      "The candidate market is noisy",
      "Titles mean different things from agency to agency",
      "Culture fit and client maturity matter",
      "Strong agency candidates rarely sit on job boards",
    ],
    whenToUse: [
      "You need client services, PR, social, digital, growth or operations talent",
      "The role requires agency-specific judgement",
      "You need a shortlist that respects both skill and fit",
      "The hiring process needs to move without becoming rushed",
    ],
    howEssentialWorks: [
      "Get under the skin of the agency, clients, team and pressure points",
      "Translate the role into candidate language that credible agency people trust",
      "Screen for client maturity, commercial sense and team impact",
      "Keep communication direct and expectations realistic",
    ],
    mistakes: [
      "Assuming every agency title means the same thing",
      "Under-selling the opportunity to passive candidates",
      "Hiring only for craft and ignoring client pressure",
    ],
    faqs: serviceFaqs,
    relatedServiceSlugs: ["leadership-search", "senior-recruitment"],
    relatedInsightSlugs: [
      "when-should-an-agency-use-retained-search",
      "why-senior-marketing-hiring-goes-wrong",
    ],
    relatedCaseStudySlugs: ["independent-pr-agency-senior-account-director"],
    cta: {
      label: "Talk through an agency hire",
      href: "/contact",
      variant: "primary",
    },
    seoTitle:
      "Agency Recruitment for Marketing, PR & Digital Teams | Essential Resourcing",
    metaDescription:
      "Specialist agency recruitment for PR, digital, creative, performance, client services and agency leadership roles.",
  },
  {
    title: "Client-side Marketing Recruitment",
    slug: "client-side-marketing-recruitment",
    shortDescription:
      "Senior marketing and communications recruitment for brands and growth businesses.",
    heroHeadline:
      "Marketing hires should connect to growth, not just activity.",
    heroSubheadline:
      "More campaigns do not always mean more progress. The right marketing hire should build demand, improve performance, strengthen brand and connect marketing to the wider business.",
    audience: [
      "CMOs",
      "Marketing Directors",
      "People leaders",
      "CEOs",
      "Growth businesses",
    ],
    problemsSolved: [
      "Avoiding expensive mis-hires",
      "Matching marketing talent to business stage",
      "Hiring people who can drive revenue, brand, demand or customer growth",
      "Separating strong operators from good interviewers",
    ],
    whenToUse: [
      "You are hiring a senior marketer or specialist growth role",
      "The business needs outcomes, not just channel ownership",
      "Salary, process or positioning needs honest challenge",
      "You need agency-market and client-side perspective",
    ],
    howEssentialWorks: [
      "Clarify the commercial job the hire needs to do",
      "Pressure-test the salary, brief and decision process",
      "Engage candidates who fit the stage, pace and ambition",
      "Keep the process focused on evidence, not interview polish",
    ],
    mistakes: [
      "Hiring a channel owner when the business needs a builder",
      "Waiting for ideal candidates to apply cold",
      "Ignoring the stage-fit between candidate and business",
    ],
    faqs: serviceFaqs,
    relatedServiceSlugs: ["leadership-search", "senior-recruitment"],
    relatedInsightSlugs: [
      "how-to-hire-a-marketing-director-without-wasting-six-weeks",
    ],
    relatedCaseStudySlugs: ["growth-brand-head-of-marketing"],
    cta: {
      label: "Talk through a marketing hire",
      href: "/contact",
      variant: "primary",
    },
    seoTitle: "Client-side Marketing Recruitment | Essential Resourcing",
    metaDescription:
      "Senior client-side marketing recruitment for brands and growth businesses hiring marketing directors, heads of marketing, comms leaders and digital talent.",
  },
  {
    title: "Senior Recruitment",
    slug: "senior-recruitment",
    shortDescription:
      "Specialist recruitment across marketing, PR, communications and digital roles where quality matters.",
    heroHeadline: "Specialist senior recruitment where quality matters.",
    heroSubheadline:
      "For mid-to-senior marketing, PR, communications and digital roles where the wrong hire creates noise, delay and avoidable commercial pain.",
    audience: [
      "Agency leaders",
      "Brands",
      "Growth businesses",
      "Marketing teams",
      "People leaders",
    ],
    problemsSolved: [
      "Too many irrelevant CVs",
      "Weak candidate communication",
      "Unclear salary expectations",
      "Hiring processes that drift",
    ],
    whenToUse: [
      "The role is specialist, senior or hard to fill",
      "You need candidate trust and market context",
      "You want a tighter shortlist, not a bigger inbox",
      "You need someone to tell you what the market is really saying",
    ],
    howEssentialWorks: [
      "Get the brief sharp before going to market",
      "Speak to candidates properly, not transactionally",
      "Share honest feedback and market signals",
      "Keep shortlists focused and useful",
    ],
    mistakes: [
      "Equating activity with progress",
      "Sending CVs before the brief is clear",
      "Ignoring process pace and candidate experience",
    ],
    faqs: serviceFaqs,
    relatedServiceSlugs: [
      "leadership-search",
      "agency-recruitment",
      "client-side-marketing-recruitment",
    ],
    relatedInsightSlugs: [
      "why-senior-marketing-hiring-goes-wrong",
      "how-to-hire-a-marketing-director-without-wasting-six-weeks",
    ],
    relatedCaseStudySlugs: [
      "independent-pr-agency-senior-account-director",
      "growth-brand-head-of-marketing",
    ],
    cta: {
      label: "Discuss a senior role",
      href: "/contact",
      variant: "primary",
    },
    seoTitle:
      "Senior Marketing & Communications Recruitment | Essential Resourcing",
    metaDescription:
      "Specialist senior recruitment for marketing, PR, communications and digital roles where quality, judgement and market knowledge matter.",
  },
];

const strategicInterimVideo: RichMedia = {
  type: "video",
  provider: "youtube",
  title: "Strategic Interim: senior help without another permanent hire.",
  url: "",
  description:
    "For teams that need senior direction now, Strategic Interim can create momentum without locking in another permanent salary.",
};

export const homepageFeatureVideo: RichMedia = {
  type: "video",
  provider: "youtube",
  title: "The problem behind the hire matters more than the job title.",
  url: "",
  thumbnail: "/assets/og-image.png",
  thumbnailAlt: "Essential Resourcing brand graphic for a founder video",
  description:
    "David's short version: get clear on the commercial problem before you ask the market for a job title.",
};

export const insights: Insight[] = [
  {
    title: "What is a Strategic Interim Marketing Leader?",
    slug: "what-is-a-strategic-interim-marketing-leader",
    status: "published",
    category: "Strategic interim explainers",
    excerpt:
      "A plain-English explanation of when interim senior marketing leadership makes sense and how it differs from consultancy.",
    publishedDate: "2026-06-09",
    updatedDate: "2026-06-09",
    readingTime: "5 min read",
    author: "David Walsh, Founder, Essential Resourcing",
    media: strategicInterimVideo,
    body: [
      {
        heading: "Direct answer",
        content: [
          "A strategic interim marketing leader is an experienced senior operator who steps into a business for a defined period to create direction, build capability and move work forward.",
          "They are not there to produce a detached report and disappear. They are there to get close enough to the business to make judgement useful.",
        ],
      },
      {
        heading: "When it makes sense",
        content: [
          "It makes sense when the business needs senior marketing direction but another permanent senior salary feels too early, too expensive or too slow.",
          "It also works when a founder, MD or CMO needs someone credible to steady the team during a transition.",
        ],
      },
      {
        heading: "What makes it work",
        content: [
          "The brief needs a clear outcome, access to the right people and permission to challenge decisions. Without that, interim work becomes expensive activity.",
        ],
      },
    ],
    pullQuote:
      "Consultants often tell you what the problem is. A Strategic Interim helps fix it.",
    faqs: [
      {
        question: "Is strategic interim the same as consultancy?",
        answer:
          "No. Consultancy is often advisory and detached. Strategic interim is embedded, practical and outcome-led.",
      },
      {
        question: "What roles can be strategic interim?",
        answer:
          "Common roles include Interim CMO, Marketing Director, Head of Marketing, Growth Director, Digital Director and Agency Operations Director.",
      },
    ],
    relatedServiceSlugs: ["strategic-interim"],
    relatedInsightSlugs: ["strategic-interim-vs-consultant"],
    seoTitle:
      "What is a Strategic Interim Marketing Leader? | Essential Resourcing",
    metaDescription:
      "A clear explanation of strategic interim marketing leadership, when it makes sense and how it differs from consultancy.",
  },
  {
    title: "When Should an Agency Use Retained Search?",
    slug: "when-should-an-agency-use-retained-search",
    status: "published",
    category: "Agency growth/hiring insight",
    excerpt:
      "Retained search is not for every role. It is for moments where candidate quality, confidentiality and judgement matter.",
    publishedDate: "2026-06-09",
    updatedDate: "2026-06-09",
    readingTime: "4 min read",
    author: "David Walsh, Founder, Essential Resourcing",
    body: [
      {
        heading: "Direct answer",
        content: [
          "An agency should use retained search when the role is senior, confidential, commercially important or difficult enough that advert response will not solve it properly.",
        ],
      },
      {
        heading: "What retained search changes",
        content: [
          "It creates space for proper briefing, market mapping, direct candidate engagement and better candidate management. It also signals seriousness to senior people.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is retained search only for board roles?",
        answer:
          "No. It can be useful for any role where the market is narrow, the hire is commercially important or the best candidates are not actively applying.",
      },
    ],
    relatedServiceSlugs: ["leadership-search", "agency-recruitment"],
    relatedInsightSlugs: ["why-senior-marketing-hiring-goes-wrong"],
    seoTitle:
      "When Should an Agency Use Retained Search? | Essential Resourcing",
    metaDescription:
      "When retained search makes sense for agency leadership and senior marketing or communications hiring.",
  },
  {
    title: "Why Senior Marketing Hiring Goes Wrong",
    slug: "why-senior-marketing-hiring-goes-wrong",
    status: "published",
    category: "Hiring advice",
    excerpt:
      "Senior marketing hiring usually goes wrong before the first interview, because the brief, salary or process is not honest enough.",
    publishedDate: "2026-06-09",
    updatedDate: "2026-06-09",
    readingTime: "6 min read",
    author: "David Walsh, Founder, Essential Resourcing",
    body: [
      {
        heading: "Direct answer",
        content: [
          "Senior marketing hiring goes wrong when businesses hire for a title instead of a commercial outcome.",
          "It also goes wrong when the process is slow, the salary is misaligned or the brief is too vague to attract credible people.",
        ],
      },
      {
        heading: "Common warning signs",
        content: [
          "If every candidate seems close but not quite right, the brief may be confused. If strong candidates drop out, the process may not be giving them enough confidence.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the biggest senior marketing hiring mistake?",
        answer:
          "Hiring for a list of channels instead of the business result the person needs to create.",
      },
    ],
    relatedServiceSlugs: [
      "leadership-search",
      "client-side-marketing-recruitment",
    ],
    relatedInsightSlugs: [
      "how-to-hire-a-marketing-director-without-wasting-six-weeks",
    ],
    seoTitle: "Why Senior Marketing Hiring Goes Wrong | Essential Resourcing",
    metaDescription:
      "Practical advice on why senior marketing recruitment fails and how to avoid expensive mis-hires.",
  },
  {
    title: "How to Hire a Marketing Director Without Wasting Six Weeks",
    slug: "how-to-hire-a-marketing-director-without-wasting-six-weeks",
    status: "published",
    category: "Client-side marketing hiring insight",
    excerpt:
      "A sharper brief, better salary reality and cleaner process can save weeks in a senior marketing director search.",
    publishedDate: "2026-06-09",
    updatedDate: "2026-06-09",
    readingTime: "5 min read",
    author: "David Walsh, Founder, Essential Resourcing",
    body: [
      {
        heading: "Direct answer",
        content: [
          "To hire a Marketing Director without wasting six weeks, decide what commercial problem the role solves, what level of seniority is genuinely required and what evidence will prove the candidate can do it.",
        ],
      },
      {
        heading: "What to fix first",
        content: [
          "Fix the brief, salary band, decision team and interview rhythm before going to market. Senior candidates notice drift quickly.",
        ],
      },
    ],
    faqs: [
      {
        question: "What should a Marketing Director brief include?",
        answer:
          "It should include commercial outcomes, team context, budget ownership, reporting line, decision rights and the business stage the candidate is walking into.",
      },
    ],
    relatedServiceSlugs: [
      "client-side-marketing-recruitment",
      "leadership-search",
    ],
    relatedInsightSlugs: ["why-senior-marketing-hiring-goes-wrong"],
    seoTitle: "How to Hire a Marketing Director | Essential Resourcing",
    metaDescription:
      "How brands and growth businesses can hire a Marketing Director with a clearer brief, better process and stronger candidate engagement.",
  },
];

export const insightCategories = [
  "Hiring advice",
  "Market commentary",
  "Salary snapshots",
  "Strategic interim explainers",
  "Candidate advice",
  "Agency growth/hiring insight",
  "Client-side marketing hiring insight",
  "Case-study led articles",
];

export const insightSeeds = [
  "Nobody buys recruitment. They buy the outcome.",
  "The job title is not the brief.",
  "Why strategic but hands-on usually means the brief needs work.",
  "Why your hiring process is putting good people off.",
  "The hidden cost of lowballing senior marketing hires.",
  "Strategic Interim is not consultancy. Here is the difference.",
  "Why agencies struggle to hire senior PR people.",
  "What founders actually need from their next marketing leader.",
  "Why more CVs rarely fix a broken brief.",
  "How to stop wasting six weeks on a role the market will not buy.",
];

export const aiSearchQuestions = [
  {
    question: "What is a Strategic Interim marketing leader?",
    answer:
      "A Strategic Interim marketing leader is an experienced senior operator who steps into the business for a defined period to create direction, support the team and move a commercial problem forward.",
  },
  {
    question: "When should an agency use retained search?",
    answer:
      "Use retained search when the role is senior, confidential, commercially important or difficult enough that advert response will not solve it properly.",
  },
  {
    question: "Why do senior marketing hires fail?",
    answer:
      "Senior marketing hires usually fail when the business hires for a title instead of a commercial outcome, or when the brief, salary and process are not honest enough.",
  },
  {
    question: "How do you define the real brief behind a marketing hire?",
    answer:
      "Start with the business problem: growth, leadership, capability, pace, client pressure or founder overload. The job title comes after that.",
  },
  {
    question: "What makes agency recruitment different?",
    answer:
      "Agency hiring has to account for client handling, pace, ambiguity, commercial pressure and culture. The same title can mean very different things agency to agency.",
  },
  {
    question:
      "What should a founder consider before hiring a Marketing Director?",
    answer:
      "A founder should decide what the Marketing Director needs to change, what decision rights they will have, what budget exists and whether the business really needs a builder, operator or strategist.",
  },
  {
    question:
      "When should a business hire an interim CMO or Marketing Director?",
    answer:
      "Hire an interim CMO or Marketing Director when you need senior judgement and momentum now, but a permanent hire is too early, too expensive or too slow.",
  },
  {
    question: "How do you avoid wasting time on the wrong candidates?",
    answer:
      "Get the brief sharp before going to market, define what good looks like, move quickly with strong people and stop measuring progress by CV volume.",
  },
  {
    question:
      "What salary should businesses pay for senior marketing roles in the North West?",
    answer:
      "The honest answer depends on scope, team size, commercial ownership, hybrid expectations and business stage. A generic title-based range can mislead more than it helps.",
  },
];

export const caseStudies: CaseStudy[] = [
  {
    title: "Independent PR agency, Manchester",
    slug: "independent-pr-agency-senior-account-director",
    status: "draft",
    clientType: "Independent PR agency",
    sector: "PR and communications",
    roleHired: "Senior Account Director",
    serviceSlug: "agency-recruitment",
    challengeSummary:
      "Needed someone who could lead clients, mentor the team and take pressure off the founder.",
    clientContext:
      "An independent Manchester agency needed senior client leadership without adding another layer of management for the sake of it.",
    hiringChallenge:
      "The agency needed a candidate who could win trust with clients quickly, support junior team members and operate without constant founder input.",
    whyHard:
      "Senior agency candidates can look similar on paper. The difference is often client maturity, commercial judgement and how they behave under pressure.",
    businessProblem:
      "The founder needed senior client leadership that would remove pressure rather than create another layer to manage.",
    whyHireMattered:
      "The hire needed to protect client confidence, support the team and give the founder more commercial headspace.",
    whatMadeItTricky:
      "The right person had to bring PR and communications depth, but the real test was judgement with clients and junior people.",
    whatKindOfPerson:
      "A calm senior operator with credible client handling, mentoring ability and enough commercial sense to earn trust quickly.",
    approach: [
      "Clarified the real pressure points behind the title",
      "Mapped candidates with credible PR, comms and client leadership depth",
      "Focused screening on client handling, mentoring and commercial judgement",
    ],
    process:
      "Draft example structure. Add real shortlist, process detail and permissioned timings before publication.",
    outcome:
      "Proof is being checked. Add the confirmed outcome before publication.",
    whatChanged:
      "Proof is being checked. Add verified detail on client confidence, team support and founder capacity before publication.",
    impact:
      "Proof is being checked. Add real commercial impact if it can be disclosed.",
    featured: true,
    seoTitle:
      "Independent PR Agency Senior Account Director Case Study | Essential Resourcing",
    metaDescription:
      "Draft anonymised case study structure for a senior PR agency hire. Add verified outcome before publication.",
  },
  {
    title: "Growth brand Head of Marketing",
    slug: "growth-brand-head-of-marketing",
    status: "draft",
    clientType: "Growth brand",
    sector: "Client-side marketing",
    roleHired: "Head of Marketing",
    serviceSlug: "client-side-marketing-recruitment",
    challengeSummary:
      "Needed someone who could own outcomes, not just manage channels.",
    clientContext:
      "A growing business needed a marketing leader who could connect brand, demand, customer growth and commercial priorities.",
    hiringChallenge:
      "The risk was hiring a channel specialist into a role that required broader judgement and business-stage fit.",
    whyHard:
      "Strong interviewers are not always strong builders. The brief needed evidence of operating in a similar stage of growth.",
    businessProblem:
      "The business needed marketing leadership connected to growth, not a channel owner producing more activity.",
    whyHireMattered:
      "A weak hire would have slowed demand, confused priorities and left the wider business without a useful marketing voice.",
    whatMadeItTricky:
      "The brief needed stage-fit, commercial judgement and proof of building momentum, not just polished interview answers.",
    whatKindOfPerson:
      "A hands-on marketing leader who could connect brand, demand, performance and customer growth without needing perfect conditions.",
    approach: [
      "Defined the business outcomes before discussing channel experience",
      "Pressure-tested salary, team support and decision rights",
      "Screened for stage-fit and measurable commercial impact",
    ],
    process:
      "Draft example structure. Add real process detail before publication.",
    outcome:
      "Proof is being checked. Add the verified outcome before publication.",
    whatChanged:
      "Proof is being checked. Add verified detail on marketing direction, team focus and growth impact before publication.",
    impact:
      "Proof is being checked. Add real commercial impact if permission allows.",
    featured: true,
    seoTitle:
      "Growth Brand Head of Marketing Case Study | Essential Resourcing",
    metaDescription:
      "Draft anonymised case study structure for a client-side Head of Marketing hire. Add verified outcome before publication.",
  },
  {
    title: "Integrated agency strategic interim",
    slug: "integrated-agency-strategic-interim",
    status: "draft",
    clientType: "Integrated agency",
    sector: "Agency leadership",
    roleHired: "Strategic Interim",
    serviceSlug: "strategic-interim",
    challengeSummary:
      "Needed senior commercial rhythm, team direction and momentum during a transition.",
    clientContext:
      "An agency needed experienced leadership support without immediately committing to a permanent senior hire.",
    hiringChallenge:
      "The brief required someone embedded enough to shape decisions, not a consultant producing abstract recommendations.",
    whyHard:
      "Interim leaders need credibility quickly. They must manage stakeholders, challenge decisions and still be practical.",
    businessProblem:
      "The agency needed senior direction and operating rhythm without committing too early to a permanent leadership salary.",
    whyHireMattered:
      "The right interim would create momentum during transition and give the team clearer decisions week by week.",
    whatMadeItTricky:
      "The work needed someone embedded enough to influence reality, not a detached adviser producing a tidy deck.",
    whatKindOfPerson:
      "A credible senior operator who could challenge usefully, steady the team and keep the commercial rhythm honest.",
    approach: [
      "Defined the outcome and operating rhythm",
      "Prioritised candidates with agency leadership and commercial maturity",
      "Kept scope focused on momentum, clarity and team confidence",
    ],
    process:
      "Draft example structure. Add real scope and timing before publication.",
    outcome:
      "Proof is being checked. Add the verified outcome before publication.",
    whatChanged:
      "Proof is being checked. Add verified detail on operating rhythm, team confidence and commercial progress before publication.",
    impact:
      "Proof is being checked. Add real commercial impact if permission allows.",
    featured: true,
    seoTitle:
      "Strategic Interim Agency Leadership Case Study | Essential Resourcing",
    metaDescription:
      "Draft anonymised case study structure for a strategic interim agency leadership brief.",
  },
];

export const salarySnapshots: SalarySnapshot[] = [
  {
    title: "North West Marketing Salary Snapshot",
    slug: "north-west-marketing-salary-snapshot",
    status: "draft",
    quarter: "Draft for 2026 update",
    market: "North West marketing",
    intro:
      "A draft salary snapshot for senior marketing roles in the North West. Add current, checked salary data before publishing it as advice.",
    commentary: [
      "Salary data should be reviewed against current briefs, candidate conversations and market movement before publication.",
      "The table is intentionally semantic HTML so search engines and AI systems can understand the content.",
    ],
    rows: [
      {
        role: "Head of Marketing",
        low: "To validate",
        mid: "To validate",
        high: "To validate",
        notes: "Add range once current data is confirmed.",
      },
      {
        role: "Marketing Director",
        low: "To validate",
        mid: "To validate",
        high: "To validate",
        notes: "Add range once current data is confirmed.",
      },
      {
        role: "Senior PR / Communications Lead",
        low: "To validate",
        mid: "To validate",
        high: "To validate",
        notes: "Add range once current data is confirmed.",
      },
    ],
    hiringNotes: [
      "Clarify whether the role is a builder, operator or strategic leader before benchmarking salary.",
      "Hybrid expectations, team size and decision rights can shift candidate appetite.",
    ],
    candidateAvailability: [
      "Strong senior candidates are rarely waiting on job boards.",
      "Salary expectations move quickly when the brief requires commercial ownership.",
    ],
    takeaways: [
      "Do not benchmark senior roles by title alone.",
      "Use market advice before committing to a public salary band.",
    ],
    seoTitle: "North West Marketing Salary Snapshot | Essential Resourcing",
    metaDescription:
      "Draft North West marketing salary snapshot with semantic salary table and hiring notes.",
  },
  {
    title: "PR & Communications Salary Snapshot",
    slug: "pr-communications-salary-snapshot",
    status: "draft",
    quarter: "Draft for 2026 update",
    market: "PR and communications",
    intro:
      "A draft PR and communications salary snapshot structure ready for current data validation.",
    commentary: [
      "Agency and client-side PR titles need careful comparison before salary ranges are published.",
    ],
    rows: [
      {
        role: "Senior Account Director",
        low: "To validate",
        mid: "To validate",
        high: "To validate",
        notes: "Agency-side range to confirm.",
      },
      {
        role: "Communications Lead",
        low: "To validate",
        mid: "To validate",
        high: "To validate",
        notes: "Client-side range to confirm.",
      },
    ],
    hiringNotes: [
      "Separate press office, corporate comms, content and strategic communications expectations.",
    ],
    candidateAvailability: [
      "Senior PR candidates often prioritise leadership quality and client mix, not only salary.",
    ],
    takeaways: ["Benchmark against responsibility, not title alone."],
    seoTitle: "PR & Communications Salary Snapshot | Essential Resourcing",
    metaDescription:
      "Draft PR and communications salary snapshot for validation before publication.",
  },
  {
    title: "Digital and Performance Marketing Salary Snapshot",
    slug: "digital-performance-marketing-salary-snapshot",
    status: "draft",
    quarter: "Draft for 2026 update",
    market: "Digital and performance marketing",
    intro:
      "A draft salary snapshot for digital, performance, CRM and demand generation roles. Add current, checked data before publishing.",
    commentary: [
      "Digital and performance salaries should be checked against channel ownership, budget responsibility, reporting line and commercial expectations.",
    ],
    rows: [
      {
        role: "Performance Marketing Lead",
        low: "To validate",
        mid: "To validate",
        high: "To validate",
        notes: "Confirm against current budget ownership and channel mix.",
      },
      {
        role: "Digital Marketing Manager",
        low: "To validate",
        mid: "To validate",
        high: "To validate",
        notes:
          "Confirm against paid, organic, CRM and analytics responsibilities.",
      },
    ],
    hiringNotes: [
      "Separate hands-on channel execution from strategic growth ownership before benchmarking.",
    ],
    candidateAvailability: [
      "Strong digital candidates can move quickly when the scope, budget and decision rights are clear.",
    ],
    takeaways: [
      "Do not compare digital salaries without checking budget, team and commercial accountability.",
    ],
    seoTitle:
      "Digital and Performance Marketing Salary Snapshot | Essential Resourcing",
    metaDescription:
      "Draft digital and performance marketing salary snapshot for validation before publication.",
  },
  {
    title: "Senior Marketing Leadership Salary Snapshot",
    slug: "senior-marketing-leadership-salary-snapshot",
    status: "draft",
    quarter: "Draft for 2026 update",
    market: "Senior marketing leadership",
    intro:
      "A draft salary snapshot for senior marketing leadership roles. Add verified salary data before publishing.",
    commentary: [
      "Senior marketing leadership ranges should be benchmarked against commercial ownership, team size, board exposure and business stage.",
    ],
    rows: [
      {
        role: "Marketing Director",
        low: "To validate",
        mid: "To validate",
        high: "To validate",
        notes: "Confirm against team size, budget and reporting line.",
      },
      {
        role: "CMO / Fractional CMO",
        low: "To validate",
        mid: "To validate",
        high: "To validate",
        notes:
          "Separate permanent, fractional and interim scope before comparing.",
      },
    ],
    hiringNotes: [
      "Clarify whether the role is strategic leadership, hands-on building or both.",
    ],
    candidateAvailability: [
      "Senior leaders judge the brief, decision process and ambition as much as the salary.",
    ],
    takeaways: [
      "Leadership salaries need context. The title alone tells you very little.",
    ],
    seoTitle:
      "Senior Marketing Leadership Salary Snapshot | Essential Resourcing",
    metaDescription:
      "Draft senior marketing leadership salary snapshot for validation before publication.",
  },
  {
    title: "Agency Hiring Market Snapshot",
    slug: "agency-hiring-market-snapshot",
    status: "draft",
    quarter: "Draft for 2026 update",
    market: "Agency hiring",
    intro:
      "A draft agency hiring market snapshot covering senior client services, PR, digital and agency leadership roles.",
    commentary: [
      "Agency market commentary should account for client mix, margin pressure, pace, hybrid expectations and senior candidate appetite.",
    ],
    rows: [
      {
        role: "Account Director / Senior Account Director",
        low: "To validate",
        mid: "To validate",
        high: "To validate",
        notes:
          "Confirm by agency type, client complexity and leadership expectations.",
      },
      {
        role: "Agency Operations / Commercial Lead",
        low: "To validate",
        mid: "To validate",
        high: "To validate",
        notes:
          "Confirm by remit, reporting line and commercial accountability.",
      },
    ],
    hiringNotes: [
      "Agency titles vary heavily. Benchmark against responsibility, not title alone.",
    ],
    candidateAvailability: [
      "Senior agency candidates often move for better leadership, clearer clients and commercial trust.",
    ],
    takeaways: [
      "More CVs rarely fix an agency brief if the proposition is weak.",
    ],
    seoTitle: "Agency Hiring Market Snapshot | Essential Resourcing",
    metaDescription:
      "Draft agency hiring market snapshot for validation before publication.",
  },
];

export const jobs: Job[] = [
  {
    title: "Senior Account Director",
    slug: "senior-account-director-draft",
    status: "draft",
    salaryRange: "Add confirmed salary",
    salaryCurrency: "GBP",
    salaryPeriod: "to_be_confirmed",
    salaryVisibility: "to_be_confirmed",
    rateMin: undefined,
    rateMax: undefined,
    ratePeriod: "to_be_confirmed",
    salary: "Add confirmed salary",
    salaryStatus: "unverified",
    salaryTransparencyNote:
      "Draft only. Do not publish until the salary or rate range is confirmed.",
    location: "Manchester / hybrid",
    officeLocation: "Add the confirmed office base before publication.",
    workingPattern: "to_be_confirmed",
    hybridPattern:
      "Add the actual office rhythm before this role is published.",
    remotePossible: "to_be_confirmed",
    hybrid: "Hybrid",
    hybridReality:
      "Add the actual office rhythm before this role is published.",
    locationExpectation:
      "Add the real location expectation, including any client-site or office days.",
    travelExpectation:
      "Add any travel, client-site or regional meeting expectations before publication.",
    employmentType: "Full-time",
    sector: "Agency",
    specialism: "PR & Communications",
    roleType: "Permanent",
    seniority: "Senior",
    agencyOrClientSide: "agency",
    whyRoleExists:
      "This draft exists so David can prepare the role properly before it is shown as a live opportunity.",
    whyThisRoleMatters:
      "This draft exists so David can prepare the role properly before it is shown as a live opportunity.",
    successInThreeMonths:
      "Add the first practical outcomes the person should have delivered.",
    successInSixMonths:
      "Add what should be working better by month six.",
    successInTwelveMonths:
      "Add the longer-term impact only if the client has agreed it.",
    summary:
      "Draft role note for a senior agency hire. This is not a live vacancy until David marks it live.",
    description: [
      "This draft is here so the role can be written properly before it goes live.",
      "When a role is live, this page should include a clear brief, salary, location, responsibilities and requirements.",
    ],
    davidsTake: [
      "Add David's plain-English take before publication: what matters, what the CV will not show and what candidates should know.",
    ],
    responsibilities: [
      "Lead senior client relationships",
      "Support and mentor account teams",
      "Bring commercial judgement to client work",
    ],
    mustHaves: [
      "Credible agency client leadership",
      "Strong PR and communications judgement",
      "Evidence of mentoring or leading account teams",
    ],
    niceToHaves: [
      "Sector depth that matches the client portfolio",
      "Experience helping founders or directors create more headspace",
    ],
    whatGoodLooksLike: [
      "Add the real outcomes the person needs to create before publication.",
    ],
    requirements: [
      "Strong agency experience",
      "Credible client leadership",
      "Clear communication and judgement under pressure",
    ],
    benefits: ["Add real benefits before publication"],
    interviewSteps: [
      "Add the expected interview steps before publication.",
      "Confirm who the candidate will meet and likely timings.",
    ],
    interviewProcessConfirmed: "to_be_confirmed",
    interviewProcess: [
      "Add the expected interview steps before publication.",
      "Confirm who the candidate will meet and likely timings.",
    ],
    processOverview:
      "Typical process for this kind of role. Confirm the exact client stages before publication.",
    processSteps: [
      "Apply or send a LinkedIn/profile note.",
      "David reviews the application directly.",
      "Quick call with David if there is a possible fit.",
      "Client first stage when the role is confirmed.",
      "Task, presentation or final stage only if the client genuinely needs it.",
      "Offer, feedback or clear next step.",
    ],
    expectedTimeline:
      "Typical process timing to confirm before this role is published.",
    taskRequired: "to_be_confirmed",
    presentationRequired: "to_be_confirmed",
    firstStageFormat:
      "Typical first stage to confirm with the client before publication.",
    finalStageFormat:
      "Typical final stage to confirm with the client before publication.",
    feedbackExpectation:
      "David will keep candidates updated where there is a relevant next step. Do not promise feedback timings until the client process is confirmed.",
    applicationReviewTimeframe:
      "David reviews applications directly. Confirm any role-specific response timings before publication.",
    applicationProcess: [
      "David reviews the note or application directly.",
      "If it looks like a possible fit, David contacts the candidate to discuss the role properly.",
      "Nothing is sent to a client without the candidate's permission.",
    ],
    applicationProcessNotes:
      "Add any role-specific notes about application review, shortlisting or likely timings before publication.",
    applicationNotes:
      "Add any role-specific application notes before publication.",
    candidatePrivacyNote:
      "Candidate details stay private and are only used for recruitment purposes. CV upload is not enabled until secure storage is configured.",
    candidateDataHandling:
      "Candidate details stay private and are only used for recruitment purposes. CV upload is not enabled until secure storage is configured.",
    quickQuestionEnabled: true,
    whatsappQuestionEnabled: true,
    quickQuestionRoute:
      "Candidates can ask David a quick question by WhatsApp before applying.",
    applicationCta: {
      label: "Start application",
      href: "/contact",
      variant: "primary",
    },
    applicationEmail: "david@essentialresourcing.co.uk",
    postedDate: "2026-06-09",
    publishedDate: "2026-06-09",
    updatedDate: "2026-06-09",
    seoTitle: "Senior Account Director Draft Role | Essential Resourcing",
    metaDescription:
      "Draft job page structure for a Senior Account Director role. Not a live vacancy.",
  },
];

export const richMediaExamples: RichMedia[] = [
  strategicInterimVideo,
  {
    type: "image",
    title: "Manchester-led recruitment imagery",
    src: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80",
    alt: "Abstract architectural detail suitable for a premium Manchester-led recruitment website",
    caption: "Manchester-led, UK-wide, with real photography to follow.",
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getInsight(slug: string) {
  return insights.find(
    (insight) => insight.slug === slug && insight.status === "published",
  );
}

export function getCaseStudy(slug: string) {
  return caseStudies.find((caseStudy) => caseStudy.slug === slug);
}

export function getSalarySnapshot(slug: string) {
  return salarySnapshots.find((snapshot) => snapshot.slug === slug);
}

export function getJob(slug: string) {
  return jobs.find((job) => job.slug === slug);
}

const vagueSalaryPattern =
  /\b(add confirmed salary|tbc|competitive salary|competitive|depending on experience|doe|market rate)\b/i;
const emptyJobListPattern =
  /\b(add |to be confirmed|tbc|confirm |before publication|draft only|draft role|this draft)\b/i;
const candidateBuzzwordPattern =
  /\b(ninja|rockstar|superstar|wizard|guru|unicorn|exciting opportunity|fast-paced environment|dynamic team|hit the ground running|wear many hats)\b/i;
const publishableSalaryVisibility = ["public_range", "indicative_range"];
const ratePeriods = ["daily", "hourly", "weekly", "monthly", "fixed"];

export function getJobTransparencyIssues(job: Job) {
  const issues: string[] = [];
  const searchableCopy = [
    job.title,
    job.summary,
    job.whyRoleExists,
    job.whyThisRoleMatters,
    job.applicationNotes,
    job.candidatePrivacyNote,
    ...job.description,
    ...job.davidsTake,
    ...job.responsibilities,
    ...job.requirements,
  ].join(" ");

  if (
    job.salaryStatus === "unverified" ||
    !publishableSalaryVisibility.includes(job.salaryVisibility) ||
    vagueSalaryPattern.test(job.salary) ||
    vagueSalaryPattern.test(job.salaryRange)
  ) {
    issues.push("salary_or_rate_not_confirmed");
  }

  if (
    publishableSalaryVisibility.includes(job.salaryVisibility) &&
    !job.salaryCurrency.trim()
  ) {
    issues.push("salary_currency_missing");
  }

  if (
    job.salaryStatus !== "unverified" &&
    (typeof job.salaryMin !== "number" || typeof job.salaryMax !== "number")
  ) {
    issues.push("salary_min_max_missing");
  }

  if (
    publishableSalaryVisibility.includes(job.salaryVisibility) &&
    ratePeriods.includes(job.ratePeriod) &&
    (typeof job.rateMin !== "number" || typeof job.rateMax !== "number") &&
    (typeof job.salaryMin !== "number" || typeof job.salaryMax !== "number")
  ) {
    issues.push("rate_min_max_missing");
  }

  if (
    job.salaryStatus !== "unverified" &&
    job.salaryPeriod === "to_be_confirmed"
  ) {
    issues.push("salary_period_missing");
  }

  if (!job.salaryTransparencyNote.trim()) {
    issues.push("salary_transparency_note_missing");
  }

  if (!job.location.trim()) issues.push("location_missing");
  if (
    !job.officeLocation.trim() ||
    emptyJobListPattern.test(job.officeLocation)
  ) {
    issues.push("office_location_missing");
  }

  if (!job.workingPattern.trim() || job.workingPattern === "to_be_confirmed") {
    issues.push("working_pattern_missing");
  }

  if (
    !job.hybridPattern.trim() ||
    emptyJobListPattern.test(job.hybridPattern)
  ) {
    issues.push("hybrid_pattern_missing");
  }

  if (job.remotePossible === "to_be_confirmed") {
    issues.push("remote_possible_missing");
  }

  if (
    !job.hybridReality.trim() ||
    emptyJobListPattern.test(job.hybridReality)
  ) {
    issues.push("hybrid_reality_missing");
  }

  if (
    !job.locationExpectation.trim() ||
    emptyJobListPattern.test(job.locationExpectation)
  ) {
    issues.push("location_expectation_missing");
  }

  if (
    !job.travelExpectation.trim() ||
    emptyJobListPattern.test(job.travelExpectation)
  ) {
    issues.push("travel_expectation_missing");
  }

  if (!job.roleType.trim()) issues.push("role_type_missing");
  if (!job.seniority.trim()) issues.push("seniority_missing");
  if (!job.sector.trim()) issues.push("sector_missing");
  if (job.agencyOrClientSide === "to_be_confirmed") {
    issues.push("agency_or_client_side_missing");
  }

  if (!job.whyRoleExists.trim()) {
    issues.push("why_role_exists_missing");
  }

  if (!job.whyThisRoleMatters.trim()) {
    issues.push("why_role_exists_missing");
  }

  if (job.davidsTake.length === 0) issues.push("davids_take_missing");
  if (job.mustHaves.length === 0) issues.push("must_haves_missing");
  if (job.niceToHaves.length === 0) issues.push("nice_to_haves_missing");
  if (job.whatGoodLooksLike.length === 0) {
    issues.push("what_good_looks_like_missing");
  }
  if (
    ![
      job.successInThreeMonths,
      job.successInSixMonths,
      job.successInTwelveMonths,
    ].some((item) => item.trim())
  ) {
    issues.push("success_indicators_missing");
  }
  if (job.interviewSteps.length === 0) {
    issues.push("interview_steps_missing");
  }
  if (job.interviewProcessConfirmed === "to_be_confirmed") {
    issues.push("interview_process_not_confirmed");
  }
  if (job.interviewProcess.length === 0) {
    issues.push("interview_process_missing");
  }
  if (job.applicationProcess.length === 0) {
    issues.push("application_process_missing");
  }

  const candidateFacingCopy = [
    job.summary,
    job.whyThisRoleMatters,
    job.salaryTransparencyNote,
    job.hybridReality,
    job.hybridPattern,
    job.locationExpectation,
    job.travelExpectation,
    job.applicationNotes,
    job.applicationProcessNotes,
    job.candidatePrivacyNote,
    job.candidateDataHandling,
    job.quickQuestionRoute,
    ...job.davidsTake,
    ...job.description,
    ...job.responsibilities,
    ...job.mustHaves,
    ...job.niceToHaves,
    ...job.whatGoodLooksLike,
    job.successInThreeMonths,
    job.successInSixMonths,
    job.successInTwelveMonths,
    ...job.requirements,
    ...job.benefits,
    ...job.interviewSteps,
    ...job.interviewProcess,
    ...job.applicationProcess,
  ];

  if (candidateFacingCopy.some((item) => emptyJobListPattern.test(item))) {
    issues.push("candidate_transparency_placeholders_present");
  }

  if (!job.candidateDataHandling.trim()) {
    issues.push("candidate_data_handling_missing");
  }

  if (!job.candidatePrivacyNote.trim()) {
    issues.push("candidate_privacy_note_missing");
  }

  if (!job.applicationNotes.trim()) {
    issues.push("application_notes_missing");
  }

  if (!job.applicationProcessNotes.trim()) {
    issues.push("application_process_notes_missing");
  }

  if (!job.quickQuestionRoute.trim()) {
    issues.push("quick_question_route_missing");
  }

  if (candidateBuzzwordPattern.test(searchableCopy)) {
    issues.push("buzzword_jargon_present");
  }

  return issues;
}

export function isJobCandidateTransparent(job: Job) {
  return getJobTransparencyIssues(job).length === 0;
}

function todayIsoDate(referenceDate = new Date()) {
  return referenceDate.toISOString().slice(0, 10);
}

export function isJobLive(job: Job, referenceDate = new Date()) {
  if (job.status !== "live") return false;
  if (!isJobCandidateTransparent(job)) return false;
  if (!job.closingDate) return true;
  return job.closingDate >= todayIsoDate(referenceDate);
}

export function isJobClosed(job: Job, referenceDate = new Date()) {
  if (job.status === "closed") return true;
  if (job.status !== "live" || !job.closingDate) return false;
  return job.closingDate < todayIsoDate(referenceDate);
}
