import styles from "./EssentialApproach.module.css";

export function ServiceComparison({
  dimensions,
  services,
}: {
  dimensions: readonly string[];
  services: readonly { title: string; comparison: readonly string[] }[];
}) {
  return (
    <div className={styles.comparison}>
      {/* One semantic description list per service, reflowed without duplicate copy. */}
      <div className={styles.comparisonLabels} aria-hidden="true">
        <p>Service</p>
        {dimensions.map((dimension) => (
          <p key={dimension}>{dimension}</p>
        ))}
      </div>
      {services.map((service) => (
        <section className={styles.comparisonService} key={service.title}>
          <h3>{service.title}</h3>
          <dl>
            {dimensions.map((dimension, index) => (
              <div key={dimension}>
                <dt>{dimension}</dt>
                <dd>{service.comparison[index]}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
