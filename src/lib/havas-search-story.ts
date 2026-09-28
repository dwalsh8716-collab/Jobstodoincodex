export type CaseStudySearchStory = {
  brief: { heading: string; impact: string };
  challenge: {
    heading: string;
    questionsHeading: string;
    questions: string[];
    closing: string;
  };
  approach: {
    heading: string;
    intro: string;
    steps: { _key: string; title: string; text: string }[];
    linkLabel: string;
  };
  outcome: {
    heading: string;
    text: string;
    summary: string;
    tenure: string;
    tenureQualifier: string;
    tenureLabel: string;
  };
  progression: { heading: string; text: string; from: string; to: string };
  impact: { value: string; attribution: string };
  view: { heading: string; paragraphs: string[] };
};

export const havasSearchStory: CaseStudySearchStory = {
  brief: {
    heading: "What Havas actually needed.",
    impact:
      "Get a Managing Partner hire right and they can have a real impact across clients, people, culture and commercial performance.\n\nGet it wrong and it's an expensive mistake — in more ways than salary and recruitment fees.\n\nThis was a hire worth taking the time to get right.",
  },
  challenge: {
    heading: "The CV wasn't going to tell us enough.",
    questionsHeading: "What we actually needed to know",
    questions: [
      "How did they lead?",
      "How commercially strong were they?",
      "What relationships had they actually owned?",
      "How did they handle difficult clients and difficult decisions?",
      "What had they personally contributed?",
      "Would they actually work within Havas?",
    ],
    closing: "That's where the judgement comes in.",
  },
  approach: {
    heading: "Search the market. Then apply the judgement.",
    intro:
      "The search was run on a retained basis, giving us the mandate to properly map the market, approach senior people directly and understand fit before introducing them.",
    steps: [
      {
        _key: "understand",
        title: "Understand",
        text: "Get properly underneath the brief before approaching anybody.",
      },
      {
        _key: "map",
        title: "Map",
        text: "Map the senior agency market rather than wait for applications.",
      },
      {
        _key: "approach",
        title: "Approach",
        text: "Engage strong people who weren't necessarily looking.",
      },
      {
        _key: "assess",
        title: "Assess",
        text: "Look beyond the CV at commercials, leadership, client credibility and fit.",
      },
      {
        _key: "focus",
        title: "Focus",
        text: "Fewer, better conversations. No shortlist padding.",
      },
    ],
    linkLabel: "See the full Retained Search process",
  },
  outcome: {
    heading:
      "James Reddington joined Havas Media Manchester as Managing Partner.",
    text: "James made the move after almost 24 years at Carat Manchester, where he had been Group Business Director.\n\nFor somebody to leave a business after nearly 24 years, this wasn't simply another job move.\n\nIt had to be the right opportunity for James as much as James had to be the right person for Havas.",
    summary: "Appointed → later progressed to Joint General Manager",
    tenure: "24 YEARS",
    tenureQualifier: "Almost",
    tenureLabel: "at Carat Manchester before making the move.",
  },
  progression: {
    heading: "The better measure is what happens after the placement.",
    text: "This is probably my favourite bit of the story.\n\nJames subsequently progressed into a newly created Joint General Manager role for Havas Media Manchester alongside Lucy Barnes, becoming part of the senior leadership of the agency.\n\nRecruitment shouldn't really be judged by whether somebody accepted the job.\n\nThe better question is:\n\nDid we help the business hire somebody who went on to succeed there?\n\nIn this case, they clearly did.",
    from: "Managing Partner",
    to: "Joint General Manager",
  },
  impact: {
    value: "+150%",
    attribution:
      "Manchester billings in a year, as reported by Havas during the subsequent leadership period.",
  },
  view: {
    heading: "Senior recruitment is increasingly about judgement, not access.",
    paragraphs: [
      "Technology can find people.",
      "LinkedIn can find people.",
      "AI can find people.",
      "The valuable bit is understanding who's genuinely good, what they've actually achieved and whether they're right for this business.",
      "That's where recruitment earns its money.",
    ],
  },
};
