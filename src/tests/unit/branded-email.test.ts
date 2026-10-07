import { describe, expect, it } from "vitest";
import { essentialEmailHtml, essentialEmailSender } from "@/lib/branded-email";

describe("website email branding", () => {
  it("uses a clear sender name and the approved full logo", () => {
    expect(essentialEmailSender("website@example.com")).toBe(
      "Essential Resourcing <website@example.com>",
    );
    expect(essentialEmailHtml("Hello\n\nThanks.")).toContain(
      "/assets/essential-resourcing-email-logo.png",
    );
  });

  it("preserves paragraphs and safely escapes form content", () => {
    const html = essentialEmailHtml(
      'Name: <script>alert("x")</script>\n\nPrivacy: https://example.com/privacy?a=1&b=2',
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("https://example.com/privacy?a=1&amp;b=2");
    expect(html).toContain("</p><p");
  });
});
