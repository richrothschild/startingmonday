import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { resolveCanonicalCompany, clearCanonicalCache } from '../lib/canonical-company.js'
import { fetchAtsOpenings } from '../signals/fetch-ats-json.js'
import { inferRoleFamilyFromTitle, recordRoleOpening } from '../lib/outcome-labels.js'

const ATS_POLLER_LOCK_KEY = 9315702442n
const ATS_COMPANY_BATCH = Number(process.env.ATS_POLLER_COMPANY_BATCH ?? 300)

export async function runAtsPollerJob() {
  const supabase = getSupabase()

  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: ATS_POLLER_LOCK_KEY })
  if (!locked) {
    logger.warn('ats-poller-job: another instance running — skipping')
    return
  }

  clearCanonicalCache()

  const stats = {
    companies: 0,
    fetched: 0,
    openingsSeen: 0,
    openingsUpserted: 0,
    openingsClosed: 0,
    roleLabels: 0,
  }

  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, user_id, company_url, sector, is_public_company, sec_cik_padded, canonical_company_id, career_page_url')
      .is('archived_at', null)
      .not('career_page_url', 'is', null)
      .limit(ATS_COMPANY_BATCH)

    if (error) {
      logger.error('ats-poller-job: failed to fetch companies', { error: error.message })
      return
    }

    stats.companies = companies?.length ?? 0

    for (const company of companies ?? []) {
      const { provider, openings } = await fetchAtsOpenings(company.career_page_url)
      if (!provider) continue

      stats.fetched += 1
      stats.openingsSeen += openings.length

      const canonicalCompanyId = await resolveCanonicalCompany(supabase, company)
      if (!canonicalCompanyId) continue

      const activeUrls = new Set()
      for (const opening of openings) {
        const openedOn = opening.opened_on ?? new Date().toISOString().slice(0, 10)
        activeUrls.add(opening.role_url)

        const { error: upsertError } = await supabase
          .from('ats_role_openings')
          .upsert(
            {
              canonical_company_id: canonicalCompanyId,
              source_platform: provider,
              role_title: opening.role_title,
              role_family: inferRoleFamilyFromTitle(opening.role_title),
              role_url: opening.role_url,
              opened_on: openedOn,
              is_open: true,
              closed_on: null,
              raw_payload: opening.raw ?? {},
              fetched_at: new Date().toISOString(),
            },
            { onConflict: 'canonical_company_id,source_platform,role_url' },
          )

        if (!upsertError) stats.openingsUpserted += 1

        const label = await recordRoleOpening(supabase, {
          canonicalCompanyId,
          roleFamily: inferRoleFamilyFromTitle(opening.role_title),
          roleTitle: opening.role_title,
          openedOn,
          labelSource: 'ats_json',
          sourceRef: `${provider}:${opening.role_url}`,
        })
        if (label.openingId && !label.existing) stats.roleLabels += 1
      }

      const { data: currentlyOpen } = await supabase
        .from('ats_role_openings')
        .select('id, role_url')
        .eq('canonical_company_id', canonicalCompanyId)
        .eq('source_platform', provider)
        .eq('is_open', true)

      for (const row of currentlyOpen ?? []) {
        if (activeUrls.has(row.role_url)) continue
        const { error: closeError } = await supabase
          .from('ats_role_openings')
          .update({ is_open: false, closed_on: new Date().toISOString().slice(0, 10), fetched_at: new Date().toISOString() })
          .eq('id', row.id)
        if (!closeError) stats.openingsClosed += 1
      }
    }

    logger.info('ats-poller-job: complete', stats)
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: ATS_POLLER_LOCK_KEY })
  }
}
