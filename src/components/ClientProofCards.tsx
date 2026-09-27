import Image from "next/image";
import Link from "next/link";
import { analyticsAttributes } from "@/lib/analytics";
import { clientProofQuotes } from "@/lib/content";
import type { ClientProofQuote } from "@/lib/types";

type ClientProofCardsProps = {
  location: string;
  variant?: "inline" | "section";
};

function ClientProofCard({
  item,
  location,
}: {
  item: ClientProofQuote;
  location: string;
}) {
  return (
    <article className="card proof-card client-proof-card">
      <div className="client-proof-card-head">
        <Image
          className="client-proof-person"
          src={item.personImage}
          alt={item.personImageAlt}
          width={96}
          height={96}
          sizes="96px"
        />
        <Link
          className="client-proof-logo-link"
          href={item.companyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${item.company}. Opens in a new tab.`}
          {...analyticsAttributes("cta_click", {
            label: item.company,
            href: item.companyUrl,
            location,
            cta_text: item.company,
            destination: "client_proof_company",
          })}
        >
          <Image
            className="client-proof-logo"
            src={item.brandLogo}
            alt={item.brandLogoAlt}
            width={196}
            height={76}
            sizes="196px"
          />
        </Link>
      </div>
      <span className="tag">{item.proofPoint}</span>
      <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
      <footer>
        <strong>{item.name}</strong>
        <span>
          {item.role}, {item.company}
        </span>
      </footer>
    </article>
  );
}

export function ClientProofCards({
  location,
  variant = "inline",
}: ClientProofCardsProps) {
  const cards = clientProofQuotes.map((item) => (
    <ClientProofCard key={item.name} item={item} location={location} />
  ));

  if (variant === "section") {
    return (
      <section className="section client-proof-section surface">
        <div className="container section-heading">
          <p className="eyebrow">Client proof</p>
          <h2>Two permissioned examples while the fuller case studies are written.</h2>
          <p className="lede">
            Named client quotes, linked to the relevant businesses, with proper
            case studies to follow once the detail is written up.
          </p>
        </div>
        <div className="container client-proof-grid">{cards}</div>
      </section>
    );
  }

  return <>{cards}</>;
}
