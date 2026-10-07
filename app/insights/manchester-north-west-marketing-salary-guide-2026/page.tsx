import Link from "next/link";
import type { Metadata } from "next";
import { Fragment } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQAccordion } from "@/components/FAQAccordion";
import { SchemaScript } from "@/components/SchemaScript";
import { articleSchema, createMetadata, absoluteUrl } from "@/lib/seo";
import { salaryTables, salaryRowGroups } from "@/lib/salary-guide-2026-tables";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/site";
import {
  salaryGuideInsight as guide,
  salaryGuidePath,
  salaryGuideSocialDescription,
  salaryGuideIntro,
  salaryGuideMarket,
  salaryDefinitions,
  salaryGuideBasis,
  salaryCommentary,
  salaryEditorial,
  salaryGuideFaqs,
} from "@/lib/salary-guide-2026";
import styles from "./salary-guide.module.css";
import { SalaryGuideShare } from "./SalaryGuideShare";
import { SalarySenseCheckForm } from "./SalarySenseCheckForm";
import { SalaryChecker } from "./SalaryChecker";
import { analyticsAttributes } from "@/lib/analytics";

const baseMetadata = createMetadata({
  title: guide.seoTitle,
  description: guide.metaDescription,
  path: salaryGuidePath,
  image: "/assets/salary-guide-2026-social.png",
});
export const metadata: Metadata = {
  ...baseMetadata,
  authors: [{ name: "David Walsh", url: absoluteUrl("/about-david-walsh") }],
  openGraph: {
    ...baseMetadata.openGraph,
    type: "article",
    images: [
      {
        url: absoluteUrl("/assets/salary-guide-2026-social.png"),
        width: 1200,
        height: 630,
        alt: "Manchester & North West Marketing Salary Guide 2026 by David Walsh, Essential Resourcing",
      },
    ],
    description: salaryGuideSocialDescription,
    publishedTime: guide.publishedDate,
    modifiedTime: guide.updatedDate,
  },
  twitter: {
    ...baseMetadata.twitter,
    description: salaryGuideSocialDescription,
  },
};

function Paragraphs({ texts }: { texts: string[] }) {
  return (
    <>
      {texts.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </>
  );
}

function Editorial({
  section,
  id,
  className,
}: {
  section: { heading: string; content: string[] };
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`${styles.editorial}${className ? ` ${className}` : ""}`}
    >
      <h2>{section.heading}</h2>
      <Paragraphs texts={section.content} />
    </section>
  );
}

const navigation = [
  "Marketing Leadership",
  "Client-side marketing",
  "Brand",
  "Product Marketing",
  "Growth & Demand Generation",
  "Digital & Performance",
  "eCommerce",
  "CRM",
  "Content & Social",
  "PR & Communications",
  "Agency",
  "Strategy & Planning",
  "Media Strategy & Comms Planning",
  "Media Agency",
  "Data & Analytics",
  "Research & Insight",
  "Fractional & Interim",
];

export default function SalaryGuidePage() {
  const schema = {
    ...articleSchema(guide),
    image: absoluteUrl("/assets/salary-guide-2026-social.png"),
  };
  const salarySenseCheckWhatsAppUrl = buildWhatsAppUrl({
    number: siteConfig.whatsApp.number,
    message:
      "Hi David, I’d like you to sense-check a salary. The role/title is: [add role]. The salary or budget is: [add figure].",
  });
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Insights", href: "/insights" },
          { name: "Marketing Salary Guide 2026", href: salaryGuidePath },
        ]}
      />
      <article>
        <header className={`section dark ${styles.heroSection}`}>
          <div className={`container ${styles.hero}`}>
            <p className="eyebrow">
              Salary guide · Manchester & North West · 2026
            </p>
            <h1>{guide.title}</h1>
            <p className="lede">
              What should you actually be paying good marketing people in 2026?
            </p>
            <Paragraphs texts={salaryGuideIntro} />
            <p className="meta">
              By <Link href="/about-david-walsh">David Walsh</Link>, Founder,
              Essential Resourcing · Research: September 2026
            </p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="#salary-checker">
                Check my salary
              </Link>
              <a className="text-link" href="#salary-navigation">
                Jump to salaries
              </a>
            </div>
          </div>
        </header>
        <div className="section surface">
          <div className={`container ${styles.guide}`}>
            <section className={styles.editorial}>
              <h2>
                A quick read on the Manchester &amp; North West marketing market
              </h2>
              <Paragraphs texts={salaryGuideMarket} />
            </section>
            <section id="reading-the-tables" className={styles.editorial}>
              <h2>How to read the salary tables</h2>
              <dl className={styles.definitions}>
                {salaryDefinitions.map(([label, text]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{text}</dd>
                  </div>
                ))}
              </dl>
              <Paragraphs texts={salaryGuideBasis} />
            </section>
            <SalaryGuideShare position="top" />
            <SalaryChecker whatsAppUrl={salarySenseCheckWhatsAppUrl} />
            <nav
              id="salary-navigation"
              aria-label="Salary guide sections"
              className={styles.navigation}
            >
              <div className={styles.navigationInner}>
                <h2>Jump to salaries</h2>
                <div
                  className={styles.navigationScroll}
                  role="region"
                  aria-label="Scrollable salary guide section links"
                  // Keyboard users can scroll the single-line navigation.
                  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                  tabIndex={0}
                >
                  <ul>
                    {salaryTables.map((table, i) => (
                      <li key={table.id}>
                        <a
                          href={`#${table.id}`}
                          {...analyticsAttributes(
                            "salary_guide_section_clicked",
                            { salary_section: table.id },
                          )}
                        >
                          {navigation[i]}
                        </a>
                      </li>
                    ))}
                    <li>
                      <a href="#methodology">Methodology</a>
                    </li>
                    <li>
                      <a href="#salary-faqs">Salary FAQs</a>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
            {salaryTables.map((table, tableIndex) => {
              const commentary = salaryCommentary[table.id] || {};
              const typicalColumnIndex = table.headers.findIndex(
                (header) => header === "Typical",
              );
              const scrollHintId = `${table.id}-scroll-hint`;
              return (
                <Fragment key={table.id}>
                  {table.id === "fractional" && (
                    <Editorial section={salaryEditorial.comparison} />
                  )}
                  <section
                    id={table.id}
                    className={`${styles.salarySection} ${
                      tableIndex % 2 === 1 ? styles.salarySectionAlt : ""
                    }`}
                  >
                    <p className={styles.categoryLabel}>
                      Salary category {String(tableIndex + 1).padStart(2, "0")}
                    </p>
                    <h2>{table.title}</h2>
                    {commentary.before &&
                      table.id !== "marketing-leadership" && (
                        <div className={styles.prose}>
                          <Paragraphs texts={commentary.before} />
                        </div>
                      )}
                    <p className="meta">
                      {table.id === "marketing-leadership"
                        ? "Annual gross base salary in GBP. Lower / Typical / Upper are Essential Resourcing planning points, not statistical quartiles. Bonus, LTIP and equity sit separately."
                        : table.id === "fractional"
                          ? "Planning/reference rates in GBP. Day rates and monthly engagements are separate pricing models."
                          : "Annual gross base salary in GBP. Lower / Typical / Upper are planning points, not statistical quartiles."}
                    </p>
                    <p id={scrollHintId} className={styles.scrollHint}>
                      Swipe across to compare every salary column →
                    </p>
                    <div
                      className={styles.tableScroll}
                      role="region"
                      aria-label={`${table.title} table; scroll horizontally if needed`}
                      aria-describedby={scrollHintId}
                      // Keyboard users need focus to scroll a wide salary table.
                      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                      tabIndex={0}
                    >
                      <table className={styles.table}>
                        <caption>
                          {table.title} — Essential Resourcing 2026 planning
                          ranges
                        </caption>
                        <thead>
                          <tr>
                            {table.headers.map((header) => (
                              <th
                                scope="col"
                                key={header}
                                className={
                                  header === "Typical"
                                    ? styles.typicalColumn
                                    : undefined
                                }
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        {salaryRowGroups(table).map((group, groupIndex) => (
                          <tbody
                            key={group.label || table.id}
                            aria-labelledby={
                              group.label
                                ? `${table.id}-group-${groupIndex}`
                                : undefined
                            }
                          >
                            {group.label && (
                              <tr className={styles.groupRow}>
                                <th
                                  id={`${table.id}-group-${groupIndex}`}
                                  scope="rowgroup"
                                  colSpan={table.headers.length}
                                >
                                  {group.label}
                                </th>
                              </tr>
                            )}
                            {group.rows.map((row, index) => (
                              <tr key={`${row[0]}-${index}`}>
                                {row.map((cell, i) =>
                                  i === 0 ? (
                                    <th scope="row" key={i}>
                                      {cell}
                                    </th>
                                  ) : (
                                    <td
                                      key={i}
                                      className={
                                        i === typicalColumnIndex
                                          ? styles.typicalColumn
                                          : undefined
                                      }
                                    >
                                      {cell}
                                    </td>
                                  ),
                                )}
                              </tr>
                            ))}
                          </tbody>
                        ))}
                      </table>
                    </div>
                    {commentary.note && (
                      <p className={styles.note}>
                        {commentary.note}{" "}
                        <a href="#junior-salaries">Read the hours guidance.</a>
                      </p>
                    )}
                    {table.id === "marketing-leadership" &&
                      commentary.before && (
                        <div className={styles.prose}>
                          <Paragraphs texts={commentary.before} />
                        </div>
                      )}
                    {commentary.pullQuote && (
                      <blockquote className={styles.leadershipQuote}>
                        <p>{commentary.pullQuote}</p>
                      </blockquote>
                    )}
                    {commentary.heading && <h3>{commentary.heading}</h3>}
                    {commentary.questions && (
                      <ul className={styles.leadershipQuestions}>
                        {commentary.questions.map((question) => (
                          <li key={question}>{question}</li>
                        ))}
                      </ul>
                    )}
                    {commentary.after && (
                      <div className={styles.prose}>
                        <Paragraphs texts={commentary.after} />
                      </div>
                    )}
                    {commentary.lenses && (
                      <dl className={styles.marketingLenses}>
                        {commentary.lenses.map(({ label, description }) => (
                          <div key={label}>
                            <dt>{label}</dt>
                            <dd>{description}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {commentary.sections?.map((section) => (
                      <div className={styles.prose} key={section.heading}>
                        {commentary.lenses ? (
                          <h4 className={styles.marketingQuestion}>
                            {section.heading}
                          </h4>
                        ) : (
                          <h3>{section.heading}</h3>
                        )}
                        <Paragraphs texts={section.content} />
                      </div>
                    ))}
                    {["product-marketing", "growth-demand-generation"].includes(
                      table.id,
                    ) && (
                      <p className={styles.prose}>
                        For help shaping a marketing brief, explore{" "}
                        <Link href="/specialisms/marketing-and-leadership">
                          Marketing &amp; Leadership
                        </Link>
                        .
                      </p>
                    )}
                    {table.id === "digital-performance" && (
                      <p className={styles.prose}>
                        For a specialist acquisition or performance hire,
                        explore{" "}
                        <Link href="/specialisms/digital-performance-ecommerce">
                          Digital, Performance &amp; eCommerce
                        </Link>
                        .
                      </p>
                    )}
                    {table.id === "content-social" && (
                      <p className={styles.prose}>
                        For a content or reputation-led brief, explore{" "}
                        <Link href="/specialisms/pr-communications-content">
                          PR, Communications &amp; Content
                        </Link>
                        .
                      </p>
                    )}
                    {table.id === "marketing-leadership" && (
                      <p className={styles.prose}>
                        For a senior, confidential or commercially important
                        appointment, this work belongs at the beginning of a{" "}
                        <Link href="/services/retained-search">
                          Retained Search
                        </Link>{" "}
                        conversation.
                      </p>
                    )}
                    {table.id === "fractional" && (
                      <p className={styles.prose}>
                        For help defining that arrangement, explore{" "}
                        <Link href="/services/fractional">
                          Fractional leadership
                        </Link>
                        .
                      </p>
                    )}
                    <a
                      className={`text-link ${styles.back}`}
                      href="#salary-navigation"
                    >
                      Back to salary sections ↑
                    </a>
                  </section>
                </Fragment>
              );
            })}
            <Editorial section={salaryEditorial.junior} id="junior-salaries" />
            <p className={styles.prose}>
              Check the current rates on{" "}
              <a href="https://www.gov.uk/national-minimum-wage-rates">
                GOV.UK: National Minimum Wage and National Living Wage rates
              </a>
              .
            </p>
            <section
              className={`${styles.editorial} ${styles.guidanceSection}`}
            >
              <h2>How to use this guide</h2>
              <div className={styles.guidanceGrid}>
                <div className={styles.guidanceCard}>
                  <p className={styles.guidanceLabel}>For employers</p>
                  <h3>{salaryEditorial.employers.heading}</h3>
                  <Paragraphs texts={salaryEditorial.employers.content} />
                  <p>
                    That’s where{" "}
                    <Link href="/services/market-intelligence-advisory">
                      salary benchmarking and hiring advice
                    </Link>{" "}
                    can help. Once the brief is clear,{" "}
                    <Link href="/services/permanent-recruitment">
                      Permanent Recruitment
                    </Link>{" "}
                    may be the appropriate route for finding the person.
                  </p>
                </div>
                <div className={styles.guidanceCard}>
                  <p className={styles.guidanceLabel}>For candidates</p>
                  <h3>{salaryEditorial.candidates.heading}</h3>
                  <Paragraphs texts={salaryEditorial.candidates.content} />
                  <p>
                    If you’re considering a move, you can{" "}
                    <Link href="/candidates">
                      speak to David about your next step
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </section>
            <section id="salary-sense-check" className={styles.senseCheckPanel}>
              <div className={styles.senseCheckCopy}>
                <p className={styles.guidanceLabel}>A quick second opinion</p>
                <h2 id="salary-sense-check-heading">
                  Want me to sense-check a salary?
                </h2>
                <p id="salary-sense-check-intro">
                  Send me the role or title, the salary or budget, and anything
                  useful about the brief. I’ll tell you whether it broadly
                  stacks up.
                </p>
                <div className={styles.senseCheckActions}>
                  {salarySenseCheckWhatsAppUrl && (
                    <a
                      className={styles.contactLink}
                      href={salarySenseCheckWhatsAppUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Prefer WhatsApp? Message David
                    </a>
                  )}
                  <Link className={styles.contactLink} href="/contact">
                    Use the contact page
                  </Link>
                </div>
              </div>
              <SalarySenseCheckForm />
            </section>
            <Editorial
              section={salaryEditorial.methodology}
              id="methodology"
              className={styles.methodology}
            />
          </div>
        </div>
        <div id="salary-faqs" className={styles.faqAnchor}>
          <FAQAccordion
            faqs={salaryGuideFaqs}
            heading="Manchester & North West marketing salary FAQs"
          />
        </div>
        <div className={`container ${styles.bottomShare}`}>
          <SalaryGuideShare position="bottom" />
        </div>
        <section className={`section dark ${styles.ctaSection}`}>
          <div className={`container ${styles.hero} ${styles.ctaInner}`}>
            <p className="eyebrow">Sense-check the brief</p>
            <h2>Not sure whether your salary stacks up?</h2>
            <p>A salary guide can get you into the right ballpark.</p>
            <p>
              It can’t tell me whether your £65k Head of Marketing brief is
              actually a Head of Marketing role, or a Marketing Director job
              wearing the wrong title.
            </p>
            <p>That’s where the conversation matters.</p>
            <p>
              If you’re hiring in marketing, digital, PR, communications or
              agency leadership, send me the brief before you go to market.
            </p>
            <p>
              If it stacks up, I’ll tell you. If it doesn’t, I’ll tell you that
              too.
            </p>
            <p>That’s kind of the point.</p>
            <div className="button-row">
              <Link
                className="button button-primary"
                href="#salary-sense-check"
              >
                Sense-check a salary with David
              </Link>
            </div>
            <p className="meta">
              Helping Businesses Make Better Hiring Decisions.
            </p>
          </div>
        </section>
      </article>
      <SchemaScript
        data={{
          ...schema,
          inLanguage: "en-GB",
          spatialCoverage: ["Manchester", "North West England"],
          isAccessibleForFree: true,
        }}
      />
    </>
  );
}
