"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { primaryNavigation, serviceNavigation, siteConfig } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function currentFor(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Essential Resourcing home">
        <Image src={siteConfig.logoDark} width={300} height={83} alt="Essential Resourcing" priority />
      </Link>

      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
        <span className="sr-only">Open navigation</span>
      </button>

      <nav className={`primary-nav ${open ? "is-open" : ""}`} id="primary-navigation" aria-label="Primary navigation">
        {primaryNavigation.map((item) =>
          item.label === "Services" ? (
            <div className="nav-group" key={item.href}>
              <Link href={item.href} aria-current={currentFor(item.href) ? "page" : undefined} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
              <div className="nav-dropdown" aria-label="Services menu">
                {serviceNavigation.map((service) => (
                  <Link key={service.href} href={service.href} onClick={() => setOpen(false)}>
                    {service.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              className={"cta" in item && item.cta ? "nav-cta" : undefined}
              href={item.href}
              key={item.href}
              aria-current={currentFor(item.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {"cta" in item && item.cta ? "Talk to David" : item.label}
            </Link>
          )
        )}
      </nav>
    </header>
  );
}
