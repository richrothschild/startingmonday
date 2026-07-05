// Outcome-label backfill (T2.2, T2.3, T2.4). Daily, batch-capped:
// 1. exec_hire retro-labeler — appointment events prove a search concluded;
//    back-label the prior 180 days (captures never-posted retained searches).
// 2. user_pipeline labeler — companies in applied/interviewing/offer stages
//    prove a live search existed. Confidential ground truth: always
//    exclude_from_public_stats. Stage-change time is approximated by
//    companies.updated_at (no stage-transition timestamp exists).
// 3. proxy_diff labeler — DEF 14A officer-table diffs surface appointments
//    with the search window approximated by the filing date.

import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { resolveCanonicalCompany, clearCanonicalCache } from '../lib/canonical-company.js'
import {
  recordRoleOpening,
  inferRoleFamilyFromTitle,
  roleFamilyForRoleType,
} from '../lib/outcome-labels.js'
import { getOfficerAppointments } from '../signals/fetch-sec-officers.js'

const OUTCOME_BACKFILL_LOCK_KEY = 6472913850n
const EXEC_HIRE_BATCH = Number(process.env.OUTCOME_EXEC_HIRE_BATCH ?? 200)
const PIPELINE_BATCH = Number(process.env.OUTCOME_PIPELINE_BATCH ?? 200)
const PROXY_DIFF_BATCH = Number(process.env.OUTCOME_PROXY_DIFF_BATCH ?? 10)

export async function runOutcomeLabelBackfillJob() {
  const supabase = getSupabase()

  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: OUTCOME_BACKFILL_LOCK_KEY })
  if (!locked) {
    logger.warn('outcome-label-backfill-job: another instance running — skipping')
    return
  }

  clearCanonicalCache()
  const totals = { execHire: 0, pipeline: 0, proxy: 0, labeledEvents: 0 }

  try {
    await backfillExecHires(supabase, totals)
    await backfillPipelineStages(supabase, totals)
    await backfillProxyDiffs(supabase, totals)
    logger.info('outcome-label-backfill-job: complete', totals)
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: OUTCOME_BACKFILL_LOCK_KEY })
  }
}

// T2.2 — exec_hire events are retroactive proof a role was open.
async function backfillExecHires(supabase, totals) {
  const { data: events, error } = await supabase
    .from('company_events')
    .select('id, canonical_company_id, event_date, summary')
    .eq('event_type', 'exec_hire')
    .order('event_date', { ascending: false })
    .limit(EXEC_HIRE_BATCH)

  if (error) {
    logger.warn('outcome-label-backfill-job: exec_hire fetch failed', { error: error.message })
    return
  }

  for (const event of events ?? []) {
    const { data: existing } = await supabase
      .from('role_openings')
      .select('id')
      .eq('label_source', 'exec_hire')
      .eq('source_ref', event.id)
      .limit(1)
      .maybeSingle()
    if (existing) continue

    const result = await recordRoleOpening(supabase, {
      canonicalCompanyId: event.canonical_company_id,
      roleFamily: inferRoleFamilyFromTitle(event.summary),
      roleTitle: null,
      openedOn: event.event_date,
      labelSource: 'exec_hire',
      sourceRef: event.id,
      excludeEventId: event.id,
    })
    if (result.openingId && !result.existing) {
      totals.execHire++
      totals.labeledEvents += result.labeledEvents
    }
  }
}

// T2.3 — active pipeline stages are confidential-search ground truth.
async function backfillPipelineStages(supabase, totals) {
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, user_id, name, company_url, sector, stage, updated_at, canonical_company_id')
    .in('stage', ['applied', 'interviewing', 'offer'])
    .is('archived_at', null)
    .order('updated_at', { ascending: false })
    .limit(PIPELINE_BATCH)

  if (error) {
    logger.warn('outcome-label-backfill-job: pipeline fetch failed', { error: error.message })
    return
  }
  if (!companies?.length) return

  const userIds = [...new Set(companies.map(c => c.user_id))]
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, role_type')
    .in('user_id', userIds)
  const roleTypeByUser = new Map((profiles ?? []).map(p => [p.user_id, p.role_type]))

  for (const company of companies) {
    const sourceRef = `${company.id}:${company.stage}`
    const { data: existing } = await supabase
      .from('role_openings')
      .select('id')
      .eq('label_source', 'user_pipeline')
      .eq('source_ref', sourceRef)
      .limit(1)
      .maybeSingle()
    if (existing) continue

    const canonicalCompanyId = await resolveCanonicalCompany(supabase, company)
    if (!canonicalCompanyId) continue

    const result = await recordRoleOpening(supabase, {
      canonicalCompanyId,
      roleFamily: roleFamilyForRoleType(roleTypeByUser.get(company.user_id)),
      roleTitle: null,
      // Approximation: no stage-transition timestamp exists; updated_at is
      // the best available bound on when the stage became active.
      openedOn: (company.updated_at ?? new Date().toISOString()).slice(0, 10),
      labelSource: 'user_pipeline',
      sourceRef,
      excludeFromPublicStats: true,
    })
    if (result.openingId && !result.existing) {
      totals.pipeline++
      totals.labeledEvents += result.labeledEvents
    }
  }
}

// T2.4 — DEF 14A officer-table diffs surface appointments.
async function backfillProxyDiffs(supabase, totals) {
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, company_url, sector, sec_cik_padded, canonical_company_id')
    .not('sec_cik_padded', 'is', null)
    .is('archived_at', null)
    .limit(500)

  if (error) {
    logger.warn('outcome-label-backfill-job: proxy candidates fetch failed', { error: error.message })
    return
  }

  // One representative company per CIK; skip CIKs already diffed (two snapshots present).
  const byCik = new Map()
  for (const company of companies ?? []) {
    if (!byCik.has(company.sec_cik_padded)) byCik.set(company.sec_cik_padded, company)
  }

  let processed = 0
  for (const [cikPadded, company] of byCik) {
    if (processed >= PROXY_DIFF_BATCH) break

    const { count } = await supabase
      .from('officer_snapshots')
      .select('id', { count: 'exact', head: true })
      .eq('sec_cik_padded', cikPadded)
    if ((count ?? 0) >= 2) continue // already snapshotted and diffed

    processed++
    const { appointments, filingDate } = await getOfficerAppointments(supabase, {
      cikPadded,
      companyName: company.name,
    })
    if (!appointments.length || !filingDate) continue

    const canonicalCompanyId = await resolveCanonicalCompany(supabase, company)
    if (!canonicalCompanyId) continue

    for (const appointment of appointments) {
      const result = await recordRoleOpening(supabase, {
        canonicalCompanyId,
        roleFamily: inferRoleFamilyFromTitle(appointment.title),
        roleTitle: appointment.title,
        openedOn: filingDate,
        labelSource: 'proxy_diff',
        sourceRef: `${cikPadded}:${appointment.name}`,
      })
      if (result.openingId && !result.existing) {
        totals.proxy++
        totals.labeledEvents += result.labeledEvents
      }
    }
  }
}
