import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  CMS_SESSION_COOKIE,
  cmsGateConfigured,
  getCmsUsername,
  isCmsSessionValid,
} from "@/lib/cms-auth";
import { imageSizes } from "@/lib/images";
import { siteConfig } from "@/lib/site";

type Props = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
    setup?: string;
  }>;
};

const editableAreas = [
  "Pages, navigation and site settings",
  "Services, CTAs, FAQs and proof points",
  "Jobs, salary snapshots and hiring notes",
  "Insights, case studies, images, video and galleries",
];

export const metadata: Metadata = {
  title: "CMS Login | Essential Resourcing",
  description: "Private editor login for the Essential Resourcing website.",
  alternates: {
    canonical: `${siteConfig.url}/cms`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CmsPage({ searchParams }: Props) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const loggedIn = await isCmsSessionValid(
    cookieStore.get(CMS_SESSION_COOKIE)?.value,
  );
  const redirectTo =
    params?.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/studio";
  const hasSetup = cmsGateConfigured();

  return (
    <section className="section cms-shell">
      <div className="container cms-layout">
        <div className="cms-panel cms-intro">
          <Image
            src={siteConfig.logoDark}
            width={300}
            height={83}
            sizes={imageSizes.logo}
            alt="Essential Resourcing"
          />
          <p className="eyebrow">Private editor area</p>
          <h1>Make the site easy to keep sharp.</h1>
          <p className="lede">
            Log in here, open the CMS, and update the parts of the website that
            need to move with the business.
          </p>
          <div className="cms-checklist" aria-label="Editable website areas">
            {editableAreas.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>

        <div className="cms-panel cms-login-card">
          {loggedIn ? (
            <>
              <span className="tag">Signed in</span>
              <h2>Welcome back, David.</h2>
              <p>
                The front door is open. Go into the CMS Studio to edit content,
                add media, review jobs or prepare launch updates.
              </p>
              <div className="button-row">
                <Link className="button button-primary" href="/studio">
                  Open CMS Studio
                </Link>
                <Link className="button button-secondary" href="/">
                  View website
                </Link>
              </div>
              <form action="/api/cms/logout" method="post">
                <button className="text-link cms-link-button" type="submit">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <span className="tag">Editor login</span>
              <h2>Log in to the CMS.</h2>
              <p>
                This is a simple site-level gate for the preview and live
                website. The connected Sanity account then handles the full
                editor workspace.
              </p>

              {!hasSetup || params?.setup === "missing" ? (
                <div className="cms-alert">
                  Add `CMS_GATE_USERNAME`, `CMS_GATE_PASSWORD` and
                  `CMS_GATE_SECRET` before using the editor gate.
                </div>
              ) : null}

              {params?.error ? (
                <div className="cms-alert">
                  Those details did not match. Try again.
                </div>
              ) : null}

              <form
                className="cms-login-form"
                action="/api/cms/login"
                method="post"
              >
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <label htmlFor="cms-username">
                  <span>Username</span>
                  <input
                    id="cms-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    defaultValue={getCmsUsername()}
                    required
                  />
                </label>
                <label htmlFor="cms-password">
                  <span>Password</span>
                  <input
                    id="cms-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </label>
                <button className="button button-primary" type="submit">
                  Log in and edit
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
