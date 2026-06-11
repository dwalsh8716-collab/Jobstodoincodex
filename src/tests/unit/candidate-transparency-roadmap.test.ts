import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("candidate transparency roadmap", () => {
  it("documents the full candidate transparency build plan without launching private features", () => {
    const roadmap = readFileSync(
      "docs/recruiter-labs-candidate-transparency-roadmap.md",
      "utf8",
    );

    expect(roadmap).toContain("Product Vision");
    expect(roadmap).toContain("Build Order");
    expect(roadmap).toContain("Dependencies");
    expect(roadmap).toContain("What Can Go Public Soon");
    expect(roadmap).toContain("What Must Stay Private");
    expect(roadmap).toContain("Backend And Storage Requirements");
    expect(roadmap).toContain("Legal And Privacy Review");
    expect(roadmap).toContain("Suggested GitHub Issue Order");
    expect(roadmap).toContain("clear jobs");
    expect(roadmap).toContain("salary or rate");
    expect(roadmap).toContain("hybrid reality");
    expect(roadmap).toContain("WhatsApp quick question");
    expect(roadmap).toContain("candidate transparency score");
    expect(roadmap).toContain("CV upload");
    expect(roadmap).toContain("LinkedIn/profile URL");
    expect(roadmap).toContain("feature stays off");
    expect(roadmap).toContain("not legal advice");
  });

  it("keeps the public/private data boundary explicit", () => {
    const roadmap = readFileSync(
      "docs/recruiter-labs-candidate-transparency-roadmap.md",
      "utf8",
    );

    expect(roadmap).toContain("Sanity must not hold candidate names");
    expect(roadmap).toContain("Private candidate data belongs in Postgres");
    expect(roadmap).toContain("Must stay blocked");
    expect(roadmap).toContain("Phone first for bad news");
    expect(roadmap).not.toContain("enable CV upload now");
    expect(roadmap).not.toContain("store WhatsApp message bodies");
  });

  it("links the roadmap from the existing docs index and foundation doc", () => {
    const readme = readFileSync("README.md", "utf8");
    const foundation = readFileSync(
      "docs/recruiter-labs-candidate-transparency.md",
      "utf8",
    );

    expect(readme).toContain(
      "docs/recruiter-labs-candidate-transparency-roadmap.md",
    );
    expect(foundation).toContain(
      "docs/recruiter-labs-candidate-transparency-roadmap.md",
    );
  });
});
