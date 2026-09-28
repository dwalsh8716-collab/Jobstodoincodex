import type { Service } from "@/lib/types";
import styles from "./ServicePresentation.module.css";

export function ServiceOverviewCards({ service }: { service: Service }) {
  const cards = [
    { title: "Who it's for", copy: service.audience },
    { title: "What it solves", copy: service.problemsSolved },
    { title: "When it makes sense", copy: service.whenToUse },
  ];

  return (
    <section className="section surface">
      <div className={`container ${styles.overviewGrid}`}>
        {cards.map((card, index) => (
          <article className={styles.overviewCard} key={card.title}>
            <span className={styles.overviewNumber} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2>{card.title}</h2>
            <p>{card.copy.join(" ")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
