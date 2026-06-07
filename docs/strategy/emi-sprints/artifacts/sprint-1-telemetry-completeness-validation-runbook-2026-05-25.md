# Sprint 1 Telemetry Completeness Validation Runbook

Owner: Documentation Operations
Status: deprecated
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: no
Canonical doc: docs/sprint-backlog.md
Lifecycle candidate: archive


Date: 2026-05-25  
Scope: Sprint 1 EMI content pages
- src/app/page.tsx
- src/app/pricing/page.tsx
- src/app/for-cio/page.tsx
- src/app/for-coaches/page.tsx

Purpose:
- Close H4 in the Sprint 1 A+ rubric.
- Verify telemetry completeness is canonical enough for scorecard closeout.
- Produce auditable evidence for page-level PASS status.

## Validation Gate

H4 passes only if all conditions are true for each Sprint 1 page:
1. At least 100 unique sessions reached the page after publish, or 7 full days have elapsed since deploy.
2. Critical dimensions have <= 1% null rate:
- page_slug
- persona_segment
- session_id
- week_start
3. Required events are present:
- emi_page_view
- emi_cta_click
- emi_proof_block_view
- emi_objection_expand
- emi_path_transition
4. No page is missing its primary CTA event stream.

## Event Contract

Expected properties by event:
- Common: page_slug, persona_segment, experiment_id, session_id, week_start
- CTA events: cta_id, to_path
- Proof events: proof_id
- Objection events: objection_id

Experiment id expected in Sprint 1:
- sprint1_emi_content_a_plus

## Pages and Expected Segments

| Page | page_slug | persona_segment |
|---|---|---|
| Home | / | executives |
| Pricing | /pricing | executives |
| For CIO | /for-cio | executives |
| For Coaches | /for-coaches | coaches |

## Evidence To Save

For each validation run, save:
1. Raw query output or screenshot from analytics tool.
2. Exported CSV or JSON if available.
3. One markdown summary block appended to the sprint scorecard.
4. Validation timestamp, operator, and sample size.

## PostHog Query Set (HogQL)

Use the PostHog SQL/HogQL query tool if available.

### Query 1: Session threshold by page

```sql
SELECT
  properties.page_slug AS page_slug,
  uniq(properties.session_id) AS unique_sessions,
  min(timestamp) AS first_event_at,
  max(timestamp) AS last_event_at
FROM events
WHERE event = 'emi_page_view'
  AND properties.experiment_id = 'sprint1_emi_content_a_plus'
  AND properties.page_slug IN ('/', '/pricing', '/for-cio', '/for-coaches')
GROUP BY page_slug
ORDER BY page_slug
```

Pass rule:
- unique_sessions >= 100 per page, or the deployment has been live for 7 days.

### Query 2: Critical null-rate check by page

```sql
SELECT
  properties.page_slug AS page_slug,
  count() AS total_events,
  round(100.0 * countIf(empty(toString(properties.page_slug))) / count(), 2) AS page_slug_null_pct,
  round(100.0 * countIf(empty(toString(properties.persona_segment))) / count(), 2) AS persona_segment_null_pct,
  round(100.0 * countIf(empty(toString(properties.session_id))) / count(), 2) AS session_id_null_pct,
  round(100.0 * countIf(empty(toString(properties.week_start))) / count(), 2) AS week_start_null_pct
FROM events
WHERE event IN (
    'emi_page_view',
    'emi_cta_click',
    'emi_proof_block_view',
    'emi_objection_expand',
    'emi_path_transition'
  )
  AND properties.experiment_id = 'sprint1_emi_content_a_plus'
  AND properties.page_slug IN ('/', '/pricing', '/for-cio', '/for-coaches')
GROUP BY page_slug
ORDER BY page_slug
```

Pass rule:
- Every null percentage <= 1.00.

### Query 3: Required event coverage by page

```sql
SELECT
  properties.page_slug AS page_slug,
  event,
  count() AS event_count,
  uniq(properties.session_id) AS unique_sessions
FROM events
WHERE event IN (
    'emi_page_view',
    'emi_cta_click',
    'emi_proof_block_view',
    'emi_objection_expand',
    'emi_path_transition'
  )
  AND properties.experiment_id = 'sprint1_emi_content_a_plus'
  AND properties.page_slug IN ('/', '/pricing', '/for-cio', '/for-coaches')
GROUP BY page_slug, event
ORDER BY page_slug, event
```

Pass rule:
- All five events appear for each page.
- `emi_cta_click` must be present for each page.

### Query 4: Primary CTA presence by page

```sql
SELECT
  properties.page_slug AS page_slug,
  properties.cta_id AS cta_id,
  count() AS clicks
FROM events
WHERE event = 'emi_cta_click'
  AND properties.experiment_id = 'sprint1_emi_content_a_plus'
  AND properties.page_slug IN ('/', '/pricing', '/for-cio', '/for-coaches')
GROUP BY page_slug, cta_id
ORDER BY page_slug, clicks DESC
```

Expected primary CTA ids include:
- /: hero_start_trial or final_start_campaign
- /pricing: pricing_nav_get_started or pricing_plan_active
- /for-cio: cio_quick_nav_start_trial or cio_prehero_start_trial
- /for-coaches: coaches_top_preview_cta or coaches_request_preview

Pass rule:
- Each page has at least one expected primary CTA id with non-zero volume.

## Manual Sanity Check

Before trusting the sample threshold, perform one manual click path per page in production:
1. Load the page.
2. Click one primary CTA.
3. Expand one objection block.
4. Scroll into proof section.
5. Confirm events appear in live PostHog debug stream with expected properties.

## Scorecard Update Template

Append this block to the Sprint 1 scorecard when validated:

```md
### H4 Validation Run - YYYY-MM-DD HH:MM UTC
- Operator: NAME
- Deploy reference: COMMIT / DEPLOY ID
- Session threshold met: YES/NO
- Home null-rate status: PASS/FAIL
- Pricing null-rate status: PASS/FAIL
- For-CIO null-rate status: PASS/FAIL
- For-Coaches null-rate status: PASS/FAIL
- Required event coverage: PASS/FAIL
- Primary CTA coverage: PASS/FAIL
- Final H4 verdict: PASS/FAIL
- Evidence links: LIST
```

## If H4 Fails

1. Identify the missing or null property by page and event type.
2. Reproduce in live debug stream with one manual session.
3. Patch telemetry code before widening page copy changes.
4. Rerun the validation queries after redeploy.
5. Do not mark Sprint 1 closed until all pages pass.

## Current Constraint

As of 2026-05-25, the code-level telemetry implementation is live in repo, but H4 cannot be closed until post-publish traffic reaches threshold or 7 days elapse.
