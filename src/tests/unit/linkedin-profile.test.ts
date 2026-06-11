import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { organisationSchema, personSchema } from "@/lib/seo";
import { defaultLinkedInProfileUrl, siteConfig } from "@/lib/site";

const readProjectFile = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("David Walsh LinkedIn profile integration", () => {
  it("uses one central public LinkedIn profile URL", () => {
    expect(defaultLinkedInProfileUrl).toBe(
      "https://www.linkedin.com/in/davidwalshrecruiter/",
    );
    expect(siteConfig.linkedIn).toBe(defaultLinkedInProfileUrl);
    expect(siteConfig.linkedInLabel).toBe("Connect with David on LinkedIn");
  });

  it("adds the LinkedIn profile to person and organisation sameAs data", () => {
    expect(personSchema()).toMatchObject({
      sameAs: [defaultLinkedInProfileUrl],
    });
    expect(organisationSchema()).toMatchObject({
      sameAs: [defaultLinkedInProfileUrl],
    });
  });

  it("places LinkedIn only on founder, contact, footer and author trust surfaces", () => {
    expect(readProjectFile("app/about-david-walsh/page.tsx")).toContain(
      'location="about_page"',
    );
    expect(readProjectFile("app/page.tsx")).toContain(
      'location="homepage_founder_block"',
    );
    expect(readProjectFile("app/contact/page.tsx")).toContain(
      'location="contact_page"',
    );
    expect(readProjectFile("src/components/Footer.tsx")).toContain(
      'location="footer"',
    );
    expect(readProjectFile("app/insights/[slug]/page.tsx")).toContain(
      'location="author_bio"',
    );
    expect(readProjectFile("app/insights/[slug]/page.tsx")).toContain(
      ".includes(siteConfig.founder.toLowerCase())",
    );

    expect(readProjectFile("app/services/[slug]/page.tsx")).not.toContain(
      "LinkedInProfileLink",
    );
    expect(readProjectFile("app/jobs/[slug]/page.tsx")).not.toContain(
      "LinkedInProfileLink",
    );
  });

  it("keeps LinkedIn profile links as plain links, not embedded tracking widgets", () => {
    const profileLink = readProjectFile("src/components/LinkedInProfileLink.tsx");

    expect(profileLink).toContain('target="_blank"');
    expect(profileLink).toContain('rel="noopener noreferrer"');
    expect(profileLink).toContain('"linkedin_click"');
    expect(profileLink).not.toContain("linkedin-insight");
    expect(profileLink).not.toContain("lintrk(");
  });

  it("adds editor-facing Sanity settings for the public profile link", () => {
    const schema = readProjectFile("sanity/schemas/index.ts");
    const query = readProjectFile("src/lib/sanity-queries.ts");
    const editorGuide = readProjectFile("docs/sanity-editor-guide.md");

    for (const field of [
      "linkedInProfileUrl",
      "linkedInButtonLabel",
      "showLinkedInInFooter",
      "showLinkedInOnContactPage",
      "showLinkedInInFounderBlock",
    ]) {
      expect(schema).toContain(field);
      expect(query).toContain(field);
    }

    expect(editorGuide).toContain("LinkedIn Profile Settings");
    expect(editorGuide).toContain(defaultLinkedInProfileUrl);
  });
});
