"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { trackEvent } from "@/lib/analytics";
import {
  comparisonRoles,
  formatSalary,
  parseAnnualSalary,
  resultCopy,
  salaryResultBand,
  salaryScale,
  searchCheckerRoles,
  type CheckerRole,
} from "@/lib/salary-checker";
import styles from "./salary-product.module.css";

export function SalaryChecker({ whatsAppUrl }: { whatsAppUrl: string }) {
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const roleInput = useRef<HTMLInputElement>(null);
  const salaryInput = useRef<HTMLInputElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const started = useRef(false);
  const viewed = useRef(false);
  const focusAfterReset = useRef(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CheckerRole | null>(null);
  const [salary, setSalary] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [error, setError] = useState<{
    field: "role" | "salary";
    message: string;
  } | null>(null);
  const [result, setResult] = useState<{
    role: CheckerRole;
    salary: number;
  } | null>(null);
  const matches = searchCheckerRoles(query);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewed.current) {
          viewed.current = true;
          trackEvent("salary_checker_view");
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (open && active >= 0)
      list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  useEffect(() => {
    if (result) {
      resultHeading.current?.focus({ preventScroll: true });
      resultHeading.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    } else if (focusAfterReset.current) {
      focusAfterReset.current = false;
      roleInput.current?.focus({ preventScroll: true });
      roleInput.current?.scrollIntoView({
        block: "center",
        behavior: "instant",
      });
    }
  }, [result]);

  function start() {
    if (!started.current) {
      started.current = true;
      trackEvent("salary_checker_started");
    }
  }

  function choose(role: CheckerRole) {
    setSelected(role);
    setQuery(role.title);
    setOpen(false);
    setActive(-1);
    setResult(null);
    setError(null);
    trackEvent("salary_checker_role_selected", {
      salary_section: role.sectionId,
      role_slug: role.id,
    });
  }

  function onKeys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((value) =>
        event.key === "ArrowDown"
          ? Math.min(value + 1, matches.length - 1)
          : Math.max(0, value - 1),
      );
    } else if (
      event.key === "Enter" &&
      open &&
      active >= 0 &&
      matches[active]
    ) {
      event.preventDefault();
      choose(matches[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (event.key === "Tab") setOpen(false);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setOpen(false);
    if (!selected) {
      setError({
        field: "role",
        message:
          "Choose a role from the suggestions so we use the right planning range.",
      });
      roleInput.current?.focus();
      return;
    }
    const amount = parseAnnualSalary(salary);
    if (amount === null) {
      setError({
        field: "salary",
        message:
          "Add your annual base salary in pounds, for example 50,000. Use a positive amount, without bonus or benefits.",
      });
      salaryInput.current?.focus();
      return;
    }
    setError(null);
    setResult({ role: selected, salary: amount });
    trackEvent("salary_checker_completed", {
      salary_section: selected.sectionId,
      role_slug: selected.id,
      result_band: salaryResultBand(selected, amount),
    });
  }

  const band = result ? salaryResultBand(result.role, result.salary) : null;
  const scale = result ? salaryScale(result.role, result.salary) : null;
  const comparisons = result ? comparisonRoles(result.role, result.salary) : [];

  return (
    <section
      id="salary-checker"
      ref={root}
      className={styles.checker}
      aria-labelledby={`${id}-heading`}
      data-clarity-mask="true"
      data-hj-suppress
    >
      <p className="eyebrow">A starting point. Not a verdict.</p>
      <h2 id={`${id}-heading`}>Where does your salary sit?</h2>
      <p className={styles.intro}>
        No magic AI number. Just the actual Manchester &amp; North West planning
        ranges from this guide.
      </p>
      <p className={styles.intro}>
        Pick the closest role, add your salary and I&apos;ll show you where it
        sits.
      </p>
      <form
        onSubmit={submit}
        noValidate
        className={styles.checkerForm}
        onFocus={start}
        aria-label="Salary checker"
      >
        <div className={`form-row ${styles.roleField}`}>
          <label htmlFor={`${id}-role`}>Your role</label>
          <input
            ref={roleInput}
            id={`${id}-role`}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={`${id}-options`}
            aria-activedescendant={
              open && active >= 0 ? `${id}-option-${active}` : undefined
            }
            aria-required="true"
            aria-invalid={error?.field === "role"}
            aria-describedby={
              error?.field === "role" ? `${id}-error` : `${id}-role-help`
            }
            value={query}
            autoComplete="off"
            maxLength={140}
            placeholder="For example, Marketing Manager"
            onKeyDown={onKeys}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(null);
              setResult(null);
              setOpen(true);
              setActive(-1);
              setError(null);
            }}
          />
          <p id={`${id}-role-help`} className={styles.help}>
            {selected ? selected.section : "Search by title or discipline."}
          </p>
          {open && (
            <div className={styles.suggestions}>
              <ul
                ref={list}
                id={`${id}-options`}
                role="listbox"
                aria-label="Matching guide roles"
              >
                {matches.map((role, index) => (
                  <li
                    key={role.id}
                    id={`${id}-option-${index}`}
                    role="option"
                    aria-selected={index === active}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(role)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") choose(role);
                    }}
                  >
                    <strong>{role.title}</strong>
                    <span>{role.section}</span>
                  </li>
                ))}
              </ul>
              <span className="sr-only" role="status">
                {matches.length} matching roles
              </span>
            </div>
          )}
          {matches.length === 0 && (
            <p className={styles.noMatch}>
              Can&apos;t see your exact title? Welcome to marketing 😂 Pick the
              closest one, or{" "}
              <a
                href="#salary-sense-check"
                onClick={() => trackEvent("salary_checker_sense_check_clicked")}
              >
                send me the actual brief
              </a>{" "}
              and I&apos;ll have a look.
            </p>
          )}
        </div>
        <div className="form-row">
          <label htmlFor={`${id}-salary`}>Your current salary</label>
          <div className={styles.moneyInput}>
            <span aria-hidden="true">£</span>
            <input
              ref={salaryInput}
              id={`${id}-salary`}
              inputMode="decimal"
              autoComplete="off"
              maxLength={16}
              value={salary}
              aria-required="true"
              aria-invalid={error?.field === "salary"}
              aria-describedby={`${id}-salary-help${error?.field === "salary" ? ` ${id}-error` : ""}`}
              placeholder="50,000"
              onChange={(event) => {
                setSalary(event.target.value.replace(/^\s*£\s*/, ""));
                setResult(null);
                setError(null);
              }}
            />
          </div>
          <p id={`${id}-salary-help`} className={styles.help}>
            Annual gross base salary in GBP. No bonus or benefits.
          </p>
        </div>
        <button
          className={`button button-primary ${styles.checkButton}`}
          type="submit"
        >
          See where I sit
        </button>
        {error && (
          <p id={`${id}-error`} className={styles.error} role="alert">
            {error.message}
          </p>
        )}
      </form>
      <div className={styles.caveat}>
        <p>
          Job titles only tell us so much. Team, budget, scope and commercial
          responsibility can move the benchmark quite a bit. The calculator is a
          starting point. For the actual recruiter answer, I need to understand
          the job.
        </p>
        <p>
          Your salary stays in this page while you use it. It isn&apos;t saved
          or sent to us.
        </p>
        <a href="#fractional">
          Looking for Fractional or Interim rates? View that section.
        </a>
      </div>
      {result && band && scale && (
        <div className={styles.result}>
          <p className="eyebrow">{result.role.section}</p>
          <h3 ref={resultHeading} tabIndex={-1}>
            {result.role.title}: your salary is {formatSalary(result.salary)}
          </h3>
          <dl className={styles.points}>
            {result.role.labels.map((label, index) => (
              <div key={index}>
                <dt>{["Lower", "Typical", "Upper"][index]}</dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
          <svg
            className={styles.range}
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <line
              x1="0"
              x2="1000"
              y1="62"
              y2="62"
              className={styles.rangeTrack}
            />
            <line
              x1={scale.position(result.role.lower) * 10}
              x2={scale.position(result.role.upper) * 10}
              y1="62"
              y2="62"
              className={styles.rangeBand}
            />
            {[result.role.lower, result.role.typical, result.role.upper].map(
              (point, i) => (
                <line
                  key={i}
                  x1={scale.position(point) * 10}
                  x2={scale.position(point) * 10}
                  y1="48"
                  y2="78"
                  className={styles.rangeTick}
                />
              ),
            )}
            <line
              x1={scale.position(result.salary) * 10}
              x2={scale.position(result.salary) * 10}
              y1="8"
              y2="62"
              className={styles.youTick}
            />
          </svg>
          <p className={styles.help}>
            The tall marker is you. The highlighted line runs from Lower to
            Upper; the middle tick is Typical. The scale extends when needed to
            include your salary.
          </p>
          <h4>{resultCopy[band].heading}</h4>
          <p>{resultCopy[band].text}</p>
          {result.role.upperOpen && (
            <p>
              The guide shows {result.role.labels[2]} here. The chart uses{" "}
              {formatSalary(result.role.upper)} as its reference point, not a
              ceiling.
            </p>
          )}
          <p className={styles.help}>
            These are planning points, not percentiles or a judgement of what
            you should earn. &ldquo;Around Typical&rdquo; means within 5% of
            that point, while staying inside Lower–Upper.
          </p>
          <h4>Other roles around your salary</h4>
          <p>
            Interesting, not definitive. Roles can sit around the same salary
            for completely different reasons. Have a look at the actual remit
            before deciding they&apos;re comparable.
          </p>
          {comparisons.length > 0 ? (
            <ul className={styles.comparisons}>
              {comparisons.map((role) => (
                <li key={role.id}>
                  <a
                    href={`#${role.sectionId}`}
                    onClick={() =>
                      trackEvent("salary_checker_comparison_clicked", {
                        role_slug: role.id,
                        salary_section: role.sectionId,
                      })
                    }
                  >
                    {role.title}
                    <span>{role.section}</span>
                  </a>
                  <dl className={styles.points}>
                    {role.labels.map((label, i) => (
                      <div key={i}>
                        <dt>{["Lower", "Typical", "Upper"][i]}</dt>
                        <dd>{label}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No close comparisons in this guide at that salary. I&apos;d rather
              say that than force a match.
            </p>
          )}
          <div className={styles.resultCta}>
            <h4>
              Want the recruiter answer rather than the calculator answer?
            </h4>
            <p>
              If your title says one thing but the job has quietly become
              something much bigger, send me the role and what you&apos;re
              actually doing. I&apos;ll tell you whether it broadly stacks up.
            </p>
            <div className="button-row">
              <a
                className="button button-primary"
                href="#salary-sense-check"
                onClick={() =>
                  trackEvent("salary_checker_sense_check_clicked", {
                    salary_section: result.role.sectionId,
                  })
                }
              >
                Sense-check my salary
              </a>
              <a
                className="text-link"
                href={whatsAppUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackEvent("salary_checker_whatsapp_clicked", {
                    salary_section: result.role.sectionId,
                  })
                }
              >
                WhatsApp David
              </a>
            </div>
          </div>
          <button
            className={styles.textButton}
            type="button"
            onClick={() => {
              focusAfterReset.current = true;
              setResult(null);
              trackEvent("salary_checker_reset");
            }}
          >
            Check another salary
          </button>
        </div>
      )}
      <noscript>
        <p>
          The salary checker needs JavaScript. All the approved salary tables
          are available below without it.
        </p>
      </noscript>
    </section>
  );
}
