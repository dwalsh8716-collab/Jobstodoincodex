import Link from "next/link";
import { breadcrumbSchema } from "@/lib/seo";
import { SchemaScript } from "./SchemaScript";

export function Breadcrumbs({ items }: { items: Array<{ name: string; href: string }> }) {
  const allItems = [{ name: "Home", href: "/" }, ...items];

  return (
    <>
      <nav className="breadcrumbs container" aria-label="Breadcrumbs">
        {allItems.map((item, index) => (
          <span key={item.href}>
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            <Link href={item.href}>{item.name}</Link>
          </span>
        ))}
      </nav>
      <SchemaScript data={breadcrumbSchema(allItems)} />
    </>
  );
}
