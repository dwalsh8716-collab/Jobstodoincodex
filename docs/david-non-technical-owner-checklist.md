# David's Non-Technical Owner Checklist

Audit date: 11 June 2026

## Before Launch

1. Log into Railway.
2. Confirm the website service exists.
3. Confirm the Railway deployment URL opens.
4. Confirm `/api/health` works.
5. Add the production environment variables in Railway.
6. Log into Sanity.
7. Confirm the Sanity project and dataset.
8. Confirm David has editor/admin access.
9. Open `/cms`.
10. Log into the CMS gate.
11. Open `/studio`.
12. Edit and publish one harmless test content item.
13. Check the website still loads.
14. Test the contact form.
15. Test the data/privacy request form.
16. Test WhatsApp links.
17. Test booking link.
18. Confirm LinkedIn link.
19. Confirm email address.
20. Confirm phone number if used.
21. Read the Privacy Policy.
22. Read the Cookie Policy.
23. Read the Candidate Privacy Notice.
24. Get legal review before launch.
25. Confirm Recruiter Labs is not public.
26. Confirm no private candidate data is in Sanity.
27. Confirm no CV files are in the public folder.
28. Confirm Google Analytics/Search Console setup only after consent is approved.
29. Confirm the 123 Reg DNS plan preserves email records.
30. Submit sitemap in Google Search Console after the domain is live.

## Every Month

1. Check Railway logs.
2. Check uptime monitor alerts.
3. Check contact form still works.
4. Check Sanity content for stale jobs.
5. Remove or close old jobs.
6. Check Google Search Console issues.
7. Check GA4 only if consent setup is approved.
8. Check GitHub Dependabot/security alerts.
9. Ask Codex to review any update PRs.
10. Run a monthly site health report.
11. Review privacy/data requests.
12. Check retention review queue if Postgres is enabled.

## When Something Breaks

1. Do not paste passwords or private candidate data into chat.
2. Copy the page URL.
3. Copy the error message if visible.
4. Check Railway logs.
5. Check GitHub Actions.
6. Ask Codex to inspect the failing route or check.
7. If the site is down after a deploy, roll back in Railway if needed.
8. If a form fails, ask people to email David directly while it is fixed.
9. If a privacy/data request fails, handle it manually and record the action.
10. Keep Recruiter Labs off until the issue is understood.

## Things Not To Touch Casually

- DNS email records.
- `DATABASE_URL`.
- Sanity write/read tokens.
- CMS gate secret.
- WhatsApp Business access token.
- Resend API key.
- GitHub Actions secrets.

## Simple Rule

If it affects private data, email, domain, analytics or payments, stop and ask before changing it.

No panic. No faff.
