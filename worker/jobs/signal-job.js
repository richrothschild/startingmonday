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
import { fetchPdlExecs } from '../signals/fetch-pdl-execs.js'
import { diffExecSnapshot } from '../signals/diff-exec-snapshot.js'
import { correlateSignals } from '../signals/correlate-signals.js'

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
      .select('id, email, subscription_tier')
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
        .select('id, name, crunchbase_id, company_url, linkedin_url')
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
          // Passing supabase+companyId also indexes all 8-K filings for trend detection below.
          const secArticles = await fetchSecFilings(company.name, { supabase, companyId: company.id })
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
            })
            if (!skipped) {
              signalsFound++
              logger.info('signal-job: SEC trend signal', { company: company.name })
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
                const { departures, hires } = await diffExecSnapshot(supabase, company.id, currentExecs, today)

                for (const exec of departures) {
                  const outreachAngle = `The departure of ${exec.name} as ${exec.title} creates an opening for external executive talent. Reach out before the search is formalized.`
                  const { skipped } = await writeSignal(supabase, {
                    companyId:     company.id,
                    userId:        user.id,
                    signalType:    'exec_departure',
                    signalSummary: `${exec.name} (${exec.title}) departed ${company.name}.`,
                    sourceUrl:     exec.linkedin_url ? `${exec.linkedin_url}#departure` : null,
                    signalDate:    today,
                    outreachAngle,
                  })
                  if (!skipped) {
                    signalsFound++
                    logger.info('signal-job: exec departure', { company: company.name, exec: exec.name })
                    if (user.subscription_tier === 'executive' && user.email) {
                      sendSignalAlert({
                        to: user.email,
                        companyName: company.name,
                        patternName: 'Exec Departure',
                        summary: `${exec.name} (${exec.title}) has departed ${company.name}. No replacement announced yet.`,
                        outreachAngle,
                      }).catch(err => logger.error('signal-job: exec departure alert failed', { error: err.message }))
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
              const { skipped } = await writeSignal(supabase, {
                companyId:     company.id,
                userId:        user.id,
                signalType:    'pattern_alert',
                signalSummary: `${correlation.pattern_name}: ${correlation.pattern_summary}`,
                sourceUrl:     `pattern://${correlation.pattern_name.toLowerCase().replace(/\s+/g, '_')}/${weekSlot}`,
                signalDate:    new Date().toISOString().split('T')[0],
                outreachAngle: correlation.outreach_angle ?? null,
              })
              if (!skipped) {
                signalsFound++
                logger.info('signal-job: pattern alert', { company: company.name, pattern: correlation.pattern_name })
                if (user.subscription_tier === 'executive' && user.email) {
                  sendSignalAlert({
                    to: user.email,
                    companyName: company.name,
                    patternName: correlation.pattern_name,
                    summary: correlation.pattern_summary,
                    outreachAngle: correlation.outreach_angle ?? null,
                  }).catch(err => logger.error('signal-job: pattern alert email failed', { error: err.message }))
                }
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
