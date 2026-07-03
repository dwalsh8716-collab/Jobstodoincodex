# UX And Conversion Audit

Audit date: 3 July 2026

Status: strong brand experience, safer conversion paths now tightened.

## 1. UX Executive Summary

The site already feels distinctive: founder-led, direct, human and memorable.
It does not look or read like a generic recruitment agency site. That is a real
advantage.

The main UX risk was not weak design. It was decision noise in a few conversion
moments:

- contact page hero had too many equal-weight actions
- client journey could explain the first-call outcome more clearly
- candidate journey had a no-live-roles moment that needed a stronger bridge to
  the confidential route
- long button labels and email routes needed better mobile wrapping protection

Safe fixes implemented:

- simplified the contact page hero to the three highest-intent routes
- moved candidate, email, phone and LinkedIn routes into a secondary options
  area
- added client-page next-step reassurance
- added candidate no-live-roles empty state with direct routes
- added candidate next-step cards before the form
- hardened button wrapping for mobile labels and email addresses

## 2. Conversion Blockers

Fixed:

- Too many contact hero CTAs competing at the same level.
- Candidate path felt weaker when no live jobs were shown.
- Client page needed clearer reassurance about what happens after an enquiry.

Still watch:

- Live Resend email delivery is not configured and tested yet.
- GA4/consent tracking is not fully live-tested yet.
- Real conversion data is not available until launch traffic exists.

## 3. Trust Gaps

Strong:

- David is visible as the founder.
- The tone is direct and specific.
- Proof is not faked.
- Candidate privacy and CV handling are explained.
- WhatsApp feels useful, not like a cheap widget.

Gaps that need real-world input:

- Permissioned case studies.
- Named testimonials only with approval.
- Real salary or market data.
- Live Google Business Profile and Search Console confidence signals.

Do not fill these gaps with invented proof.

## 4. Friction Points

Fixed:

- The contact page now starts with WhatsApp, booking and brief submission.
- Secondary routes are still available without taking over the hero.
- Candidate no-live-roles path now has a clear next action.
- Client page explains the first conversation in plain English.

Keep:

- No account creation for candidates.
- No CV upload until private storage is ready.
- Forms stay short enough to complete.
- WhatsApp remains one route, not the only route.

## 5. Mobile UX Issues

Automated QA had already passed desktop, tablet and mobile. The CRO pass added:

- button text wrapping protection
- cleaner contact route hierarchy
- clearer mobile candidate action when no roles are live

Manual mobile checks still needed:

- tap WhatsApp on a real phone
- book a call on a real phone
- submit the contact form after Resend is configured
- check final DNS domain after cutover

## 6. CTA Recommendations

Implemented:

- Contact hero: keep only the fastest/highest intent routes.
- Client page: reinforce "sense-check the brief" with what happens next.
- Candidate page: use "Send a confidential note" when no live roles exist.

Recommended CTA hierarchy:

1. WhatsApp for speed.
2. Booking for a scheduled conversation.
3. Form for structured context.
4. Email, LinkedIn and candidate route as secondary options.

Avoid:

- "Contact sales"
- "Submit vacancy"
- "Request talent"
- generic "Get started"

## 7. Page Flow Recommendations

Homepage:

- PASS. It has a distinctive first impression, clear founder voice, service
  route, proof caveat, candidate/client split and final CTA.

Clients:

- Improved. The page now explains what happens after a brief is sent.

Candidates:

- Improved. The no-live-roles state now routes candidates to a private note or
  WhatsApp instead of ending the journey.

Contact:

- Improved. First decision is simpler; secondary routes remain available.

Service pages:

- PASS. They show audience, problem, use case, process, mistakes, proof
  standard, related services, related insight, FAQs and CTA.

## 8. Copy Clarity Improvements

Implemented:

- "Send the brief" replaces a less precise contact hero action.
- Client next steps explain the first conversation without sales fluff.
- Candidate next steps reduce fear around privacy and CV sending.

Keep using:

- "Sense-check a brief"
- "Talk to David"
- "Send a confidential note"
- "No CV flinging"
- "The job title is not the brief"

## 9. Visual Hierarchy Improvements

Implemented:

- fewer hero CTAs on the contact page
- secondary route grouping below the primary contact options
- clearer card-based reassurance on client and candidate pages
- long CTA labels can wrap safely on small screens

No redesign needed. The brand system is already distinctive.

## 10. Prioritised UX Action Plan

Done now:

- simplify contact conversion hierarchy
- add client next-step reassurance
- improve candidate no-live-roles path
- add mobile text-wrapping protection
- document this UX/CRO audit

Before public launch:

- test WhatsApp on a real phone
- test booking on desktop and mobile
- send a real contact-form enquiry after Resend is live
- confirm CMS gate and Recruiter Labs access
- rerun production QA on the final domain

First 30 days after launch:

- review GA4/consented CTA events
- check which route people actually use: WhatsApp, booking, email or form
- improve the highest-exit page using real behaviour, not taste
- ask two or three trusted clients whether the page explains the offer quickly

Final rule: premium, fast, human. No faff. No fake proof. No noisy widgetry.
