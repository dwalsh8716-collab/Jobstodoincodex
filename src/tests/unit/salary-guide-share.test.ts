import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SalaryGuideShare } from "../../../app/insights/manchester-north-west-marketing-salary-guide-2026/SalaryGuideShare";

describe("salary guide sharing landmarks", () => {
  it("distinguishes the top and bottom blocks without changing their visible invitation", () => {
    for (const position of ["top", "bottom"] as const) {
      const html = renderToStaticMarkup(createElement(SalaryGuideShare, { position }));
      expect(html).toContain(`aria-label="Share the salary guide (${position})"`);
      expect(html).toContain("Useful? Send it to someone who’s hiring.");
      expect(html).toContain("Copy link");
    }
  });
});
