import { ContactForm } from "@/components/ContactForm";
import { RichMediaBlock } from "@/components/RichMedia";
import { SalaryTable } from "@/components/SalaryTable";
import { richMediaExamples, salarySnapshots } from "@/lib/content";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Design System | Essential Resourcing",
  description: "Design system reference page for Essential Resourcing colours, components and rich media.",
  path: "/design-system",
  noIndex: true
});

const tokens = [
  ["Background", "--color-bg"],
  ["Surface", "--color-surface"],
  ["Muted surface", "--color-surface-muted"],
  ["Ink", "--color-ink"],
  ["Primary", "--color-primary"],
  ["Accent", "--color-accent"]
];

export default function DesignSystemPage() {
  return (
    <>
      <section className="section dark">
        <div className="container section-heading">
          <p className="eyebrow">Design system</p>
          <h1>Adaptable visual language, not a hardcoded theme.</h1>
          <p className="lede">
            Colours, typography, spacing, radius, buttons, media and form treatments are all centralised. Change the
            tokens in `src/styles/theme.css` to shift the visual direction.
          </p>
        </div>
      </section>
      <section className="section surface">
        <div className="container section-heading">
          <p className="eyebrow">Tokens</p>
          <h2>Colour system.</h2>
        </div>
        <div className="container grid grid-3">
          {tokens.map(([label, token]) => (
            <article className="card" key={token}>
              <div className="token-swatch" style={{ background: `var(${token})` }} />
              <h3>{label}</h3>
              <p>{token}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="container section-heading">
          <p className="eyebrow">Components</p>
          <h2>Buttons, cards and media.</h2>
        </div>
        <div className="container grid grid-3">
          <article className="card">
            <h3>Buttons</h3>
            <div className="button-row hero-actions">
              <a className="button button-primary" href="/contact">Primary</a>
              <a className="button button-secondary" href="/contact">Secondary</a>
              <a className="button button-dark" href="/contact">Dark</a>
            </div>
          </article>
          <article className="card lift-card">
            <span className="tag">Card</span>
            <h3>Commercially sharp recruitment</h3>
            <p>A compact card pattern for services, jobs, insights and proof.</p>
          </article>
          <article className="card">
            <h3>Rich media</h3>
            <p>Video, images and galleries are reusable blocks with matching Sanity schema fields.</p>
          </article>
        </div>
      </section>
      <section className="section surface">
        <div className="container split">
          <RichMediaBlock media={richMediaExamples[0]} />
          <RichMediaBlock media={richMediaExamples[1]} />
        </div>
      </section>
      <section className="section muted">
        <div className="container split">
          <SalaryTable snapshot={salarySnapshots[0]} />
          <ContactForm />
        </div>
      </section>
    </>
  );
}
