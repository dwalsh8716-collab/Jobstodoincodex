import Link from "next/link";
import { specialisms } from "@/lib/content";
import styles from "./AudiencePages.module.css";

export function SpecialismRoutes() {
  return (
    <ul className={styles.specialismRoutes}>
      {specialisms.map((area) => (
        <li key={area.slug}>
          <Link href={`/specialisms/${area.slug}`}>
            <h3>{area.title}</h3>
            <p>{area.description}</p>
            <span className="text-link">Explore {area.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
