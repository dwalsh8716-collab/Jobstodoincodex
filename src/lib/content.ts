import { salaryGuideInsight } from "./salary-guide-2026";
import { havasSearchStory } from "./havas-search-story";
import type {
  CaseStudy,
  ClientProofQuote,
  Insight,
  Job,
  LinkedInRecommendation,
  RichMedia,
  SalarySnapshot,
  Service,
} from "./types";

export const proofPoints = [
  "Manchester-based, UK-wide",
  "Senior hires, specialist roles and Fractional",
  "Agency-side and client-side",
];

export const whyEssential = [
  "Technology helps find the market",
  "Experience gets behind the CV",
  "Fewer CVs. Better conversations.",
  "Honest market advice",
  "Specialist marketing and agency knowledge",
  "Proper human judgement",
];

export const linkedInRecommendations: LinkedInRecommendation[] = [
  {
    name: "Abby White",
    role: "Founder & CEO at hAWk comms",
    date: "August 2026",
    excerpt: "David is incredibly well connected across the agency world.",
    proofPoint: "Agency network",
    serviceSlugs: ["permanent-recruitment", "retained-search"],
  },
  {
    name: "Mark Varley",
    role: "Commercial & agency leader",
    date: "June 2026",
    excerpt:
      "He has a refreshingly honest approach and believes in doing things the right way.",
    proofPoint: "Honest advice",
    serviceSlugs: [
      "permanent-recruitment",
      "retained-search",
      "fractional",
      "market-intelligence-advisory",
    ],
  },
  {
    name: "Hanna Dymond",
    role: "Paid media lead",
    date: "April 2026",
    excerpt:
      "Professionalism, transparency and deep understanding of both the role and the wider digital marketing landscape.",
    proofPoint: "Digital marketing understanding",
    serviceSlugs: ["permanent-recruitment", "retained-search"],
  },
  {
    name: "Lorna Bithell",
    role: "Senior PR consultant",
    date: "June 2024",
    excerpt:
      "Supportive, proactive, and communicative. He also really understands the public relations field.",
    proofPoint: "Candidate care",
    serviceSlugs: ["permanent-recruitment"],
  },
  {
    name: "Eleanor Mitchell",
    role: "Communications planning lead",
    date: "April 2024",
    excerpt:
      "He had my best interests at heart, not just getting a bum on a seat.",
    proofPoint: "Candidate-first process",
    serviceSlugs: ["permanent-recruitment"],
  },
  {
    name: "Bradley Tooth",
    role: "Founder at You Know Who",
    date: "June 2023",
    excerpt: "Honest, reliable and personable.",
    proofPoint: "Delivered against the brief",
    serviceSlugs: ["permanent-recruitment", "retained-search", "fractional"],
  },
];

export const clientProofQuotes: ClientProofQuote[] = [
  {
    name: "Stu Lunn",
    role: "CEO",
    company: "Omnicom Media Group UK",
    companyUrl: "https://omnicommedia.com/uk/",
    quote:
      "David took time to understand our agency culture before sending a single CV. The hire he made is now our Head of Digital, two years later.",
    proofPoint: "Agency leadership hire",
    personImage: "/assets/images/proof/stu-lunn-omnicom-media-group.webp",
    personImageAlt: "Stu Lunn, CEO at Omnicom Media Group UK",
    brandLogo: "/assets/images/proof/omnicom-media-group-logo.webp",
    brandLogoAlt: "Omnicom Media Group logo",
  },
  {
    name: "Mike Wallwork",
    role: "Chief Digital Officer",
    company: "Footasylum",
    companyUrl: "https://www.footasylum.com/",
    quote:
      "No fluff, no nonsense. David told us what we needed to hear, not what we wanted to hear. That honesty saved us from a bad hire.",
    proofPoint: "Client-side digital leadership",
    personImage: "/assets/images/proof/mike-wallwork-footasylum.webp",
    personImageAlt: "Mike Wallwork, Chief Digital Officer at Footasylum",
    brandLogo: "/assets/images/proof/footasylum-logo.webp",
    brandLogoAlt: "Footasylum logo",
  },
];

export const specialisms = [
  {
    slug: "marketing-and-leadership",
    title: "Marketing & Leadership",
    description:
      "Marketing leaders and specialists, from Marketing Executive through to Head of Marketing, Marketing Director and CMO.",
    detail:
      "Brand, product marketing, growth and broader marketing roles sit here too.",
    seoTitle: "Marketing & Leadership Recruitment | Essential Resourcing",
    metaDescription:
      "Marketing and leadership recruitment for marketing specialists, Heads of Marketing, Marketing Directors and CMOs across Manchester, the North West and UK.",
  },
  {
    slug: "digital-performance-ecommerce",
    title: "Digital, Performance & eCommerce",
    description:
      "Digital and commercially focused specialists across performance, paid media, PPC, SEO, CRM, eCommerce, acquisition and retention.",
    detail:
      "From hands-on specialists through to Heads of Digital, Performance Directors and digital leadership.",
    seoTitle: "Digital & eCommerce Recruitment | Essential",
    metaDescription:
      "Digital, performance and eCommerce recruitment across PPC, SEO, paid media, CRM, acquisition, retention and digital leadership roles.",
  },
  {
    slug: "pr-communications-content",
    title: "PR, Communications & Content",
    description:
      "PR, communications, corporate comms, content, social, influencer and reputation roles across agency and client-side teams.",
    detail:
      "From Account Executives and Managers through to Heads of Communications, PR Directors and senior leaders.",
    seoTitle: "PR & Communications Recruitment | Essential",
    metaDescription:
      "PR, communications and content recruitment across agency and client-side teams, from account roles to PR Directors and senior communications leaders.",
  },
  {
    slug: "agency-client-services-leadership",
    title: "Agency Client Services & Leadership",
    description:
      "The people who lead clients, teams and agencies, from Account Manager and Account Director through to Business Director, Managing Partner and Managing Director.",
    detail:
      "PR, digital, integrated, creative, media and performance agencies.",
    seoTitle: "Agency Client Services Recruitment | Essential",
    metaDescription:
      "Agency client services and leadership recruitment across Account Manager, Account Director, Business Director and Managing Partner roles.",
  },
] as const;

export function getSpecialismBySlug(slug: string) {
  return specialisms.find((specialism) => specialism.slug === slug);
}

export const services: Service[] = [
  {
    title: "Permanent Recruitment",
    slug: "permanent-recruitment",
    shortDescription:
      "Success-based recruitment for permanent marketing, digital, PR, communications and agency hires.",
    heroHeadline: "Permanent marketing recruitment. Done properly.",
    heroSubheadline:
      "For permanent marketing, digital, PR, communications and agency hires where you need specialist market knowledge and access to people beyond whoever happens to apply.\n\nIt's the straightforward, success-based recruitment model.\n\nStraightforward doesn't mean chucking CVs at you.",
    audience: [
      "Agencies, brands, growth businesses and marketing teams making specialist or mid-to-senior permanent hires.",
    ],
    problemsSolved: [
      "You need better candidates than the advert is producing, or the brief, salary and proposition need tightening before you properly go to market.",
    ],
    whenToUse: [
      "You know you need somebody permanently and want specialist, success-based recruitment with a proper search behind it.",
    ],
    howEssentialWorks: [
      "I get underneath the brief before searching.",
      "What does this person actually need to do? What's genuinely essential? Does the salary stack up? And why would somebody good want the job?",
      "Then I search the market, speak to the right people and give you a focused shortlist of candidates I genuinely think are worth meeting.",
    ],
    mistakes: [
      "Firing a job advert out and hoping the right person happens to apply",
      "Sending candidates before the recruiter properly understands the brief",
      "Judging people by job title rather than evidence",
      "Dragging feedback out until the best candidate takes another role",
    ],
    processEyebrow: "The Permanent Recruitment process",
    processHeading: "Good people. Properly recruited.",
    processIntro: "A straightforward search. Done with a bit more thought.",
    processSteps: [
      {
        title: "Get underneath the brief",
        description: "What does this person actually need to change?",
      },
      {
        title: "Pressure-test the market",
        description: "Does the salary, title and proposition stack up?",
      },
      {
        title: "Search beyond applicants",
        description: "Search the real market. Not just who's looking.",
      },
      {
        title: "Get behind the CV",
        description: "What did they actually deliver?",
      },
      {
        title: "Build a shortlist worth meeting",
        description: "Fewer people. Better evidence.",
      },
      {
        title: "Interview, offer & onboard",
        description: "Keep momentum and make the hire stick.",
      },
    ],
    marketFitEyebrow: "Where this service fits",
    marketFitHeading:
      "You know roughly what you need. Now let's make sure the brief stacks up.",
    judgementEyebrow: "What David actually does",
    judgementHeading:
      "Fewer CVs. Better conversations. Better hiring decisions.",
    faqs: [
      {
        question:
          "Is Permanent Recruitment the same as contingency recruitment?",
        answer:
          "Broadly, yes. It's the traditional success-based model: you pay a fee when I successfully appoint somebody. But contingent shouldn't mean chucking CVs at the wall and hoping one sticks.",
      },
      {
        question: "Is Permanent Recruitment success-based?",
        answer:
          "Yes. Permanent Recruitment is the straightforward success-based model, but still starts with a proper brief and a focused market search.",
      },
      {
        question: "Which permanent roles does Essential recruit?",
        answer:
          "Marketing, digital, PR, communications and agency roles, from specialist appointments through to senior managers and heads of function.",
      },
      {
        question: "When is retained search a better fit?",
        answer:
          "When the hire is senior, confidential, difficult, commercially important or needs a more committed market-mapping process.",
      },
      {
        question: "Do you only recruit permanent roles in Manchester?",
        answer:
          "No. Essential is Manchester-led and North West-rooted, but permanent marketing searches can run UK-wide when the brief needs it.",
      },
    ],
    relatedServiceSlugs: ["retained-search", "market-intelligence-advisory"],
    relatedInsightSlugs: [
      "how-much-does-senior-marketing-recruitment-cost",
      "why-senior-marketing-hiring-goes-wrong",
    ],
    relatedCaseStudySlugs: [
      "independent-pr-agency-senior-account-director",
      "growth-brand-head-of-marketing",
      "havas-media-manchester-managing-partner-james-reddington",
    ],
    cta: {
      label: "Talk to David",
      href: "/contact",
      variant: "primary",
    },
    ctaHeading: "Need a permanent marketing hire?",
    ctaText:
      "Tell me what you're trying to hire. I'll give you a straight view on the brief, salary and market.",
    searchSummary:
      "Permanent Recruitment works when the role is permanent, the market is reasonably accessible and you want specialist recruitment without committing to a retained search.\n\nTypical briefs span marketing leadership, digital, performance, PR, communications, client services, agency operations and senior specialist appointments.",
    searchPhrases: [
      "marketing recruiters Manchester",
      "permanent marketing recruitment",
      "digital recruitment North West",
      "PR recruitment Manchester",
      "agency recruitment UK",
    ],
    seoTitle: "Permanent Marketing Recruitment | Essential",
    metaDescription:
      "Success-based permanent recruitment for marketing, digital, PR, communications and agency hires across Manchester, the North West and UK.",
  },
  {
    title: "Retained Search",
    slug: "retained-search",
    shortDescription:
      "A deeper, exclusive search for senior, confidential, difficult or commercially important appointments.",
    heroHeadline: "When the hire matters enough to search the market properly.",
    heroSubheadline:
      "For senior, confidential, difficult or commercially important appointments where you want a committed search of the relevant market — not simply a hopeful advert and a pile of CVs.",
    audience: [
      "Founders, CEOs, MDs, CMOs, Marketing Directors and agency leaders making an appointment that really matters.",
    ],
    problemsSolved: [
      "The market is narrow, the strongest candidates aren't necessarily looking and you need more research, coverage and control than a standard recruitment process gives you.",
    ],
    whenToUse: [
      "The hire is senior, confidential, difficult or commercially important enough to justify a committed search of the market.",
    ],
    howEssentialWorks: [
      "It gives the brief a proper mandate.",
      "That means deeper briefing, structured market research, target-company mapping, direct approaches, transparent progress and regular calibration as the search develops.",
      "If the market tells us something different from what we expected, we deal with it while we're searching — not six weeks later when everybody's wondering why the shortlist isn't right.",
      "This isn't about making recruitment sound posher. It's about giving an important hire the search it deserves.",
    ],
    mistakes: [
      "Treating a leadership search like an advert-response exercise",
      "Hiring the best interviewer rather than the best person for the job",
      "Writing the brief around the last person who held the role",
      "Taking three weeks between interviews and wondering where the candidate went",
    ],
    processEyebrow: "The Retained Search process",
    processHeading: "A proper search of the market.",
    processIntro:
      "More research. More visibility. More confidence in the decision.",
    processSteps: [
      {
        title: "Get the brief right",
        description:
          "Define the role, outcomes, behaviours, target market and search parameters.",
      },
      {
        title: "Map the market",
        description: "Identify the relevant talent across the agreed market.",
      },
      {
        title: "Approach",
        description:
          "Professionally engage the people we actually want to speak to.",
      },
      {
        title: "Steer & calibrate",
        description:
          "Share progress, market feedback and adjust the search where needed.",
      },
      {
        title: "Longlist",
        description: "Assess interested candidates against the agreed brief.",
      },
      {
        title: "Shortlist",
        description: "Agree the 3–5 people genuinely worth meeting.",
      },
      {
        title: "Hire",
        description:
          "Interview, select, offer and support the move into the business.",
      },
    ],
    marketFitEyebrow: "Where this service fits",
    marketFitHeading:
      "The right person matters more than getting some CVs quickly.",
    judgementEyebrow: "Why retained?",
    judgementHeading:
      "Retained doesn't mean “the same recruitment, but you pay me some money upfront.”",
    faqs: [
      {
        question:
          "How is Retained Search different from Permanent Recruitment?",
        answer:
          "Retained Search gives the brief a committed mandate and a more research-led process: deeper briefing, market mapping, systematic direct approaches, regular search calibration, longlisting and an agreed shortlist. Permanent Recruitment can work brilliantly when the brief and candidate market are reasonably accessible. Retained is for the appointments where you want to search the relevant market more comprehensively.",
      },
      {
        question: "Can you help shape the brief before the search starts?",
        answer:
          "Yes. The brief, salary, process and market reality should be challenged before the search starts, not after six weeks of disappointment.",
      },
      {
        question: "Which senior roles does Essential recruit?",
        answer:
          "Typical retained briefs include CMOs, Marketing Directors, Managing Directors, Managing Partners, Heads of Marketing, communications leaders and senior agency leadership.",
      },
      {
        question: "Do you run retained searches outside Manchester?",
        answer:
          "Yes. Essential is Manchester-led with strong North West roots, but retained searches can run UK-wide where the brief needs it.",
      },
    ],
    relatedServiceSlugs: [
      "permanent-recruitment",
      "fractional",
      "market-intelligence-advisory",
    ],
    relatedInsightSlugs: [
      "retained-search-vs-contingent-recruitment",
      "when-should-an-agency-use-retained-search",
      "why-senior-marketing-hiring-goes-wrong",
    ],
    relatedCaseStudySlugs: [
      "havas-media-manchester-managing-partner-james-reddington",
      "independent-pr-agency-senior-account-director",
    ],
    cta: {
      label: "Talk to David",
      href: "/contact",
      variant: "primary",
    },
    ctaHeading: "Got a senior hire that needs a proper search?",
    ctaText:
      "Tell me what you're trying to hire and I'll tell you whether Retained Search is actually the right route.",
    searchSummary:
      "Retained Search is for the appointments where you want to know the market has been properly researched, relevant people have been identified and approached, and the process has been continually calibrated rather than left to chance.\n\nTypical searches include CMOs, Marketing Directors, Managing Directors, Managing Partners, Heads of Marketing, senior communications leaders and agency leadership.",
    searchPhrases: [
      "retained marketing recruitment",
      "retained search Manchester",
      "marketing leadership search",
      "senior marketing recruitment Manchester",
      "agency leadership search",
    ],
    seoTitle: "Retained Marketing Search | Essential",
    metaDescription:
      "Retained search for senior, confidential and commercially important marketing, digital, PR and agency leadership appointments across Manchester and the UK.",
  },
  {
    title: "Fractional Leadership",
    slug: "fractional",
    shortDescription:
      "Search and selection for embedded senior marketing and agency leaders when a full-time hire isn't the right answer.",
    heroHeadline:
      "Senior marketing leadership. Just not necessarily five days a week.",
    heroSubheadline:
      "Sometimes the business needs a CMO, Marketing Director or senior agency leader — but another full-time permanent hire isn't necessarily the right answer.\n\nI help you work out what senior capability you actually need, then find the person who can deliver it.",
    audience: [
      "Founders, MDs, agency owners, growth businesses and leadership teams that need experienced marketing leadership now.",
    ],
    problemsSolved: [
      "There's a senior leadership gap, the team needs direction or the business is changing faster than the permanent structure can keep up.",
    ],
    whenToUse: [
      "You need senior capability and accountability, but a five-day-a-week permanent appointment isn't necessarily the answer.",
    ],
    howEssentialWorks: [
      "Fractional generally means senior leadership for part of the working week over an ongoing period.",
      "Interim usually means somebody stepping into a role for a defined temporary period.",
      "Advisory is typically lighter-touch guidance. Consultancy is often project or recommendation-led.",
      "In reality, the lines can blur.",
      "I'd rather understand what you actually need somebody to do and then work out the right model than force the problem into whichever label happens to be fashionable.",
    ],
    mistakes: [
      "Hiring a tactical freelancer when the problem is leadership",
      "Bringing somebody senior in without giving them enough access to make a difference",
      "Leaving the outcome vague",
      "Assuming Fractional Leadership is automatically cheaper rather than asking whether it's the right model",
    ],
    processEyebrow: "Fractional Leadership Search",
    processHeading:
      "Work out what leadership you actually need. Then find the person.",
    processIntro: "Because “we need someone fractional” isn't really a brief.",
    leadershipStages: [
      {
        title: "Define the leadership need",
        label: "Problem · Model · Mandate",
        paragraphs: [
          "What needs fixing, building, changing or leading?",
          "What level of seniority does the business actually need?",
          "What should they own, for how long and with what authority?",
        ],
      },
      {
        title: "Find the right person",
        label: "Search · Assess · Engage · Embed",
        paragraphs: [
          "Find somebody who's genuinely solved something comparable.",
          "Assess whether they can create impact quickly.",
          "Agree the engagement and get them properly into the business.",
        ],
      },
    ],
    processSteps: [
      {
        title: "Define the problem",
        description: "What actually needs changing?",
      },
      {
        title: "Define the model",
        description: "Fractional, interim, advisory or permanent?",
      },
      {
        title: "Define the mandate",
        description:
          "Outcomes, authority, access, time commitment and duration.",
      },
      {
        title: "Search the market",
        description:
          "Find leaders who've genuinely solved comparable problems.",
      },
      {
        title: "Assess for impact",
        description:
          "Can they get useful quickly and bring the team with them?",
      },
      {
        title: "Agree the engagement",
        description:
          "Scope, availability, expectations, commercials and start date.",
      },
      {
        title: "Onboard & review",
        description:
          "Get them properly into the business and keep the original outcomes visible.",
      },
    ],
    marketFitEyebrow: "Fractional Leadership",
    marketFitHeading: "What is Fractional Leadership?",
    judgementEyebrow: "Fractional, interim, advisory & consultancy",
    judgementHeading:
      "Don't get too hung up on the label. Get clear on the problem.",
    faqs: [
      {
        question: "What is a Fractional marketing leader?",
        answer:
          "A Fractional marketing leader is an experienced senior marketer who works with a business for a defined number of days or period to provide leadership, direction and practical support.",
      },
      {
        question: "Is Fractional the same as interim marketing leadership?",
        answer:
          "Sometimes. Fractional often means part-time senior leadership. Interim usually means a defined temporary period. In reality, the right model depends on the business problem.",
      },
      {
        question: "How is Fractional different from consultancy?",
        answer:
          "Consultancy is often advisory. A good Fractional leader gets closer to the business, helps lead the work and stays involved when decisions meet reality.",
      },
      {
        question:
          "Which roles can be filled on an interim or fractional basis?",
        answer:
          "Common roles include Interim CMO, Interim Marketing Director, Interim Head of Marketing, Interim Growth Director, Interim Digital Director and senior agency leadership.",
      },
      {
        question: "How many days a week does a Fractional leader usually work?",
        answer:
          "It depends on the problem. Some businesses need one day a week, others need two or three. The right answer comes from the outcome, not the title.",
      },
    ],
    relatedServiceSlugs: ["retained-search", "market-intelligence-advisory"],
    relatedInsightSlugs: [
      "what-is-a-fractional-marketing-leader",
      "do-you-actually-need-a-full-time-marketing-director",
    ],
    relatedCaseStudySlugs: ["integrated-agency-fractional"],
    cta: {
      label: "Discuss Fractional Leadership",
      href: "/contact",
      variant: "primary",
    },
    ctaHeading:
      "Need senior marketing leadership without rushing into another permanent hire?",
    ctaText:
      "Tell me what's going on. I'll give you a straight view on whether Fractional actually makes sense.",
    searchSummary:
      "A Fractional leader is an experienced senior operator who joins the business for an agreed amount of time to help lead against a defined commercial problem.\n\nThey might work one, two or three days a week. The important bit isn't the number of days. It's what they're there to change.\n\nUnlike traditional advisory consultancy, the right Fractional leader gets properly into the business, works with the team and remains involved when the plan meets reality.",
    searchPhrases: [
      "fractional CMO",
      "fractional marketing director",
      "fractional marketing leader",
      "fractional marketing leadership Manchester",
      "fractional agency leadership",
      "fractional marketing leadership North West",
    ],
    seoTitle: "Fractional Marketing Leadership | Essential Resourcing",
    metaDescription:
      "Find Fractional CMOs, Marketing Directors and senior marketing or agency leaders when you need experienced leadership without immediately making another full-time permanent hire.",
  },
  {
    title: "Market Intelligence & Advisory",
    slug: "market-intelligence-advisory",
    shortDescription:
      "Salary benchmarking, talent mapping, competitor intelligence, brief design and hiring advice.",
    heroHeadline: "Before you recruit, make sure the brief actually stacks up.",
    heroSubheadline:
      "Sometimes the most useful thing I can do is tell you not to start recruiting yet.\n\nMaybe the salary is wrong. Maybe the brief is actually three jobs. Maybe you're not sure what level you need. Or maybe you want to understand where the talent actually sits before committing to a search.",
    audience: [
      "Founders, CEOs, MDs, People leaders, marketing leaders and agencies making an important hiring or team decision.",
    ],
    problemsSolved: [
      "You're missing the market evidence needed to decide what to hire, what to pay or whether the brief is realistic.",
    ],
    whenToUse: [
      "Before, during or instead of recruitment when salary, scope, structure, talent availability or market reality needs checking.",
    ],
    howEssentialWorks: [
      "No 87-page consultancy deck.",
      "Just useful information that helps you make a better hiring decision.",
      "Sometimes that means sharpening the brief. Sometimes it means changing the salary. And sometimes it means not recruiting yet.",
    ],
    mistakes: [
      "Starting recruitment before the brief is commercially clear",
      "Trusting salary calculators without checking the real market",
      "Assuming the person you have described exists at the salary you want to pay",
      "Mistaking competitor gossip for useful intelligence",
    ],
    processEyebrow: "Market Intelligence",
    processHeading: "Get the market facts before you make the hiring decision.",
    processIntro:
      "Sometimes the answer is to recruit. Sometimes it's to change the brief, change the salary, go Fractional — or not hire yet.",
    evidenceAreas: [
      {
        title: "Market Mapping",
        description: "Where does the relevant talent actually sit?",
      },
      {
        title: "Salary Intelligence",
        description: "What does the market realistically pay?",
      },
      {
        title: "Talent Availability",
        description: "How much relevant talent is actually out there?",
      },
      {
        title: "Competitor Intelligence",
        description: "How are comparable businesses structured?",
      },
      {
        title: "Hiring Feasibility",
        description: "Does the brief and proposition actually stack up?",
      },
    ],
    advisoryAreas: [
      {
        title: "Salary benchmarking",
        description:
          "What are comparable people actually earning across Manchester, the North West and wider UK?",
      },
      {
        title: "Talent mapping",
        description:
          "Where does the relevant talent sit and how big is the realistic candidate market?",
      },
      {
        title: "Competitor / team intelligence",
        description:
          "How are comparable businesses structuring their marketing, digital or agency teams?",
      },
      {
        title: "Brief design",
        description:
          "What level and type of person does the business actually need?",
      },
      {
        title: "Market testing",
        description:
          "Will the salary, location, hybrid model, title and proposition attract the people you're targeting?",
      },
      {
        title: "Hiring advisory",
        description:
          "How should you structure the interview, assessment and eventual hiring decision?",
      },
    ],
    marketFitEyebrow: "Where this service fits",
    marketFitHeading:
      "Market Intelligence & Advisory is useful before, during or instead of recruitment.",
    judgementEyebrow: "Commercial reality check",
    judgementHeading:
      "Does the person you're describing actually exist — and what are they going to cost?",
    faqs: [
      {
        question: "Can Essential help with salary benchmarking?",
        answer:
          "Yes. David can help sense-check salary, level, location, hybrid expectations and whether the package fits the market you're trying to reach.",
      },
      {
        question: "What is talent mapping?",
        answer:
          "Talent mapping means working out where the relevant people actually sit, how large the realistic candidate market is and where the search may become difficult.",
      },
      {
        question: "Can you help design the brief before recruitment starts?",
        answer:
          "Yes. Sometimes the biggest value is working out whether you need a Marketing Director, Head of Marketing, Performance Director, Fractional CMO or something else entirely.",
      },
      {
        question: "Is this a big consultancy project?",
        answer:
          "No. It is practical hiring advice and market intelligence designed to help you make a better decision, not a giant deck nobody reads.",
      },
    ],
    relatedServiceSlugs: ["permanent-recruitment", "retained-search"],
    relatedInsightSlugs: [
      "what-should-you-pay-a-senior-marketing-hire-in-2026",
      "how-to-hire-a-marketing-director-without-wasting-six-weeks",
      "how-much-does-senior-marketing-recruitment-cost",
    ],
    relatedCaseStudySlugs: [],
    cta: {
      label: "Get a market view",
      href: "/contact",
      variant: "primary",
    },
    ctaHeading: "Need to check the market before you recruit?",
    ctaText:
      "Tell me what you're thinking. I'll help you work out whether the brief, salary and candidate market actually stack up.",
    searchSummary:
      "A defined piece of research to give you useful evidence before committing to a search. Sometimes the answer is to reshape the brief or salary. Sometimes it's not to recruit yet.",
    searchPhrases: [
      "marketing recruitment market intelligence",
      "salary benchmarking marketing roles",
      "talent mapping marketing recruitment",
      "marketing hiring advisory",
      "marketing recruitment brief design",
    ],
    seoTitle: "Market Intelligence & Advisory | Essential",
    metaDescription:
      "Salary benchmarking, talent mapping, competitor intelligence, brief design and market advice for marketing, digital, PR and agency hiring.",
  },
];

const fractionalVideo: RichMedia = {
  type: "video",
  provider: "youtube",
  title: "Fractional: senior help without another permanent hire.",
  url: "",
  description:
    "For businesses that need experienced direction now, without rushing into a permanent decision.",
};

export const homepageFeatureVideo: RichMedia = {
  type: "video",
  provider: "youtube",
  title: "The problem behind the hire matters more than the job title.",
  url: "",
  thumbnail: "/assets/images/david-walsh-founder.jpg",
  thumbnailAlt:
    "David Walsh, founder of Essential Resourcing and marketing recruitment specialist in Manchester",
  description:
    "David's short version: work out what the business actually needs before asking the market for another job title.",
};

export const insights: Insight[] = [
  salaryGuideInsight,
  {
    title:
      "Marketing Recruitment in Manchester & the North West: A Straight-Talking Guide",
    slug: "marketing-recruitment-manchester-north-west-guide",
    status: "published",
    category: "Hiring advice",
    cardCategory: "Hiring advice / Market commentary",
    excerpt:
      "A practical guide to hiring marketing, digital, PR and agency talent across Manchester and the North West.",
    cardExcerpt:
      "A straight-talking guide to the Manchester and North West marketing market, salaries, briefs and hiring routes.",
    publishedDate: "2026-09-15",
    updatedDate: "2026-09-15",
    readingTime: "8 min read",
    author: "David Walsh",
    body: [
      {
        heading:
          "Marketing recruitment in Manchester isn’t about finding more CVs",
        content: [
          "I’ve recruited marketing, digital, PR, communications and agency people across Manchester and the North West for a long time.",
          "And the market has changed.",
          "Technology has made finding people easier.",
          "LinkedIn can find people.",
          "AI can find people.",
          "Job boards can certainly find you lots of people.",
          "The difficult bit is still working out who’s genuinely bloody good, who’s right for your business and whether the role you’ve taken to market makes sense in the first place.",
          "That’s what good marketing recruitment should help you solve.",
        ],
      },
      {
        heading:
          "What does the Manchester and North West marketing market look like in 2026?",
        content: [
          "It’s mixed.",
          "There are more candidates available in some areas than we’ve been used to historically, but that doesn’t automatically mean the best people for your particular job are easy to hire.",
          "From the searches and conversations I’m seeing, there are still pockets of demand at senior salary levels. At the same time, the wider recruitment market has been cautious and candidate availability has remained high.",
          "The North West also remains a smaller marketing talent market than London and the South East. Marketing Week’s 2026 survey found 8.3% of respondents were based in the North West compared with 53.9% in London and the South East.",
          "That’s why I wouldn’t approach a Manchester search by simply taking a London brief, knocking a percentage off the salary and hoping for the best.",
          "The regional market has its own agencies, brands, candidate networks and salary realities.",
        ],
      },
      {
        heading: "What marketing roles can you recruit for in Manchester?",
        content: [
          "At Essential Resourcing, my core market covers senior and specialist roles across:",
          "Marketing leadership: CMO, Marketing Director, Head of Marketing and senior marketing leadership.",
          "Digital and performance: Digital, paid media, performance, SEO, PPC, CRM, eCommerce and analytics.",
          "PR and communications: PR, corporate communications, content, social and reputation.",
          "Agency: Client services, PR, digital, performance, strategy, operations and agency leadership.",
          "Fractional: Experienced marketing and agency leaders brought into a business for a defined period rather than another permanent hire.",
          "That doesn’t mean I’ll claim to recruit absolutely everything with the word “marketing” somewhere in the title.",
          "Specialist, not generalist. That’s the point.",
        ],
      },
      {
        heading: "Start with the problem, not the job title",
        content: [
          "This is probably the biggest thing I’d change about how businesses recruit.",
          "Don’t start with:",
          "“We need a Marketing Director.”",
          "Start with:",
          "“What do we need this person to have changed 12 months after they join?”",
          "Maybe you need to build a marketing function.",
          "Maybe acquisition has stalled.",
          "Maybe you’ve got a good team but nobody senior enough to lead it.",
          "Maybe the founder is still making every marketing decision.",
          "Maybe you’ve grown quickly and the brand hasn’t kept up.",
          "Those situations could all result in somebody being called Marketing Director.",
          "They require very different people.",
          "The job title isn’t the brief.",
        ],
      },
      {
        heading: "What should you pay?",
        content: [
          "Again: scope first, title second.",
          "My 2026 North West salary research found meaningful variation even within apparently similar senior roles.",
          "A Marketing Manager with broad execution responsibility isn’t automatically the same proposition as somebody leading a team, owning significant budget and carrying commercial accountability.",
          "The same becomes even more pronounced at Head of Marketing, Marketing Director and CMO level.",
          "Look at:",
          "Team size.",
          "Marketing budget.",
          "Business size and stage.",
          "Reporting line.",
          "Commercial ownership.",
          "Geographic remit.",
          "Decision-making authority.",
          "What they’re inheriting.",
          "What they’re expected to change.",
          "Then benchmark the salary.",
          "Not the other way around.",
        ],
      },
      {
        heading: "Agency and client-side hiring aren’t the same",
        content: [
          "I’ve worked extensively across both.",
          "And that matters.",
          "Agency hiring needs an understanding of client handling, commercial pressure, pace, margin and the fact that the same title can mean completely different things from one agency to another.",
          "Client-side hiring requires understanding the business stage, marketing capability, budget, team and what commercial outcome the person is expected to own.",
          "Someone being excellent agency-side doesn’t automatically make them brilliant client-side.",
          "And vice versa.",
        ],
      },
      {
        heading:
          "Do you need Permanent Recruitment, Retained Search or Fractional support?",
        content: [
          "It depends on the problem.",
          "For a specialist role where there is a reasonable active candidate market, contingency can work perfectly well.",
          "For a senior, confidential or business-critical appointment where you need proper market mapping and direct approaches, retained search may make considerably more sense.",
          "And sometimes you don’t need another permanent employee at all.",
          "You need an experienced senior operator for two or three days a week, or for six months, to create direction and momentum while you work out the longer-term answer.",
          "That’s where Fractional or interim support comes in.",
        ],
      },
      {
        heading: "What should a good marketing recruiter actually do?",
        content: [
          "Not send you the most CVs.",
          "I’d expect them to:",
          "Challenge the brief.",
          "Tell you when the salary doesn’t stack up.",
          "Understand the market.",
          "Find people who aren’t applying.",
          "Get underneath what candidates have actually achieved.",
          "Tell you when somebody isn’t right.",
          "Manage the process.",
          "Keep good candidates engaged.",
          "And occasionally tell you:",
          "“You don’t actually need a recruiter for this one.”",
          "Because the objective shouldn’t be another recruitment fee.",
          "It should be a better hiring decision.",
        ],
      },
      {
        heading:
          "Looking for a marketing recruiter in Manchester or the North West?",
        content: [
          "Essential Resourcing is Manchester-led, North West-rooted and works across the UK on senior and specialist marketing, digital, PR, communications and agency appointments.",
          "If you’ve got a role coming up, I’m always happy to sense-check the brief before you start.",
          "Talk to David.",
        ],
      },
    ],
    pullQuote: "The job title isn’t the brief.",
    faqs: [
      {
        question:
          "What does a marketing recruiter in Manchester or the North West actually do?",
        answer:
          "A good specialist recruiter helps define the brief, map the relevant talent market, find people who are not necessarily applying, assess evidence beyond the CV and keep the hiring process moving.",
      },
      {
        question:
          "Does Essential Resourcing only recruit marketing roles in Manchester?",
        answer:
          "No. Essential Resourcing is Manchester-led and North West-rooted, but works across the UK on senior and specialist marketing, digital, PR, communications and agency appointments.",
      },
      {
        question:
          "Should a senior marketing hire be handled through Permanent Recruitment, Retained Search or Fractional support?",
        answer:
          "It depends on the problem behind the hire. Permanent Recruitment can work well for accessible specialist roles. Retained Search is usually stronger for senior, confidential or business-critical appointments. Fractional or interim support can be better when the business needs senior help now but is not ready for another permanent hire.",
      },
    ],
    relatedServiceSlugs: [
      "permanent-recruitment",
      "retained-search",
      "fractional",
    ],
    relatedInsightSlugs: [
      "the-job-title-isnt-the-brief-senior-marketing-hire",
      "what-should-you-pay-a-senior-marketing-hire-in-2026",
      "retained-search-vs-contingent-recruitment",
    ],
    ctaHeading:
      "Need a straight view on a Manchester or North West marketing hire?",
    ctaText:
      "Send David the brief and he’ll tell you what the market is likely to do with it.",
    seoTitle: "Marketing Recruitment Manchester | Essential",
    metaDescription:
      "A practical guide to hiring marketing, digital, PR and agency talent across Manchester and the North West.",
  },
  {
    title: "Retained Search vs Contingent Recruitment: Which Should You Use?",
    slug: "retained-search-vs-contingent-recruitment",
    status: "published",
    category: "Hiring advice",
    cardCategory: "Hiring advice",
    excerpt:
      "Retained search or contingency recruitment? A plain-English guide to how each works, what they cost and when businesses should use them.",
    cardExcerpt:
      "When contingency is perfectly sensible, when retained search earns its keep and how to choose the right model.",
    publishedDate: "2026-09-15",
    updatedDate: "2026-09-15",
    readingTime: "7 min read",
    author: "David Walsh",
    body: [
      {
        heading:
          "What’s the difference between retained and contingent recruitment?",
        content: [
          "The simplest answer?",
          "Contingency recruitment: you generally pay when the recruiter successfully fills the role.",
          "Retained search: you commit to one search partner and pay for the search process, normally in agreed stages, rather than only paying for the final CV that gets hired.",
          "Neither model is automatically better.",
          "Despite what some recruiters will tell you.",
          "They solve different problems.",
          "Executive search is typically exclusive and involves deeper identification, assessment and selection work; industry guidance distinguishes that from contingency recruitment, which traditionally focuses more heavily on identifying and presenting candidates against agreed criteria.",
        ],
      },
      {
        heading: "When does contingency recruitment make sense?",
        content: [
          "Quite a lot of the time.",
          "If you’re hiring a reasonably well-understood role and there’s a healthy candidate market, you may not need a full retained search.",
          "For example:",
          "Marketing Executive.",
          "Account Manager.",
          "PPC Manager.",
          "PR Account Executive.",
          "Marketing Manager.",
          "The title isn’t the deciding factor, but if the market is accessible and the business can move quickly, contingency can be a perfectly sensible solution.",
          "The recruiter finds somebody.",
          "You hire them.",
          "The recruiter gets paid.",
          "Simple.",
        ],
      },
      {
        heading: "Where can contingency go wrong?",
        content: [
          "When five agencies all get the same vacancy on Friday afternoon.",
          "Suddenly everybody is racing to LinkedIn.",
          "Candidates get approached four times about the same job.",
          "Recruiters become incentivised to get a CV in first, rather than understand the person best.",
          "The client receives 25 CVs.",
          "Everyone looks very busy.",
          "And somehow nobody is particularly happy. 😂",
          "That’s contingency at its worst.",
          "Good contingency recruitment doesn’t have to work like that.",
          "But the commercial model can encourage speed and volume if it isn’t managed properly.",
        ],
      },
      {
        heading: "What changes with retained search?",
        content: [
          "Commitment.",
          "From both sides.",
          "The client commits to the search partner.",
          "The recruiter commits proper time and resource to the assignment.",
          "That gives you space to:",
          "Interrogate the brief.",
          "Map the market.",
          "Research target companies.",
          "Approach passive candidates properly.",
          "Understand motivations.",
          "Assess people in more depth.",
          "Challenge assumptions.",
          "Manage a longer or more complex process.",
          "And represent the opportunity consistently in the market.",
          "You’re not simply paying for a CV.",
          "You’re paying for the search.",
        ],
      },
      {
        heading: "When would I recommend retained search?",
        content: [
          "Usually when one or more of these apply:",
          "The role is senior.",
          "It’s commercially important.",
          "The market is narrow.",
          "The search is confidential.",
          "You’ve already tried and failed to recruit it.",
          "The strongest candidates are unlikely to be applying.",
          "The brief needs shaping.",
          "The wrong hire would be particularly expensive.",
          "Or you genuinely want somebody to map the market rather than wait for applications.",
          "A Managing Partner, CMO or Marketing Director search is an obvious candidate.",
          "But I’ve also retained roles below that level where the circumstances justified it.",
          "Again:",
          "The job title isn’t the brief.",
        ],
      },
      {
        heading: "Does retained search guarantee a better candidate?",
        content: [
          "No.",
          "And I’d be suspicious of anybody telling you it does.",
          "It gives the recruiter a better process and commercial environment in which to conduct a thorough search.",
          "What they do with that is another question entirely.",
          "A bad recruiter with a retainer is still a bad recruiter.",
          "They’ve just been paid earlier. 😂",
          "Ask how the search will actually work.",
          "Who is doing it?",
          "How will the market be mapped?",
          "How will candidates be assessed?",
          "How often will you receive updates?",
          "What happens if the brief changes?",
          "What’s guaranteed?",
          "What happens if the successful candidate leaves?",
          "Those questions matter more than whether somebody has written “Executive Search” in gold lettering on their website.",
        ],
      },
      {
        heading: "What does Essential Resourcing do?",
        content: [
          "Both.",
          "I’m not interested in forcing every client into retained search because it sounds more premium.",
          "For some roles, senior or specialist contingency recruitment is absolutely fine.",
          "For important leadership searches, retained or exclusive work can produce a much better process.",
          "And occasionally Fractional is the better answer than either.",
          "The first job is working out what you’re actually trying to solve.",
          "Then choose the recruitment model.",
        ],
      },
      {
        heading: "Retained or contingency?",
        content: [
          "A very simple rule of thumb:",
          "If you need somebody to find candidates, contingency may be enough.",
          "If you need somebody to properly search a market and help you make an important hiring decision, retained becomes much more interesting.",
          "If you’re unsure which route your role needs, give me a shout.",
          "I’ll tell you which I’d use.",
          "Even if it’s the cheaper one.",
          "Sense-check your search.",
        ],
      },
    ],
    pullQuote:
      "If you need somebody to properly search a market and help you make an important hiring decision, retained becomes much more interesting.",
    faqs: [
      {
        question:
          "What is the difference between retained search and contingency recruitment?",
        answer:
          "Contingency recruitment usually means the recruiter is paid only if they fill the role. Retained search means the client commits to one search partner and pays for a structured search process, usually in agreed stages.",
      },
      {
        question: "When should a business use retained search?",
        answer:
          "Retained search makes most sense when the role is senior, confidential, difficult, commercially important, narrow in market or expensive to get wrong.",
      },
      {
        question: "Does retained search guarantee a better hire?",
        answer:
          "No model can guarantee a better hire on its own. Retained search creates the conditions for a more thorough process, but the quality still depends on the brief, search work, assessment and decision-making.",
      },
    ],
    relatedServiceSlugs: ["retained-search", "permanent-recruitment"],
    relatedInsightSlugs: [
      "when-should-an-agency-use-retained-search",
      "why-senior-marketing-hiring-goes-wrong",
      "how-much-does-senior-marketing-recruitment-cost",
    ],
    ctaHeading: "Not sure whether your role needs retained search?",
    ctaText:
      "Send David the brief and he’ll tell you which route he’d use, even if it’s the cheaper one.",
    seoTitle: "Retained vs Contingent Recruitment | Essential",
    metaDescription:
      "Retained search or contingency recruitment? A plain-English guide to how each works, what they cost and when businesses should use them.",
  },
  {
    title: "How Much Does Senior Marketing Recruitment Cost?",
    slug: "how-much-does-senior-marketing-recruitment-cost",
    status: "published",
    category: "Salary and market insight",
    cardCategory: "Hiring advice / Salary and market insight",
    excerpt:
      "What it costs to recruit a Marketing Director, CMO or senior marketer, including recruitment fees, retained search and hidden hiring costs.",
    cardExcerpt:
      "A practical guide to recruitment fees, retained search costs and the real cost of getting a senior hire wrong.",
    publishedDate: "2026-09-15",
    updatedDate: "2026-09-15",
    readingTime: "7 min read",
    author: "David Walsh",
    body: [
      {
        heading:
          "How much does it cost to use a recruiter for a senior marketing hire?",
        content: [
          "Usually, the first answer people want is a percentage.",
          "Fair enough.",
          "But it’s not quite that simple.",
          "The cost of recruiting a Marketing Director, CMO, Head of Marketing or other senior marketer depends on:",
          "The recruitment model.",
          "The seniority and salary.",
          "How difficult the search is.",
          "Whether it’s exclusive.",
          "Whether you’re using retained search.",
          "And what you’re actually asking the recruiter to do.",
          "So rather than pretend there’s one magic number, here’s how I’d think about it.",
        ],
      },
      {
        heading: "Percentage-based permanent recruitment",
        content: [
          "A common permanent recruitment model is a fee calculated as a percentage of the successful candidate’s first-year base salary.",
          "For illustration only:",
          "If somebody earns £80,000 and the agreed recruitment fee is 20%, the recruitment fee would be:",
          "£16,000 + VAT.",
          "At £100,000, the same percentage would be:",
          "£20,000 + VAT.",
          "At £150,000:",
          "£30,000 + VAT.",
          "Those are examples, not Essential Resourcing’s universal fee card or a claim about a single UK market rate.",
          "The actual percentage and terms should be agreed before the search starts.",
        ],
      },
      {
        heading: "What does retained search cost?",
        content: [
          "Retained search can also be percentage-based, fixed-fee or structured around an agreed search value.",
          "The main difference is when and what you’re paying for.",
          "Instead of the entire fee being conditional on a successful placement, payments are usually linked to stages of the search.",
          "For example:",
          "Search commencement.",
          "Shortlist or agreed milestone.",
          "Successful completion.",
          "Exact structures vary.",
          "The important distinction is that the recruiter has been commissioned to conduct the search, not simply join a race to submit the winning candidate.",
        ],
      },
      {
        heading: "Why does senior recruitment cost more?",
        content: [
          "Because hopefully you’re buying more than somebody typing “Marketing Director Manchester” into LinkedIn.",
          "At senior level, a proper search can involve:",
          "Brief interrogation.",
          "Salary benchmarking.",
          "Market mapping.",
          "Competitor research.",
          "Direct approaches.",
          "Candidate qualification.",
          "Assessment.",
          "Motivation analysis.",
          "Process management.",
          "Offer negotiation.",
          "Reference or additional assessment stages.",
          "And a lot of conversations with people who ultimately never appear on your shortlist.",
          "That’s the invisible bit.",
          "The five candidates you eventually see might have come from a market of 100+ people researched and dozens of proper conversations.",
        ],
      },
      {
        heading: "“But £20,000 is a lot of money.”",
        content: [
          "It is.",
          "I’m not going to pretend otherwise.",
          "Businesses should challenge recruitment fees.",
          "I’d challenge a £20,000 invoice too.",
          "The question is:",
          "What are you getting for it?",
          "If you’re paying somebody £20k to email you six CVs they found on a database that morning, I’d have questions.",
          "If you’re paying for a proper search that helps you appoint somebody responsible for millions of pounds of marketing investment, a team and a meaningful part of your growth strategy, the commercial equation starts looking rather different.",
        ],
      },
      {
        heading: "The recruitment fee isn’t the biggest cost",
        content: [
          "This is the bit businesses sometimes overlook.",
          "Imagine you hire a senior marketer on £100,000.",
          "There’s salary.",
          "Employer costs.",
          "Potential bonus.",
          "Pension.",
          "Benefits.",
          "Onboarding.",
          "Leadership time.",
          "Opportunity cost.",
          "And potentially six or twelve months of commercial impact.",
          "The recruitment fee is visible because it arrives on an invoice.",
          "The cost of the wrong hire rarely does.",
          "It appears gradually.",
          "Lost time.",
          "Team disruption.",
          "Missed growth.",
          "Agency costs.",
          "Bad decisions.",
          "Then eventually you start recruiting the same role again.",
          "That’s why I think the conversation around senior recruitment fees should be less:",
          "“How cheaply can we fill this?”",
          "and more:",
          "“What’s the sensible amount to invest in making this decision properly?”",
        ],
      },
      {
        heading: "Does every senior marketing hire need a recruiter?",
        content: [
          "Absolutely not.",
          "You might already know the right person.",
          "You may have an excellent internal talent team.",
          "You might advertise and get three outstanding candidates.",
          "Brilliant.",
          "Hire one.",
          "Don’t pay me. 😂",
          "Recruitment becomes valuable when the person you need isn’t obvious or easily accessible, the brief needs challenging, the market needs mapping, or the consequences of getting the appointment wrong justify a more thorough process.",
        ],
      },
      {
        heading: "Could Fractional be cheaper?",
        content: [
          "Sometimes.",
          "But I’d frame it differently.",
          "Fractional isn’t a cheap version of permanent recruitment.",
          "It’s a different answer.",
          "If you need senior marketing leadership but aren’t ready for another permanent £100k+ hire, bringing in an experienced operator for a defined period or number of days can make commercial sense.",
          "It can also help you work out what permanent structure you actually need before committing to it.",
        ],
      },
      {
        heading: "So, how much should you budget?",
        content: [
          "For a permanent search, understand:",
          "Candidate salary + agreed recruitment fee + employment costs + onboarding costs.",
          "For retained search, understand:",
          "The total search fee + payment stages + guarantees + exactly what work is included.",
          "For Fractional:",
          "Day/monthly rate + expected days + duration + any agreed search/management costs + tax/status implications where relevant.",
          "Then compare the whole cost and outcome, not simply the headline recruiter percentage.",
        ],
      },
      {
        heading: "Want an actual number for your role?",
        content: [
          "Send me the brief.",
          "I’ll tell you what recruitment route I’d recommend, what I’d charge and why.",
          "And if I think you can recruit it perfectly well yourself?",
          "I’ll tell you that too.",
          "Talk to David.",
        ],
      },
    ],
    pullQuote:
      "The recruitment fee is visible because it arrives on an invoice. The cost of the wrong hire rarely does.",
    faqs: [
      {
        question:
          "How are senior marketing recruitment fees usually calculated?",
        answer:
          "Many permanent recruitment fees are calculated as a percentage of the successful candidate’s first-year base salary, but the actual fee and terms should always be agreed before the search starts.",
      },
      {
        question: "What does retained search cost?",
        answer:
          "Retained search can be percentage-based, fixed-fee or structured around an agreed search value, with payments usually linked to stages such as commencement, shortlist or completion.",
      },
      {
        question:
          "Is the recruitment fee the biggest cost of a senior marketing hire?",
        answer:
          "Usually not. Salary, employer costs, onboarding, leadership time, missed growth and the cost of getting the hire wrong can matter far more than the visible recruitment invoice.",
      },
    ],
    relatedServiceSlugs: [
      "retained-search",
      "permanent-recruitment",
      "fractional",
    ],
    relatedInsightSlugs: [
      "retained-search-vs-contingent-recruitment",
      "what-should-you-pay-a-senior-marketing-hire-in-2026",
      "why-senior-marketing-hiring-goes-wrong",
    ],
    ctaHeading: "Want an actual number for your role?",
    ctaText:
      "Send David the brief and he’ll tell you what recruitment route he’d recommend, what he’d charge and why.",
    seoTitle: "Senior Marketing Recruitment Cost | Essential",
    metaDescription:
      "What it costs to recruit a Marketing Director, CMO or senior marketer, including recruitment fees, retained search and hidden hiring costs.",
  },
  {
    title:
      "The Job Title Isn’t the Brief: 7 Questions to Answer Before You Hire a Senior Marketer",
    slug: "the-job-title-isnt-the-brief-senior-marketing-hire",
    status: "published",
    category: "Hiring advice",
    cardCategory: "Hiring advice",
    excerpt:
      "Before you recruit a Marketing Director, CMO or Head of Digital, get clear on the business problem first.",
    cardExcerpt:
      "Seven practical questions to answer before taking a senior marketing brief to market.",
    publishedDate: "2026-09-15",
    updatedDate: "2026-09-15",
    readingTime: "7 min read",
    author: "David Walsh",
    body: [
      {
        heading: "Intro",
        content: [
          "One of the biggest mistakes I see businesses make when recruiting senior marketing people happens before they’ve even spoken to a candidate.",
          "They start with the job title.",
          "“We need a Marketing Director.”",
          "“We need a Head of Digital.”",
          "“We need a CMO.”",
          "Fine.",
          "But what do you actually need them to do?",
          "Because two businesses can both be recruiting a Marketing Director and need completely different people.",
          "One might need somebody to build a marketing function from scratch.",
          "Another needs someone to inherit 25 people and make them better.",
          "One needs brand transformation.",
          "Another desperately needs commercial growth.",
          "And occasionally, when you properly get underneath it, the “Marketing Director” brief turns out to be about three different jobs wearing a trench coat. 😂",
          "Before you start recruiting, I’d answer these seven questions.",
        ],
      },
      {
        heading: "1. What problem are they actually coming in to solve?",
        content: [
          "Not what tasks will they perform.",
          "What problem exists in the business that means you’re hiring somebody?",
          "Growth has stalled?",
          "The brand needs repositioning?",
          "Customer acquisition is becoming too expensive?",
          "The marketing team needs leadership?",
          "You’ve grown to £20m without really having a marketing strategy?",
          "Start there.",
        ],
      },
      {
        heading: "2. What needs to be different 12 months after they join?",
        content: [
          "This is one of my favourite questions when taking a senior brief.",
          "Imagine we’re sitting here a year from now and you tell me:",
          "“David, this person has been absolutely bloody brilliant.”",
          "What’s changed?",
          "That answer tells me considerably more than a list of 25 responsibilities copied from somebody else’s job description.",
        ],
      },
      {
        heading: "3. What decisions will they actually be allowed to make?",
        content: [
          "This matters particularly with Marketing Director and CMO appointments.",
          "You can recruit somebody brilliant, but if every meaningful decision still has to go through the founder or CEO, you’ve got a problem.",
          "Be realistic about the mandate.",
        ],
      },
      {
        heading: "4. What are they inheriting?",
        content: [
          "Team.",
          "Budget.",
          "Agencies.",
          "Technology.",
          "Data.",
          "Brand.",
          "Commercial expectations.",
          "And, sometimes, a bit of a mess.",
          "A marketer who’s brilliant at building from zero isn’t necessarily the same person who’s brilliant at transforming an established function.",
        ],
      },
      {
        heading: "5. What’s genuinely non-negotiable?",
        content: [
          "This is where briefs often get ridiculous.",
          "“We need somebody who’s worked in exactly our sector, at exactly our size, selling exactly our product, to exactly our customer…”",
          "Eventually you’ve described one person.",
          "And they probably don’t want the job. 😂",
          "Separate what someone must already have from what a bloody good person could learn.",
        ],
      },
      {
        heading:
          "6. How are you going to assess whether they’re actually good?",
        content: [
          "A CV tells you where somebody worked.",
          "It doesn’t necessarily tell you whether they were any good when they got there.",
          "Ask for evidence.",
          "What changed because of them?",
          "What did they personally own?",
          "What was the starting point?",
          "What were the results?",
          "What went wrong?",
          "How did they respond?",
          "Go beyond the CV.",
        ],
      },
      {
        heading: "7. Why would somebody brilliant want this job?",
        content: [
          "Businesses spend loads of time defining what they want from candidates.",
          "Less time asking why the best candidates would want them.",
          "If you’re trying to attract somebody who’s already successful, well paid and reasonably happy, “competitive salary and great culture” probably isn’t getting them out of bed.",
          "What’s the opportunity?",
          "Get that clear before you go to market.",
        ],
      },
    ],
    faqs: [
      {
        question: "What should a senior marketing brief include?",
        answer:
          "It should start with the business problem, the outcome required, the decisions the hire will own, what they inherit and why a strong candidate would want the role.",
      },
      {
        question: "Why is a job title not enough for a senior marketing hire?",
        answer:
          "The same title can mean completely different things in different businesses. A Marketing Director building from scratch is not the same as one inheriting a large team and budget.",
      },
      {
        question: "How do you reduce risk before recruiting a senior marketer?",
        answer:
          "Get clear on the problem, the mandate, the non-negotiables and the evidence you’ll use to assess whether somebody can actually solve it.",
      },
    ],
    relatedServiceSlugs: [
      "retained-search",
      "permanent-recruitment",
      "permanent-recruitment",
    ],
    relatedInsightSlugs: [
      "why-senior-marketing-hiring-goes-wrong",
      "how-to-hire-a-marketing-director-without-wasting-six-weeks",
    ],
    ctaHeading: "The job title isn’t the brief. The business problem is.",
    ctaText:
      "If you’re planning a senior marketing hire and want to sense-check the brief before you start searching, talk to David.",
    seoTitle: "Senior Marketing Brief Questions | Essential",
    metaDescription:
      "Seven questions to answer before hiring a senior marketer, Marketing Director, Head of Digital or CMO.",
  },
  {
    title:
      "The Marketing Recruitment Market Isn’t Dead. But Businesses Are Definitely Hiring Differently.",
    slug: "marketing-recruitment-market-isnt-dead-businesses-hiring-differently",
    status: "published",
    category: "Market commentary",
    cardCategory: "Market commentary",
    excerpt:
      "The market isn’t simply good or bad. Senior marketing hiring is still moving, but the bar is higher.",
    cardExcerpt:
      "A straight view on cautious hiring, perfect CV paralysis and why the human judgement still matters.",
    publishedDate: "2026-09-15",
    updatedDate: "2026-09-15",
    readingTime: "5 min read",
    author: "David Walsh",
    body: [
      {
        heading: "Intro",
        content: [
          "I’ve recruited across marketing, digital, PR and agencies for a long time, and one thing I’ve learned is that the market is rarely simply “good” or “bad”.",
          "It’s usually just complicated.",
          "And right now, that’s probably the best word for it.",
          "There are still businesses hiring senior marketers. Current UK vacancies span CMOs, Marketing Directors, Heads of Marketing, Growth Directors, digital leaders and specialist roles.",
          "But the conversations I’m having feel different.",
        ],
      },
      {
        heading: "Businesses are more cautious",
        content: [
          "I’m seeing more scrutiny around senior hires.",
          "Not necessarily because businesses don’t want to invest.",
          "Because they really don’t want to get it wrong.",
          "Budgets are being challenged.",
          "Headcount needs justification.",
          "And somebody costing £80k, £100k or £120k+ needs to demonstrate why that investment makes commercial sense.",
          "That’s not necessarily a bad thing.",
          "But it changes how businesses should recruit.",
        ],
      },
      {
        heading: "The “perfect CV” problem",
        content: [
          "The danger is that caution turns into paralysis.",
          "I’ve seen briefs become so specific that perfectly good candidates get ruled out because they haven’t worked in precisely the right sector, agency, business model or environment.",
          "That’s understandable.",
          "But there’s a difference between reducing hiring risk and trying to remove every possible element of risk.",
          "You can’t.",
          "Sometimes the safest-looking CV isn’t the best hire.",
        ],
      },
      {
        heading: "Senior marketers need to demonstrate commercial impact",
        content: [
          "At senior level, “I managed the marketing strategy” isn’t really enough anymore.",
          "Businesses increasingly want to understand:",
          "What grew?",
          "What improved?",
          "What did you change?",
          "What did you personally own?",
          "How did marketing affect the commercial performance of the business?",
          "That means candidates need to be better at explaining their impact.",
          "And businesses need to get better at assessing it.",
        ],
      },
      {
        heading: "AI is changing the mechanics, not the fundamental decision",
        content: [
          "Search is getting easier.",
          "AI can help find people, analyse information, prepare questions and make recruitment processes more efficient.",
          "Great.",
          "I use it myself.",
          "But that arguably makes the human bit more important.",
          "Because finding somebody whose LinkedIn profile contains the right words isn’t the difficult part.",
          "Working out whether they’re genuinely good is.",
        ],
      },
      {
        heading: "My view",
        content: [
          "I don’t think businesses have stopped hiring marketers.",
          "I think they’ve become more deliberate about which marketing hires are genuinely worth making.",
          "And personally, I think that’s healthy.",
          "The businesses that get this right won’t necessarily be the ones interviewing the most people.",
          "They’ll be the ones that are clearest about the problem they’re hiring somebody to solve.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is the UK marketing recruitment market quiet in 2026?",
        answer:
          "It is not dead, but senior hiring is more deliberate. Businesses are scrutinising cost, risk and commercial impact more carefully.",
      },
      {
        question: "What are businesses looking for in senior marketers?",
        answer:
          "They increasingly want evidence of commercial impact: what changed, what grew, what improved and what the candidate personally owned.",
      },
      {
        question: "How is AI changing marketing recruitment?",
        answer:
          "AI can make search and preparation faster, but it does not replace the judgement needed to assess whether somebody is genuinely right for a brief.",
      },
    ],
    relatedServiceSlugs: ["retained-search", "permanent-recruitment"],
    relatedInsightSlugs: [
      "why-senior-marketing-hiring-goes-wrong",
      "the-job-title-isnt-the-brief-senior-marketing-hire",
    ],
    ctaHeading: "Trying to read the current marketing market?",
    ctaText:
      "Give David a shout. He’ll tell you what he’s seeing, even if the answer isn’t particularly convenient.",
    seoTitle: "Marketing Recruitment Market Commentary 2026",
    metaDescription:
      "A practical view on the UK senior marketing recruitment market, cautious hiring and commercial impact in 2026.",
  },
  {
    title: "What Should You Pay a Senior Marketing Hire in 2026?",
    slug: "what-should-you-pay-a-senior-marketing-hire-in-2026",
    status: "published",
    category: "Salary and market insight",
    cardCategory: "Salary and market insight",
    excerpt:
      "A practical way to think about senior marketing pay in 2026: start with scope, not the job title.",
    cardExcerpt:
      "Why senior marketing salaries should be shaped by scope, accountability, scarcity and the real candidate market.",
    publishedDate: "2026-09-15",
    updatedDate: "2026-09-15",
    readingTime: "6 min read",
    author: "David Walsh",
    body: [
      {
        heading: "Market note",
        content: [
          "Market: UK, with a particular focus on Manchester and the North West.",
          "Date: September 2026.",
          "Basis: Essential Resourcing market observation, not a published salary survey.",
        ],
      },
      {
        heading: "Intro",
        content: [
          "“What’s the market rate?”",
          "Probably one of the questions I’ve been asked most throughout my recruitment career.",
          "And unfortunately the truthful answer is usually:",
          "It depends.",
          "Helpful, David. Cheers. 😂",
          "But senior marketing salaries genuinely aren’t determined by job title alone.",
          "A £50m retailer hiring its first Marketing Director and a global business recruiting somebody to lead 100 marketers could use exactly the same title.",
          "They’re not the same job.",
          "So before deciding what to pay, look at what you’re actually asking somebody to own.",
        ],
      },
      {
        heading: "Start with scope, not title",
        content: [
          "A senior marketing salary should reflect business size and complexity.",
          "What size organisation are they joining?",
          "Team.",
          "Are they a standalone marketer or leading 40 people?",
          "Budget.",
          "Are they managing £500k or £20m?",
          "Commercial accountability.",
          "Are they delivering marketing activity or genuinely responsible for growth?",
          "Leadership expectations.",
          "Are they sitting on the leadership team and influencing business strategy?",
          "Transformation.",
          "Are they inheriting something healthy or being asked to rebuild the bloody thing?",
          "Scarcity.",
          "How many people in your geography genuinely have the experience you need?",
          "Those variables can move compensation considerably.",
        ],
      },
      {
        heading: "Don’t build a £100k brief with a £70k budget",
        content: [
          "This happens more than you’d think.",
          "The requirements gradually grow.",
          "Commercial leadership.",
          "Brand.",
          "Performance.",
          "Digital transformation.",
          "Data.",
          "AI.",
          "Team development.",
          "Agency management.",
          "Board experience.",
          "International expansion.",
          "And then somebody says:",
          "“We were thinking about £65k?”",
          "Right. 😂",
          "There’s nothing wrong with having a fixed budget.",
          "But something has to give.",
        ],
      },
      {
        heading: "Benchmark the people, not just the salary surveys",
        content: [
          "Salary guides are useful.",
          "They’re a reference point.",
          "They’re not gospel.",
          "When I run a search, I’m interested in what the actual people capable of doing the job are earning, what would motivate them to move and what competing opportunities they’re considering.",
          "That’s your real market.",
        ],
      },
      {
        heading: "Think about the whole proposition",
        content: [
          "Senior candidates don’t move purely for another £5k.",
          "They consider remit, autonomy, CEO relationship, quality of leadership, team, budget, flexibility, equity, bonus, career trajectory, brand and whether the job actually sounds enjoyable.",
          "Money matters.",
          "Of course it bloody does.",
          "But compensation is only part of the proposition.",
        ],
      },
      {
        heading: "What good costs",
        content: [
          "My general advice is simple.",
          "Don’t ask:",
          "“What’s the cheapest we can get this person for?”",
          "Ask:",
          "“What does somebody genuinely capable of solving this problem cost?”",
          "They’re very different questions.",
        ],
      },
    ],
    faqs: [
      {
        question: "What should a senior marketing salary be based on?",
        answer:
          "Scope, team size, budget, commercial accountability, transformation need, scarcity and the real candidate market matter more than the job title alone.",
      },
      {
        question: "Are salary guides enough for senior marketing hiring?",
        answer:
          "They are useful reference points, but they do not replace live market evidence from the people capable of doing the specific job.",
      },
      {
        question: "Why do senior marketing salary expectations vary so much?",
        answer:
          "The same title can carry very different levels of ownership, risk, leadership and commercial responsibility from one business to another.",
      },
    ],
    relatedServiceSlugs: ["retained-search", "permanent-recruitment"],
    relatedInsightSlugs: [
      "how-to-hire-a-marketing-director-without-wasting-six-weeks",
      "how-much-does-senior-marketing-recruitment-cost",
    ],
    ctaHeading: "Budgeting for a senior marketing hire?",
    ctaText:
      "David can give you a realistic view of what he’s seeing in the market, without inflating the salary or pretending somebody brilliant costs £50k if they don’t.",
    seoTitle: "Senior Marketing Salary Guide 2026 | Essential Resourcing",
    metaDescription:
      "What to consider when setting senior marketing salaries in 2026 across Manchester, the North West and the UK.",
  },
  {
    title: "Do You Actually Need a Full-Time Marketing Director?",
    slug: "do-you-actually-need-a-full-time-marketing-director",
    status: "published",
    category: "Fractional",
    cardCategory: "Fractional",
    excerpt:
      "Sometimes a permanent senior hire is not the smartest answer. Fractional can give you senior leadership without rushing the structure.",
    cardExcerpt:
      "When interim or fractional marketing leadership may make more sense than another permanent senior salary.",
    publishedDate: "2026-09-15",
    updatedDate: "2026-09-15",
    readingTime: "5 min read",
    author: "David Walsh",
    body: [
      {
        heading: "Intro",
        content: [
          "Here’s something recruitment companies probably aren’t supposed to say:",
          "Sometimes you don’t need to make a permanent hire.",
          "There. Said it.",
          "I’ve spoken to plenty of businesses that know they need senior marketing capability but aren’t actually ready for another full-time senior salary.",
          "That’s where Fractional marketing leadership can make a lot of sense.",
        ],
      },
      {
        heading: "What’s the actual problem?",
        content: [
          "Perhaps you’ve reached a point where the founder can no longer lead marketing.",
          "Maybe you’ve got a good junior or mid-level team but nobody senior enough to set the direction.",
          "Maybe your Marketing Director has left.",
          "Maybe you’re going through a transformation.",
          "Maybe growth has stalled.",
          "Or perhaps you know marketing needs fixing but aren’t yet sure what the permanent structure should look like.",
          "You need senior thinking.",
          "That doesn’t automatically mean you need somebody five days a week forever.",
        ],
      },
      {
        heading: "When Fractional can work better than permanent",
        content: [
          "It can make particular sense when you need experienced leadership quickly.",
          "You’re between permanent leaders.",
          "The business is going through change.",
          "You need to build a strategy before hiring a permanent team.",
          "You’ve got good people who need stronger leadership above them.",
          "You need a specific transformation delivered.",
          "You’re scaling but not yet ready for a full-time CMO.",
          "Or you want to test what senior marketing leadership actually adds before committing permanently.",
        ],
      },
      {
        heading: "This isn’t someone popping in once a month with a PowerPoint",
        content: [
          "There’s an important distinction between advice and ownership.",
          "The strongest Fractional leaders aren’t simply standing outside the business telling everybody what they’re doing wrong.",
          "They’re in it.",
          "They can attend leadership meetings.",
          "Manage teams.",
          "Challenge decisions.",
          "Work with agencies.",
          "Build the roadmap.",
          "Implement change.",
          "And, importantly, they’re still there next week when reality kicks in.",
        ],
      },
      {
        heading: "Scope it properly",
        content: [
          "The biggest mistake with fractional appointments is hiring somebody without defining what they’re actually there to achieve.",
          "Agree what problem they are solving.",
          "What needs to be different in 90 or 180 days?",
          "How much authority do they have?",
          "Who do they report to?",
          "What team and budget do they own?",
          "How many days are genuinely required?",
          "And what happens when the assignment ends?",
          "Otherwise you haven’t bought flexible leadership.",
          "You’ve bought an expensive person with a confusing diary.",
        ],
      },
      {
        heading: "Interim or permanent?",
        content: [
          "Neither is inherently better.",
          "It depends on the business problem.",
          "If you need somebody to own marketing for the next five years, build a large team and become a long-term member of the leadership group, permanent probably makes sense.",
          "If you need senior capability now, but don’t yet need or can’t justify another full-time executive hire, Fractional might be the smarter option.",
        ],
      },
    ],
    faqs: [
      {
        question: "When should a business use a Fractional Marketing Director?",
        answer:
          "When senior marketing leadership is needed quickly but the business is not ready, able or certain enough to make the right permanent appointment.",
      },
      {
        question: "Is Fractional the same as interim marketing leadership?",
        answer:
          "They often overlap. Essential uses Fractional to describe senior marketing leadership for a defined business need, usually closer to the work than detached consultancy.",
      },
      {
        question: "How should an interim marketing assignment be scoped?",
        answer:
          "Start with the outcome, authority, reporting line, team, budget, days required and what should happen when the assignment ends.",
      },
    ],
    relatedServiceSlugs: ["fractional", "retained-search"],
    relatedInsightSlugs: [
      "what-is-a-fractional-marketing-leader",
      "how-much-does-senior-marketing-recruitment-cost",
    ],
    ctaHeading:
      "Need senior marketing leadership but not sure permanent is right?",
    ctaText:
      "Talk to David about whether permanent, retained search or Fractional actually makes most sense.",
    seoTitle: "Full-Time Marketing Director or Fractional? | Essential",
    metaDescription:
      "When a business may need Fractional marketing leadership instead of a full-time Marketing Director.",
  },
  {
    title:
      "Your CV Tells Me Where You’ve Worked. I Want to Know What You Actually Did.",
    slug: "your-cv-tells-me-where-youve-worked-what-you-actually-did",
    status: "published",
    category: "Candidate advice",
    cardCategory: "Candidate advice",
    excerpt:
      "Senior marketing CVs need to show what changed because you were there, not just where you worked.",
    cardExcerpt:
      "A straight-talking guide for senior marketing, digital, PR and agency candidates writing better CVs.",
    publishedDate: "2026-09-15",
    updatedDate: "2026-09-15",
    readingTime: "5 min read",
    author: "David Walsh",
    body: [
      {
        heading: "Intro",
        content: [
          "I’ve looked at thousands of marketing CVs over the years.",
          "And I still think CVs are pretty shit at telling you who’s actually good. 😂",
          "They’re necessary.",
          "They’re useful.",
          "But particularly at senior level, they have a habit of becoming a collection of increasingly impressive words.",
          "“Led.”",
          "“Transformed.”",
          "“Drove.”",
          "“Delivered.”",
          "“Owned.”",
          "Lovely.",
          "But what actually happened?",
          "That’s what I want to know.",
        ],
      },
      {
        heading: "Tell me what changed because you were there",
        content: [
          "If you’re a senior marketer, don’t just tell me:",
          "“Responsible for digital transformation.”",
          "Tell me what the situation looked like when you arrived.",
          "What was broken?",
          "What did you change?",
          "What did you personally do?",
          "What happened afterwards?",
          "That’s far more useful.",
        ],
      },
      {
        heading: "Separate your contribution from the team’s",
        content: [
          "Senior marketers should absolutely talk about their teams.",
          "Good leaders don’t do everything themselves.",
          "But when I’m assessing somebody I need to understand the difference between:",
          "“My team delivered £20m growth.”",
          "and:",
          "“Here’s the part I played in creating the conditions that produced £20m growth.”",
          "Both can be impressive.",
          "Just make the distinction clear.",
        ],
      },
      {
        heading: "Give me numbers, with context",
        content: [
          "Numbers help.",
          "Revenue.",
          "ROAS.",
          "CAC.",
          "Retention.",
          "Brand metrics.",
          "Pipeline.",
          "Market share.",
          "Budget.",
          "Team growth.",
          "But numbers without context can be meaningless.",
          "If revenue increased 40%, was that because of your marketing strategy or because the company acquired another business?",
          "Tell the story.",
        ],
      },
      {
        heading: "Talk about the stuff that went wrong",
        content: [
          "This might sound counterintuitive.",
          "But I learn loads from asking senior candidates about things that didn’t work.",
          "A campaign that failed.",
          "A hire you got wrong.",
          "A strategy you changed.",
          "A disagreement with the CEO.",
          "Nobody who’s spent 15 years in marketing has got everything right.",
          "Pretending otherwise makes me more suspicious, not less. 😂",
        ],
      },
      {
        heading: "Don’t turn the CV into War and Peace",
        content: [
          "You don’t need to document every task you’ve performed since 2004.",
          "Your CV needs to create enough confidence and curiosity for somebody to want the conversation.",
          "Then the conversation goes deeper.",
        ],
      },
      {
        heading: "One final thing",
        content: [
          "Your CV’s job isn’t to prove you’re perfect.",
          "It’s to help somebody understand why your experience might be relevant to the problem they need solving.",
          "That’s a much better starting point.",
        ],
      },
    ],
    faqs: [
      {
        question: "What should a senior marketing CV show?",
        answer:
          "It should show what changed because of you, what you personally owned, what the starting point was and how your work affected the business.",
      },
      {
        question: "Should senior candidates include numbers on a CV?",
        answer:
          "Yes, where they are accurate and have context. Numbers are useful when they explain what improved and what role you played in that improvement.",
      },
      {
        question: "Should a CV mention things that went wrong?",
        answer:
          "Not as a list of failures, but senior candidates should be ready to discuss difficult work honestly. It often shows judgement and maturity.",
      },
    ],
    relatedServiceSlugs: ["permanent-recruitment"],
    relatedInsightSlugs: [
      "your-first-marketing-director-what-should-you-actually-be-hiring-for",
      "why-senior-marketing-hiring-goes-wrong",
    ],
    ctaHeading: "Considering your next senior marketing move?",
    ctaText:
      "You’re welcome to send David your CV. If something needs changing, he’ll tell you. If it’s fine, he’ll tell you that too.",
    seoTitle: "Senior Marketing CV Advice | Essential Resourcing",
    metaDescription:
      "CV advice for senior marketing, digital, PR and agency candidates who need to show impact, not just job titles.",
  },
  {
    title:
      "Why Hiring Senior Agency People Is Harder Than Matching Clients and Job Titles",
    slug: "why-hiring-senior-agency-people-is-harder-than-matching-clients-and-job-titles",
    status: "published",
    category: "Agency hiring",
    cardCategory: "Agency hiring",
    excerpt:
      "Agency hiring is as much about how somebody operates as where they’ve worked.",
    cardExcerpt:
      "Why matching agency names, clients and job titles is not enough when hiring senior agency people.",
    publishedDate: "2026-09-15",
    updatedDate: "2026-09-15",
    readingTime: "5 min read",
    author: "David Walsh",
    body: [
      {
        heading: "Intro",
        content: [
          "I’ve recruited into agencies for a big chunk of my career.",
          "PR.",
          "Digital.",
          "Integrated.",
          "Media.",
          "Performance.",
          "Creative.",
          "And one thing that’s always struck me is how easy it is to make an agency CV look like a perfect match.",
          "Similar clients.",
          "Similar agency.",
          "Similar title.",
          "Sorted.",
          "Except it isn’t.",
          "Because agency hiring is as much about how somebody operates as where they’ve worked.",
        ],
      },
      {
        heading: "A £1m client isn’t always a £1m client",
        content: [
          "Two Account Directors might both say they’ve led £1m accounts.",
          "One may have genuinely owned the relationship, grown the account, managed difficult conversations, protected margin and led the team.",
          "The other may have had a brilliant Business Director doing most of that above them.",
          "Same CV bullet.",
          "Completely different hire.",
        ],
      },
      {
        heading: "Commercial ability matters",
        content: [
          "At senior agency level, client service can’t simply mean “clients like me.”",
          "Can they grow an account?",
          "Spot an opportunity?",
          "Protect margin?",
          "Challenge a client?",
          "Handle a difficult renewal?",
          "Lead a pitch?",
          "Know when to say no?",
          "Agencies don’t employ senior people simply to keep everybody happy.",
          "They need them to help make the agency successful.",
        ],
      },
      {
        heading: "Different agencies need different personalities",
        content: [
          "Some agencies are structured.",
          "Some are entrepreneurial.",
          "Some are beautifully organised.",
          "Some are less beautifully organised. 😂",
          "Someone who’s brilliant inside a global network isn’t automatically going to thrive in a 40-person independent.",
          "And vice versa.",
          "That’s why culture fit shouldn’t mean:",
          "“Would I have a pint with them?”",
          "It should mean:",
          "“Can this person perform in the environment we’re actually putting them into?”",
        ],
      },
      {
        heading: "Don’t over-index on identical client experience",
        content: [
          "Relevant sector knowledge can absolutely matter.",
          "But I’ve seen businesses reject brilliant people because they haven’t worked on precisely the right type of account.",
          "Ask what knowledge is genuinely essential.",
          "And what a smart person could learn.",
          "Otherwise you’re fishing in an unnecessarily tiny pond.",
        ],
      },
      {
        heading: "Work out what success looks like",
        content: [
          "Before interviewing, decide what you need this person to change.",
          "More senior client relationships?",
          "Better retention?",
          "New business?",
          "Stronger team leadership?",
          "Improved profitability?",
          "A new capability?",
          "Then assess against that.",
          "Not simply whether their CV contains three agency logos you recognise.",
        ],
      },
    ],
    faqs: [
      {
        question: "Why is senior agency hiring difficult?",
        answer:
          "Senior agency roles depend on judgement, client handling, commercial ability, pace, resilience and cultural fit, not just similar titles or client names.",
      },
      {
        question: "Should agencies insist on identical sector experience?",
        answer:
          "Sometimes sector experience matters, but over-indexing on identical accounts can rule out strong people who could learn the sector quickly.",
      },
      {
        question: "How should agencies assess senior candidates?",
        answer:
          "Assess how they operate: account growth, margin protection, difficult conversations, leadership, client maturity and what success needs to look like in your environment.",
      },
    ],
    relatedServiceSlugs: ["permanent-recruitment", "retained-search"],
    relatedInsightSlugs: [
      "when-should-an-agency-use-retained-search",
      "why-senior-marketing-hiring-goes-wrong",
    ],
    ctaHeading: "Hiring a senior agency person?",
    ctaText:
      "Talk through the brief with David before assuming the title tells the whole story.",
    seoTitle: "Senior Agency Hiring Advice | Essential Resourcing",
    metaDescription:
      "Why senior agency recruitment needs to assess commercial judgement, client handling and fit, not just matching titles.",
  },
  {
    title:
      "Your First Marketing Director: What Should You Actually Be Hiring For?",
    slug: "your-first-marketing-director-what-should-you-actually-be-hiring-for",
    status: "published",
    category: "Client-side marketing hiring",
    cardCategory: "Client-side marketing hiring",
    excerpt:
      "Before hiring your first Marketing Director, work out what you’re actually handing them.",
    cardExcerpt:
      "A founder/CEO guide to defining the first senior marketing leadership hire properly.",
    publishedDate: "2026-09-15",
    updatedDate: "2026-09-15",
    readingTime: "6 min read",
    author: "David Walsh",
    body: [
      {
        heading: "Intro",
        content: [
          "There’s a particular hiring conversation I really enjoy.",
          "A founder or CEO has grown a decent business.",
          "Marketing has happened.",
          "Perhaps reasonably successfully.",
          "There might be a small team.",
          "A couple of agencies.",
          "Some paid media.",
          "CRM.",
          "Social.",
          "A website that’s been rebuilt approximately 47 times. 😂",
          "But marketing has never really had one senior person properly owning it.",
          "Eventually the business reaches the point where somebody says:",
          "“I think we need a Marketing Director.”",
          "Maybe.",
          "But before recruiting one, work out what you’re actually handing them.",
        ],
      },
      {
        heading: "What stage is the business at?",
        content: [
          "A £5m founder-led business trying to establish product-market fit needs something very different from a £100m retailer trying to transform an established marketing function.",
          "Think about revenue and growth ambitions.",
          "Customer base.",
          "Market maturity.",
          "Team.",
          "Budget.",
          "Channels.",
          "Data.",
          "Technology.",
          "Brand maturity.",
          "And what the CEO currently owns that they want to hand over.",
        ],
      },
      {
        heading: "What does the team look like?",
        content: [
          "If your new Marketing Director inherits six good specialists, you may need a leader who can create direction and get more from them.",
          "If they inherit nobody, you need a builder.",
          "Those aren’t necessarily the same person.",
        ],
      },
      {
        heading: "What’s the budget?",
        content: [
          "This sounds obvious.",
          "It isn’t always.",
          "You can’t ask somebody to deliver enormous growth and then give them £14.50 and a Canva subscription. 😂",
          "Be clear about what they genuinely control.",
        ],
      },
      {
        heading: "Brand, growth or both?",
        content: [
          "One of the biggest challenges with senior marketing briefs is expecting one person to be world-class at everything.",
          "Brand.",
          "Performance.",
          "CRM.",
          "Ecommerce.",
          "Data.",
          "PR.",
          "Content.",
          "Product.",
          "Commercial strategy.",
          "AI.",
          "And probably organise the Christmas party while they’re at it.",
          "Strong Marketing Directors can operate broadly.",
          "But everybody has strengths.",
          "Know which ones your business actually needs.",
        ],
      },
      {
        heading: "What does the CEO relationship look like?",
        content: [
          "This can make or break the hire.",
          "If you’ve historically owned every marketing decision, are you genuinely ready to hand some of that responsibility over?",
          "A good senior marketer should challenge you occasionally.",
          "If what you really want is somebody senior enough to be accountable but junior enough to agree with everything you say, you’re going to have an interesting search.",
        ],
      },
      {
        heading: "What needs to change?",
        content: [
          "This is the question I’d build the whole brief around.",
          "Twelve months after this person starts:",
          "What does the team look like?",
          "What has happened to revenue?",
          "What has happened to acquisition?",
          "What has happened to the brand?",
          "What decisions are being made differently?",
          "What are you, as CEO, no longer having to do?",
          "Now we’ve got a brief.",
        ],
      },
    ],
    faqs: [
      {
        question: "When should a founder hire their first Marketing Director?",
        answer:
          "When marketing needs senior ownership, clearer direction and commercial accountability beyond the founder, agencies or a small specialist team.",
      },
      {
        question: "What should a first Marketing Director own?",
        answer:
          "It depends on the business stage, but common ownership includes team direction, budget, channels, brand, growth priorities, agencies and marketing’s commercial contribution.",
      },
      {
        question: "Do you need a builder or optimiser?",
        answer:
          "If there is little team or structure, you may need a builder. If there is an established team and budget, you may need someone who can improve and focus what already exists.",
      },
    ],
    relatedServiceSlugs: ["permanent-recruitment", "retained-search"],
    relatedInsightSlugs: [
      "how-to-hire-a-marketing-director-without-wasting-six-weeks",
      "why-senior-marketing-hiring-goes-wrong",
    ],
    ctaHeading: "Approaching your first senior marketing leadership hire?",
    ctaText:
      "Talk it through with David before writing the job description and heading straight to market.",
    seoTitle: "Hiring Your First Marketing Director | Essential Resourcing",
    metaDescription:
      "What founders and CEOs should define before hiring their first Marketing Director or senior marketing leader.",
  },
  {
    title: "What is a Fractional Marketing Leader?",
    slug: "what-is-a-fractional-marketing-leader",
    status: "published",
    category: "Fractional",
    cardCategory: "Fractional explainers",
    excerpt:
      "Senior marketing leadership for the time the business actually needs.",
    cardExcerpt:
      "When Fractional makes sense, what the person actually does and how it differs from consultancy.",
    publishedDate: "2026-06-09",
    updatedDate: "2026-09-10",
    readingTime: "5 min read",
    author: "David Walsh",
    media: fractionalVideo,
    body: [
      {
        heading: "Direct answer",
        content: [
          "A Fractional marketing leader is an experienced senior marketer who joins a business for a defined period or number of days to provide leadership, direction and hands-on support against a specific business need.",
          "Unlike a traditional consultant, they're usually embedded in the business and involved in making the plan happen, not simply recommending what somebody else should do.",
        ],
      },
      {
        heading: "When does Fractional make sense?",
        content: [
          "It works when the business needs senior marketing leadership but another permanent senior hire is too early, too slow or simply isn't the right answer.",
          "That might be because a Marketing Director has left, the business is growing faster than the team, a founder is carrying too much or the marketing function needs experienced direction before the permanent structure is clear.",
        ],
      },
      {
        heading: "How is Fractional different from consultancy?",
        content: [
          "The line isn't absolute, but there's an important practical difference.",
          "A consultant will often diagnose a problem and recommend what should happen.",
          "A Fractional leader is typically closer to the day-to-day business.",
          "They might attend leadership meetings, mentor the team, challenge decisions, build the roadmap, manage stakeholders and help deliver it.",
          "They're still there next week when reality kicks in.",
        ],
      },
      {
        heading: "What makes it work?",
        content: [
          "Start with an outcome, not a vague number of days.",
          "What does the business need to be different three or six months from now?",
          "Then give the person enough access, information and authority to make themselves useful.",
          "Otherwise you've just hired an expensive person to sit in meetings.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is Fractional the same as interim marketing leadership?",
        answer:
          "Often, yes. Fractional is the phrase many people search for when they need senior leadership for a defined business need.",
      },
      {
        question: "How is Fractional different from consultancy?",
        answer:
          "A consultant often recommends what should happen. A Fractional leader gets closer to the business and helps make it happen.",
      },
      {
        question: "Which marketing roles can work on an interim basis?",
        answer:
          "Common examples include Interim CMO, Marketing Director, Head of Marketing, Growth Director, Digital Director and senior agency leadership roles.",
      },
      {
        question:
          "How many days a week does a fractional marketing leader work?",
        answer:
          "It depends on the problem. One, two or three days a week can all work when the outcome and scope are clear.",
      },
    ],
    relatedServiceSlugs: ["fractional"],
    relatedInsightSlugs: [
      "do-you-actually-need-a-full-time-marketing-director",
      "how-much-does-senior-marketing-recruitment-cost",
    ],
    ctaHeading: "Wondering whether this could work in your business?",
    ctaText: "Tell David what's going on and he'll give you a straight view.",
    seoTitle: "What Is a Fractional Marketing Leader? | Essential",
    metaDescription:
      "What a fractional marketing leader does, when to hire one and how the model differs from traditional consultancy.",
  },
  {
    title: "When Should an Agency Use Retained Search?",
    slug: "when-should-an-agency-use-retained-search",
    status: "published",
    category: "Agency hiring",
    cardCategory: "Agency growth/hiring insight",
    excerpt:
      "Not every agency vacancy needs retained search. Some absolutely do.",
    cardExcerpt:
      "Retained search isn't right for every vacancy. Here's when it earns its keep.",
    publishedDate: "2026-06-09",
    updatedDate: "2026-09-10",
    readingTime: "4 min read",
    author: "David Walsh",
    body: [
      {
        heading: "Direct answer",
        content: [
          "An agency should consider retained search when a role is senior, confidential, commercially important or difficult enough that relying on advert response and whoever happens to be actively looking is unlikely to solve it properly.",
        ],
      },
      {
        heading: "When does retained search earn its keep?",
        content: [
          "If you're hiring an important leader, entering a new market, replacing somebody confidentially or looking for a very specific combination of experience, the people you want may never apply to your advert.",
          "That's when properly mapping the market becomes much more valuable.",
        ],
      },
      {
        heading: "What changes with retained search?",
        content: [
          "The recruiter has a proper mandate to search the market rather than racing other agencies to send the first CV.",
          "That creates more room for:",
          "A deeper brief",
          "Proper market mapping",
          "Direct approaches to passive candidates",
          "More detailed assessment",
          "Consistent candidate management",
          "Honest market feedback",
          "And a process where everybody has a bit more skin in the game.",
        ],
      },
      {
        heading: "When is it probably overkill?",
        content: [
          "If the role is straightforward, the candidate market is healthy and a normal specialist recruitment process is likely to solve it, retained search may be unnecessary.",
          "David will tell you that too.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is retained search only for board roles?",
        answer:
          "No. It can be useful for any senior, confidential or commercially important agency hire where the market needs to be properly mapped.",
      },
      {
        question: "How is retained recruitment different from contingency?",
        answer:
          "Retained recruitment gives the search a proper mandate and commitment. It is less about racing to send CVs and more about mapping, assessing and managing the right market.",
      },
      {
        question: "Do we pay the whole retained search fee upfront?",
        answer:
          "Usually not. Retained searches are normally staged. David will explain the structure before anything starts.",
      },
      {
        question: "Can retained search be used for confidential hiring?",
        answer:
          "Yes. Confidential hiring is one of the moments where retained search can make real sense.",
      },
    ],
    relatedServiceSlugs: ["permanent-recruitment", "retained-search"],
    relatedInsightSlugs: [
      "why-senior-marketing-hiring-goes-wrong",
      "retained-search-vs-contingent-recruitment",
    ],
    ctaHeading: "Got a role you're not sure how to take to market?",
    ctaText: "Give David a shout.",
    seoTitle: "Agency Retained Search | Essential",
    metaDescription:
      "When retained recruitment makes sense for agencies hiring senior, confidential or difficult-to-find marketing, PR and digital talent.",
  },
  {
    title: "Why Senior Marketing Hiring Goes Wrong",
    slug: "why-senior-marketing-hiring-goes-wrong",
    status: "published",
    category: "Hiring advice",
    excerpt:
      "A lot of senior marketing hiring goes wrong before the first candidate has even been interviewed.",
    cardExcerpt:
      "Most senior hiring problems start before the first interview.",
    publishedDate: "2026-06-09",
    updatedDate: "2026-09-10",
    readingTime: "6 min read",
    author: "David Walsh",
    body: [
      {
        heading: "Direct answer",
        content: [
          "Senior marketing hiring often goes wrong because businesses start with a job title instead of defining the commercial problem the person needs to solve.",
          "An unclear brief, unrealistic salary, weak assessment and slow interview process then make it much harder to identify and secure the right person.",
        ],
      },
      {
        heading: "1. The job title becomes the brief",
        content: [
          '"We need a Marketing Director."',
          "Fine.",
          "Why?",
          "What needs to be different when they arrive?",
          "A Marketing Director hired to build a marketing function from scratch is a very different person from one hired to optimise an established £10m budget and a team of 20.",
          "Same title. Completely different brief.",
        ],
      },
      {
        heading: "2. The job description becomes a shopping list",
        content: [
          "Strategic.",
          "Hands-on.",
          "Commercial.",
          "Creative.",
          "Data-led.",
          "Brilliant leader.",
          "Can also jump into Google Ads on a Tuesday afternoon.",
          "At some point you've stopped describing a person and started describing the Avengers 😂",
          "Prioritise what actually matters.",
        ],
      },
      {
        heading: "3. The CV gets too much credit",
        content: [
          "A polished CV can tell a convincing story.",
          "AI is making polished applications even easier to create.",
          "So ask better questions.",
          "What did this person personally do?",
          "What was already working when they arrived?",
          "What changed?",
          "How was success measured?",
          "What went wrong?",
          "What would they do differently?",
        ],
      },
      {
        heading: "4. The process tests interviewing rather than ability",
        content: [
          "Some excellent marketers are brilliant interviewees.",
          "Some aren't.",
          "The objective isn't to hire the person who gives the slickest answer.",
          "It's to gather enough evidence to make a sensible decision.",
        ],
      },
      {
        heading: "5. Good candidates get lost to slow decisions",
        content: [
          'Three weeks between stages isn\'t "being thorough".',
          "Sometimes it's just slow.",
          "Strong candidates have other conversations happening.",
          "A good process can still be rigorous without taking forever.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the biggest mistake when hiring a senior marketer?",
        answer:
          "Starting with a job title instead of the commercial problem the person needs to solve.",
      },
      {
        question: "How should businesses assess senior marketing candidates?",
        answer:
          "Agree what good looks like before interviewing, then test evidence against that brief rather than relying on CV polish or who interviews best.",
      },
      {
        question:
          "How long should a senior marketing recruitment process take?",
        answer:
          "It should be rigorous, but not slow for the sake of it. Good candidates have options, so decision-makers, stages and feedback rhythm need to be clear before you start.",
      },
    ],
    relatedServiceSlugs: ["retained-search", "permanent-recruitment"],
    relatedInsightSlugs: [
      "how-to-hire-a-marketing-director-without-wasting-six-weeks",
      "the-job-title-isnt-the-brief-senior-marketing-hire",
    ],
    ctaHeading:
      "Hiring a senior marketer and want somebody to challenge the brief before it hits the market?",
    ctaText: "Talk to David.",
    seoTitle: "Senior Marketing Hiring Mistakes | Essential",
    metaDescription:
      "Why senior marketing hires fail and how better briefs, candidate assessment and hiring processes reduce the risk of an expensive mis-hire.",
  },
  {
    title: "How to Hire a Marketing Director Without Wasting Six Weeks",
    slug: "how-to-hire-a-marketing-director-without-wasting-six-weeks",
    status: "published",
    category: "Client-side marketing hiring",
    cardCategory: "Client-side marketing hiring insight",
    excerpt:
      "The quickest way to waste six weeks hiring a Marketing Director? Start searching before you've worked out what you actually need.",
    cardExcerpt:
      "A clearer brief, realistic salary and better process can save weeks in a Marketing Director search.",
    publishedDate: "2026-06-09",
    updatedDate: "2026-09-10",
    readingTime: "5 min read",
    author: "David Walsh",
    body: [
      {
        heading: "Direct answer",
        content: [
          "To hire a Marketing Director effectively, first define the commercial problem the person needs to solve, what success should look like and what level of leadership the business genuinely needs.",
          "Then agree the salary, decision-makers, assessment criteria and interview process before approaching the market.",
        ],
      },
      {
        heading: "1. Start with the problem",
        content: [
          "Why does this hire exist?",
          "Maybe growth has stalled.",
          "Maybe marketing has become a collection of disconnected channels.",
          "Maybe the founder still owns half the marketing decisions.",
          "Maybe there's a strong team with nobody experienced enough to lead it.",
          "Start there.",
        ],
      },
      {
        heading: "2. Work out what kind of Marketing Director you need",
        content: [
          "Builder or optimiser?",
          "Brand-heavy or performance-led?",
          "B2B or consumer?",
          "Hands-on or leading a sizeable team?",
          "Transformation or steady growth?",
          'There isn\'t one universal "great Marketing Director".',
          "There's a great Marketing Director for this business, at this stage, with this problem.",
        ],
      },
      {
        heading: "3. Get realistic about salary",
        content: [
          "Don't build the perfect candidate in your head and only afterwards discover the market values that person very differently.",
          "Sense-check it early.",
        ],
      },
      {
        heading: "4. Decide how you'll judge people",
        content: [
          "What evidence would convince you this person can do the job?",
          "Agree it before interviewing.",
          'Otherwise it\'s remarkably easy to hire the person everybody "liked".',
        ],
      },
      {
        heading: "5. Move",
        content: [
          "You don't need to make a reckless decision.",
          "You do need to respect that good people have options.",
          "Decide who's involved, how many stages are genuinely necessary and when decisions will be made before the first interview.",
        ],
      },
    ],
    faqs: [
      {
        question: "What should a Marketing Director brief include?",
        answer:
          "It should include the commercial problem, expected outcomes, team and budget context, decision rights, salary, process and the evidence you need to see.",
      },
      {
        question: "How much should a Marketing Director earn?",
        answer:
          "It depends on scope, team size, budget, sector, location, hybrid expectations and business stage. A live brief needs a current market view.",
      },
      {
        question: "Should a Marketing Director be hands-on?",
        answer:
          "Sometimes. The useful question is how hands-on they need to be and whether that matches the level, salary and business stage.",
      },
      {
        question: "How do you assess a Marketing Director at interview?",
        answer:
          "Assess evidence against the agreed brief: what they changed, what they personally owned, how success was measured and how they handled difficult bits.",
      },
    ],
    relatedServiceSlugs: ["permanent-recruitment", "retained-search"],
    relatedInsightSlugs: [
      "why-senior-marketing-hiring-goes-wrong",
      "your-first-marketing-director-what-should-you-actually-be-hiring-for",
    ],
    ctaHeading:
      "Want David to sense-check the brief before you start the six-week adventure?",
    ctaText: "Give him a shout.",
    seoTitle: "How to Hire a Marketing Director | Essential Resourcing",
    metaDescription:
      "How to recruit a Marketing Director with a clearer brief, realistic salary, better candidate assessment and a hiring process that doesn’t lose good people.",
  },
];

export const insightCategories = [
  "Hiring advice",
  "Market commentary",
  "Salary and market insight",
  "Fractional",
  "Candidate advice",
  "Agency hiring",
  "Client-side marketing hiring",
  "Case studies",
];

export const insightSeeds = [
  "Nobody buys recruitment. They buy the outcome.",
  "The job title is not the brief.",
  "Why strategic but hands-on usually means the brief needs work.",
  "Why your hiring process is putting good people off.",
  "The hidden cost of lowballing senior marketing hires.",
  "Fractional and interim support is not consultancy. Here is the difference.",
  "Why agencies struggle to hire senior PR people.",
  "What founders actually need from their next marketing leader.",
  "Why more CVs rarely fix a broken brief.",
  "How to stop wasting six weeks on a role the market will not buy.",
];

export const aiSearchQuestions = [
  {
    question:
      "How do I choose a marketing recruiter in Manchester or the North West?",
    answer:
      "Choose a recruiter who understands the regional marketing, digital, PR and agency market, can challenge the brief, give honest salary advice and reach people who are not simply applying to job adverts.",
  },
  {
    question:
      "What is the difference between retained search and contingency recruitment?",
    answer:
      "Contingency recruitment usually means paying when the recruiter fills the role. Retained search means committing to one search partner and paying for a structured search process, usually in stages.",
  },
  {
    question: "How much does senior marketing recruitment cost?",
    answer:
      "Senior marketing recruitment fees often depend on salary, search difficulty, exclusivity, whether the work is retained and how much market mapping and assessment is needed. The fee should be agreed clearly before the search starts.",
  },
  {
    question: "What is a Fractional marketing leader?",
    answer:
      "A Fractional marketing leader is an experienced senior marketer who joins a business for a defined period or number of days to provide leadership, direction and hands-on support against a specific business need.",
  },
  {
    question: "When should an agency use retained search?",
    answer:
      "Retained search makes sense when an agency hire is senior, confidential, difficult to reach or commercially important enough to justify a properly mapped and managed search.",
  },
  {
    question: "Why do senior marketing hires fail?",
    answer:
      "Often because the business starts with a job title instead of the problem it needs the person to solve. An unclear brief, unrealistic salary, weak assessment or slow interview process can then make the problem worse.",
  },
  {
    question: "How do you define the real brief behind a marketing hire?",
    answer:
      "Start with the business problem. What needs to grow, change, improve or stop? What should be different six or twelve months after the person joins? Then work backwards into the experience and capability required.",
  },
  {
    question: "What makes agency recruitment different?",
    answer:
      "Agency hiring involves more than technical skill. Client handling, commercial awareness, pace, resilience and team fit can matter just as much, and the same job title can mean very different things from one agency to another.",
  },
  {
    question:
      "What should a founder consider before hiring a Marketing Director?",
    answer:
      "Start with what the Marketing Director needs to achieve, the team and budget they'll inherit, the decisions they'll actually own and whether the business needs a builder, optimiser, strategist or hands-on operator.",
  },
  {
    question:
      "When should a business hire an interim or fractional CMO or Marketing Director?",
    answer:
      "When senior marketing leadership is needed now but a permanent appointment is too early, too slow or simply isn't the right model for the business.",
  },
  {
    question: "How do you avoid wasting time on the wrong candidates?",
    answer:
      "Define what good looks like before interviewing. Assess evidence against that brief rather than relying on CV keywords or who gives the slickest interview.",
  },
  {
    question:
      "What salary should businesses pay for senior marketing roles in the North West?",
    answer:
      "It depends on much more than the job title. Scope, team size, budget, commercial responsibility, sector, location, hybrid expectations and business stage all affect the market. For a live role, David can give you a current view rather than pretending one generic salary table answers everything.",
  },
  {
    question: "Who handles marketing recruitment in Manchester?",
    answer:
      "Essential Resourcing is a Manchester-based specialist marketing recruitment and leadership search business founded by David Walsh. It recruits across marketing, PR, communications, digital and agencies throughout the North West and wider UK.",
  },
  {
    question:
      "Can Essential Resourcing help with PR recruitment in Manchester?",
    answer:
      "Yes. Essential Resourcing supports PR recruitment in Manchester and the North West, especially senior agency, communications, client services and leadership roles where fit and judgement matter.",
  },
  {
    question:
      "Does Essential Resourcing recruit digital and performance marketing talent?",
    answer:
      "Yes. Digital recruitment includes performance marketing, paid media, eCommerce, CRM, analytics, digital leadership and related agency and client-side roles.",
  },
  {
    question:
      "Can Essential Resourcing work on an exclusive or retained basis?",
    answer:
      "Yes. Retained or exclusive search is particularly useful for senior, confidential or difficult hires where proper market mapping, candidate engagement and a committed search process matter.",
  },
];

export const caseStudies: CaseStudy[] = [
  {
    title: "Hiring a Managing Partner for Havas Media Manchester",
    searchStory: havasSearchStory,
    slug: "havas-media-manchester-managing-partner-james-reddington",
    status: "published",
    clientType: "Havas Media Manchester",
    sector: "Media agency leadership",
    roleHired: "Managing Partner",
    serviceSlug: "retained-search",
    challengeSummary:
      "A retained search for a senior agency leader that resulted in James Reddington joining Havas Media Manchester as Managing Partner — and later progressing into the leadership of the Manchester agency.",
    clientContext:
      "Havas Media Manchester needed an experienced Managing Partner who could bring commercial strength, credibility with senior clients, strong people leadership and, importantly, be the right fit for the agency.\n\nAt this level, having the right companies and job titles on your CV only gets you so far.",
    hiringChallenge:
      "At Managing Partner level, CV matching doesn’t really cut it.\n\nTwo candidates can have similar agencies, clients and job titles on paper and be completely different propositions in reality.\n\nSo the search needed to go further.\n\nHow did they lead?\n\nHow commercially strong were they?\n\nWhat relationships had they actually owned?\n\nHow did they deal with difficult clients and difficult decisions?\n\nWhat had they personally contributed?\n\nAnd would they actually work within Havas?\n\nThat’s where the judgement comes in.",
    whyHard:
      "Plenty of senior agency candidates can look right on paper. The harder work is understanding whether they can lead people, navigate a complex agency business and make sense for the opportunity.",
    businessProblem:
      "Havas wasn’t simply looking for somebody who’d already been called a Managing Partner.\n\nThey needed somebody who could handle major client relationships, lead people, make good commercial decisions and play a senior role in where the agency was heading.\n\nThe job title wasn’t the brief.",
    whyHireMattered:
      "Get a Managing Partner hire right and they can have a real impact across clients, people, culture and the commercial performance of the agency.\n\nGet it wrong and it’s an expensive mistake — in more ways than just salary and recruitment fees.\n\nThis was a hire worth taking the time to get right.",
    whatMadeItTricky:
      "There were plenty of people in the market with recognisable agency names and senior job titles.\n\nThat wasn’t enough.\n\nWe needed somebody commercially strong, credible enough to sit opposite senior clients, capable of leading good people and culturally right for Havas Media Manchester.\n\nThat’s a much smaller pool.",
    whatKindOfPerson:
      "An experienced senior agency leader who understood clients, people and commercials.\n\nSomebody who could operate credibly at leadership level but still understood the realities of agency life.\n\nAnd somebody with enough understanding of the Manchester agency market for the move to genuinely make sense.",
    approach: [
      "Got properly underneath the brief before approaching anybody",
      "Mapped the senior agency market rather than waiting for people to apply",
      "Approached strong people who weren’t necessarily looking for another job",
      "Looked beyond the CV at commercial strength, leadership, client credibility and fit",
      "Focused on fewer, better conversations rather than sending a pile of CVs to make the search look busy",
    ],
    process:
      "The search was run on a retained basis.\n\nThat gave us the time and commitment to properly map the relevant market, approach senior people directly and understand whether somebody genuinely fitted the opportunity before introducing them.\n\nThe objective was never to produce the biggest shortlist.\n\nIt was to produce the right one.",
    outcome:
      "James Reddington was appointed Managing Partner of Havas Media Manchester after almost 24 years at Carat Manchester, where he had been Group Business Director.\n\nFor somebody to leave a business after nearly 24 years tells you this wasn’t simply another job move.\n\nIt had to be the right opportunity for James as much as James had to be the right person for Havas.",
    whatChangedHeading: "What happened next",
    whatChanged:
      "This is probably my favourite bit of the story.\n\nJames subsequently progressed into a newly created Joint General Manager role for Havas Media Manchester alongside Lucy Barnes, becoming part of the senior leadership of the agency.\n\nThat’s important because recruitment shouldn’t really be judged by whether somebody accepted the job.\n\nThe better question is:\n\nDid we help the business hire somebody who went on to succeed there?\n\nIn this case, they clearly did.",
    impactHeading: "The wider business impact",
    impact:
      "Havas later reported that James and Lucy played a key role in the growth of the Manchester agency, including retaining the BBC account, winning new clients and contributing during a period in which Manchester billings increased by 150% in a year.\n\nI’m not going to pretend Essential gets the credit for what James went on to achieve.\n\nThat’s James and the Havas team’s achievement.\n\nBut seeing somebody you originally introduced go on to progress within the business and become part of its leadership is a pretty bloody good sign that the original hire worked.\n\nAnd ultimately, that’s what good recruitment should be trying to achieve.\n\nNot just:\n\n“Did we fill the vacancy?”\n\nBut:\n\n“Did we help the business hire the right person?”",
    quote: "Finding the CV wasn’t the job. Finding the right person was.",
    essentialView: [
      "This search is a good example of why I think senior recruitment is increasingly about judgement, not access to candidates.",
      "Technology can find people.",
      "LinkedIn can find people.",
      "AI can find people.",
      "The valuable bit is understanding who’s genuinely good, what they’ve actually achieved and whether they’re right for this business.",
      "That’s where recruitment earns its money.",
    ],
    ctaHeading: "Making an important senior hire?",
    ctaText:
      "If you’re recruiting a Managing Partner, Marketing Director, CMO or another senior marketing, digital or agency leader, I’m always happy to sense-check the brief before you start.\n\nEven if, honestly, you don’t need a recruiter for this one.",
    ctaLabel: "Talk to David",
    proofLogo: "/assets/images/proof/havas-media-network-logo.png",
    proofLogoAlt: "Havas Media Network logo",
    proofLinkedInUrl: "https://www.linkedin.com/in/jamesreddington/",
    proofLinkedInLabel: "View James Reddington on LinkedIn",
    externalSourceUrl:
      "https://lbbonline.com/news/havas-media-manchester-creates-joint-general-manager-role",
    externalSourceLabel: "Read the Havas leadership update",
    featured: true,
    seoTitle: "Havas Managing Partner Case Study | Essential",
    metaDescription:
      "How Essential Resourcing ran a retained senior agency leadership search for Havas Media Manchester and appointed James Reddington.",
  },
  {
    title: "Independent PR agency, Manchester",
    slug: "independent-pr-agency-senior-account-director",
    status: "draft",
    clientType: "Independent PR agency",
    sector: "PR and communications",
    roleHired: "Senior Account Director",
    serviceSlug: "permanent-recruitment",
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
    seoTitle: "Senior Account Director Case Study | Essential Resourcing",
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
    serviceSlug: "permanent-recruitment",
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
    seoTitle: "Head of Marketing Case Study | Essential",
    metaDescription:
      "Draft anonymised case study structure for a client-side Head of Marketing hire. Add verified outcome before publication.",
  },
  {
    title: "Integrated agency fractional leadership",
    slug: "integrated-agency-fractional",
    status: "draft",
    clientType: "Integrated agency",
    sector: "Agency leadership",
    roleHired: "Fractional leadership",
    serviceSlug: "fractional",
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
    seoTitle: "Fractional Agency Leadership Case Study | Essential",
    metaDescription:
      "Draft anonymised case study structure for a fractional agency leadership brief.",
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
    title: "Digital & Performance Marketing Salary Snapshot",
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
    seoTitle: "Digital Marketing Salary Snapshot | Essential Resourcing",
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
    seoTitle: "Senior Marketing Salary Snapshot | Essential",
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
    employmentType: "permanent-full-time",
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
    successInSixMonths: "Add what should be working better by month six.",
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
      "Candidate details stay private and are only used for recruitment purposes. CVs are uploaded through the approved private route and are not sent to clients without permission.",
    candidateDataHandling:
      "Candidate details stay private and are only used for recruitment purposes. CVs are uploaded through the approved private route and are not sent to clients without permission.",
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
  fractionalVideo,
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
const googleJobTitleRiskPattern =
  /\b(apply now|hiring now|urgent|immediate start|job vacancy|essential resourcing)\b|[£$€]|\*{2,}|!{2,}/i;
const fullyRemotePattern =
  /\b(100% remote|fully remote|remote-first|remote first|work remotely|work from home)\b/i;
const ukApplicantLocationPattern =
  /\b(uk|united kingdom|great britain|britain|england|scotland|wales|northern ireland)\b/i;
const publishableSalaryVisibility = ["public_range", "indicative_range"];
const ratePeriods = ["daily", "hourly", "weekly", "monthly", "fixed"];

export function getGoogleJobPostingIssues(
  job: Job,
  referenceDate = new Date(),
) {
  const issues: string[] = [];
  const descriptionCopy = [
    job.summary,
    ...job.description,
    ...job.responsibilities,
    ...job.mustHaves,
    ...job.requirements,
    ...job.benefits,
    job.applicationNotes,
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (googleJobTitleRiskPattern.test(job.title)) {
    issues.push("job_title_not_plain_role_title");
  }

  if (!job.postedDate.trim()) {
    issues.push("job_posted_date_missing");
  }

  if (!job.hiringOrganizationName?.trim()) {
    issues.push("job_hiring_organization_missing");
  }

  if (
    !job.employmentType.trim() ||
    /to be confirmed/i.test(job.employmentType)
  ) {
    issues.push("job_employment_type_missing");
  }

  if (
    !job.summary.trim() ||
    job.description.length === 0 ||
    job.responsibilities.length === 0 ||
    job.mustHaves.length === 0 ||
    descriptionCopy.length < 240
  ) {
    issues.push("job_description_incomplete");
  }

  if (job.applicationFormEnabled === false && !job.applicationEmail.trim()) {
    issues.push("job_apply_route_missing");
  }

  if (job.remotePossible === "yes") {
    const remoteCopy = [
      job.summary,
      job.hybridPattern,
      job.hybridReality,
      job.locationExpectation,
      job.travelExpectation,
    ].join(" ");

    if (!fullyRemotePattern.test(remoteCopy)) {
      issues.push("remote_not_clearly_100_percent");
    }

    if (!ukApplicantLocationPattern.test(remoteCopy)) {
      issues.push("remote_applicant_location_missing");
    }
  } else if (!job.location.trim()) {
    issues.push("job_physical_location_missing");
  }

  if (
    job.status === "live" &&
    (!job.closingDate || job.closingDate < todayIsoDate(referenceDate))
  ) {
    issues.push(
      job.closingDate ? "expired_live_job" : "job_closing_date_missing",
    );
  }

  return issues;
}

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

  issues.push(...getGoogleJobPostingIssues(job));

  return [...new Set(issues)];
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
