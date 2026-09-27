import type { FAQ } from "@/lib/types";
import { faqSchema } from "@/lib/seo";
import { SchemaScript } from "./SchemaScript";

export function FAQAccordion({
  faqs,
  heading = "Clear answers before a conversation.",
}: {
  faqs: FAQ[];
  heading?: string;
}) {
  if (!faqs.length) return null;

  return (
    <section className="section surface">
      <div className="container faq-layout">
        <div>
          <p className="eyebrow">FAQs</p>
          <h2>{heading}</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.question} className="faq-item">
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
      <SchemaScript data={faqSchema(faqs)} />
    </section>
  );
}
