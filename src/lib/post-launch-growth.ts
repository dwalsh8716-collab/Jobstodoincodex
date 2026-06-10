export type CornerstoneContentItem = {
  workingTitle: string;
  audience: string;
  searchIntent: string;
  geoQuestion: string;
  h1: string;
  h2s: string[];
  internalLinks: string[];
  cta: string;
  relatedService: string;
  linkedInAngle: string;
  digitalPrAngle: string;
  proofNeeded: string;
};

export type SalaryMarketAsset = {
  title: string;
  dataNeeded: string[];
  collectionMethod: string;
  cmsFields: string[];
  pageStructure: string[];
  seoGeoValue: string;
  digitalPrHook: string;
  linkedInAngle: string;
  updateFrequency: string;
  caveat: string;
  internalLinks: string[];
  cta: string;
};

export type DigitalPrCampaign = {
  title: string;
  coreStory: string;
  whyAnyoneWouldCare: string;
  audience: string;
  dataNeeded: string[];
  possibleHeadline: string;
  journalistAngle: string;
  tradeAngle: string;
  linkedInAngle: string;
  siteAsset: string;
  outreachTargets: string[];
  risks: string[];
  antiGimmickRule: string;
};

export type FounderAuthorityPillar = {
  pillar: string;
  linkedInPostIdeas: string[];
  articleIdeas: string[];
  prCommentIdeas: string[];
  serviceLinks: string[];
  cta: string;
};

export type CalendarWeek = {
  week: number;
  mainPiece: string;
  linkedInPosts: string[];
  digitalPrAngle: string;
  internalLinkUpdates: string[];
  cta: string;
  dataOrProofNeeded: string;
};

export const strategicPrinciple = [
  "Getting the website right means Google can understand Essential Resourcing.",
  "Building authority means the market has a reason to talk about David, cite him and trust the work.",
  "That is the bit that compounds.",
];

export const cornerstoneContentPlan: CornerstoneContentItem[] = [
  {
    workingTitle: "The job title is not the brief",
    audience: "Founders, MDs and marketing leaders hiring senior people",
    searchIntent: "Understand why a job title is not enough to brief a senior marketing hire",
    geoQuestion: "How do you define the real brief behind a marketing hire?",
    h1: "The job title is not the brief",
    h2s: [
      "The problem usually sits behind the title",
      "What a proper brief needs to include",
      "Why weak briefs waste six weeks",
      "How Essential sharpens the brief before search",
    ],
    internalLinks: ["/services/leadership-search", "/clients", "/contact"],
    cta: "Sense-check a brief",
    relatedService: "Leadership Search",
    linkedInAngle:
      "A short founder-led post showing how the same job title can mean three different business problems.",
    digitalPrAngle:
      "Commentary on why senior hiring failures often start with vague briefs, not weak candidates.",
    proofNeeded:
      "Anonymised examples from real briefs showing how title, scope and commercial pressure differed.",
  },
  {
    workingTitle: "What is Strategic Interim?",
    audience: "Founders, MDs and marketing teams needing senior help now",
    searchIntent: "Define Strategic Interim and explain when it makes sense",
    geoQuestion: "What is a Strategic Interim marketing leader?",
    h1: "What is Strategic Interim in marketing?",
    h2s: [
      "Strategic Interim in plain English",
      "When interim beats a permanent hire",
      "What the interim should actually fix",
      "How to brief the role properly",
    ],
    internalLinks: ["/services/strategic-interim", "/insights", "/contact"],
    cta: "Talk through an interim need",
    relatedService: "Strategic Interim",
    linkedInAngle:
      "Explain that interim is not a panic hire; it is senior judgement for a defined problem.",
    digitalPrAngle:
      "Founder commentary on the rise of interim marketing leadership in cautious hiring markets.",
    proofNeeded:
      "Examples of interim scopes, timings and outcomes with no client names unless permission is clear.",
  },
  {
    workingTitle: "Strategic Interim vs Consultancy",
    audience: "Businesses weighing interim leadership against consultancy support",
    searchIntent: "Compare two ways to solve a senior marketing problem",
    geoQuestion: "What is the difference between Strategic Interim and consultancy?",
    h1: "Strategic Interim vs consultancy",
    h2s: [
      "Consultancy gives advice from the outside",
      "Strategic Interim gets closer to the work",
      "When consultancy is still the right answer",
      "How to choose without wasting budget",
    ],
    internalLinks: ["/services/strategic-interim", "/clients", "/contact"],
    cta: "Work out which route fits",
    relatedService: "Strategic Interim",
    linkedInAngle:
      "A practical comparison: deck, diagnosis or someone embedded enough to move the work on.",
    digitalPrAngle:
      "Opinion piece for business press on why firms are buying senior operating judgement, not more decks.",
    proofNeeded:
      "Clear caveats and anonymised examples. No fake impact claims.",
  },
  {
    workingTitle: "Why senior marketing hiring goes wrong",
    audience: "Leadership teams that have struggled to hire senior marketers",
    searchIntent: "Diagnose common causes of senior marketing hiring failure",
    geoQuestion: "Why do senior marketing hires fail?",
    h1: "Why senior marketing hiring goes wrong",
    h2s: [
      "The brief is too vague",
      "The salary does not match the expectation",
      "The process loses good people",
      "The business hires for polish instead of judgement",
    ],
    internalLinks: ["/services/leadership-search", "/services/senior-recruitment", "/insights"],
    cta: "Fix the brief before you hire",
    relatedService: "Leadership Search",
    linkedInAngle:
      "Name the hard truth: most hiring problems are process and brief problems first.",
    digitalPrAngle:
      "Expert comment on the cost of senior hiring mistakes for growing businesses.",
    proofNeeded:
      "Anonymised reasons roles were re-briefed, salary challenged or process tightened.",
  },
  {
    workingTitle: "When should an agency use retained search?",
    audience: "Agency founders and senior agency leaders",
    searchIntent: "Understand when retained search is justified",
    geoQuestion: "When should an agency use retained search?",
    h1: "When should an agency use retained search?",
    h2s: [
      "When the role is senior or sensitive",
      "When advert response will not solve it",
      "When the market needs proper engagement",
      "What retained search should give you",
    ],
    internalLinks: ["/services/agency-recruitment", "/services/leadership-search", "/case-studies"],
    cta: "Talk through an agency brief",
    relatedService: "Agency Recruitment",
    linkedInAngle:
      "Explain why retained does not mean fancy; it means the role matters enough to do properly.",
    digitalPrAngle:
      "Agency trade comment on why senior agency hires need sharper positioning.",
    proofNeeded:
      "Agency role examples, seniority, market constraints and permissioned outcomes if available.",
  },
  {
    workingTitle: "What founders actually need from their next marketing leader",
    audience: "Founders and owner-managed growth businesses",
    searchIntent: "Clarify the right kind of senior marketing hire",
    geoQuestion: "When should a founder hire a Marketing Director?",
    h1: "What founders actually need from their next marketing leader",
    h2s: [
      "Builder, operator or strategist?",
      "What decision rights the role needs",
      "Why founder overload changes the brief",
      "How to avoid hiring a job title",
    ],
    internalLinks: ["/services/client-side-marketing-recruitment", "/services/leadership-search", "/contact"],
    cta: "Sense-check the role",
    relatedService: "Client-side Marketing Recruitment",
    linkedInAngle:
      "A founder-facing post about marketing leaders needing decision rights, not just a to-do list.",
    digitalPrAngle:
      "Founder/business press angle on when marketing still sits too heavily on the owner.",
    proofNeeded:
      "Real questions David asks founders before taking a brief.",
  },
  {
    workingTitle: "How to hire a Marketing Director without wasting six weeks",
    audience: "Businesses about to start a Marketing Director search",
    searchIntent: "Learn how to structure a senior hiring process",
    geoQuestion: "How do you avoid wasting six weeks on the wrong hire?",
    h1: "How to hire a Marketing Director without wasting six weeks",
    h2s: [
      "Get the brief sharp before you go to market",
      "Decide what good looks like",
      "Move properly with strong candidates",
      "Stop judging progress by CV volume",
    ],
    internalLinks: ["/services/client-side-marketing-recruitment", "/insights", "/contact"],
    cta: "Start with the brief",
    relatedService: "Client-side Marketing Recruitment",
    linkedInAngle:
      "Break down the first two weeks of a proper search before anyone starts interviewing.",
    digitalPrAngle:
      "Commentary on senior marketing hiring timelines and the cost of slow processes.",
    proofNeeded:
      "Anonymised process timings and examples from real searches.",
  },
  {
    workingTitle: "Why good marketing candidates are not applying to your job",
    audience: "Hiring managers frustrated by weak applications",
    searchIntent: "Understand why advert response is poor",
    geoQuestion: "Why are good senior marketing candidates not applying?",
    h1: "Why good marketing candidates are not applying to your job",
    h2s: [
      "The best people are not waiting on job boards",
      "Your advert may not sell the real opportunity",
      "Salary and hybrid detail matter",
      "Good candidates need context before they move",
    ],
    internalLinks: ["/clients", "/services/senior-recruitment", "/contact"],
    cta: "Improve the candidate approach",
    relatedService: "Senior Recruitment",
    linkedInAngle:
      "Explain why weak applications often mean weak positioning, not a weak candidate market.",
    digitalPrAngle:
      "Recruitment trade angle on senior candidate behaviour in marketing and comms.",
    proofNeeded:
      "Candidate conversation themes and anonymised feedback from search work.",
  },
  {
    workingTitle: "Retained search vs contingency recruitment",
    audience: "Clients choosing how to handle an important hire",
    searchIntent: "Compare retained and contingency recruitment honestly",
    geoQuestion: "What is the difference between retained search and standard recruitment?",
    h1: "Retained search vs contingency recruitment",
    h2s: [
      "The difference in plain English",
      "When contingency can work",
      "When retained search is the safer route",
      "What clients should expect from either model",
    ],
    internalLinks: ["/services/leadership-search", "/services/senior-recruitment", "/contact"],
    cta: "Choose the right search model",
    relatedService: "Leadership Search",
    linkedInAngle:
      "A fair comparison that does not pretend retained is right for every role.",
    digitalPrAngle:
      "Expert explainer for founders and HR audiences on why search model affects candidate trust.",
    proofNeeded:
      "No claims without evidence. Use process examples and decision criteria.",
  },
  {
    workingTitle: "What salary should you pay for a Head of Marketing in the North West?",
    audience: "North West businesses pricing senior marketing roles",
    searchIntent: "Understand salary factors before setting a range",
    geoQuestion: "What salary should businesses pay for senior marketing roles in the North West?",
    h1: "What salary should you pay for a Head of Marketing in the North West?",
    h2s: [
      "Why the title is not enough",
      "What changes the salary range",
      "How hybrid, team size and decision rights affect pay",
      "How to validate the range before going live",
    ],
    internalLinks: ["/salary-snapshots", "/services/client-side-marketing-recruitment", "/contact"],
    cta: "Check the salary before launch",
    relatedService: "Client-side Marketing Recruitment",
    linkedInAngle:
      "A salary reality check: title, scope and decision rights change the number.",
    digitalPrAngle:
      "Regional business press angle once verified salary data exists.",
    proofNeeded:
      "Validated salary ranges, source notes, date reviewed and clear caveats.",
  },
];

export const salaryMarketAssets: SalaryMarketAsset[] = [
  {
    title: "North West Senior Marketing Salary Snapshot",
    dataNeeded: ["Current briefs", "Candidate expectations", "Role scope", "Hybrid expectations"],
    collectionMethod:
      "Log anonymised salary signals from live briefs and candidate conversations each month.",
    cmsFields: ["quarter", "market", "rows", "source notes", "date reviewed"],
    pageStructure: ["Plain-English summary", "Semantic table", "Hiring notes", "Caveats", "CTA"],
    seoGeoValue:
      "Answers salary-intent searches while giving AI systems clear, dated context.",
    digitalPrHook:
      "Regional salary reality gap for senior marketing roles once data is verified.",
    linkedInAngle:
      "Why a Head of Marketing salary is meaningless without scope and decision rights.",
    updateFrequency: "Quarterly",
    caveat: "Publish only once ranges are checked against real market evidence.",
    internalLinks: ["/salary-snapshots", "/services/client-side-marketing-recruitment"],
    cta: "Check a salary range",
  },
  {
    title: "Manchester Agency Hiring Snapshot",
    dataNeeded: ["Agency role briefs", "Client services salaries", "PR and digital candidate appetite"],
    collectionMethod:
      "Track anonymised agency hiring patterns from active briefs and founder conversations.",
    cmsFields: ["market", "commentary", "salary rows", "candidate availability", "source notes"],
    pageStructure: ["Market summary", "Role table", "What agencies are struggling with", "CTA"],
    seoGeoValue: "Builds local agency recruitment authority for Manchester and the North West.",
    digitalPrHook: "Agency hiring confidence and senior client services pressure.",
    linkedInAngle: "What agency candidates are actually moving for this quarter.",
    updateFrequency: "Quarterly",
    caveat: "Separate agency types; do not flatten PR, creative, digital and integrated agencies into one claim.",
    internalLinks: ["/services/agency-recruitment", "/case-studies"],
    cta: "Talk through an agency hire",
  },
  {
    title: "PR & Communications Salary Snapshot",
    dataNeeded: ["PR agency briefs", "Client-side comms briefs", "Candidate salary expectations"],
    collectionMethod:
      "Record ranges by remit, client mix, seniority and whether the role is agency or in-house.",
    cmsFields: ["sector", "rows", "role notes", "hiring notes", "date reviewed"],
    pageStructure: ["Summary", "Salary table", "Agency vs in-house context", "CTA"],
    seoGeoValue: "Supports PR and comms recruitment searches with dated, useful evidence.",
    digitalPrHook: "Communications leadership pay and candidate movement.",
    linkedInAngle: "Why PR titles hide very different responsibilities.",
    updateFrequency: "Quarterly",
    caveat: "Do not publish named-company or client-sensitive information.",
    internalLinks: ["/services/agency-recruitment", "/specialisms"],
    cta: "Check a PR or comms brief",
  },
  {
    title: "Digital and Performance Marketing Salary Snapshot",
    dataNeeded: ["Budget ownership", "Channel mix", "Team size", "Commercial targets"],
    collectionMethod:
      "Capture what each role is actually accountable for before recording a range.",
    cmsFields: ["role", "low/mid/high", "budget notes", "channel notes", "date reviewed"],
    pageStructure: ["Summary", "Role-by-role table", "Scope notes", "CTA"],
    seoGeoValue: "Answers digital salary searches without reducing roles to job titles.",
    digitalPrHook: "Performance marketing pay pressure where budget ownership is unclear.",
    linkedInAngle: "A digital salary range without budget context is guesswork.",
    updateFrequency: "Quarterly",
    caveat: "Flag whether ranges are permanent, contract, interim or fractional.",
    internalLinks: ["/salary-snapshots", "/services/senior-recruitment"],
    cta: "Benchmark the role properly",
  },
  {
    title: "Strategic Interim Rate Guide",
    dataNeeded: ["Interim scope", "Day rate or retainer", "Length of assignment", "Outcome expected"],
    collectionMethod:
      "Record anonymised interim scopes and rates only where the commercial context is clear.",
    cmsFields: ["assignment type", "rate model", "scope", "caveats", "review date"],
    pageStructure: ["Definition", "Rate context", "When it makes sense", "CTA"],
    seoGeoValue: "Supports Strategic Interim and interim CMO searches with practical context.",
    digitalPrHook: "Why businesses buy interim judgement during uncertain hiring markets.",
    linkedInAngle: "Interim is not cheap permanent hiring. It has a different job.",
    updateFrequency: "Twice yearly",
    caveat: "Avoid exact claims until enough evidence exists. Use ranges and caveats.",
    internalLinks: ["/services/strategic-interim", "/insights/what-is-a-strategic-interim-marketing-leader"],
    cta: "Talk through interim support",
  },
  {
    title: "Senior Marketing Leadership Hiring Report",
    dataNeeded: ["Leadership role briefs", "Failure points", "Hiring timelines", "Candidate motivations"],
    collectionMethod:
      "Combine anonymised brief data, candidate conversations and founder questions.",
    cmsFields: ["summary", "findings", "method notes", "charts", "download asset"],
    pageStructure: ["Executive summary", "Findings", "What it means", "Service links", "CTA"],
    seoGeoValue: "Creates a higher-authority asset for links, citations and AI references.",
    digitalPrHook: "The senior marketing leadership confidence gap.",
    linkedInAngle: "What senior marketers want before they will move.",
    updateFrequency: "Annual",
    caveat: "Methodology must be explicit. No survey language unless a survey actually ran.",
    internalLinks: ["/services/leadership-search", "/insights"],
    cta: "Discuss a leadership search",
  },
  {
    title: "Agency Client Services Salary Snapshot",
    dataNeeded: ["Account management roles", "Client complexity", "Team responsibility", "Commercial ownership"],
    collectionMethod:
      "Group data by agency type and role responsibility, not just title.",
    cmsFields: ["agency type", "role rows", "responsibility notes", "source notes"],
    pageStructure: ["Summary", "Salary table", "What changes the range", "CTA"],
    seoGeoValue: "Builds agency recruitment authority around client services hiring.",
    digitalPrHook: "Client services pressure, over-servicing and pay expectations.",
    linkedInAngle: "Why the best client services people are hard to prise out.",
    updateFrequency: "Quarterly",
    caveat: "Protect client confidentiality and avoid overclaiming from small samples.",
    internalLinks: ["/services/agency-recruitment", "/case-studies"],
    cta: "Talk through a client services hire",
  },
];

export const digitalPrCampaigns: DigitalPrCampaign[] = [
  {
    title: "The Hidden Cost of a Bad Senior Marketing Hire",
    coreStory:
      "A senior marketing hire going wrong costs more than salary because it slows decisions, drains teams and delays growth.",
    whyAnyoneWouldCare:
      "Founders and MDs feel this pain but rarely quantify it before hiring.",
    audience: "Founders, MDs, HR leaders and business press",
    dataNeeded: ["Anonymised re-brief examples", "Hiring timeline estimates", "Common failure points"],
    possibleHeadline:
      "The real cost of a bad senior marketing hire is not the recruitment fee",
    journalistAngle:
      "Business risk and founder decision-making, not recruiter self-promotion.",
    tradeAngle: "Why senior marketing hires fail before the candidate starts.",
    linkedInAngle:
      "A blunt post listing the hidden costs nobody budgets for.",
    siteAsset: "Data-led insight or report page",
    outreachTargets: ["Regional business press", "Marketing trade press", "HR press"],
    risks: ["Can sound scare-led", "Needs real examples"],
    antiGimmickRule: "Keep the numbers caveated and explain the assumptions.",
  },
  {
    title: "How Long It Really Takes to Hire Senior Marketers in the North West",
    coreStory:
      "Hiring timelines stretch when the brief, salary or process is not market-ready.",
    whyAnyoneWouldCare:
      "Businesses need realistic planning before a senior role becomes urgent.",
    audience: "North West business leaders and marketing leaders",
    dataNeeded: ["Anonymised time-to-hire ranges", "Process blockers", "Role seniority"],
    possibleHeadline:
      "Why senior marketing hiring takes longer than most businesses plan for",
    journalistAngle: "Regional labour market and growth planning.",
    tradeAngle: "How process quality affects senior candidate conversion.",
    linkedInAngle: "Why the first delay usually happens before the role goes live.",
    siteAsset: "North West hiring timeline snapshot",
    outreachTargets: ["Manchester business press", "Marketing trade press", "Founder newsletters"],
    risks: ["Small sample size", "Market changes quickly"],
    antiGimmickRule: "Publish methodology and update dates clearly.",
  },
  {
    title: "The Founder Bottleneck",
    coreStory:
      "Marketing still sits on the founder's desk in many growth businesses, and the next hire has to fix that pressure.",
    whyAnyoneWouldCare:
      "Founder overload is a real commercial problem, not just an org-chart issue.",
    audience: "Founders and growth business media",
    dataNeeded: ["Founder interview themes", "Brief patterns", "Common decision rights issues"],
    possibleHeadline:
      "When marketing still sits on the founder's desk, the job title is not the brief",
    journalistAngle: "Founder productivity, growth and senior hiring.",
    tradeAngle: "What founders really need from a Marketing Director.",
    linkedInAngle: "Signs the founder is still the marketing department.",
    siteAsset: "Founder bottleneck insight",
    outreachTargets: ["Founder podcasts", "Business press", "LinkedIn creators"],
    risks: ["Can feel too broad without examples"],
    antiGimmickRule: "Use real anonymised founder problems, not motivational fluff.",
  },
  {
    title: "The Agency Over-Servicing Index",
    coreStory:
      "Agency teams lose margin and senior focus when client service structures are wrong.",
    whyAnyoneWouldCare:
      "Agency founders care about client pressure, margin and team burnout.",
    audience: "Agency founders, agency trade press and PR/digital leaders",
    dataNeeded: ["Agency founder questions", "Client services role scopes", "Over-servicing signals"],
    possibleHeadline:
      "The agency over-servicing problem is often a hiring problem in disguise",
    journalistAngle: "Agency margin pressure and senior client leadership.",
    tradeAngle: "How client services hiring affects profitability.",
    linkedInAngle: "When a Senior Account Director brief is really a margin problem.",
    siteAsset: "Agency over-servicing insight or snapshot",
    outreachTargets: ["Agency trade press", "PR trade press", "Digital agency newsletters"],
    risks: ["Needs careful language; no client blame"],
    antiGimmickRule: "Focus on operational insight, not a made-up league table.",
  },
  {
    title: "The Senior Marketing Salary Reality Gap",
    coreStory:
      "Businesses often price senior marketing roles by title when scope is what changes the salary.",
    whyAnyoneWouldCare:
      "A wrong range quietly kills candidate interest.",
    audience: "Hiring managers, founders and regional business press",
    dataNeeded: ["Verified salary ranges", "Scope notes", "Candidate expectation themes"],
    possibleHeadline:
      "Why the same Head of Marketing title can need a very different salary",
    journalistAngle: "Regional salary pressure and senior talent movement.",
    tradeAngle: "Why scope, not title, should anchor salary benchmarking.",
    linkedInAngle: "Salary reality check: title is not enough.",
    siteAsset: "Salary snapshot page",
    outreachTargets: ["Regional press", "HR press", "Marketing press"],
    risks: ["Cannot publish without validated salary data"],
    antiGimmickRule: "Do not invent ranges. Publish only checked data.",
  },
  {
    title: "Why Strategic But Hands-On Usually Means the Brief Is Broken",
    coreStory:
      "Businesses often ask for someone strategic and hands-on because the real role has not been defined.",
    whyAnyoneWouldCare:
      "It names a common hiring problem in plain English.",
    audience: "Founders, marketing leaders and recruitment trade press",
    dataNeeded: ["Brief examples", "Role scope patterns", "Candidate feedback"],
    possibleHeadline:
      "Strategic but hands-on is not a brief. It is a warning light",
    journalistAngle: "How vague job specs damage senior hiring.",
    tradeAngle: "Why marketers push back on unclear leadership briefs.",
    linkedInAngle: "A short post decoding what strategic but hands-on often really means.",
    siteAsset: "Insight article linked to leadership search and interim",
    outreachTargets: ["Marketing newsletters", "Recruitment press", "LinkedIn creators"],
    risks: ["Phrase can become clickbait"],
    antiGimmickRule: "Explain the fix, not just the complaint.",
  },
  {
    title: "The Great Marketing Leadership Confidence Gap",
    coreStory:
      "Businesses know they need senior marketing judgement but are unsure whether to hire permanent, interim or fractional.",
    whyAnyoneWouldCare:
      "It helps leaders choose the right shape of support.",
    audience: "Founders, MDs and marketing leaders",
    dataNeeded: ["Decision criteria", "Brief examples", "Interim vs permanent patterns"],
    possibleHeadline:
      "Permanent, interim or fractional: why marketing leadership decisions are getting harder",
    journalistAngle: "Changing senior leadership models in growth businesses.",
    tradeAngle: "How firms choose between permanent and interim marketing leadership.",
    linkedInAngle: "The problem is not always who to hire. Sometimes it is what shape of help to buy.",
    siteAsset: "Comparison guide",
    outreachTargets: ["Business press", "Marketing trade press", "Founder podcasts"],
    risks: ["Needs nuance"],
    antiGimmickRule: "Do not present one model as the answer to everything.",
  },
  {
    title: "Manchester Agency Hiring Snapshot",
    coreStory:
      "Agency hiring pressure in Manchester shifts by client demand, senior candidate appetite and margin confidence.",
    whyAnyoneWouldCare:
      "It gives agency leaders a market view they can use.",
    audience: "Manchester and North West agency leaders",
    dataNeeded: ["Agency briefs", "Candidate conversations", "Role demand by function"],
    possibleHeadline:
      "What Manchester agencies are really hiring for this quarter",
    journalistAngle: "Regional creative and professional services market.",
    tradeAngle: "Agency hiring demand and senior candidate movement.",
    linkedInAngle: "What the Manchester agency market is asking for right now.",
    siteAsset: "Agency hiring snapshot",
    outreachTargets: ["Manchester business press", "Agency trade press", "Local newsletters"],
    risks: ["Needs enough data to avoid overclaiming"],
    antiGimmickRule: "Call it a snapshot, not a definitive market report.",
  },
  {
    title: "The Strategic Interim Trend Report",
    coreStory:
      "More businesses may use interim marketing leadership when they need judgement but permanent hiring feels slow or risky.",
    whyAnyoneWouldCare:
      "It explains a practical response to uncertain hiring conditions.",
    audience: "Business leaders and marketing decision-makers",
    dataNeeded: ["Interim enquiries", "Common scopes", "Assignment lengths", "Budget models"],
    possibleHeadline:
      "Why more businesses are considering interim marketing leadership",
    journalistAngle: "Flexible senior leadership and business confidence.",
    tradeAngle: "Strategic Interim as an alternative to permanent senior hiring.",
    linkedInAngle: "Interim works when the problem is clear and the clock is ticking.",
    siteAsset: "Strategic Interim report or guide",
    outreachTargets: ["Business press", "Marketing trade press", "Founder newsletters"],
    risks: ["Trend claims need evidence"],
    antiGimmickRule: "Use David's own enquiry patterns and clear caveats.",
  },
  {
    title: "What Marketing Leaders Actually Want From Their Next Role",
    coreStory:
      "Senior marketers move for scope, trust, decision rights and leadership quality, not just a better title.",
    whyAnyoneWouldCare:
      "It helps clients sell the opportunity properly.",
    audience: "Clients hiring senior marketing leaders",
    dataNeeded: ["Candidate conversation themes", "Offer feedback", "Role acceptance reasons"],
    possibleHeadline:
      "What senior marketers want before they will leave a good role",
    journalistAngle: "Candidate expectations and leadership hiring.",
    tradeAngle: "How to make senior marketing opportunities credible.",
    linkedInAngle: "Strong candidates are judging the business as hard as the business is judging them.",
    siteAsset: "Candidate market insight",
    outreachTargets: ["Marketing press", "HR press", "LinkedIn newsletters"],
    risks: ["Needs anonymised evidence"],
    antiGimmickRule: "Use themes and quotes only with permission.",
  },
];

export const founderAuthorityPillars: FounderAuthorityPillar[] = [
  {
    pillar: "The problem behind the hire",
    linkedInPostIdeas: ["Three different briefs hiding behind one Head of Marketing title"],
    articleIdeas: ["How to define the real brief before search starts"],
    prCommentIdeas: ["Expert comment on why senior roles are mis-scoped"],
    serviceLinks: ["/services/leadership-search", "/clients"],
    cta: "Sense-check a brief",
  },
  {
    pillar: "The job title is not the brief",
    linkedInPostIdeas: ["What a job title hides from candidates"],
    articleIdeas: ["The job title is not the brief"],
    prCommentIdeas: ["Comment on vague job ads and hiring failures"],
    serviceLinks: ["/services/leadership-search"],
    cta: "Fix the brief",
  },
  {
    pillar: "No CV flinging",
    linkedInPostIdeas: ["Why five useful profiles beat twenty loose CVs"],
    articleIdeas: ["Why more CVs rarely fix a broken brief"],
    prCommentIdeas: ["Recruitment process quality commentary"],
    serviceLinks: ["/clients", "/services/senior-recruitment"],
    cta: "Improve the shortlist",
  },
  {
    pillar: "Senior marketing hiring mistakes",
    linkedInPostIdeas: ["The mistake that loses good candidates in week one"],
    articleIdeas: ["Why senior marketing hiring goes wrong"],
    prCommentIdeas: ["Hiring process risks and leadership hiring"],
    serviceLinks: ["/services/leadership-search"],
    cta: "De-risk the search",
  },
  {
    pillar: "Strategic Interim explained",
    linkedInPostIdeas: ["Interim is not consultancy theatre"],
    articleIdeas: ["What is Strategic Interim?"],
    prCommentIdeas: ["Flexible senior marketing leadership"],
    serviceLinks: ["/services/strategic-interim"],
    cta: "Talk through interim",
  },
  {
    pillar: "Agency hiring reality",
    linkedInPostIdeas: ["What agency candidates are really judging"],
    articleIdeas: ["When should an agency use retained search?"],
    prCommentIdeas: ["Agency market commentary"],
    serviceLinks: ["/services/agency-recruitment"],
    cta: "Talk through an agency hire",
  },
  {
    pillar: "Salary reality checks",
    linkedInPostIdeas: ["The same title can need a different salary"],
    articleIdeas: ["What salary should you pay for a Head of Marketing in the North West?"],
    prCommentIdeas: ["Regional salary commentary with verified data"],
    serviceLinks: ["/salary-snapshots"],
    cta: "Check the range",
  },
  {
    pillar: "Candidate market truth",
    linkedInPostIdeas: ["Why good candidates are not applying"],
    articleIdeas: ["Why good marketing candidates are not applying to your job"],
    prCommentIdeas: ["Candidate expectations and market behaviour"],
    serviceLinks: ["/candidates", "/clients"],
    cta: "Improve candidate engagement",
  },
  {
    pillar: "Founder bottlenecks",
    linkedInPostIdeas: ["Signs marketing is still stuck on the founder's desk"],
    articleIdeas: ["What founders actually need from their next marketing leader"],
    prCommentIdeas: ["Founder growth and leadership commentary"],
    serviceLinks: ["/services/client-side-marketing-recruitment"],
    cta: "Sense-check the role",
  },
  {
    pillar: "Hiring process mistakes",
    linkedInPostIdeas: ["How slow feedback turns strong candidates cold"],
    articleIdeas: ["How to hire a Marketing Director without wasting six weeks"],
    prCommentIdeas: ["Hiring timeline and candidate conversion commentary"],
    serviceLinks: ["/clients", "/contact"],
    cta: "Tighten the process",
  },
];

export const monthlyDistributionWorkflow = [
  {
    week: 1,
    actions: [
      "Publish one cornerstone or market insight",
      "Create three LinkedIn posts from it",
      "Add internal links from the article to relevant service pages",
    ],
  },
  {
    week: 2,
    actions: [
      "Pitch one digital PR or expert comment angle",
      "Offer David as an expert source where he can speak from experience",
      "Repurpose the article into a short opinion post",
    ],
  },
  {
    week: 3,
    actions: [
      "Publish one shorter FAQ-led insight",
      "Update one service FAQ from a real client question",
      "Add a case study or proof point only if permission is clear",
    ],
  },
  {
    week: 4,
    actions: [
      "Review Search Console, analytics and LinkedIn performance",
      "Review enquiries and CTA clicks",
      "Choose next month's topic from real data, not guesswork",
    ],
  },
];

export const contentCalendar: CalendarWeek[] = [
  {
    week: 1,
    mainPiece: "The job title is not the brief",
    linkedInPosts: ["Same title, different problem", "Why weak briefs waste time", "What David asks before search"],
    digitalPrAngle: "Expert comment on senior hiring failures",
    internalLinkUpdates: ["/services/leadership-search", "/clients"],
    cta: "Sense-check a brief",
    dataOrProofNeeded: "Anonymised brief examples",
  },
  {
    week: 2,
    mainPiece: "What is Strategic Interim?",
    linkedInPosts: ["Interim in plain English", "When permanent is too slow", "What an interim should fix"],
    digitalPrAngle: "Flexible senior marketing leadership",
    internalLinkUpdates: ["/services/strategic-interim"],
    cta: "Talk through interim",
    dataOrProofNeeded: "Interim scope examples",
  },
  {
    week: 3,
    mainPiece: "Why senior marketing hiring goes wrong",
    linkedInPosts: ["Brief first, shortlist second", "Salary mismatch", "Process kills interest"],
    digitalPrAngle: "Cost of bad senior hiring",
    internalLinkUpdates: ["/services/leadership-search", "/insights"],
    cta: "Fix the brief",
    dataOrProofNeeded: "Failure point themes",
  },
  {
    week: 4,
    mainPiece: "When should an agency use retained search?",
    linkedInPosts: ["When retained is worth it", "Why advert response is not enough", "How agency candidates judge roles"],
    digitalPrAngle: "Agency senior hiring pressure",
    internalLinkUpdates: ["/services/agency-recruitment"],
    cta: "Talk through an agency brief",
    dataOrProofNeeded: "Agency brief examples",
  },
  {
    week: 5,
    mainPiece: "North West Senior Marketing Salary Snapshot",
    linkedInPosts: ["Title is not a salary range", "Scope changes the number", "Hybrid and decision rights matter"],
    digitalPrAngle: "Regional salary reality gap",
    internalLinkUpdates: ["/salary-snapshots", "/services/client-side-marketing-recruitment"],
    cta: "Check a salary range",
    dataOrProofNeeded: "Verified salary ranges",
  },
  {
    week: 6,
    mainPiece: "Strategic Interim vs Consultancy",
    linkedInPosts: ["Deck or operator?", "When consultancy works", "When interim is better"],
    digitalPrAngle: "Businesses buying senior operating judgement",
    internalLinkUpdates: ["/services/strategic-interim"],
    cta: "Choose the right route",
    dataOrProofNeeded: "Interim and consultancy comparison examples",
  },
  {
    week: 7,
    mainPiece: "What founders actually need from their next marketing leader",
    linkedInPosts: ["Builder, operator or strategist", "Decision rights matter", "Founder overload"],
    digitalPrAngle: "Founder bottleneck commentary",
    internalLinkUpdates: ["/services/client-side-marketing-recruitment"],
    cta: "Sense-check the role",
    dataOrProofNeeded: "Founder questions and role patterns",
  },
  {
    week: 8,
    mainPiece: "Why good marketing candidates are not applying to your job",
    linkedInPosts: ["Weak advert or weak market?", "Context before CVs", "Why good people need a reason"],
    digitalPrAngle: "Senior candidate behaviour",
    internalLinkUpdates: ["/clients", "/services/senior-recruitment"],
    cta: "Improve candidate engagement",
    dataOrProofNeeded: "Candidate feedback themes",
  },
  {
    week: 9,
    mainPiece: "Manchester Agency Hiring Snapshot",
    linkedInPosts: ["What agencies are hiring for", "Client services pressure", "Candidate appetite"],
    digitalPrAngle: "Manchester agency market snapshot",
    internalLinkUpdates: ["/services/agency-recruitment", "/case-studies"],
    cta: "Talk through an agency hire",
    dataOrProofNeeded: "Agency hiring data",
  },
  {
    week: 10,
    mainPiece: "Retained search vs contingency recruitment",
    linkedInPosts: ["When contingency works", "When retained is safer", "Candidate trust in search"],
    digitalPrAngle: "Search model and candidate quality",
    internalLinkUpdates: ["/services/leadership-search", "/services/senior-recruitment"],
    cta: "Choose the right search model",
    dataOrProofNeeded: "Process examples",
  },
  {
    week: 11,
    mainPiece: "How to hire a Marketing Director without wasting six weeks",
    linkedInPosts: ["Week one matters", "Define good first", "Stop measuring CV volume"],
    digitalPrAngle: "Senior hiring timelines",
    internalLinkUpdates: ["/services/client-side-marketing-recruitment", "/contact"],
    cta: "Start with the brief",
    dataOrProofNeeded: "Process timing examples",
  },
  {
    week: 12,
    mainPiece: "What marketing leaders actually want from their next role",
    linkedInPosts: ["Scope over title", "Trust and decision rights", "Why strong candidates say no"],
    digitalPrAngle: "Senior marketing candidate expectations",
    internalLinkUpdates: ["/candidates", "/clients"],
    cta: "Position the role properly",
    dataOrProofNeeded: "Candidate conversation themes",
  },
];

export const measurementFramework = {
  seoGeo: [
    "Organic impressions",
    "Organic clicks",
    "Query growth",
    "Indexed pages",
    "Strategic Interim queries",
    "Marketing recruitment Manchester/North West queries",
    "Pages earning links or mentions",
    "AI-search citations or surfaced answers where visible",
  ],
  digitalPr: [
    "Coverage secured",
    "Relevant links",
    "Brand mentions",
    "Referral traffic",
    "Trade publication mentions",
    "Newsletter or podcast mentions",
  ],
  commercial: [
    "Contact form submissions",
    "Talk to David clicks",
    "Booking link clicks",
    "Strategic Interim enquiries",
    "Leadership Search enquiries",
    "Job applications",
  ],
  authority: [
    "LinkedIn comment quality",
    "Inbound quote requests",
    "Repeat mentions",
    "Case study views",
    "Salary snapshot views",
  ],
};

export const stagedRoadmap = [
  {
    stage: "Week 0",
    actions: [
      "Set up Search Console, GA4 or Tag Manager and submit sitemap",
      "Validate schema, robots, metadata and indexability",
      "Prepare the first four content pieces before the site is promoted",
    ],
  },
  {
    stage: "First 30 days",
    actions: [
      "Publish four cornerstone articles",
      "Publish one salary snapshot only if data is verified",
      "Post on LinkedIn three times per week",
      "Pitch one expert comment or digital PR angle per week",
    ],
  },
  {
    stage: "Days 31-90",
    actions: [
      "Publish two useful articles per month",
      "Run one lightweight data-led PR campaign",
      "Secure three to five relevant external mentions or links",
      "Improve pages using Search Console query data",
    ],
  },
  {
    stage: "Months 3-6",
    actions: [
      "Build a salary hub once enough validated data exists",
      "Build a Strategic Interim resource centre",
      "Publish a quarterly marketing hiring report if the evidence is strong enough",
      "Create repeatable monthly reporting",
    ],
  },
  {
    stage: "Months 6-12",
    actions: [
      "Create an annual market report or proprietary survey",
      "Run a founder panel or roundtable",
      "Turn the best insights into guides",
      "Refresh older content and track enquiries by source",
    ],
  },
];
