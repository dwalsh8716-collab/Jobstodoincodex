import Link from "next/link";
import { analyticsAttributes } from "@/lib/analytics";
import styles from "./ServicesLanding.module.css";

type ServiceProduct = {
  title: string;
  href: string;
  proposition: string;
  clientNeed: string;
  description: readonly string[];
  ctaLabel: string;
};

export function ServiceProductCards({
  services,
}: {
  services: readonly ServiceProduct[];
}) {
  return (
    <ul className={styles.productGrid}>
      {services.map((service, index) => (
        <li key={service.href}>
          <Link
            className={styles.productCard}
            href={service.href}
            aria-label={service.ctaLabel}
            {...analyticsAttributes("cta_click", {
              label: service.ctaLabel,
              href: service.href,
              location: "services_products",
            })}
          >
            <span className={styles.number} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{service.title}</h3>
            <p className={styles.proposition}>{service.proposition}</p>
            <p className={styles.thought}>&ldquo;{service.clientNeed}&rdquo;</p>
            <div className={styles.description}>
              {service.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <span className={`text-link ${styles.productLink}`}>
              {service.ctaLabel}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
