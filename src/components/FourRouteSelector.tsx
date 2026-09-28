import Link from "next/link";
import { analyticsAttributes } from "@/lib/analytics";
import styles from "./EssentialApproach.module.css";

export type ServiceRoute = {
  title: string;
  href: string;
  thought: string;
  description: string;
};

export function FourRouteSelector({
  routes,
}: {
  routes: readonly ServiceRoute[];
}) {
  return (
    <div className={styles.selector}>
      <p className={styles.origin}>Your hiring problem</p>
      <ul className={styles.routeGrid}>
        {routes.map((route, index) => (
          <li key={route.href}>
            <Link
              className={styles.routeCard}
              href={route.href}
              aria-label={`Explore ${route.title}`}
              {...analyticsAttributes("cta_click", {
                label: `Explore ${route.title}`,
                href: route.href,
                location: "how_essential_works_routes",
              })}
            >
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{route.title}</h3>
              <p className={styles.thought}>&ldquo;{route.thought}&rdquo;</p>
              <p className={styles.routeDescription}>{route.description}</p>
              <span className={`text-link ${styles.routeLink}`}>
                Explore {route.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
