import type { Insight } from "./types";
import { salaryTables } from "./salary-guide-2026-tables";

export const salaryGuideSlug =
  "manchester-north-west-marketing-salary-guide-2026";
export const salaryGuidePath = `/insights/${salaryGuideSlug}`;
export const salaryGuideSocialDescription =
  "What should you actually pay good marketing people? Manchester and North West salary ranges, agency benchmarks and Fractional rates, with straight advice from David Walsh.";

export const salaryGuideIntro = [
  "Salary guides are useful. They’re not gospel.",
  "A Marketing Manager in a founder-led business can have a completely different job from a Marketing Manager inside a large corporate. Same title. Different team, budget and commercial responsibility.",
  "Use this guide to find your starting point. Then price the actual job.",
];
export const salaryGuideMarket = [
  "I’ve built this guide around Manchester and the North West first. It covers client-side marketing, brand, digital, performance, eCommerce, CRM, content, social, PR, communications, agency roles and Fractional leadership.",
  "The figures are Essential Resourcing planning ranges: a combination of advertised salaries, published research and recruiter judgement. Where the local evidence is thin, I haven’t quietly dropped a national figure into a Manchester table and called it a fact.",
  "The useful question is whether your budget matches the responsibility you’re asking someone to take on. That matters at every level, but particularly when a modest job title is carrying a rather substantial brief.",
];
export const salaryDefinitions = [
  [
    "Lower",
    "The lower planning point for the role, depending on its scope and level.",
  ],
  [
    "Typical",
    "The middle planning point I’d use to begin a salary conversation.",
  ],
  [
    "Upper",
    "The upper planning point, where broader scope, experience or commercial responsibility may justify it.",
  ],
];
export const salaryGuideBasis = [
  "“Typical” is not a measured statistical median. These columns are not quartiles or percentiles, and the ranges don’t claim to cover every employer or every version of a role.",
  "Permanent figures are annual gross base salaries. Bonus, commission, benefits, equity, LTIP, profit share and dividends sit separately. Employer pension and National Insurance costs are also separate from base salary.",
  "Fractional figures use their own pricing models, shown in the relevant table.",
];
export const salaryCommentary: Record<
  string,
  {
    heading?: string;
    before?: string[];
    after?: string[];
    note?: string;
    pullQuote?: string;
    questions?: string[];
  }
> = {
  "marketing-leadership": {
    before: [
      "Senior marketing leadership is probably where job titles become least useful.",
      "A Head of Marketing in one business might lead three people and report into a Marketing Director.",
      "Somewhere else, they might own the entire marketing function, sit alongside the executive team and carry responsibility that another business would comfortably call Marketing Director.",
      "CMO gets even messier.",
      "In a founder-led scale-up, the CMO might be the first genuinely senior marketing hire. In a large group, they could lead multiple functions, markets and substantial teams, with board-level responsibility and compensation that includes bonus, LTIP or equity.",
    ],
    pullQuote: "Same title. Completely different job.",
    heading:
      "At this level, I’d want to understand the business before I benchmark the salary.",
    questions: [
      "What does the person actually own?",
      "Who do they report to?",
      "Are they on the board or executive team?",
      "What’s the team size?",
      "What’s the marketing budget?",
      "Do they own revenue, pipeline or a P&L?",
      "UK only or international?",
      "Transformation brief or established function?",
      "What’s sitting outside base salary — bonus, LTIP, equity?",
    ],
    after: [
      "Because there’s a world of difference between somebody being the most senior marketer in the business and somebody genuinely operating as a CMO.",
      "The job title really isn’t the brief at this level.",
    ],
  },
  "client-side-marketing": {
    before: [
      "Planning ranges for permanent marketing roles in Manchester and the North West.",
    ],
    heading: "Marketing Manager: the title only tells you so much",
    note: "At the junior end, check contracted hours as well as annual salary. A £25,000 salary does not meet the stated 2026 National Living Wage equivalent for someone aged 21 or over working 40 hours a week. See the junior salary guidance below.",
    after: [
      "A Marketing Manager delivering campaigns within an established team isn’t necessarily doing the same job as someone building the marketing plan, managing agencies, owning the budget and reporting to the board.",
      "Both might have the same title. Their accountability is quite different.",
      "Before settling on the salary, work out whether this person is executing somebody else’s strategy or creating it. Are they managing activity, or are they expected to lead the function and answer for its commercial contribution?",
      "If your Marketing Manager brief carries Head of Marketing responsibility, the salary needs to reflect that. The job title isn’t the brief.",
    ],
  },
  brand: {
    after: [
      "One Brand Manager might own a single UK proposition. Another could be managing several brands, agencies and international markets.",
      "At the senior end, the portfolio matters as much as the title. I’d want to understand the team, budget, reporting line and commercial decisions this person will own. A role with substantial responsibility for brand strategy across a complex business needs a different conversation from a narrower delivery brief.",
    ],
  },
  "digital-performance": {
    note: "The £25,000 PPC Executive planning point needs the same age-and-hours check as other entry-level salaries.",
  },
  ecommerce: {
    after: [
      "eCommerce is another area where the title can hide a completely different job.",
      "Someone running the trading calendar, merchandising products and improving conversion is doing something very different from someone owning the entire eCommerce P&L, international growth, technology roadmap and a sizeable team.",
      "That’s why I’d be particularly careful with Head of eCommerce and eCommerce Director.",
      "In one business, the Head of eCommerce might essentially be the senior website and trading person. In another, they’re responsible for tens of millions in online revenue and effectively running a major commercial channel.",
      "Same title. Very different job.",
      "Look at revenue ownership, team size, markets, platform complexity, trading responsibility, acquisition, CRO and whether they’re actually carrying a P&L.",
      "“eCommerce” on the job description doesn’t tell you enough. Get clear about what they’re being asked to own.",
    ],
  },
  "pr-communications": {
    before: [
      "These are client-side PR, communications and analytics planning ranges. Agency PR roles are covered separately in the agency section below.",
    ],
    after: [
      "Technical platform knowledge can materially change a brief. So can the difference between producing content and setting its direction, or delivering communications activity and advising senior leaders on reputation.",
      "Look at channel breadth, organisational complexity and who owns the decisions. Team leadership and commercial accountability deserve attention even when the title hasn’t changed.",
    ],
  },
  agency: {
    before: [
      "Agency benchmarking needs a bit of care.",
      "Search “Account Executive” and you can find yourself comparing someone in a Manchester creative agency with an enterprise software salesperson. The title matches. The jobs don’t.",
      "These ranges are for marketing, creative, digital, performance and PR/communications agencies in Manchester and the North West.",
    ],
    note: "For entry-level roles, check hours alongside the annual figure. The £25,000 and £26,000 Lower planning points are below the stated 40-hour National Living Wage equivalent for workers aged 21 or over.",
    heading: "What changes a senior agency salary?",
    after: [
      "An Account Director looking after a contained client portfolio may have a different job from one leading a substantial team, growing accounts and carrying responsibility for margin.",
      "The differences become greater at Client Services Director, Managing Partner and Managing Director level. New-business expectations, agency size, ownership structure and responsibility for running the business all matter.",
      "The Managing Partner and Managing Director planning points assume substantial agencies, group responsibilities or genuine commercial leadership. A smaller independent agency may sit below those ranges.",
      "Then there’s the package. Bonus, profit share and equity can change the conversation considerably, but they shouldn’t be quietly bundled into a base-salary comparison.",
      "Get underneath the title before deciding what the job should pay.",
    ],
  },
  fractional: {
    before: [
      "Fractional, interim, consultancy and advisory are often bundled together. They can solve quite different problems.",
      "A Fractional leader might be embedded in the business for part of the week with ongoing operational responsibility. An interim leader may cover a vacancy or lead a period of change on a more intensive basis.",
      "A consultant might deliver a defined project. An advisor may provide strategic input without taking responsibility for running the function.",
      "Start with the work and the commitment required. Then choose the engagement model.",
    ],
    after: [
      "These are Essential Resourcing planning/reference rates. They aren’t an official Manchester Fractional market median or a rate card covering every UK engagement.",
      "Candidate day rates and monthly retainers describe different arrangements. The Fractional CMO advisory-only figures are per month; the scope of advice and time commitment should be agreed separately.",
      "A candidate day rate is not necessarily the full client charge. Any fees, tax treatment and engagement terms need explaining separately.",
      "I wouldn’t turn these figures into salary equivalents by multiplying a day rate by an assumed number of days. Work out what the business needs this person to do and how much of their time it requires.",
    ],
  },
};

export const salaryEditorial = {
  comparison: {
    heading: "Does client-side marketing pay more than agency?",
    content: [
      "Sometimes. But not consistently enough for me to stick a percentage on it and pretend that’s science.",
      "Agency discipline, client portfolio, business size and commercial ownership all affect the comparison. So do team responsibility and the way bonus and benefits are structured.",
      "An agency Account Director and a client-side Marketing Manager aren’t automatically comparable because both look “mid-senior”.",
      "Compare what they own, the decisions they make and the consequences of getting those decisions wrong. Then compare the packages.",
    ],
  },
  junior: {
    heading: "Why the bottom of the salary ladder needs another look",
    content: [
      "From 1 April 2026, the National Living Wage for workers aged 21 and over is £12.71 an hour. Using 52 weeks, that works out at approximately £24,785 for a 37.5-hour week or £26,437 for a 40-hour week.",
      "Those figures are a useful sense-check, not a substitute for checking the applicable hourly rate and working arrangements.",
      "It explains why historic £21k–£24k full-time marketing salaries can’t simply be carried forward unchanged. The hours and the person’s age matter.",
      "As the statutory floor rises, the space between some Assistant and Executive salaries gets tighter too. If you’re building a junior team, review the progression as well as the starting salary. More responsibility needs a sensible place to go.",
      "The junior planning ranges in this guide have been reviewed with that context in mind. Their Lower figures are not suitable for every contracted-hours arrangement.",
    ],
  },
  employers: {
    heading: "If you’re hiring",
    content: [
      "Sense-check the budget before the role goes to market. Then look at the brief.",
      "What needs to be different in 12 months? What will this person own? What team and budget will they control? Are they creating the strategy or delivering it?",
      "Those questions help establish whether you need a Manager, Head of, Director or CMO. They also expose the brief that has quietly become two jobs while keeping the salary for one.",
      "If the scope and budget don’t stack up, it’s better to find out before six weeks of interviewing people who were never going to be right.",
    ],
  },
  candidates: {
    heading: "If you’re a candidate",
    content: [
      "Please don’t find your job title, look at the number in the right-hand column and immediately march into your boss’s office demanding a pay rise.",
      "Use the range to prepare a better conversation.",
      "Experience matters, but so does what you’ve done with it. Think about your impact, the decisions you own, the team you lead and the commercial responsibility you carry.",
      "Be clear about what has changed since your salary was last reviewed. A stronger case comes from explaining the job you’re now doing and what you’ve delivered.",
    ],
  },
  methodology: {
    heading: "Where did the numbers come from?",
    content: [
      "This isn’t one salary website copied into a table.",
      "The research behind Essential Resourcing’s guide looked across 176 role and discipline entries, 255 selected salary observations and 63 screened vacancies. After cleaning duplicates and unusable records, 51 distinct offers were usable, with 42 of those offers dated between 17 June and 15 September 2026.",
      "Those are research totals across the guide, not a claim that every role has the same amount of evidence behind it.",
      "Manchester and North West evidence came first. Broader published salary information and specialist recruitment research provided context where useful. National figures weren’t silently converted into Manchester salaries.",
      "Advertised salaries tell us what employers offered in their adverts. They don’t necessarily tell us what a successful candidate eventually accepted.",
      "Some roles produce a useful body of local evidence. Others, particularly senior agency, brand and Fractional leadership roles, don’t produce a neat local dataset. The planning ranges reflect that difference.",
      "Permanent figures are annual gross base salaries. Bonus, commission, benefits, equity, LTIP, profit share and dividends sit separately, as do employer pension and National Insurance costs. Fractional rates retain the pricing models shown in their table.",
      "The junior ranges also take account of the 2026 National Living Wage context. An annual salary still needs checking against age, contracted hours and the applicable hourly rate.",
      "And finally, a bit of recruiter nous and noggin. Where the public numbers are thin or messy, I’ve applied nearly 15 years’ experience recruiting in the market and the figures I’d genuinely use when advising a client on a live brief. That’s judgement, and I’d rather be open about it than dress it up as a statistical finding.",
      "Salary information changes. For an active hire, sense-check the budget when you’re ready to go to market.",
      "Last reviewed: September 2026.",
    ],
  },
};

export const salaryGuideFaqs = [
  {
    question: "What is the average Marketing Manager salary in Manchester?",
    answer:
      "Essential Resourcing’s 2026 Manchester and North West planning range for a Marketing Manager is £40,000–£65,000, with £50,000 as the Typical planning point. That is a starting point for a salary conversation, not a measured statistical average or median. Team, budget and commercial responsibility affect where a role sits.",
  },
  {
    question: "What should a Head of Marketing earn in Manchester?",
    answer:
      "Essential Resourcing’s 2026 planning range is £60,000–£100,000 in annual gross base salary, with £75,000 as the Typical planning point. The scope needs particular attention: leading a small team within a wider function is different from owning the whole marketing operation.",
  },
  {
    question:
      "What does a Marketing Director earn in Manchester and the North West?",
    answer:
      "The guide’s annual base-salary planning range is £75,000–£125,000, with £95,000 as the Typical planning point. Commercial remit, team size and board responsibility affect the brief. Bonus, equity and other package elements are separate from these base-salary figures.",
  },
  {
    question: "What does a CMO earn in Manchester?",
    answer:
      "Essential Resourcing’s 2026 Manchester and North West planning range for a Chief Marketing Officer is £110,000–£180,000 base salary, with £140,000 as the Typical planning point. At CMO level, business size, international remit, board responsibility, revenue ownership, bonus, LTIP and equity can materially change the overall package.",
  },
  {
    question: "What does an Account Director earn at a Manchester agency?",
    answer:
      "The agency Account Director planning range is £45,000–£65,000 in annual base salary, with £55,000 as the Typical planning point. These figures relate to marketing, creative, digital, performance and PR/communications agencies. Client portfolio, team remit and commercial responsibility affect the salary.",
  },
  {
    question:
      "What does a Senior Account Director earn at a Manchester agency?",
    answer:
      "Essential Resourcing’s 2026 Manchester and North West agency planning range is £55,000–£80,000 in annual base salary, with £65,000 as the Typical planning point. The size and complexity of the portfolio, leadership responsibilities and expectations for account growth all need considering.",
  },
  {
    question: "How much does a Head of Performance earn in Manchester?",
    answer:
      "For client-side roles, the planning range is £70,000–£100,000, with £80,000 as the Typical point. For agency roles, it is £65,000–£100,000, also with an £80,000 Typical point. These are annual base-salary planning figures, not measured medians. Media spend, channel breadth, team and commercial ownership matter.",
  },
  {
    question: "Do client-side marketing roles pay more than agency roles?",
    answer:
      "Sometimes, but this guide does not establish a universal percentage premium. Employer size, agency discipline, role scope, leadership responsibilities and the wider package can change the comparison. Moving client-side does not automatically mean a higher salary.",
  },
  {
    question: "Are Manchester marketing salaries lower than London?",
    answer:
      "London salaries may be higher for some roles and employers, but this guide does not establish a reliable Manchester–London percentage difference. Benchmark the actual role, employer, responsibilities and local market rather than applying a blanket London discount.",
  },
  {
    question: "What does a Fractional CMO cost?",
    answer:
      "Essential Resourcing’s candidate day-rate planning range is £750–£1,200, with £950 as the Typical point. Monthly retainers are £5,000–£8,000, with £6,500 Typical. Advisory-only support is £3,000–£5,000 per month, with £4,000 Typical; the scope of advice and time commitment should be agreed separately. These models are not interchangeable.",
  },
  {
    question: "How much does a Fractional Marketing Director cost?",
    answer:
      "The candidate day-rate planning range is £750–£900, with £825 as the Typical point. The monthly-retainer range is £3,000–£5,000, with £4,000 Typical. These are separate engagement models: the retainer should not be treated as an assumed multiple of the day rate.",
  },
  {
    question: "Why are entry-level marketing salaries increasing?",
    answer:
      "Rising statutory wage floors put upward pressure on the bottom of traditional salary ladders and can narrow the gap between Assistant and Executive roles. From April 2026, the National Living Wage for workers aged 21 and over is £12.71 an hour. Employers need to check contracted hours as well as annual salary.",
  },
  {
    question: "How often should salary benchmarks be reviewed?",
    answer:
      "For active recruitment, sense-check the salary when the role goes to market. Revisit it if the responsibilities, hiring conditions or candidate feedback change. An annual guide is useful context, but it should not become a fixed answer long after the brief or market has moved on.",
  },
  {
    question: "Why do salaries vary so much for the same job title?",
    answer:
      "The title does not capture the whole job. Team size, budget, reporting line, commercial responsibility, business stage and international remit can all change the scope. Bonus and equity also affect the wider package. Compare responsibilities before deciding that two matching titles should command the same salary.",
  },
];

export const salaryGuideInsight: Insight = {
  title: "Manchester & North West Marketing Salary Guide 2026",
  slug: salaryGuideSlug,
  status: "published",
  noIndex: false,
  category: "Salary insight",
  cardCategory: "Salary insight",
  excerpt:
    "Marketing, digital, PR and agency salary planning ranges for Manchester and the North West, with Fractional leadership rates and straight advice from David Walsh.",
  publishedDate: "2026-09-24",
  updatedDate: "2026-09-24",
  readingTime: "15 min read",
  author: "David Walsh",
  body: [
    {
      heading:
        "What should you actually be paying good marketing people in 2026?",
      content: salaryGuideIntro,
    },
    {
      heading: "A quick read on the Manchester marketing market",
      content: salaryGuideMarket,
    },
    {
      heading: "How to read the salary tables",
      content: [
        ...salaryDefinitions.map(([label, text]) => `${label}: ${text}`),
        ...salaryGuideBasis,
      ],
    },
    ...salaryTables.map((table) => ({
      heading: table.title,
      content: [
        ...(salaryCommentary[table.id]?.before || []),
        ...table.rows.map((row) =>
          row.map((value, i) => `${table.headers[i]}: ${value}`).join("; "),
        ),
        ...(salaryCommentary[table.id]?.note
          ? [salaryCommentary[table.id].note!]
          : []),
        ...(salaryCommentary[table.id]?.after || []),
      ],
    })),
    ...Object.values(salaryEditorial),
  ],
  faqs: salaryGuideFaqs,
  relatedServiceSlugs: [
    "market-intelligence-advisory",
    "permanent-recruitment",
    "retained-search",
    "fractional",
  ],
  relatedInsightSlugs: [],
  seoTitle:
    "Manchester & North West Marketing Salary Guide 2026 | Essential Resourcing",
  metaDescription:
    "Explore 2026 marketing, digital, PR and agency salary ranges for Manchester and the North West, with practical hiring advice and Fractional leadership rates.",
};
