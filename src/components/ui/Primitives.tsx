import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "dark";

function buttonClassName(variant: ButtonVariant, className?: string) {
  return ["button", `button-${variant}`, className].filter(Boolean).join(" ");
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link className={buttonClassName(variant, className)} href={href}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button className={buttonClassName(variant, className)} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <article className={["card", className].filter(Boolean).join(" ")}>{children}</article>;
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={["container", className].filter(Boolean).join(" ")}>{children}</div>;
}

export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={["section", className].filter(Boolean).join(" ")}>{children}</section>;
}

export function Label({ children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props}>{children}</label>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} />;
}

export function ErrorMessage({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="field-error">
      {children}
    </p>
  );
}

export function LoadingSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <span className="loading-spinner" role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
    </span>
  );
}
