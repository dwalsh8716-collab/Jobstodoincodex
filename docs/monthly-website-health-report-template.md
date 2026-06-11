# Monthly Website Health Report

Month:

Prepared by:

## Executive Summary

Overall status:

- Green: safe
- Amber: needs attention
- Red: urgent

Plain-English summary:

```txt
Add five to eight lines. Say what is healthy, what needs attention and what
David needs to decide. No jargon. No fake green ticks.
```

## Website Health

| Check | Status | Notes |
| --- | --- | --- |
| Homepage loads |  |  |
| Key pages load |  |  |
| Contact form works |  |  |
| Booking links work |  |  |
| WhatsApp links work |  |  |
| Salary guide form status |  |  |
| CMS opens for editors |  |  |
| Railway latest deployment healthy |  |  |

Key pages to spot-check:

- `/`
- `/services`
- `/services/leadership-search`
- `/services/strategic-interim`
- `/jobs`
- `/contact`
- `/sitemap.xml`
- `/robots.txt`

## Performance

| Check | Status | Notes |
| --- | --- | --- |
| `npm run verify` passed |  |  |
| Performance budget passed |  |  |
| PageSpeed/Lighthouse reviewed |  |  |
| Core Web Vitals checked in Search Console |  |  |
| Slow pages found |  |  |
| Large image/video concern |  |  |
| Public bundle concern |  |  |

Plain-English note:

```txt
Say whether the site still feels quick, whether anything is getting heavy and
what should be fixed first if speed has slipped.
```

## SEO And GEO

| Check | Status | Notes |
| --- | --- | --- |
| Sitemap loads |  |  |
| Robots loads |  |  |
| Search Console coverage checked |  |  |
| Indexed pages reviewed |  |  |
| Missing metadata found |  |  |
| Schema issues found |  |  |
| Broken links found |  |  |
| `llms.txt` and `llms-full.txt` load |  |  |

Search Console notes:

```txt
List any indexing, crawl, Core Web Vitals or enhancement issues. If Search
Console is not set up yet, say that plainly.
```

## Security And Privacy

| Check | Status | Notes |
| --- | --- | --- |
| `npm audit --audit-level=moderate` passed |  |  |
| Dependabot/security alerts reviewed |  |  |
| Privacy Policy still accurate |  |  |
| Cookie Policy still accurate |  |  |
| Candidate Privacy Notice still accurate |  |  |
| PII/CV exposure spot-check done |  |  |
| Sanity public/private boundary still clean |  |  |
| Recruiter Labs routes hidden/noindexed |  |  |
| Consent banner and Consent Mode checked |  |  |

No fake compliance note:

```txt
If a privacy/legal item needs review, mark it Amber or Red. Do not call it done
just because the page exists.
```

## CMS Content Health

| Check | Status | Notes |
| --- | --- | --- |
| Stale pages reviewed |  |  |
| Drafts reviewed |  |  |
| Broken images checked |  |  |
| Missing alt text checked |  |  |
| Jobs to close/remove checked |  |  |
| Salary snapshots/guides reviewed |  |  |
| Case studies/proof still accurate |  |  |

Content actions for David:

-

## Leads And Forms

| Check | Status | Notes |
| --- | --- | --- |
| Contact form browser test |  |  |
| Candidate/application route test |  |  |
| Salary guide form test |  |  |
| Email notifications checked |  |  |
| Database writes checked, if Railway Postgres is live |  |  |
| WhatsApp links tested on mobile |  |  |
| Booking journey tested |  |  |

Do not put real candidate/client private details in this report.

## Actions

### Urgent Fixes

-

### Recommended Updates

-

### Content Updates

-

### Dependency Updates

-

### Manual Checks For David

-

## How To Run The Technical Check

Use:

```bash
npm run health:monthly
```

For a dry run that prints the checks without running them:

```bash
npm run health:monthly -- --dry-run
```

Then add the external/manual checks from Railway, Search Console, GA4, uptime
monitoring and Sanity. The script helps. It does not replace judgement.
