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
  "I’ve built this guide around Manchester and the North West first. It covers client-side marketing, brand, digital, performance, eCommerce, CRM, content, social, PR, communications, agency roles, strategy and planning, media-agency client leadership, data, insight and Fractional leadership.",
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
    sections?: { heading: string; content: string[] }[];
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
  "product-marketing": {
    before: [
      "A Product Marketing Manager isn’t just a Marketing Manager who happens to market a product.",
      "Proper Product Marketing usually sits between Product, Marketing, Sales and the customer. Positioning, messaging, launches, competitor intelligence and sales enablement: helping the business explain why anybody should actually buy the thing.",
      "It isn’t Product Management either. Product Marketing primarily shapes how a product goes to market, who it is for and why they should care. Product Management usually owns more of what gets built and how it develops. Businesses draw that boundary differently, so check where the responsibility actually sits.",
    ],
    heading: "What moves a Product Marketing salary?",
    after: [
      "Technical or SaaS complexity, international launches, pricing and proposition ownership can change the brief considerably. So can the expectation to equip a sales team, understand competitors and influence senior commercial decisions.",
      "These are marketing planning ranges. They are not benchmarks for Product Management, Product Design or Engineering.",
    ],
  },
  "growth-demand-generation": {
    before: [
      "Growth is another title that’s become a bit of a free-for-all. In one business it’s Performance Marketing with a broader funnel. Somewhere else it spans acquisition, conversion, CRM, retention, experimentation and work with the product team.",
      "Demand Generation often appears in B2B, SaaS and complex sales environments. The brief may bring together campaigns, content, account-based marketing, automation and lead management, with a strong focus on pipeline and the relationship between Marketing and Sales.",
      "They’re related. They’re not automatically the same job.",
    ],
    heading:
      "Before benchmarking either, find out what they’re actually expected to grow.",
    after: [
      "Do they own acquisition, qualified pipeline, retention or a wider marketing growth plan? What can they influence, and what sits with Sales or Product? Those boundaries matter more than an impressive target without the means to deliver it.",
      "This table covers marketing roles. Agency new business is covered in the Agency section; sales leadership, product-led engineering and generic commercial growth need separate comparisons.",
    ],
  },
  "digital-performance": {
    note: "The £25,000 PPC Executive and £26,000 Affiliate Executive Lower planning points need the same age-and-hours check as other entry-level salaries.",
    sections: [
      {
        heading: "Paid Social is not Organic Social.",
        content: [
          "Paid Social centres on paid advertising: campaign builds, testing, optimisation and budget pacing. At senior level, the brief can include channel strategy, creative testing, measurement, substantial budgets, client leadership and a team.",
          "Agency and client-side titles differ. Look at the channels, decisions and commercial responsibility rather than treating every Paid Social Director as the same grade. Organic and content-led social sit in Content & Social below.",
        ],
      },
      {
        heading: "Programmatic has its own specialist brief.",
        content: [
          "Programmatic roles focus on buying and managing advertising through specialist platforms. Junior work may centre on trading, campaign delivery and optimisation; senior responsibility can extend to audience strategy, data, measurement, platform choices, clients and people.",
          "That is not automatically integrated media planning or media account leadership. Nor does a broad Paid Media title tell you how much programmatic expertise the job needs.",
        ],
      },
      {
        heading: "What does ‘Biddable’ actually mean?",
        content: [
          "Depends who you ask. In one agency it means Paid Search and Paid Social. Somewhere else it includes Programmatic, or covers most of the paid activation team.",
          "I wouldn’t benchmark a Biddable Manager or Director from that word alone. Establish the channels, hands-on work, budgets, clients, team and commercial responsibility. Then use the closest specialist comparison.",
          "The job title isn’t the brief. Particularly with this one.",
        ],
      },
      {
        heading: "CRO: improving conversion, not building the software.",
        content: [
          "These CRO roles cover conversion analysis, hypotheses, A/B testing and improving customer journeys. They are marketing-side comparisons, not salary benchmarks for developers or experimentation engineers.",
        ],
      },
      {
        heading: "Affiliate is a specific commercial channel.",
        content: [
          "Publisher and network relationships, negotiation, measurement and budget ownership shape an affiliate brief. International programmes can add complexity too. Don’t use these figures as a catch-all for partnerships, business development or sales.",
        ],
      },
    ],
  },
  "content-social": {
    before: [
      "These are planning ranges for content and organic social across relevant agency and client-side roles. They are not a claim that the same title commands the same salary in both environments. Paid Social sits in Digital & Performance.",
    ],
    sections: [
      {
        heading: "Head of Social needs a look underneath the bonnet.",
        content: [
          "In one business it means the most senior hands-on social person in a small team. Elsewhere they lead organic social, content, community, influencer activity and reputation across several markets, with a sizeable team underneath them.",
          "Agency and client-side structures can look very different. Check the scope before treating the Head of Social planning point as the answer for every version of the job.",
        ],
      },
      {
        heading: "Influencer: look at the commercial responsibility.",
        content: [
          "Influencer can sit between Social, PR, creator partnerships, Content and Performance. Managing creator relationships, contracts, negotiations and campaign measurement is a different brief from product seeding alone.",
          "Some roles carry revenue or performance targets; others focus on awareness and reputation. Establish what the person owns rather than assuming every influencer role is performance marketing.",
        ],
      },
    ],
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
      "These salary planning ranges cover client-side PR and communications. Agency PR roles are covered separately in the agency section below. Marketing and digital analysts have their own section alongside media analytics.",
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
    sections: [
      {
        heading:
          "Agency new business: base salary only tells you half the story.",
        content: [
          "Agency New Business and Growth roles are about winning business for the agency. They are not the Growth Marketing roles benchmarked earlier in the guide.",
          "The table shows base salary only. Bonus, commission, profit share, equity and new-business incentives are separate. A lower base with a genuinely achievable incentive scheme may be a better package than a higher base with little upside. Check the terms, not just the headline opportunity.",
          "What is the target and average account value? Are they generating leads, leading pitches or personally closing business? What support and inherited pipeline are there? Those answers, and how incentives are earned, make the package meaningful.",
        ],
      },
    ],
    after: [
      "An Account Director looking after a contained client portfolio may have a different job from one leading a substantial team, growing accounts and carrying responsibility for margin.",
      "The differences become greater at Client Services Director, Managing Partner and Managing Director level. New-business expectations, agency size, ownership structure and responsibility for running the business all matter.",
      "The Managing Partner and Managing Director planning points assume substantial agencies, group responsibilities or genuine commercial leadership. A smaller independent agency may sit below those ranges.",
      "Then there’s the package. Bonus, profit share and equity can change the conversation considerably, but they shouldn’t be quietly bundled into a base-salary comparison.",
      "Get underneath the title before deciding what the job should pay.",
    ],
  },
  "strategy-planning": {
    before: [
      "Good planning gets underneath the brief. Who are we trying to reach? What do they believe? What needs to change? And what should the brand actually do about it?",
      "This table covers brand and creative planning in brand consultancies, creative and integrated agencies. Think research, audience insight, positioning, propositions and creative briefs. It does not cover corporate strategy, management consulting or business planning. Dedicated media-agency strategy and communications planning are benchmarked separately below.",
      "These are indicative Manchester and North West hiring estimates, added on 7 October 2026. Local salary evidence is limited, especially for heads of department. The figures combine relevant local adverts with broader regional and UK specialist guides; they are not measured local averages. Treat them as a starting budget to sense-check against the actual remit.",
    ],
    heading: "Price the strategic responsibility, not just the title.",
    after: [
      "A Brand Planner and a Brand Strategist may be doing much the same job. Senior Planner and Senior Strategist can overlap too. The paired titles above are useful comparisons, not a claim that every agency structures its team the same way.",
      "Creative Strategist needs a second question. Do you mean brand positioning and creative briefs, or testing hooks, formats and offers for paid-social ads? Both are useful jobs. They are not automatically the same hire. Channel-specific performance creative needs its own comparison, not a brand-planning salary with a different label.",
      "At planner level, look at research, audience insight, positioning, creative briefing and the ability to turn evidence into a clear recommendation. At senior level, ask whether they independently lead the thinking, challenge senior clients and connect brand, creative and media decisions.",
      "Planning Director or Strategy Director can mean leading one major account, several client relationships or the whole discipline. The Head of Planning / Head of Strategy range assumes responsibility for a function, its people and the quality of its work. In a smaller agency, the Director and Head roles may be the same job. Don’t add a title premium twice.",
      "Planning and strategy titles can overlap in a creative agency. That does not make a creative-agency Planning Director interchangeable with a media-agency Communications Planning Director. Match the work, not just the word on the business card.",
      "And client-side? Dedicated brand strategy and planning roles do exist, but a title can also hide a broader brand-management, insight or commercial-strategy remit. There isn’t enough comparable local salary evidence in this review to publish a separate client-side ladder or assume a pay premium. Use the agency figures only as context, then benchmark the business, scope and decision-making responsibility separately.",
      "The evidence is thinner at the top. National or international leadership, a major new-business remit, bonus and equity can take the package beyond these base-salary planning points. Chief Strategy Officer and group-wide roles need an individual benchmark.",
    ],
  },
  "media-strategy-planning": {
    before: [
      "Strategy and planning work closely together. That doesn’t make them the same job. A media agency may have a dedicated strategy team, specialist communications planners, client leaders and activation teams, with quite different responsibilities.",
      "Strategy owns the diagnosis and direction: the audience, the growth opportunity, the problem communications need to solve and the choices behind the approach. Communications planning turns that direction into a connected plan: channel roles, sequencing, investment choices and how the work fits together. Both require judgement. Neither is simply another name for buying media.",
      "The two role families below are separate comparisons, not one promotion ladder. These are modelled Manchester and North West base-salary planning points reviewed on 7 October 2026, informed by wider UK and London guides and limited local evidence. Junior strategy and heads of function have particularly limited direct local evidence; the figures are not measured Manchester averages.",
    ],
    heading: "Look at the team, the brief and the decisions they own.",
    after: [
      "Someone may have come through media planning and moved into a dedicated strategy team. Someone else may have built their career in research, brand or creative strategy. Their previous title does not decide the benchmark for the job they do now.",
      "At director level, separate ownership of an account’s strategy from leadership of the agency’s whole discipline. Head of Strategy and Head of Communications Planning assume responsibility for standards, people and capability across a function. An account-level Director is not automatically a Head of department.",
      "Some agencies combine the roles. Others split them. Planning Director can also mean integrated client planning rather than a specialist communications-planning appointment. Check the reporting line, client scope and actual output before selecting a range. Global, group-wide and Chief Strategy Officer appointments need a separate benchmark.",
    ],
  },
  "media-agency": {
    note: "The £26,000 Media Account Executive Lower planning point needs the same age-and-hours check as other entry-level salaries.",
    before: [
      "Media agencies have their own account and client-leadership structure. These roles bring together the client brief, media planning, specialist buying and activation teams, budgets, delivery and the commercial relationship. They are not media-owner sales jobs, and they are not all dedicated strategy roles.",
      "The table is for integrated media-agency account leadership and planning/buying coordination. A hands-on AV buyer, PPC specialist, Paid Social lead or programmatic trader needs a channel-specific comparison. A job called Media Manager might mean any of these, so establish the remit first.",
      "These are estimated Manchester and North West hiring budgets reviewed on 7 October 2026, not a local salary survey. UK and London specialist guides provide much of the evidence, with limited regional adverts for context. Senior Account Manager and Associate Director are scope-based estimates between better-documented levels. Partner-level local evidence is especially thin.",
    ],
    heading: "An Associate Director is not the same grade in every agency.",
    after: [
      "Executive and planner/buyer roles support research, plans, bookings, reporting and delivery. Managers take day-to-day ownership of accounts or planning workstreams. Senior Managers usually carry more complex work or team responsibility; not every agency uses that grade.",
      "Account Directors typically own senior client relationships, the quality of integrated plans and team delivery. Associate Director can overlap with Account Director, sit above it, or describe a specialist activation lead. The ranges deliberately overlap. Don’t price the word ‘Associate’ as an automatic promotion.",
      "Business Directors usually carry a broader client portfolio, team and commercial remit. Client Partners own significant senior relationships and account growth. Managing Partners may lead a major client group, office or business unit, with substantial revenue, profitability and people responsibility. These are possible structures, not a universal sequence every candidate must climb.",
      "The Managing Partner figures assume a salaried leadership appointment. They are not an owner’s drawings, dividends or the value of equity. Bonus and profit share sit outside these base salaries; national or international mandates can sit above the upper planning point. A Managing Director with whole-agency responsibility needs the agency leadership comparison, not an automatic title uplift.",
      "Network or independent? Neither gets an automatic salary premium. Compare the actual accounts, team, commercial responsibility and full package. A client-side Media Manager who owns budgets and manages an agency roster also needs a different comparison from someone delivering plans inside the agency.",
    ],
  },
  "data-analytics": {
    before: [
      "Useful analysis changes a decision. This section covers marketing, digital and media analysts working with campaign, audience, customer and website data, rather than every job with ‘data’ in the title.",
      "Use the junior row for an early-career reporting and measurement brief, and the Marketing / Digital Analyst row for an established analyst with greater independent responsibility. The additional levels are modelled Manchester and North West hiring estimates reviewed on 7 October 2026, using relevant regional adverts and broader specialist guides. Evidence is more limited for agency-specific director appointments; these are not measured local averages.",
    ],
    heading: "Reporting, measurement and leadership are different briefs.",
    after: [
      "Junior analysts support reporting and data checks. Experienced analysts explain what the numbers mean and recommend action. Senior analysts handle more complex questions and influence stakeholders; that does not automatically make them people managers.",
      "A long software list is not a salary benchmark. Using SQL or BigQuery does not automatically make a role a senior technical appointment. Ask what they need to solve, how independently they work and which decisions their analysis changes. More dashboards is not always more insight.",
      "Managers own delivery, prioritisation and often a team. Heads and Directors carry wider measurement, capability and commercial responsibility. Those titles can overlap between agencies and client-side businesses. The director range assumes a materially broader function, not just a renamed Head of role.",
      "SQL, experimentation, attribution, econometrics and marketing-mix modelling can change the brief substantially. Specialist modelling needs its own benchmark, as do data engineering, data science, enterprise BI and Chief Data Officer roles. They are not quietly included in these marketing-analytics figures.",
    ],
  },
  "research-insight": {
    before: [
      "Consumer and audience insight asks what people think, feel and do, and why. That may involve qualitative research, surveys, segmentation, brand tracking or combining research with behavioural evidence. It can overlap with analytics, but the briefs and specialist skills are not interchangeable.",
      "These are modelled Manchester and North West planning points reviewed on 7 October 2026. Wider UK research-sector guidance and a limited number of relevant regional adverts inform them. Direct local evidence is particularly limited at Associate Director, Director and Head level. They are starting budgets, not statistical averages.",
    ],
    heading: "Research-agency grades and in-house roles don’t line up neatly.",
    after: [
      "Executives support research design, fieldwork, analysis and reporting. Senior Executives run more of the project independently. Managers own projects or research programmes, suppliers and stakeholder recommendations; a client-side Insight Manager may commission agencies rather than manage researchers directly.",
      "Associate Director and Research Director here describe research or insight agency roles with increasing client, methodological, team and commercial ownership. Head of Consumer / Audience Insight describes leadership of a function. It is an alternative comparison, not necessarily the next rung above an agency Director.",
      "The method, sector and decision-making remit matter. Qualitative, quantitative and mixed-method briefs are not interchangeable. Specialist healthcare research, enterprise data leadership and research-agency owner or Managing Partner packages need individual benchmarking; this review does not establish a reliable local range for those appointments.",
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
      "Those totals describe the original September research, not a claim that every role has the same amount of evidence behind it. Strategy, planning, media-agency leadership, analytics and insight were expanded following a separate public-source review on 7 October 2026. That review is not included in those original counts.",
      "A final specialist coverage-gap review on 7 October added approved planning points for Product Marketing, Growth and Demand Generation, paid activation, CRO, Affiliate, senior Social, Influencer and agency new business. These additions are separate from both the original September counts and the earlier October expansion. They are recruiter-approved planning estimates, not a newly measured regional dataset.",
      "The October additions are evidence-informed estimates, not a new Manchester salary survey. Where comparable local offers are scarce, broader specialist guides help frame a budget, with role scope and geography stated explicitly. No fixed London-to-Manchester percentage discount has been applied. Intermediate grades and senior leadership points carry greater uncertainty and should be sense-checked against a live brief.",
      "The follow-up review checked the underlying job briefs, not just their titles. Social-media account roles were not treated as integrated media-agency leadership; performance-creative roles were not treated as brand planning; data-security and engineering jobs were excluded from marketing analytics. National remote roles were not counted as Manchester office-based offers. Unverifiable sample counts and automated salary estimates were not adopted.",
      "Manchester and North West evidence came first. Broader published salary information and specialist recruitment research provided context where useful. National figures weren’t silently converted into Manchester salaries.",
      "Advertised salaries tell us what employers offered in their adverts. They don’t necessarily tell us what a successful candidate eventually accepted.",
      "Some roles produce a useful body of local evidence. Others, particularly senior agency, brand and Fractional leadership roles, don’t produce a neat local dataset. The planning ranges reflect that difference.",
      "Permanent figures are annual gross base salaries. Bonus, commission, benefits, equity, LTIP, profit share and dividends sit separately, as do employer pension and National Insurance costs. Fractional rates retain the pricing models shown in their table.",
      "The junior ranges also take account of the 2026 National Living Wage context. An annual salary still needs checking against age, contracted hours and the applicable hourly rate.",
      "And finally, a bit of recruiter nous and noggin. Where the public numbers are thin or messy, I’ve applied more than a decade’s experience recruiting in the market and the figures I’d genuinely use when advising a client on a live brief. That’s judgement, and I’d rather be open about it than dress it up as a statistical finding.",
      "Salary information changes. For an active hire, sense-check the budget when you’re ready to go to market.",
      "Core salary research: September 2026. Strategy, media, analytics and insight additions reviewed: 7 October 2026. Final specialist coverage additions: 7 October 2026. Existing salary ranges have not been rebenchmarked as part of these additions.",
    ],
  },
};

export const salaryGuideFaqs = [
  {
    question: "What does a Paid Social Manager earn in Manchester?",
    answer:
      "The guide’s annual base-salary planning range is £35,000–£50,000, with £42,500 as the Typical point. This covers paid advertising, not organic social. Check campaign ownership, budgets, measurement, clients and team responsibility before choosing a point within the range.",
  },
  {
    question: "What does a Programmatic Manager earn in Manchester?",
    answer:
      "The planning range is £35,000–£50,000 in annual base salary, with £42,500 Typical. Platform execution, trading, data and measurement may sit alongside client or people responsibility. These are planning estimates, not a measured local average or an integrated media-planning benchmark.",
  },
  {
    question: "What should a Product Marketing Manager earn in the North West?",
    answer:
      "The planning range is £45,000–£70,000 in annual base salary, with £55,000 Typical. Technical complexity, positioning, launches, international markets and sales enablement can change the scope. Product Management and Product Design are different comparisons.",
  },
  {
    question: "Is Growth Marketing the same as Demand Generation?",
    answer:
      "Not automatically. Growth can span acquisition, conversion, retention and experimentation. Demand Generation often focuses on pipeline and sales alignment in B2B or complex sales environments. The roles can overlap. Establish what they own before picking a benchmark; neither is automatically an agency new-business job.",
  },
  {
    question: "What should a Head of Social earn?",
    answer:
      "The guide’s annual base-salary planning range is £55,000–£90,000, with £70,000 Typical. A hands-on lead in a small team is a different brief from someone running social, community, content and influencer activity across several markets. Agency and client-side structures also affect the comparison.",
  },
  {
    question: "Do agency new-business salary ranges include commission?",
    answer:
      "No. They show annual base salary only. Bonus, commission, profit share, equity and other incentives need a separate conversation. Check targets, pipeline, pitch support, closing responsibility and how achievable the incentive scheme actually is before comparing packages.",
  },
  {
    question: "Does this guide cover Manchester or the whole North West?",
    answer:
      "Both. Manchester is the starting point, but the guide is intended to help with hiring across North West England. These are regional planning ranges, not separate measured averages for every city or town. The role, employer, working pattern and where you need to find candidates still matter. A Manchester postcode alone doesn’t price the job.",
  },
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
      "The general agency Account Director planning range is £45,000–£65,000 in annual base salary, with £55,000 as the Typical planning point. The agency table also separates PR Account Director roles, while integrated media-agency roles have their own table. Client portfolio, team remit and commercial responsibility affect which comparison fits. The word ‘Director’ doesn’t settle it.",
  },
  {
    question:
      "What should a Media Account Director earn in Manchester and the North West?",
    answer:
      "For integrated media-agency client leadership, the guide’s estimated annual base-salary range is £45,000–£60,000, with £50,000 as the Typical planning point. This is a starting budget, not a measured Manchester average. It is not a benchmark for media-owner sales or every specialist activation role. Account Director and Associate Director can overlap between agencies, so check the accounts, team and commercial responsibility before choosing the range.",
  },
  {
    question:
      "What does a Senior Account Director earn at a Manchester agency?",
    answer:
      "The general agency Senior Account Director planning range is £55,000–£80,000 in annual base salary, with £65,000 as the Typical planning point. Senior PR Account Director has a separate row, and media-agency titles need the media comparison. The portfolio, leadership responsibilities and expectations for account growth all need considering.",
  },
  {
    question:
      "Are strategy, planning and media account leadership the same salary comparison?",
    answer:
      "No. Planner and Strategist can overlap in a creative agency, but dedicated media strategy, communications planning and integrated client leadership can be different jobs. Use the section that matches the decisions, output and team the person owns. Don’t benchmark someone purely because ‘planning’ appears in their title. The newer ranges are estimates, with thinner local evidence at senior levels.",
  },
  {
    question:
      "Should marketing analytics and consumer insight use the same salary range?",
    answer:
      "Not automatically. Marketing and media analytics usually centres on measurement, performance and behavioural data. Consumer and audience insight may involve research design, interviews, surveys and brand tracking. Some roles combine both, which is why the brief matters more than the label. The guide separates the two comparisons rather than pretending one salary ladder fits every data and insight job.",
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
      "Essential Resourcing’s candidate day-rate planning range is £750–£1,200, with £950 as the Typical point. Monthly retainers are £5,000–£8,000, with £6,500 Typical. Advisory-only support is £3,000–£5,000 per month, with £4,000 Typical. Agree the scope and time commitment separately. These are different engagement models, not an all-in client quote; any fees and tax treatment need confirming.",
  },
  {
    question: "How much does a Fractional Marketing Director cost?",
    answer:
      "The candidate day-rate planning range is £750–£900, with £825 as the Typical point. The monthly-retainer range is £3,000–£5,000, with £4,000 Typical. These are separate engagement models: the retainer should not be treated as an assumed multiple of the day rate. Agree the scope, time commitment, fees and tax treatment before treating either figure as the full client cost.",
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
  updatedDate: "2026-10-07",
  readingTime: "15 min read",
  author: "David Walsh",
  body: [
    {
      heading:
        "What should you actually be paying good marketing people in 2026?",
      content: salaryGuideIntro,
    },
    {
      heading: "A quick read on the Manchester & North West marketing market",
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
        ...(salaryCommentary[table.id]?.sections || []).flatMap((section) => [
          section.heading,
          ...section.content,
        ]),
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
