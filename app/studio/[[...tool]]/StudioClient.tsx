"use client";

import dynamic from "next/dynamic";
import config from "../../../sanity.config";

const NextStudio = dynamic(
  () => import("next-sanity/studio").then((mod) => mod.NextStudio),
  {
    ssr: false,
    loading: () => (
      <section className="section">
        <div className="container empty-state">
          <h1>Loading CMS Studio.</h1>
          <p className="lede">The editor is opening now.</p>
        </div>
      </section>
    ),
  },
);

export function StudioClient() {
  return <NextStudio config={config} />;
}
