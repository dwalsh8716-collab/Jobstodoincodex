export const specialismEditorial = {
  "marketing-and-leadership": {
    groups: [
      { title: "Specialists and delivery", items: ["Marketing Executive", "Marketing Manager", "Brand and product marketing"] },
      { title: "Function ownership", items: ["Head of Marketing", "Marketing team leadership", "Growth and broader marketing"] },
      { title: "Senior leadership", items: ["Marketing Director", "CMO", "Commercial marketing direction"] },
    ],
    heading: "What does this person actually need to own?",
    judgement: "A Head of Marketing in one business can be doing a completely different job from a Head of Marketing somewhere else. Team size, budget, channel ownership and commercial responsibility matter more than the title alone.",
    questions: ["Strategic direction, hands-on delivery, or both?", "Brand, demand or a broader commercial remit?", "What needs to change, and what authority will they have to change it?"],
    adjacent: "digital-performance-ecommerce",
    boundary: "For a brief centred on performance, acquisition or eCommerce, explore Digital, Performance & eCommerce.",
  },
  "digital-performance-ecommerce": {
    groups: [
      { title: "Acquisition", items: ["Performance marketing", "Paid media and PPC", "SEO"] },
      { title: "Customer and commerce", items: ["CRM and retention", "eCommerce", "Customer acquisition"] },
      { title: "Digital leadership", items: ["Head of Digital", "Performance Director", "Senior digital leadership"] },
    ],
    heading: "What are they actually responsible for moving?",
    judgement: "Digital job titles can hide very different responsibilities. A brief needs to say what the person owns: acquisition, revenue, conversion, retention or the team delivering them.",
    questions: ["Which commercial result needs to improve?", "Are they doing the work, leading a team or managing agencies?", "What budget, channels and decisions will they own?"],
    adjacent: "pr-communications-content",
    boundary: "Organic social, content and reputation-led briefs sit with PR, Communications & Content. This is marketing recruitment, not software engineering or IT recruitment.",
  },
  "pr-communications-content": {
    groups: [
      { title: "PR and reputation", items: ["PR and earned media", "Corporate communications", "Reputation"] },
      { title: "Content and social", items: ["Content", "Organic social", "Influencer"] },
      { title: "From delivery to leadership", items: ["Account Executive and Manager", "Head of Communications", "PR Director"] },
    ],
    heading: "PR, content and comms can look similar on paper. They aren’t the same job.",
    judgement: "Earned media, corporate reputation and content ownership need different strengths. Be clear about the audience, the work and whether the person is leading the strategy or delivering it.",
    questions: ["What audience and reputation are they responsible for?", "Is the context agency-side or in-house?", "Is this earned media, communications leadership or content delivery?"],
    adjacent: "digital-performance-ecommerce",
    boundary: "Hiring for paid social or measurable acquisition? Explore Digital, Performance & eCommerce rather than treating every social role as the same brief.",
  },
  "agency-client-services-leadership": {
    groups: [
      { title: "Client relationships", items: ["Account Manager", "Account Director", "Client services"] },
      { title: "Commercial ownership", items: ["Business Director", "Client and team leadership", "Commercial relationships"] },
      { title: "Agency leadership", items: ["Managing Partner", "Managing Director", "Agency direction"] },
    ],
    heading: "At senior agency level, the CV only tells you so much.",
    judgement: "The agency name on a CV is not the same as the candidate’s contribution. Understand the client relationships they owned, the teams they led and the commercial decisions they actually made.",
    questions: ["How do they handle difficult client situations?", "What did they contribute commercially?", "Will their leadership work within this agency’s model and culture?"],
    adjacent: "pr-communications-content",
    boundary: "This is about leading clients, teams and agencies. For a specialist PR, communications or content delivery brief, explore that market separately.",
  },
} as const;

export const specialismServiceRoutes = [
  { slug: "permanent-recruitment", title: "Permanent Recruitment", text: "For permanent hires where you know broadly what you need." },
  { slug: "retained-search", title: "Retained Search", text: "For senior, confidential or commercially important appointments that need a committed search." },
  { slug: "fractional", title: "Fractional Leadership", text: "For senior capability where another full-time permanent hire isn’t necessarily the answer." },
  { slug: "market-intelligence-advisory", title: "Market Intelligence & Advisory", text: "For salary, market, talent or brief evidence before you recruit." },
] as const;
