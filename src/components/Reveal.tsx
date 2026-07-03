"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type RevealVariant = "rise" | "fade" | "mask";

let sharedRevealObserver: IntersectionObserver | null = null;

function revealElement(element: HTMLElement) {
  element.classList.add("is-revealed");
}

function shouldSkipMotion() {
  return (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function revealObserver() {
  if (!sharedRevealObserver) {
    sharedRevealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          revealElement(entry.target as HTMLElement);
          sharedRevealObserver?.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 },
    );
  }

  return sharedRevealObserver;
}

export function Reveal({
  children,
  delay = 0,
  variant = "rise",
  className,
}: {
  children: ReactNode;
  delay?: number;
  variant?: RevealVariant;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (shouldSkipMotion()) {
      revealElement(element);
      return;
    }

    const observer = revealObserver();
    observer.observe(element);
    return () => observer.unobserve(element);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      data-reveal={variant}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
