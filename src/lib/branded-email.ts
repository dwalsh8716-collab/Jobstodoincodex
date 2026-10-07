import { siteConfig } from "./site";

export function essentialEmailSender(address: string) {
  return `Essential Resourcing <${address}>`;
}

export function essentialEmailHeaderHtml() {
  return `<div style="border-bottom:1px solid #dedede;padding-bottom:20px;margin-bottom:28px"><img src="${siteConfig.url}/assets/essential-resourcing-email-logo.png" width="216" height="60" alt="Essential Resourcing" style="display:block;width:216px;height:60px;border:0"></div>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function renderLine(line: string) {
  return line
    .split(/(https?:\/\/\S+)/g)
    .map((part) =>
      /^https?:\/\//.test(part)
        ? `<a href="${escapeHtml(part)}" style="color:#171717;text-decoration:underline">${escapeHtml(part)}</a>`
        : escapeHtml(part),
    )
    .join("");
}

export function essentialEmailHtml(text: string) {
  const paragraphs = text
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => `<p style="margin:0 0 18px">${paragraph.split("\n").map(renderLine).join("<br>")}</p>`)
    .join("");

  return `<!doctype html><html lang="en"><body style="margin:0;padding:24px;background:#fff;color:#171717;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55"><div style="max-width:560px;margin:0 auto">${essentialEmailHeaderHtml()}${paragraphs}</div></body></html>`;
}
