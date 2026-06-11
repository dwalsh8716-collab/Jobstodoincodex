# Recruiter Labs AI Vendor Discovery

## Status

Discovery only.

No account has been created. No provider has been connected. No real candidate
data, client data, CV text, interview transcript or private note should be sent
to any AI vendor until David approves the provider, terms, privacy wording and
workflow.

This is technical and operational discovery, not legal advice.

## Audit Result

The codebase already has:

- AI governance and banned-use policy
- AI launch gate
- AI Ops roadmap
- server-only AI feature flags, all off by default
- private Postgres AI draft schema
- no live AI provider keys
- no AI notetaker dependency
- Loxo-first CRM/ATS boundary
- optional Loxo reference IDs for future handoff/sync

Nothing in the site currently records interviews, transcribes candidates or
calls an AI provider.

## Recommendation

Start with Loxo.

Reason: Loxo is already the intended CRM/ATS source of truth for Essential
Resourcing. Loxo now advertises an AI Notetaker that captures, summarises and
syncs notes into candidate profiles, supports Zoom, Google Meet and Microsoft
Teams, and lets summaries be edited before being sent to a hiring manager.

Second option: Metaview.

Reason: Metaview is recruitment-specific and documents a Loxo integration that
can send AI notes, TLDRs and links back to Loxo as activities. That makes it
worth exploring if Loxo native is not good enough.

Do not build complex interview AI infrastructure in this website yet. Build a
manual structured notes workflow first, then only connect a vendor after fake
data testing and legal/privacy review.

## Sources Reviewed

- Loxo AI Notetaker: https://www.loxo.co/ai-agents/ai-notetaker
- Loxo Open API: https://help.loxo.co/en/articles/446640-loxo-s-open-api
- Loxo pricing: https://www.loxo.co/pricing
- Metaview integrations: https://www.metaview.ai/integrations
- Metaview Loxo integration help: https://support.metaview.ai/integrations/ats-integrations/loxo
- Metaview pricing: https://www.metaview.ai/pricing
- Screenloop interview intelligence: https://www.screenloop.com/product/interview-intelligence
- Screenloop integrations: https://www.screenloop.com/platform/integrations
- BrightHire integrations: https://brighthire.com/product/integrations/
- BrightHire compliance and security: https://brighthire.com/compliance-and-security/
- BrightHire pricing: https://brighthire.com/pricing/
- HireLogic: https://hirelogic.com/
- CoRecruit: https://corecruit.com/

## Comparison Matrix

| Provider                   | Best Use Case                                                                | Risks                                                                                                                                                                               | Data / Privacy Position                                                                                                                                   | Integration Effort                                                                                | Cost Level                                                                                                                   | Fit                                                                              | Recommendation                                    |
| -------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------- |
| Loxo AI Notetaker          | Native notes inside the existing CRM/ATS.                                    | May lock the workflow into Loxo's AI model and account permissions. Need exact DPA, data region, retention, training-use and export terms.                                          | Advertises notes, transcripts, recordings and snippets inside Loxo candidate profiles. Must verify UK/EU privacy position and candidate consent controls. | Lowest if David already uses Loxo for CRM/ATS.                                                    | Unknown until account plan confirmed. Loxo pricing has free/trial messaging, but AI feature availability needs confirmation. | Strongest first option because it avoids duplicate systems.                      | Worth exploring first.                            |
| Metaview                   | Recruitment-specific AI notetaker with ATS write-back.                       | External vendor adds another data processor. Need to confirm retention, model training, deletion/export, candidate consent and whether scoring can stay off.                        | Metaview states SOC 2 Type II, GDPR/CCPA compliance, encryption and SSO.                                                                                  | Medium. Loxo integration help says AI notes, TLDRs and links can be sent back to Loxo activities. | Public pricing page exists; final plan needs quote/check.                                                                    | Strong second option if Loxo native is not enough.                               | Worth exploring.                                  |
| CoRecruit                  | Agency-focused notes, ATS updates and candidate submittals.                  | Powerful automation could go beyond notes into client materials and follow-ups. Needs tight controls before use. Botless capture also needs careful candidate transparency wording. | Claims SOC 2 Type II, GDPR/privacy compliance, encryption, data ownership and audit-ready infrastructure.                                                 | Medium. Claims Loxo and 40+ ATS/CRM integrations.                                                 | Unknown until pricing check.                                                                                                 | Interesting for agency workflow, but broader than the immediate need.            | Maybe later.                                      |
| BrightHire                 | Enterprise interview intelligence, structured interviews and ATS scorecards. | May be too enterprise-heavy for Essential Resourcing. Loxo compatibility is not confirmed from reviewed sources.                                                                    | Compliance page highlights RBAC and customizable retention. Need DPA, region, deletion/export and model-training details.                                 | Medium to high. Integrations list major ATSs and video tools; Loxo not confirmed.                 | Likely higher/enterprise. Public page says plans exist, final cost needs quote.                                              | Good product category fit, weaker Loxo fit.                                      | Maybe later.                                      |
| Screenloop                 | AI ATS / interview intelligence for in-house talent teams.                   | Appears more like an all-in-one ATS/talent platform. Could duplicate Loxo. Some product copy leans into scorecards and analytics, which needs care.                                 | Security and DPA links exist, but exact region/retention terms need review.                                                                               | High if it means replacing or duplicating ATS workflow.                                           | Unknown until quote/check.                                                                                                   | Weak fit if Loxo remains source of truth.                                        | Maybe later or avoid if it duplicates Loxo.       |
| HireLogic                  | Lightweight interview assistant and insights.                                | Product copy includes matching interview discussion to job descriptions and candidate insights. Needs strict review to avoid hidden evaluation.                                     | Terms and privacy need full review. DPA/region/training-use not clear from quick public review.                                                           | Unknown. Video support appears broad; Loxo fit not confirmed.                                     | Public material references low per-interview cost in one flow, but final terms need check.                                   | Useful conceptually, but riskier until controls are clearer.                     | Blocked pending API/access and compliance review. |
| Generic meeting notetakers | Cheap notes for calls.                                                       | Not recruitment-specific. Usually poor ATS write-back, weak scorecard context and higher risk of private transcripts floating outside the recruitment workflow.                     | Varies heavily by vendor.                                                                                                                                 | Low to start, high to govern properly.                                                            | Low to medium.                                                                                                               | Weak for senior recruitment where consent, notes and client presentation matter. | Avoid for real candidates.                        |

## Loxo / CRM Questions

Ask Loxo:

- Is AI Notetaker included in David's current plan?
- Is it available for UK users and UK/EEA candidate data?
- What is the DPA and subprocessor position?
- Where are recordings, transcripts and summaries processed and stored?
- Are prompts, transcripts or outputs used for model training?
- Can recordings be disabled while keeping notes?
- Can snippets/share links be disabled by default?
- Can every AI summary be edited before any client or hiring manager sees it?
- Can generated notes be logged as candidate activities without changing core
  candidate status?
- Can custom fields or activity types separate "AI draft" from "David approved"?
- What retention, deletion and export controls exist?
- Can candidate opt-out or consent status stop the notetaker from joining?
- What audit logs exist for viewing, editing, sharing and deleting notes?
- Does the Open API support note/activity creation, transcript attachment,
  candidate profile updates and webhooks needed for this workflow?

If Loxo can handle notes, activities, review and retention natively, prefer it
over a separate website-built system.

## Questions For Any Provider

Before approval, ask:

- Are you recruitment-specific or generic?
- Which video platforms do you support: Google Meet, Zoom, Teams and phone?
- Can the tool work without recording video?
- How is candidate consent captured or displayed?
- Can recording/transcription be disabled per interview?
- Can automated scoring, ranking or recommendation be disabled?
- Can output be forced into draft/review state?
- Can David edit every output before it is used?
- Where is data processed and stored?
- Are prompts, transcripts or outputs used for model training?
- What retention, deletion and export controls exist?
- Is there a DPA suitable for UK/EEA data?
- Which ATS/CRM systems are supported?
- Is Loxo supported natively?
- Is there an API?
- Are there webhooks?
- Can write-back create activities without overwriting candidate fields?
- Can sensitive fields be redacted or excluded?
- What admin controls, SSO and role-based permissions exist?
- What does pricing look like for one or a small number of recruiters?
- What happens if the provider is unavailable?

## Risk Register

| Risk                         | Why It Matters                                                    | Control                                                              |
| ---------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| Hidden candidate evaluation  | Notes can drift into scoring or ranking.                          | Keep scoring/ranking off. Use draft notes only.                      |
| Candidate consent            | Recording/transcription changes the candidate experience.         | Clear wording before the call. Opt-out route. Manual notes fallback. |
| Data residency               | Candidate interviews may contain sensitive personal data.         | Confirm UK/EEA handling, DPA, subprocessors and deletion rights.     |
| Training use                 | Prompts and transcripts may improve vendor models unless blocked. | Confirm no training or opt-out in writing.                           |
| Duplicate CRM data           | Website/Postgres could become a second CRM.                       | Keep Loxo as source of truth. Use references and activities only.    |
| Client-visible draft leakage | AI summaries may sound polished but wrong.                        | David edits and approves before client use.                          |
| Over-automation              | Candidate submittals and follow-ups could be sent too quickly.    | No automatic sending from AI output.                                 |

## Staged Next Steps

1. Keep all AI and notetaker flags off.
2. Ask Loxo for AI Notetaker terms, demo and plan availability.
3. Ask Metaview for current Loxo integration scope and UK/EEA privacy pack.
4. Use fake candidate/interview data only for first demos.
5. Build the manual structured notes workflow before any provider integration.
6. Decide whether notes live only in Loxo or whether Postgres stores a local
   review copy.
7. Confirm consent wording for recorded/transcribed interviews.
8. Confirm deletion/export/DSAR handling.
9. Run a private beta with one workflow only.

## Decision

Current recommendation:

```txt
Explore Loxo AI Notetaker first.
Explore Metaview second if Loxo native is not enough.
Do not build a custom AI notetaker inside the website.
Do not use generic meeting notetakers for real candidates.
```

Useful technology here should save David admin time. It should not create a
black box, a second CRM, or a clever-sounding way to make people decisions.
