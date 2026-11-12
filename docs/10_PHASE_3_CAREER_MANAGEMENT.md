# 10. Phase 3 - Projects, Job Applications and Resume Support

## Objective

Add career management only after the learning MVP is stable. The purpose is to reduce spreadsheet/admin effort and connect preparation to actual job opportunities.

## 10.1 Project tracker

Seed the user's existing `Lovable` AI-powered application builder project with status `in_progress`.

Project fields:
- Name, summary, status, repository URL, demo URL (optional).
- Start date (optional), last updated date.
- Technologies with per-technology evidence: studied, used_in_project, independently_confident.
- Architecture summary.
- Challenges and decisions.
- Interview narrative / STAR-style story notes.

Feature tracker fields:
- Title, description, category (feature, bug, improvement, infrastructure), status (planned, in_progress, blocked, done), priority, notes, link.

Do not invent repository URLs, deployment URLs, user metrics or completion percentages. Provide editable seed notes based only on the supplied summary. Ask the user to fill in missing architecture details over time.

## 10.2 Job application tracker

### Stages
- interested
- applied
- referral_requested
- screening
- technical_round_1
- technical_round_2
- managerial_round
- hr
- offer
- rejected
- on_hold

The user can move an application between stages using drag/drop or a stage menu. Provide a keyboard- and mobile-friendly select action in addition to drag/drop.

### Application fields
- Company and role title.
- Job URL and job description.
- Location/work mode (optional).
- Date discovered and application date.
- Compensation range in LPA (optional).
- Recruiter name/contact (optional; private).
- Referral name/status (optional).
- Current stage.
- Next follow-up date.
- Interview date and round notes.
- Outcome and rejection reason.
- Freeform notes.

### Features
- Kanban board.
- List/table view with sort and filters.
- Search by company or role.
- Follow-up due view.
- Application funnel summary (counts by stage, not predictive probabilities).
- Round history in application detail.
- Duplicate warning for same company + role + URL.

Do not scrape sites or auto-apply. Job discovery can remain manual in this phase.

## 10.3 Resume support

Initial scope:
- Upload PDF/DOCX to a private Supabase Storage bucket.
- Store file name, file type, size, upload time and storage path.
- Display and delete uploaded versions.
- Allow pasting a job description into a comparison form.

Before AI analysis exists, offer manual checklist fields: target role, key required skills, matching evidence, gaps to address.

Do not parse or upload resume content to any external AI provider without explicit user action and clear notice. Do not put a public URL on resume files.

## 10.4 AI-ready data, not AI yet

Store enough structure for later analysis, but do not build embedding pipelines or call AI in Phase 3. Example: project technologies and verified resume bullets can later be passed as bounded context.

## Exit criteria

- [ ] Project and feature CRUD works.
- [ ] Lovable project seeds as `in_progress` with no invented links/metrics.
- [ ] Job application kanban and list views work.
- [ ] Stage can be changed without drag/drop.
- [ ] Follow-up dates and filters work.
- [ ] Duplicate warning works.
- [ ] Resume files are private and deletable.
- [ ] All file access is owner-authorized.
- [ ] User can export job application records.
