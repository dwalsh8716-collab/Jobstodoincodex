# 123 Reg Domain Switch

## Status

Manual action required.

Do not change DNS until the Railway deployment works on its Railway-generated
domain.

Production domain:

```txt
essentialresourcing.co.uk
www.essentialresourcing.co.uk
```

Recommended canonical domain:

```txt
https://essentialresourcing.co.uk
```

Use the cleaner apex domain as canonical, with `www` redirected to it, unless
Railway or the final DNS setup makes the opposite safer.

## Non-Negotiables

- Do not share the 123 Reg password with Codex, Gemini, ChatGPT or any AI tool.
- Do not delete email records.
- Do not guess DNS records.
- Do not change DNS before taking a screenshot or copy of the current records.
- Do not switch the live domain until Railway preview is working.

Changing DNS can break the website and email. Treat this like live production
work.

## Before You Touch DNS

Confirm who hosts Essential Resourcing email.

If the email provider is unknown, stop and check first.

Before changing anything, record the current DNS setup:

- A records
- AAAA records
- CNAME records
- MX records
- TXT records
- SPF records
- DKIM records
- DMARC records
- Microsoft 365 records
- Google Workspace records
- mailbox provider verification records

Keep screenshots or a copied text record of the current state.

## Railway First

In Railway:

1. Deploy the app from GitHub.
2. Confirm the Railway-generated domain works.
3. Confirm `/api/health` returns a healthy response.
4. Confirm `/cms` opens the CMS gate.
5. Confirm `/studio` redirects to `/cms` until signed in.
6. Confirm the contact form can be tested safely.
7. Open the web service.
8. Go to Settings / Networking / Domains.
9. Add:
   - `essentialresourcing.co.uk`
   - `www.essentialresourcing.co.uk`
10. Copy the exact DNS records Railway shows.

Railway must generate the record values. Do not make them up.

Railway docs:

```txt
https://docs.railway.com/networking/public-networking
```

## 123 Reg Steps

1. Log in to 123 Reg.
2. Go to Domains / Manage All.
3. Select `essentialresourcing.co.uk`.
4. Open Manage DNS / Advanced DNS.
5. Screenshot or copy every existing DNS record.
6. Identify website records that point to the old host.
7. Identify email records that must stay.
8. Add the exact DNS records Railway provides.
9. If Railway provides a `www` CNAME, add it exactly.
10. If Railway provides an apex/root record, add it exactly.
11. Remove only conflicting old website A/CNAME records.
12. Do not remove MX, SPF, DKIM, DMARC or mailbox verification records.
13. Save changes.
14. Wait for DNS propagation.
15. Confirm Railway SSL becomes active.
16. Test the apex domain.
17. Test the `www` domain.
18. Confirm one version redirects to the canonical version.
19. Send and receive a test email.
20. Update `NEXT_PUBLIC_SITE_URL` to the canonical production URL.
21. Redeploy the Railway service.
22. Submit the final sitemap in Google Search Console.

## Email Records To Protect

Do not delete or edit these unless David explicitly confirms the email provider
and the replacement records:

- MX records
- SPF TXT records
- DKIM TXT or CNAME records
- DMARC TXT records
- Microsoft 365 autodiscover or verification records
- Google Workspace records
- mailbox provider verification records

## After DNS Propagates

Test:

- `https://essentialresourcing.co.uk`
- `https://www.essentialresourcing.co.uk`
- `https://essentialresourcing.co.uk/api/health`
- `https://essentialresourcing.co.uk/sitemap.xml`
- `https://essentialresourcing.co.uk/robots.txt`
- `https://essentialresourcing.co.uk/cms`
- contact form
- WhatsApp link
- email sending
- email receiving

## Rollback Plan

If the website fails:

1. Do not delete more records.
2. Check Railway deployment logs.
3. Check Railway domain verification.
4. Revert only the website A/CNAME records to the saved previous values if
   needed.
5. Keep email records unchanged.

No guesswork. No password sharing. No broken email.
