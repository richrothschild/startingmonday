import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { sendSignalAlert } from '../lib/signal-alert.js'
import { fetchCompanyNews } from '../signals/fetch-company-news.js'
import { classifySignal } from '../signals/classify-signal.js'
import { writeSignal } from '../signals/write-signal.js'
import { fetchCrunchbaseFunding, formatFundingSignal } from '../signals/fetch-crunchbase-funding.js'
import { findPressRoomArticles } from '../signals/fetch-press-room.js'
import { fetchSecFilings } from '../signals/fetch-sec-filings.js'
import { detectSecTrends } from '../signals/detect-sec-trends.js'
import { fetchPrWire } from '../signals/fetch-pr-wire.js'
import { fetchPredictLeadsSignals } from '../signals/fetch-predictleads.js'
import { fetchProxyBoardChanges } from '../signals/fetch-sec-proxy.js'
import { fetchActivistFilings } from '../signals/fetch-sec-activist.js'
import { fetchInsiderSales } from '../signals/fetch-sec-insider.js'
import { fetchBizJournalMentions } from '../signals/fetch-bizjournal.js'
import { fetchTradePressArticles } from '../signals/fetch-trade-press.js'
import { checkRegulatoryCalendar } from '../signals/check-regulatory-calendar.js'
import { fetchPdlExecs } from '../signals/fetch-pdl-execs.js'
import { diffExecSnapshot } from '../signals/diff-exec-snapshot.js'
import { correlateSignals } from '../signals/correlate-signals.js'
import { generateOutreachDraft } from '../signals/generate-outreach-draft.js'
import {
  inferSourceKindFromUrl,
  inferFocusTags,
  extractEvidenceSnippets,
  extractPartnershipEntities,
} from '../signals/signal-meta.js'
import { getJobCheckpoint, saveJobCheckpoint, clearJobCheckpoint } from '../lib/job-checkpoint.js'
import { enqueueHeavyJob, processHeavyJobs } from '../lib/heavy-job-queue.js'
import { startSecIngestionRun, finishSecIngestionRun } from '../lib/sec-ingestion-tracker.js'

const CONFIDENCE_THRESHOLD = 60
const DELAY_MS = 600 // between companies to avoid hammering Google News
const SIGNAL_LOCK_KEY = 7329841025n
const USER_PAGE_SIZE = 500
const MAX_USER_PAGES_PER_RUN = Number(process.env.SIGNAL_JOB_MAX_PAGES_PER_RUN ?? 8)
const CHECKPOINT_JOB_NAME = 'signal-job'
const SIGNAL_RETRY_MODE = 'signal_company_retry'

async function fetchActiveUserPage(supabase, afterUserId = null) {
  let query = supabase
    .from('users')
    .select('id, email, subscription_tier')
    .in('subscription_status', ['active', 'trialing'])
    .order('id')
    .limit(USER_PAGE_SIZE)

  if (afterUserId) query = query.gt('id', afterUserId)

  const { data, error } = await query
  return { users: data ?? [], error }
}

function buildSignalMetadata(article, result, override = {}) {
  const sourceKind = override.sourceKind ?? inferSourceKindFromUrl(override.sourceUrl ?? article?.link ?? null)
  const focusTags = override.focusTags ?? inferFocusTags(override.signalType ?? result?.signal_type, result?.focus_tags ?? [])
  const evidenceSnippets = override.evidenceSnippets ?? extractEvidenceSnippets(article, result?.evidence_snippets ?? [])
  const partnerEntities = override.partnerEntities ?? extractPartnershipEntities(article, result?.partner_entities ?? [])

  return {
    confidence: typeof result?.confidence === 'number' ? result.confidence : null,
    sourceKind,
    focusTags,
    evidenceSnippets,
    partnerEntities,
    filingForm: override.filingForm ?? article?.filingForm ?? null,
    filingItems: override.filingItems ?? article?.filingItems ?? [],
  }
}

async function retrySignalCompanyById(supabase, payload) {
  const { companyId, userId } = payload ?? {}
  if (!companyId || !userId) throw new Error('invalid_signal_retry_payload')

  const [{ data: user, error: userErr }, { data: profile, error: profileErr }, { data: company, error: companyErr }] = await Promise.all([
    supabase
      .from('users')
      .select('id, email, subscription_tier')
      .eq('id', userId)
      .in('subscription_status', ['active', 'trialing'])
      .maybeSingle(),
    supabase
      .from('user_profiles')
      .select('user_id, role_type')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('companies')
      .select('id, name, user_id')
      .eq('id', companyId)
      .eq('user_id', userId)
      .is('archived_at', null)
      .maybeSingle(),
  ])

  if (userErr) throw new Error(`signal_retry_user_lookup_failed:${userErr.message}`)
  if (profileErr) throw new Error(`signal_retry_profile_lookup_failed:${profileErr.message}`)
  if (companyErr) throw new Error(`signal_retry_company_lookup_failed:${companyErr.message}`)
  if (!user || !company) {
    logger.warn('signal-job: retry target missing; skipping retry payload', {
      userId,
      companyId,
      hasUser: Boolean(user),
      hasCompany: Boolean(company),
    })
    return
  }

  const roleType = profile?.role_type ?? null
  const articles = await fetchCompanyNews(company.name)

  for (const article of articles) {
    const result = await classifySignal(company.name, article, roleType)
    const inferredPartners = extractPartnershipEntities(article, result.partner_entities ?? [])
    const inferredPartnership = inferredPartners.length > 0
    const isStrongSignal = (result.is_signal && (result.confidence ?? 0) >= CONFIDENCE_THRESHOLD) || inferredPartnership
    if (!isStrongSignal) continue

    const normalizedSignalType = inferredPartnership ? 'partnership' : result.signal_type
    const normalizedSummary = inferredPartnership
      ? `${company.name} appears to have a material partnership signal involving ${inferredPartners.join(', ')}.`
      : result.signal_summary
    if (!normalizedSignalType || !normalizedSummary) continue

    const signalDate = article.pubDate
      ? new Date(article.pubDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]

    await writeSignal(supabase, {
      companyId: company.id,
      userId: user.id,
      signalType: normalizedSignalType,
      signalSummary: normalizedSummary,
      sourceUrl: article.link,
      signalDate,
      outreachAngle: result.outreach_angle ?? null,
      ...buildSignalMetadata(article, result, {
        signalType: normalizedSignalType,
        partnerEntities: inferredPartners,
        focusTags: inferredPartnership
          ? inferFocusTags('partnership', result.focus_tags ?? [])
          : undefined,
      }),
    })
  }
}

export async function runSignalRefreshForUser({ userId, companyId = null }) {
  if (!userId) throw new Error('missing_user_id')

  const supabase = getSupabase()

  if (companyId) {
    await retrySignalCompanyById(supabase, { companyId, userId })
    return { companiesProcessed: 1, companiesFailed: 0 }
  }

  const { data: companies, error } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', userId)
    .is('archived_at', null)

  if (error) {
    throw new Error(`signal_refresh_company_lookup_failed:${error.message}`)
  }

  let companiesProcessed = 0
  let companiesFailed = 0

  for (const company of companies ?? []) {
    try {
      await retrySignalCompanyById(supabase, { companyId: company.id, userId })
      companiesProcessed += 1
    } catch (err) {
      companiesFailed += 1
      logger.error('signal-job: user refresh company failed', {
        userId,
        companyId: company.id,
        error: err.message,
      })
    }
  }

  return { companiesProcessed, companiesFailed }
}

export async function runSignalJob() {
  const supabase = getSupabase()

  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: SIGNAL_LOCK_KEY })
  if (!locked) {
    logger.warn('signal-job: another instance running — skipping')
    return
  }

  try {
    const cycleKey = new Date().toISOString().slice(0, 10)
    const checkpoint = await getJobCheckpoint(supabase, CHECKPOINT_JOB_NAME)
    const hasMatchingCycle = checkpoint?.context?.cycleKey === cycleKey
    let lastUserId = hasMatchingCycle
      ? (checkpoint?.cursor?.lastUserId ?? null)
      : null

    if (lastUserId) {
      logger.info('signal-job: resuming from checkpoint', { lastUserId, cycleKey })
    }

    let pagesProcessed = 0
    let completedCycle = false
    let usersProcessed = 0
    let companiesScanned = 0
    let signalsFound = 0

    while (pagesProcessed < MAX_USER_PAGES_PER_RUN) {
      const { users, error } = await fetchActiveUserPage(supabase, lastUserId)

      if (error) {
        logger.error('signal-job: failed to fetch users', { error: error.message, stack: error.stack })
        return
      }

      if (!users?.length) {
        if (!lastUserId) logger.info('signal-job: no active users')
        completedCycle = true
        break
      }

      pagesProcessed += 1
      usersProcessed += users.length

      const userIds = users.map(u => u.id)
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, role_type, full_name, current_title, positioning_summary, target_titles')
        .in('user_id', userIds)
      const roleTypeByUserId = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p.role_type]))
      const profileByUserId  = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))

      // Bulk-fetch companies for this user page to keep memory bounded.
      const { data: allCompanies } = await supabase
        .from('companies')
        .select('id, name, crunchbase_id, company_url, linkedin_url, sector, notes, role_watch_description, user_id, sec_cik_padded, is_public_company, activist_checked_at, insider_checked_at')
        .in('user_id', userIds)
        .is('archived_at', null)

      const companiesByUser = (allCompanies ?? []).reduce((acc, c) => {
        ;(acc[c.user_id] ??= []).push(c)
        return acc
      }, {})

      for (const user of users) {
      const roleType    = roleTypeByUserId[user.id] ?? null
      const userProfile = profileByUserId[user.id] ?? null
      const companies   = companiesByUser[user.id] ?? []

      if (!companies.length) continue

      for (const company of companies) {
        companiesScanned++
        try {
          // Google News — classify articles via Claude Haiku
          const articles = await fetchCompanyNews(company.name)
          for (const article of articles) {
            const result = await classifySignal(company.name, article, roleType)
            const inferredPartners = extractPartnershipEntities(article, result.partner_entities ?? [])
            const inferredPartnership = inferredPartners.length > 0
            const isStrongSignal = (result.is_signal && (result.confidence ?? 0) >= CONFIDENCE_THRESHOLD) || inferredPartnership
            if (!isStrongSignal) continue
            const normalizedSignalType = inferredPartnership ? 'partnership' : result.signal_type
            const normalizedSummary = inferredPartnership
              ? `${company.name} appears to have a material partnership signal involving ${inferredPartners.join(', ')}.`
              : result.signal_summary
            if (!normalizedSignalType || !normalizedSummary) continue

            const signalDate = article.pubDate
              ? new Date(article.pubDate).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0]

            const { skipped } = await writeSignal(supabase, {
              companyId:     company.id,
              userId:        user.id,
              signalType:    normalizedSignalType,
              signalSummary: normalizedSummary,
              sourceUrl:     article.link,
              signalDate,
              outreachAngle: result.outreach_angle ?? null,
              ...buildSignalMetadata(article, result, {
                signalType: normalizedSignalType,
                partnerEntities: inferredPartners,
                focusTags: inferredPartnership
                  ? inferFocusTags('partnership', result.focus_tags ?? [])
                  : undefined,
              }),
            })

            if (!skipped) {
              signalsFound++
              logger.info('signal-job: new signal', { company: company.name, type: normalizedSignalType })
            }
          }

          // Press room — scrape company's own newsroom for press releases
          if (company.company_url) {
            const pressArticles = await findPressRoomArticles(company.company_url)
            for (const article of pressArticles) {
              const result = await classifySignal(company.name, article, roleType)
              const inferredPartners = extractPartnershipEntities(article, result.partner_entities ?? [])
              const inferredPartnership = inferredPartners.length > 0
              const isStrongSignal = (result.is_signal && (result.confidence ?? 0) >= CONFIDENCE_THRESHOLD) || inferredPartnership
              if (!isStrongSignal) continue
              const normalizedSignalType = inferredPartnership ? 'partnership' : result.signal_type
              const normalizedSummary = inferredPartnership
                ? `${company.name} appears to have a material partnership signal involving ${inferredPartners.join(', ')}.`
                : result.signal_summary
              if (!normalizedSignalType || !normalizedSummary) continue

              const { skipped } = await writeSignal(supabase, {
                companyId:     company.id,
                userId:        user.id,
                signalType:    normalizedSignalType,
                signalSummary: normalizedSummary,
                sourceUrl:     article.link,
                signalDate:    new Date().toISOString().split('T')[0],
                outreachAngle: result.outreach_angle ?? null,
                ...buildSignalMetadata(article, result, {
                  signalType: normalizedSignalType,
                  partnerEntities: inferredPartners,
                  focusTags: inferredPartnership
                    ? inferFocusTags('partnership', result.focus_tags ?? [])
                    : undefined,
                }),
              })
              if (!skipped) {
                signalsFound++
                logger.info('signal-job: press room signal', { company: company.name, type: normalizedSignalType })
              }
            }
          }

          // SEC EDGAR 8-K filings — exec changes, acquisitions, bankruptcy, material events
          // Passing supabase+companyId also indexes all 8-K filings for trend detection below.
          const secRun = await startSecIngestionRun(supabase, {
            source: 'signal-job',
            companyId: company.id,
            companyName: company.name,
            companyCik: company.sec_cik_padded ?? null,
            metadata: {
              userId: user.id,
              roleType,
            },
          })

          const secResult = await fetchSecFilings(company.name, { supabase, companyId: company.id })
          let secSignalsEmitted = 0

          for (const article of secResult.articles) {
            const result = await classifySignal(company.name, article, roleType)
            if (!result.is_signal || (result.confidence ?? 0) < CONFIDENCE_THRESHOLD) continue
            if (!result.signal_type || !result.signal_summary) continue

            const signalDate = article.pubDate
              ? new Date(article.pubDate).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0]

            const { skipped } = await writeSignal(supabase, {
              companyId:     company.id,
              userId:        user.id,
              signalType:    result.signal_type,
              signalSummary: result.signal_summary,
              sourceUrl:     article.link,
              signalDate,
              outreachAngle: result.outreach_angle ?? null,
              ...buildSignalMetadata(article, result),
            })
            if (!skipped) {
              signalsFound++
              secSignalsEmitted++
              logger.info('signal-job: SEC filing signal', { company: company.name, type: result.signal_type })
            }
          }

          await finishSecIngestionRun(supabase, secRun.runId, {
            status: secResult.fetchError ? 'error' : 'success',
            filingsConsidered: secResult.indexStats.filingsConsidered,
            filingsIndexed: secResult.indexStats.filingsIndexed,
            secArticles: secResult.articles.length,
            signalsEmitted: secSignalsEmitted,
            latestFilingDate: secResult.indexStats.latestFilingDate,
            latestIngestedAt: secResult.indexStats.latestIngestedAt,
            errorMessage: secResult.fetchError,
            metadata: {
              userId: user.id,
              companyName: company.name,
            },
          })

          // SEC 8-K trend detection — cross-filing pattern analysis from indexed history
          const secTrend = await detectSecTrends(supabase, company.id, company.name, roleType)
          if (secTrend) {
            const weekSlot = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
            const { skipped } = await writeSignal(supabase, {
              companyId:     company.id,
              userId:        user.id,
              signalType:    'filing_trend',
              signalSummary: secTrend.signal_summary,
              sourceUrl:     `sec-trend://${company.id}/${weekSlot}`,
              signalDate:    new Date().toISOString().split('T')[0],
              outreachAngle: secTrend.outreach_angle ?? null,
              sourceKind: 'sec_filing',
              focusTags: inferFocusTags('filing_trend'),
              evidenceSnippets: [secTrend.signal_summary],
            })
            if (!skipped) {
              signalsFound++
              logger.info('signal-job: SEC trend signal', { company: company.name })
            }
          }

          // DEF 14A proxy — board composition diff (public companies only, 90-day guard)
          if (company.sec_cik_padded) {
            const boardChanges = await fetchProxyBoardChanges(company.name, { supabase, companyId: company.id })
            for (const change of boardChanges) {
              const today = new Date().toISOString().split('T')[0]
              const { skipped } = await writeSignal(supabase, {
                companyId:     company.id,
                userId:        user.id,
                signalType:    'board_change',
                signalSummary: change.signal_summary,
                sourceUrl:     null,
                signalDate:    today,
                outreachAngle: change.outreach_angle,
                sourceKind: 'sec_filing',
                focusTags: inferFocusTags('board_change'),
                evidenceSnippets: [change.signal_summary],
              })
              if (!skipped) {
                signalsFound++
                logger.info('signal-job: board change', { company: company.name, type: change.changeType, director: change.directorName })
              }
            }
          }

          // SC 13D activist investor watcher (public companies only, 7-day throttle)
          if (company.sec_cik_padded) {
            const activistSignals = await fetchActivistFilings(company.name, {
              supabase,
              companyId:          company.id,
              activistCheckedAt:  company.activist_checked_at,
            })
            for (const sig of activistSignals) {
              const { skipped } = await writeSignal(supabase, {
                companyId:     company.id,
                userId:        user.id,
                signalType:    'activist_entry',
                signalSummary: sig.signal_summary,
                sourceUrl:     null,
                signalDate:    sig.filing_date,
                outreachAngle: sig.outreach_angle,
                sourceKind: 'sec_filing',
                focusTags: ['governance', 'leadership'],
                evidenceSnippets: [sig.signal_summary],
              })
              if (!skipped) {
                signalsFound++
                logger.info('signal-job: activist entry', { company: company.name, activist: sig.activist_name })
              }
            }
          }

          // Form 4 insider sales — material open-market share sales by named officers (7-day throttle)
          if (company.sec_cik_padded) {
            const insiderSignals = await fetchInsiderSales(company.name, {
              supabase,
              companyId:         company.id,
              insiderCheckedAt:  company.insider_checked_at,
            })
            for (const sig of insiderSignals) {
              const { skipped } = await writeSignal(supabase, {
                companyId:     company.id,
                userId:        user.id,
                signalType:    'insider_sale',
                signalSummary: sig.signal_summary,
                sourceUrl:     null,
                signalDate:    sig.signalDate,
                outreachAngle: sig.outreach_angle,
                sourceKind: 'sec_filing',
                focusTags: ['governance', 'leadership'],
                evidenceSnippets: [sig.signal_summary],
              })
              if (!skipped) {
                signalsFound++
                logger.info('signal-job: insider sale', { company: company.name })
              }
            }
          }

          // PR wire — prnewswire, businesswire, globenewswire via Google News RSS
          const prArticles = await fetchPrWire(company.name)
          for (const article of prArticles) {
            const result = await classifySignal(company.name, article, roleType)
            const inferredPartners = extractPartnershipEntities(article, result.partner_entities ?? [])
            const inferredPartnership = inferredPartners.length > 0
            const isStrongSignal = (result.is_signal && (result.confidence ?? 0) >= CONFIDENCE_THRESHOLD) || inferredPartnership
            if (!isStrongSignal) continue
            const normalizedSignalType = inferredPartnership ? 'partnership' : result.signal_type
            const normalizedSummary = inferredPartnership
              ? `${company.name} appears to have a material partnership signal involving ${inferredPartners.join(', ')}.`
              : result.signal_summary
            if (!normalizedSignalType || !normalizedSummary) continue

            const signalDate = article.pubDate
              ? new Date(article.pubDate).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0]

            const { skipped } = await writeSignal(supabase, {
              companyId:     company.id,
              userId:        user.id,
              signalType:    normalizedSignalType,
              signalSummary: normalizedSummary,
              sourceUrl:     article.link,
              signalDate,
              outreachAngle: result.outreach_angle ?? null,
              ...buildSignalMetadata(article, result, {
                signalType: normalizedSignalType,
                partnerEntities: inferredPartners,
                focusTags: inferredPartnership
                  ? inferFocusTags('partnership', result.focus_tags ?? [])
                  : undefined,
              }),
            })
            if (!skipped) {
              signalsFound++
              logger.info('signal-job: PR wire signal', { company: company.name, type: normalizedSignalType })
            }
          }

          // Business journals — Bizjournals.com network (private + mid-market coverage)
          const bizArticles = await fetchBizJournalMentions(company.name)
          for (const article of bizArticles) {
            const result = await classifySignal(company.name, article, roleType)
            const inferredPartners = extractPartnershipEntities(article, result.partner_entities ?? [])
            const inferredPartnership = inferredPartners.length > 0
            const isStrongSignal = (result.is_signal && (result.confidence ?? 0) >= CONFIDENCE_THRESHOLD) || inferredPartnership
            if (!isStrongSignal) continue
            const normalizedSignalType = inferredPartnership ? 'partnership' : result.signal_type
            const normalizedSummary = inferredPartnership
              ? `${company.name} appears to have a material partnership signal involving ${inferredPartners.join(', ')}.`
              : result.signal_summary
            if (!normalizedSignalType || !normalizedSummary) continue

            const signalDate = article.pubDate
              ? new Date(article.pubDate).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0]

            const { skipped } = await writeSignal(supabase, {
              companyId:     company.id,
              userId:        user.id,
              signalType:    normalizedSignalType,
              signalSummary: normalizedSummary,
              sourceUrl:     article.link,
              signalDate,
              outreachAngle: result.outreach_angle ?? null,
              ...buildSignalMetadata(article, result, {
                signalType: normalizedSignalType,
                partnerEntities: inferredPartners,
                focusTags: inferredPartnership
                  ? inferFocusTags('partnership', result.focus_tags ?? [])
                  : undefined,
              }),
            })
            if (!skipped) {
              signalsFound++
              logger.info('signal-job: bizjournal signal', { company: company.name, type: normalizedSignalType })
            }
          }

          // Tech trade press — CIO/CTO/CISO-focused publications
          const tradeArticles = await fetchTradePressArticles(company.name)
          for (const article of tradeArticles) {
            const result = await classifySignal(company.name, article, roleType)
            const inferredPartners = extractPartnershipEntities(article, result.partner_entities ?? [])
            const inferredPartnership = inferredPartners.length > 0
            const isStrongSignal = (result.is_signal && (result.confidence ?? 0) >= CONFIDENCE_THRESHOLD) || inferredPartnership
            if (!isStrongSignal) continue
            const normalizedSignalType = inferredPartnership ? 'partnership' : result.signal_type
            const normalizedSummary = inferredPartnership
              ? `${company.name} appears to have a material partnership signal involving ${inferredPartners.join(', ')}.`
              : result.signal_summary
            if (!normalizedSignalType || !normalizedSummary) continue

            const signalDate = article.pubDate
              ? new Date(article.pubDate).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0]

            const { skipped } = await writeSignal(supabase, {
              companyId:     company.id,
              userId:        user.id,
              signalType:    normalizedSignalType,
              signalSummary: normalizedSummary,
              sourceUrl:     article.link,
              signalDate,
              outreachAngle: result.outreach_angle ?? null,
              ...buildSignalMetadata(article, result, {
                signalType: normalizedSignalType,
                partnerEntities: inferredPartners,
                focusTags: inferredPartnership
                  ? inferFocusTags('partnership', result.focus_tags ?? [])
                  : undefined,
              }),
            })
            if (!skipped) {
              signalsFound++
              logger.info('signal-job: trade press signal', { company: company.name, type: normalizedSignalType })
            }
          }

          // Regulatory calendar — sector-level compliance pressure signals (90-day dedup)
          const regulatorySignals = await checkRegulatoryCalendar(company, { supabase, userId: user.id })
          for (const sig of regulatorySignals) {
            const { skipped } = await writeSignal(supabase, {
              companyId:     company.id,
              userId:        user.id,
              signalType:    'regulatory_change',
              signalSummary: sig.signal_summary,
              sourceUrl:     sig.sourceUrl,
              signalDate:    new Date().toISOString().split('T')[0],
              outreachAngle: sig.outreach_angle,
              sourceKind: 'regulatory_calendar',
              focusTags: inferFocusTags('regulatory_change'),
              evidenceSnippets: [sig.signal_summary],
            })
            if (!skipped) {
              signalsFound++
              logger.info('signal-job: regulatory signal', { company: company.name, event: sig.eventName })
            }
          }

          // PredictLeads — executive changes and company event signals
          if (company.company_url && process.env.PREDICTLEADS_API_KEY) {
            const plArticles = await fetchPredictLeadsSignals(company.company_url, company.name)
            for (const article of plArticles) {
              // PredictLeads signals are already typed — use the mapped type directly
              // and run classify only to generate the signal_summary and outreach_angle.
              const result = await classifySignal(company.name, article, roleType)
              if (!result.is_signal || (result.confidence ?? 0) < CONFIDENCE_THRESHOLD) continue
              if (!result.signal_summary) continue

              const signalDate = article.pubDate
                ? new Date(article.pubDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]

              const { skipped } = await writeSignal(supabase, {
                companyId:     company.id,
                userId:        user.id,
                signalType:    article._predictleadsType,
                signalSummary: result.signal_summary,
                sourceUrl:     article.link,
                signalDate,
                outreachAngle: result.outreach_angle ?? null,
                ...buildSignalMetadata(article, result, { signalType: article._predictleadsType }),
              })
              if (!skipped) {
                signalsFound++
                logger.info('signal-job: predictleads signal', { company: company.name, type: article._predictleadsType })
              }
            }
          }

          // Crunchbase — structured funding rounds (no classification needed)
          if (company.crunchbase_id && process.env.CRUNCHBASE_API_KEY) {
            const rounds = await fetchCrunchbaseFunding(company.crunchbase_id)
            for (const round of rounds) {
              const { signal_summary, outreach_angle } = formatFundingSignal(company.name, round)
              const { skipped } = await writeSignal(supabase, {
                companyId:     company.id,
                userId:        user.id,
                signalType:    'funding',
                signalSummary: signal_summary,
                sourceUrl:     round.sourceUrl,
                signalDate:    round.announcedOn,
                outreachAngle: outreach_angle,
                sourceKind: inferSourceKindFromUrl(round.sourceUrl),
                focusTags: inferFocusTags('funding'),
                evidenceSnippets: [signal_summary],
              })
              if (!skipped) {
                signalsFound++
                logger.info('signal-job: crunchbase funding signal', { company: company.name, amount: round.amount })
              }
            }
          }
          // Proxycurl exec snapshot — detect departures and hires by diffing LinkedIn data
          if (process.env.PDL_API_KEY) {
            const today = new Date().toISOString().split('T')[0]
            const { data: existingSnapshot } = await supabase
              .from('exec_snapshots')
              .select('id')
              .eq('company_id', company.id)
              .eq('snapshot_date', today)
              .maybeSingle()

            if (!existingSnapshot) {
              const currentExecs = await fetchPdlExecs(company.name, company.company_url ?? null)
              if (currentExecs.length > 0) {
                const { departures, hires } = await diffExecSnapshot(supabase, company.id, user.id, currentExecs, today)

                for (const exec of departures) {
                  const outreachAngle = `The departure of ${exec.name} as ${exec.title} creates an opening for external executive talent. Reach out before the search is formalized.`
                  const { skipped, signalId } = await writeSignal(supabase, {
                    companyId:     company.id,
                    userId:        user.id,
                    signalType:    'exec_departure',
                    signalSummary: `${exec.name} (${exec.title}) departed ${company.name}.`,
                    sourceUrl:     exec.linkedin_url ? `${exec.linkedin_url}#departure` : null,
                    signalDate:    today,
                    outreachAngle,
                    sourceKind: 'executive_snapshot',
                    focusTags: inferFocusTags('exec_departure'),
                    evidenceSnippets: [`${exec.name} (${exec.title}) departed ${company.name}.`],
                  })
                  if (!skipped) {
                    signalsFound++
                    logger.info('signal-job: exec departure', { company: company.name, exec: exec.name })
                    if (user.subscription_tier === 'executive' && user.email) {
                      generateOutreachDraft({
                        companyName: company.name,
                        signalType: 'exec_departure',
                        signalSummary: `${exec.name} (${exec.title}) departed ${company.name}.`,
                        outreachAngle,
                        userProfile,
                        companyContext: {
                          sector: company.sector ?? null,
                          notes: company.notes ?? null,
                          roleWatchDescription: company.role_watch_description ?? null,
                        },
                      }).then(draft => {
                        if (draft && signalId) {
                          supabase.from('company_signals').update({ outreach_draft: draft }).eq('id', signalId).then(() => {})
                        }
                        sendSignalAlert({
                          to: user.email,
                          companyName: company.name,
                          patternName: 'Exec Departure',
                          summary: `${exec.name} (${exec.title}) has departed ${company.name}. No replacement announced yet.`,
                          outreachAngle,
                          outreachDraft: draft ?? null,
                        }).catch(err => logger.error('signal-job: exec departure alert failed', { error: err.message }))
                      }).catch(err => logger.error('signal-job: exec departure draft failed', { error: err.message }))
                    }
                  }
                }

                for (const exec of hires) {
                  const { skipped } = await writeSignal(supabase, {
                    companyId:     company.id,
                    userId:        user.id,
                    signalType:    'exec_hire',
                    signalSummary: `${exec.name} joined ${company.name} as ${exec.title}.`,
                    sourceUrl:     exec.linkedin_url ? `${exec.linkedin_url}#hire` : null,
                    signalDate:    today,
                    outreachAngle: `A new ${exec.title} at ${company.name} often builds new relationships early in tenure. This is a strong moment to introduce yourself.`,
                    sourceKind: 'executive_snapshot',
                    focusTags: inferFocusTags('exec_hire'),
                    evidenceSnippets: [`${exec.name} joined ${company.name} as ${exec.title}.`],
                  })
                  if (!skipped) {
                    signalsFound++
                    logger.info('signal-job: exec hire', { company: company.name, exec: exec.name })
                  }
                }
              }
            }
          }

          // Signal correlation — detect multi-signal patterns across the past 60 days
          const cutoff60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          const { data: recentSignals } = await supabase
            .from('company_signals')
            .select('signal_type, signal_summary, signal_date')
            .eq('company_id', company.id)
            .eq('user_id', user.id)
            .gte('signal_date', cutoff60)
            .neq('signal_type', 'pattern_alert')
            .order('signal_date', { ascending: false })
            .limit(10)

          if ((recentSignals?.length ?? 0) >= 2) {
            const correlation = await correlateSignals(company.name, recentSignals, roleType)
            if (correlation.detected && correlation.pattern_name) {
              const weekSlot = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
              const { skipped, signalId: patternSignalId } = await writeSignal(supabase, {
                companyId:     company.id,
                userId:        user.id,
                signalType:    'pattern_alert',
                signalSummary: `${correlation.pattern_name}: ${correlation.pattern_summary}`,
                sourceUrl:     `pattern://${correlation.pattern_name.toLowerCase().replace(/\s+/g, '_')}/${weekSlot}`,
                signalDate:    new Date().toISOString().split('T')[0],
                outreachAngle: correlation.outreach_angle ?? null,
                sourceKind: 'pattern_correlation',
                focusTags: ['leadership', 'operations'],
                evidenceSnippets: [correlation.pattern_summary],
              })
              if (!skipped) {
                signalsFound++
                logger.info('signal-job: pattern alert', { company: company.name, pattern: correlation.pattern_name })
                if (user.subscription_tier === 'executive' && user.email) {
                  generateOutreachDraft({
                    companyName: company.name,
                    signalType: 'pattern_alert',
                    signalSummary: correlation.pattern_summary,
                    outreachAngle: correlation.outreach_angle ?? null,
                    userProfile,
                    companyContext: {
                      sector: company.sector ?? null,
                      notes: company.notes ?? null,
                      roleWatchDescription: company.role_watch_description ?? null,
                    },
                  }).then(draft => {
                    if (draft && patternSignalId) {
                      supabase.from('company_signals').update({ outreach_draft: draft }).eq('id', patternSignalId).then(() => {})
                    }
                    sendSignalAlert({
                      to: user.email,
                      companyName: company.name,
                      patternName: correlation.pattern_name,
                      summary: correlation.pattern_summary,
                      outreachAngle: correlation.outreach_angle ?? null,
                      outreachDraft: draft ?? null,
                    }).catch(err => logger.error('signal-job: pattern alert email failed', { error: err.message }))
                  }).catch(err => logger.error('signal-job: pattern draft failed', { error: err.message }))
                }
              }
            }
          }
        } catch (err) {
          logger.error('signal-job: error', { company: company.name, error: err.message, stack: err.stack })

          await enqueueHeavyJob(supabase, {
            jobType: CHECKPOINT_JOB_NAME,
            payload: {
              mode: SIGNAL_RETRY_MODE,
              companyId: company.id,
              userId: user.id,
            },
            idempotencyKey: `${company.id}:${user.id}:${cycleKey}`,
            maxAttempts: 5,
          })
        }

        await new Promise(r => setTimeout(r, DELAY_MS))
      }
      }

      lastUserId = users[users.length - 1]?.id ?? lastUserId

      await saveJobCheckpoint(supabase, CHECKPOINT_JOB_NAME, {
        cursor: {
          lastUserId,
          pagesProcessed,
          usersProcessed,
          companiesScanned,
          signalsFound,
        },
        context: {
          cycleKey,
          updatedAt: new Date().toISOString(),
        },
      })

      if (users.length < USER_PAGE_SIZE) {
        completedCycle = true
        break
      }
    }

    if (completedCycle) {
      await clearJobCheckpoint(supabase, CHECKPOINT_JOB_NAME)
    } else {
      logger.warn('signal-job: page budget reached; resume will continue from checkpoint', {
        pagesProcessed,
        usersProcessed,
        lastUserId,
      })
    }

    const retryResult = await processHeavyJobs(supabase, {
      jobType: CHECKPOINT_JOB_NAME,
      limit: 10,
      handler: async (job) => {
        const payload = job?.payload ?? {}
        if (payload.mode !== SIGNAL_RETRY_MODE) {
          throw new Error('unsupported_signal_retry_payload')
        }
        await retrySignalCompanyById(supabase, payload)
      },
    })

    if ((retryResult.processed ?? 0) > 0) {
      logger.info('signal-job: retry queue processed', retryResult)
    }

    logger.info('signal-job: complete', { companiesScanned, signalsFound, usersProcessed, pagesProcessed })
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: SIGNAL_LOCK_KEY })
  }
}
