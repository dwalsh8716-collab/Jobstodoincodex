import { ClipboardList } from "lucide-react";

type TemplateLibraryProps = {
  onUseTemplate: (template: string) => void;
};

const TEMPLATES = [
  {
    title: "LinkedIn profile",
    body: "Hi [Name], I spotted your background at [Company] and wanted to send a quick personal note rather than another flat message. The thing that stood out was [specific observation]. I work with senior marketing, comms, digital and agency leaders when they need careful search support or interim help. Thought this might be worth a quick look.",
  },
  {
    title: "Company website",
    body: "Hi [Name], I was looking at [Company] and recorded this because [specific company observation] felt relevant. I help leadership teams find senior marketing, PR, comms and digital people when the brief needs a bit more judgement than a standard recruitment process. No hard sell, just a quick thought.",
  },
  {
    title: "Job advert",
    body: "Hi [Name], I saw the [Role] brief and thought it was worth sending a quick note. The role looks like it needs [specific challenge], and that is often where a tighter search approach saves time. I recorded this so you can see the thinking in context.",
  },
  {
    title: "Founder / CEO",
    body: "Hi [Name], I know hiring senior marketing or agency leadership can become noisy quickly, so I recorded this as a short, direct note. The bit I would pay attention to is [specific commercial point]. If useful, I can share how I would map the market without making a meal of it.",
  },
  {
    title: "Agency leader",
    body: "Hi [Name], I wanted to send a quick note after looking at [Agency]. For senior agency hires, the difference is usually client judgement, team fit and commercial maturity, not just the job title. I recorded this because [specific observation] caught my eye.",
  },
];

export function TemplateLibrary({ onUseTemplate }: TemplateLibraryProps) {
  return (
    <section className="panel template-panel">
      <div className="panel-heading">
        <h2>Templates</h2>
        <ClipboardList size={18} aria-hidden="true" />
      </div>

      <div className="template-list">
        {TEMPLATES.map((template) => (
          <button
            key={template.title}
            type="button"
            onClick={() => onUseTemplate(template.body)}
          >
            {template.title}
          </button>
        ))}
      </div>
    </section>
  );
}
