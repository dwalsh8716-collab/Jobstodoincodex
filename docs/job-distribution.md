# Job distribution: operating notes

The published Sanity job record is the source of truth. A job appears in Google-ready pages, the jobs sitemap and the XML feeds only while it is live, complete, indexable and not past its closing date. Drafts, closed, expired and `noIndex` jobs are excluded. The feed reads the **published** Sanity perspective directly and returns 503 if Sanity is unavailable; it does not serve local placeholder jobs.

## What is ready

- Each eligible `/jobs/[slug]` page has one JobPosting JSON-LD entity using the visible advert, canonical URL, real posting and closing dates, employment type, location and verified public salary. A fixed salary is a single value; a genuine range uses min/max. Confidential employers are represented as `confidential`, never as a fabricated client.
- The existing jobs sitemap remains the discovery route for Google. `GET /feeds/jobs.xml` is the general XML feed for prospective distribution partners. `GET /feeds/talent.xml` is a Talent-style adapter; it excludes anonymous-client jobs because Talent's published specification requests the actual company name. Both are UTF-8, generated from published Sanity records and uncached.
- The Sanity job editor has a read-only distribution panel. It checks the public website before offering share links or post copy. It reports **eligibility**, not a promise of indexing or board acceptance.
- Live public job pages offer LinkedIn, X, copy-link and supported-device native sharing. Candidate application emails can include a sanitised referring hostname and UTM source, medium and campaign; no full referrer URL is stored.
- The signed Sanity webhook revalidates pages, sitemap and feeds, submits IndexNow, and notifies Google's Indexing API when a published job is updated or removed. Closing a published job sends a removal notification. Notification failure is logged and does not block publishing.
- Google's Indexing API is enabled in the dedicated `essential-resourcing-jobs` Cloud project. A dedicated service account has Search Console owner access to the domain property, and its JSON key is stored only in Railway's production secret variable. The project-level key-creation exception was removed after setup; the inherited block is enforced again. Both initial live jobs received successful `URL_UPDATED` API responses on 1 October 2026. This confirms notification, not indexing or placement in Google for Jobs.

## Still requires external setup

1. **Google Indexing API:** configured. Keep `GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON` server-only in Railway; never put it in Sanity, a public env var or Git. Google still decides whether to index or display a page. Review notification errors in Railway logs after the next real job edit; do not publish a fake vacancy to test it.
2. **Sanity webhook:** the existing signed webhook calls `/api/webhooks/sanity` for published create, update and delete events. Its projection includes `_id`, `_type`, `_rev`, and the current or previous slug, so a deleted job can notify Google about its former URL. Recent deliveries returned HTTP 200. Keep `SANITY_WEBHOOK_SECRET` matched on both sides; the new Google notification path will be proven end to end at the next genuine job change.
3. **Adzuna:** an organic feed enquiry was submitted on 1 October 2026. Await its approval and confirmation of feed format, category mapping, update interval and confidential-client treatment before providing `https://essentialresourcing.co.uk/feeds/jobs.xml`. The endpoint is a candidate feed, **not yet an active Adzuna integration**. Build an adapter only against its agreed specification.
4. **Talent.com:** an employer/feed enquiry was submitted on 1 October 2026. Await onboarding and exact XML field mapping before providing `https://essentialresourcing.co.uk/feeds/talent.xml`. Anonymous-client roles currently remain out of that feed because its published specification asks for the actual company name. Do not reveal a client name merely to satisfy a distributor.
5. **LinkedIn Jobs and Indeed:** no automatic job posting or API connection is configured. The CMS prepares manual share copy only. Confirm eligibility and commercial terms before any future integration; do not start paid distribution without approval.

## Publishing and closing

Publish a real job in Sanity only after salary, location, working arrangement, application route, employer confidentiality and closing date are checked. Confirm the public page and its JobPosting markup, then check `/sitemap.xml` and `/feeds/jobs.xml`. Do not interpret inclusion as Google Jobs acceptance. When a role closes, set its status to closed or let its closing date pass; the JobPosting entity and feed entry disappear. The existing closed page may remain for a helpful candidate explanation but is noindexed. Keep the canonical URL stable if the role is updated; do not change its slug casually.

## Recovery

If a feed is unavailable, check Sanity availability and Railway logs. The feed returns 503 instead of a misleading empty list. If a board shows stale jobs, confirm that it fetched the current feed and request a refresh from that partner. If Google notification fails, the public page and sitemap still work; inspect the webhook logs and Google Cloud permission/quota before retrying. Do not add fake vacancies or sensitive candidate data to test distribution.
