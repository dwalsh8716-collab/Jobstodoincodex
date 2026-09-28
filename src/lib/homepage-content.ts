import {
  homepageFeatureVideo,
  linkedInRecommendations,
  specialisms,
} from "./content";
import type { CTA, RichMedia } from "./types";

export type HomeDefinition = {
  number: string;
  phrase: string;
  copy: string;
};

export type HomeComparisonRow = {
  usual: string;
  essential: string;
};

export type HomeServiceCard = {
  slug: string;
  title: string;
  proposition: string;
  description: string;
  linkLabel: string;
  href: string;
};

export type HomeAudiencePanel = {
  eyebrow: string;
  heading: string;
  items: string[];
  ctaLabel: string;
  ctaHref: string;
};

export type HomeProofItem = {
  title: string;
  copy: string;
};

export type HomeRecommendation = {
  proofPoint: string;
  name: string;
  role: string;
  date: string;
  quote: string;
};

export type HomeSpecialismCard = {
  slug: string;
  title: string;
  description: string;
  linkLabel: string;
  href: string;
};

export type HomePageContent = {
  heroEyebrow: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroLede: string;
  heroPrimaryCta: CTA;
  heroSecondaryCta: CTA;
  premiumMedia: RichMedia;
  proofPoints: string[];
  disciplines: string[];
  filterSection: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    definitions: HomeDefinition[];
  };
  differenceSection: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    comparisonLabelLeft: string;
    comparisonLabelRight: string;
    rows: HomeComparisonRow[];
  };
  servicesSection: {
    eyebrow: string;
    heading: string;
    intro: string;
    cards: HomeServiceCard[];
  };
  founderSection: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    straightTalkHeading: string;
    straightTalkPoints: string[];
  };
  audienceSection: {
    heading: string;
    client: HomeAudiencePanel;
    candidate: HomeAudiencePanel;
  };
  proofSection: {
    eyebrow: string;
    heading: string;
    intro: string;
    framework: HomeProofItem[];
    caseStudyEyebrow: string;
    caseStudyPrimaryLinkLabel: string;
    caseStudySecondaryLinkLabel: string;
    caveat: string;
  };
  linkedInSection: {
    eyebrow: string;
    heading: string;
    intro: string;
    linkLabel: string;
    recommendations: HomeRecommendation[];
  };
  liveProofSection: {
    eyebrow: string;
    heading: string;
    intro: string;
  };
  specialismsSection: {
    eyebrow: string;
    heading: string;
    cards: HomeSpecialismCard[];
  };
  manifestoSection: {
    eyebrow: string;
    heading: string;
    lines: string[];
    signature: string;
  };
  citySection: {
    ariaLabel: string;
    imageSrc: string;
    imageAlt: string;
    label: string;
    emphasis: string;
  };
  finalCtaSection: {
    heading: string;
    body: string;
    primaryCta: CTA;
    emailCtaLabel: string;
  };
  featuredInsightSlugs: string[];
  featuredCaseStudySlugs: string[];
};

export const defaultHomePageContent: HomePageContent = {
  heroEyebrow:
    "Founder-led marketing recruitment · Leadership search · Digital · PR · Agencies",
  heroHeadline: "Helping Businesses Make Better Hiring Decisions.",
  heroSubheadline: "Permanent · Retained · Fractional Marketing Search",
  heroLede:
    "Technology helps find people. Experience and judgement work out who's actually good.",
  heroPrimaryCta: {
    label: "Sense-check a brief",
    href: "/contact",
    variant: "primary",
  },
  heroSecondaryCta: {
    label: "Talk to David",
    href: "/about-david-walsh",
    variant: "secondary",
  },
  premiumMedia: homepageFeatureVideo,
  proofPoints: [
    "Manchester-based, UK-wide",
    "Marketing, PR, digital and agency hiring",
    "Fewer CVs. Better conversations.",
  ],
  disciplines: [
    "Marketing",
    "Comms",
    "PR",
    "Digital",
    "Agency-side",
    "Client-side",
    "Leadership",
    "Fractional",
  ],
  filterSection: {
    eyebrow: "The filter",
    heading:
      "Finding people is the easy bit. Working out who's genuinely good is where recruitment earns its money.",
    paragraphs: [
      "Recruitment has a reputation problem. And, let's be fair, some of it is deserved.",
      "Technology can search a market faster than ever. AI can help analyse CVs, spot patterns and remove a lot of the boring stuff.",
      "But it can't replace judgement.",
      "Essential Resourcing combines smart technology with proper conversations, more than a decade specialising in marketing recruitment and a healthy willingness to challenge the brief when something doesn't stack up.",
    ],
    definitions: [
      {
        number: "01",
        phrase: "Technology helps find the market.",
        copy: "Useful tools widen the search, spot signals and remove busywork. They don't decide who you should hire.",
      },
      {
        number: "02",
        phrase: "Experience gets behind the CV.",
        copy: "A good CV tells you what somebody has done. It doesn't always tell you whether they were actually any bloody good at it. That's where the questions, evidence and judgement come in.",
      },
      {
        number: "03",
        phrase: "Fewer CVs. Better conversations.",
        copy: "No padded shortlists. No CV pile sent over to make the search look busy. Just people worth your time, with honest context on why they're there.",
      },
    ],
  },
  differenceSection: {
    eyebrow: "Why it's different",
    heading: "Most hiring problems start before the search does.",
    paragraphs: [
      "Usually, it's not because the right person doesn't exist.",
      "It's because nobody properly challenged what the business actually needs, what success looks like, whether the salary stacks up or whether one job description has quietly become three jobs in a trench coat.",
      "That's where David starts.",
    ],
    comparisonLabelLeft: "The industry default",
    comparisonLabelRight: "Essential Resourcing",
    rows: [
      {
        usual: "Take the job description and start searching",
        essential: "Work out what the business actually needs first",
      },
      {
        usual: "Send the same recycled CVs within the hour",
        essential: "Map the market properly and approach people personally",
      },
      {
        usual: "Tell you what you want to hear about salary",
        essential: "Tell you what the market is actually saying",
      },
      {
        usual: "Send fifteen CVs and hope one sticks",
        essential: "Present fewer, properly assessed candidates",
      },
      {
        usual: "Judge people because their CV looks right",
        essential: "Get behind the CV and challenge the evidence",
      },
      {
        usual: "Let the process drift for six weeks",
        essential: "Keep feedback, candidates and decisions moving",
      },
    ],
  },
  servicesSection: {
    eyebrow: "Services",
    heading: "Four ways to work with Essential.",
    intro:
      "Permanent Recruitment, Retained Search, Fractional Leadership and Market Intelligence for marketing, communications, PR, digital and agency hiring.",
    cards: [
      {
        slug: "permanent-recruitment",
        title: "Permanent Recruitment",
        proposition: "Good people. Properly recruited.",
        description:
          "Success-based recruitment for permanent marketing, digital, PR, communications and agency hires.",
        linkLabel: "Explore Permanent Recruitment",
        href: "/services/permanent-recruitment",
      },
      {
        slug: "retained-search",
        title: "Retained Search",
        proposition:
          "When the hire matters enough to search the market properly.",
        description:
          "For senior, confidential, difficult or commercially important appointments where CV volume is not the answer.",
        linkLabel: "Explore Retained Search",
        href: "/services/retained-search",
      },
      {
        slug: "fractional",
        title: "Fractional Leadership",
        proposition: "Senior leadership. For the time you actually need it.",
        description:
          "Search for experienced CMOs, Marketing Directors and agency leaders when a full-time hire isn't the right answer.",
        linkLabel: "Explore Fractional Leadership",
        href: "/services/fractional",
      },
      {
        slug: "market-intelligence-advisory",
        title: "Market Intelligence & Advisory",
        proposition:
          "Before you recruit, make sure the brief actually stacks up.",
        description:
          "Salary benchmarking, talent mapping, competitor intelligence, brief design and hiring advice.",
        linkLabel: "Explore Market Intelligence & Advisory",
        href: "/services/market-intelligence-advisory",
      },
    ],
  },
  founderSection: {
    eyebrow: "Founder-led search",
    heading: "When you work with Essential, you work with David.",
    paragraphs: [
      "David Walsh started recruiting in 2013 and went independent in 2017. Essential Resourcing Ltd was incorporated in 2019 — the paperwork caught up later.",
      "It's deliberately founder-led.",
      "No getting sold to by one person and handed to somebody else. No huge team chasing the same database.",
      "Just specialist market knowledge, proper relationships and one person accountable for doing the job properly.",
    ],
    straightTalkHeading: "Things David will tell you straight.",
    straightTalkPoints: [
      "If the salary will not get you the person you are describing",
      "If the brief is actually two different jobs in a trench coat",
      "If your interview process is likely to lose the best people",
      "If you're looking for a unicorn that doesn't exist",
      "And, honestly, if you don't need a recruiter for this one",
    ],
  },
  audienceSection: {
    heading: "For clients and candidates",
    client: {
      eyebrow: "For clients",
      heading: "Make a better hire.",
      items: [
        "Get the brief challenged before it reaches the market",
        "Reach marketing people who aren't sitting on job boards",
        "Assess candidates beyond what's written on the CV",
        "Get honest salary and market advice",
        "Hire permanently, retained or through Fractional",
      ],
      ctaLabel: "Sense-check a brief",
      ctaHref: "/clients",
    },
    candidate: {
      eyebrow: "For candidates",
      heading: "Your career, taken seriously.",
      items: [
        "See roles genuinely relevant to what you do",
        "Get an honest view on salary, market and your next move",
        'No vague job ads or "competitive salary" mysteries where they can be avoided',
        "No CV being fired around the market without your permission",
        "Proper conversations and straight feedback wherever possible",
      ],
      ctaLabel: "See current roles",
      ctaHref: "/candidates",
    },
  },
  proofSection: {
    eyebrow: "Proof",
    heading: "A senior hire that went on to matter.",
    intro:
      "No borrowed logos. No suspiciously vague testimonials. No made-up placement numbers. Case studies only go live when the role, process, outcome and permission are clear.",
    framework: [
      {
        title: "The brief",
        copy: "What did the business actually need and why was the hire difficult?",
      },
      {
        title: "The search",
        copy: "How was the market mapped, candidates assessed and the shortlist built?",
      },
      {
        title: "The outcome",
        copy: "What genuinely changed as a result?",
      },
    ],
    caseStudyEyebrow: "Live case study",
    caseStudyPrimaryLinkLabel: "Read the Havas case study",
    caseStudySecondaryLinkLabel: "View all case studies",
    caveat: "",
  },
  linkedInSection: {
    eyebrow: "LinkedIn recommendations",
    heading: "Named proof from people who have worked with David.",
    intro:
      "Candidate and client feedback is more useful when it is public, named and easy to check.",
    linkLabel: "Read LinkedIn recommendations",
    recommendations: linkedInRecommendations.slice(0, 4).map((item) => ({
      proofPoint: item.proofPoint,
      name: item.name,
      role: item.role,
      date: item.date,
      quote: item.excerpt,
    })),
  },
  liveProofSection: {
    eyebrow: "Insights",
    heading: "Useful thinking for better hiring decisions.",
    intro:
      "Practical hiring advice and market observations from the work David actually does. No SEO sludge written because somebody said the website needed another blog.",
  },
  specialismsSection: {
    eyebrow: "Specialisms",
    heading: "Marketing people. In all their various forms.",
    cards: specialisms.map((specialism) => ({
      slug: specialism.slug,
      title: specialism.title,
      description: specialism.description,
      linkLabel: `Explore ${specialism.title}`,
      href: `/specialisms/${specialism.slug}`,
    })),
  },
  manifestoSection: {
    eyebrow: "What Essential Resourcing believes",
    heading: "The Essential Resourcing manifesto",
    lines: [
      "The job title isn't the brief.",
      "A good CV doesn't automatically mean a good candidate.",
      "Salary advice should be honest, not flattering.",
      "Feedback is basic respect, not a favour.",
      "Technology should make recruitment better, not less human.",
      "Fewer CVs. Better conversations.",
      "Better hiring decisions.",
    ],
    signature: "- David Walsh",
  },
  citySection: {
    ariaLabel: "Manchester, where Essential Resourcing is based",
    imageSrc: "/assets/images/deansgate-manchester-skyline-essential-resourcing.jpg",
    imageAlt: "Deansgate in Manchester with the Deansgate Square skyline behind it",
    label: "Made in Manchester.",
    emphasis: "Working UK-wide.",
  },
  finalCtaSection: {
    heading: "Before you waste six weeks on the wrong brief, talk to David.",
    body: "One straight conversation. If Essential Resourcing isn't the right answer, you'll be told that too.",
    primaryCta: {
      label: "Sense-check a brief",
      href: "/contact",
      variant: "dark",
    },
    emailCtaLabel: "david@essentialresourcing.co.uk",
  },
  featuredInsightSlugs: [
    "marketing-recruitment-manchester-north-west-guide",
    "retained-search-vs-contingent-recruitment",
    "how-much-does-senior-marketing-recruitment-cost",
  ],
  featuredCaseStudySlugs: [
    "havas-media-manchester-managing-partner-james-reddington",
  ],
};
