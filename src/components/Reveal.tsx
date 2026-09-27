import type { ReactNode } from "react";

type RevealVariant = "rise" | "fade" | "mask";

export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  delay?: number;
  variant?: RevealVariant;
  className?: string;
}) {
  if (!className) return <>{children}</>;

  return (
    <div className={className}>{children}</div>
  );
}
