import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { fetchCompanyNews } from '../signals/fetch-company-news.js'
import { classifySignal } from '../signals/classify-signal.js'
import { writeSignal } from '../signals/write-signal.js'
import { fetchCrunchbaseFunding, formatFundingSignal } from '../signals/fetch-crunchbase-funding.js'
import { findPressRoomArticles } from '../signals/fetch-press-room.js'
import { fetchSecFilings } from '../signals/fetch-sec-filings.js'
import { fetchPrWire } from '../signals/fetch-pr-wire.js'

const CONFIDENCE_THRESHOLD = 60
const DELAY_MS = 600 // between companies to avoid hammering Google News
const SIGNAL_LOCK_KEY = 7329841025n

export async function runSignalJob() {
  const supabase = getSupabase()

  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: SIGNAL_LOCK_KEY })
  if (!locked) {
    logger.warn('signal-job: another instance running — skipping')
    return
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .in('subscription_status', ['active', 'trialing'])
      .limit(1000)

    if (error) {
      logger.error('signal-job: failed to fetch users', { error: error.message, stack: error.stack })
      return
    }

    if (!users?.length) {
      logger.info('signal-job: no active users')
      return
    }

    const userIds = users.map(u => u.id)
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, role_type')
      .in('user_id', userIds)
    const roleTypeByUserId = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p.role_type]))

    let companiesScanned = 0
    let signalsFound = 0

    for (const user of users) {
      const roleType = roleTypeByUserId[user.id] ?? null
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, crunchbase_id, company_url')
        .eq('user_id', user.id)
        .is('archived_at', null)

      if (!companies?.length) continue

      for (const company of companies) {
        companiesScanned++
        try {
          // Google News — classify articles via Claude Haiku
          const articles = await fetchCompanyNews(company.name)
          for (const article of articles) {
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
            })

            if (!skipped) {
              signalsFound++
              logger.info('signal-job: new signal', { company: company.name, type: result.signal_type })
            }
          }

          // Press room — scrape company's own newsroom for press releases
          if (company.company_url) {
            const pressArticles = await findPressRoomArticles(company.company_url)
            for (const article of pressArticles) {
              const result = await classifySignal(company.name, article, roleType)
              if (!result.is_signal || (result.confidence ?? 0) < CONFIDENCE_THRESHOLD) continue
              if (!result.signal_type || !result.signal_summary) continue

              const { skipped } = await writeSignal(supabase, {
                companyId:     company.id,
                userId:        user.id,
                signalType:    result.signal_type,
                signalSummary: result.signal_summary,
                sourceUrl:     article.link,
                signalDate:    new Date().toISOString().split('T')[0],
                outreachAngle: result.outreach_angle ?? null,
              })
              if (!skipped) {
                signalsFound++
                logger.info('signal-job: press room signal', { company: company.name, type: result.signal_type })
              }
            }
          }

          // SEC EDGAR 8-K filings — exec changes, acquisitions, bankruptcy, material events
          const secArticles = await fetchSecFilings(company.name)
          for (const article of secArticles) {
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
            })
            if (!skipped) {
              signalsFound++
              logger.info('signal-job: SEC filing signal', { company: company.name, type: result.signal_type })
            }
          }

          // PR wire — prnewswire, businesswire, globenewswire via Google News RSS
          const prArticles = await fetchPrWire(company.name)
          for (const article of prArticles) {
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
            })
            if (!skipped) {
              signalsFound++
              logger.info('signal-job: PR wire signal', { company: company.name, type: result.signal_type })
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
              })
              if (!skipped) {
                signalsFound++
                logger.info('signal-job: crunchbase funding signal', { company: company.name, amount: round.amount })
              }
            }
          }
        } catch (err) {
          logger.error('signal-job: error', { company: company.name, error: err.message, stack: err.stack })
        }

        await new Promise(r => setTimeout(r, DELAY_MS))
      }
    }

    logger.info('signal-job: complete', { companiesScanned, signalsFound })
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: SIGNAL_LOCK_KEY })
  }
}
