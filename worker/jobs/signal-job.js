import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { fetchCompanyNews } from '../signals/fetch-company-news.js'
import { classifySignal } from '../signals/classify-signal.js'
import { writeSignal } from '../signals/write-signal.js'

const CONFIDENCE_THRESHOLD = 60
const DELAY_MS = 600 // between companies to avoid hammering Google News

export async function runSignalJob() {
  const supabase = getSupabase()

  const { data: users, error } = await supabase
    .from('users')
    .select('id')
    .in('subscription_status', ['active', 'trialing'])

  if (error) {
    logger.error('signal-job: failed to fetch users', { error: error.message })
    return
  }

  if (!users?.length) {
    logger.info('signal-job: no active users')
    return
  }

  let companiesScanned = 0
  let signalsFound = 0

  for (const user of users) {
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .eq('user_id', user.id)
      .is('archived_at', null)

    if (!companies?.length) continue

    for (const company of companies) {
      companiesScanned++
      try {
        const articles = await fetchCompanyNews(company.name)
        if (!articles.length) continue

        for (const article of articles) {
          const result = await classifySignal(company.name, article)
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
      } catch (err) {
        logger.error('signal-job: error', { company: company.name, error: err.message })
      }

      await new Promise(r => setTimeout(r, DELAY_MS))
    }
  }

  logger.info('signal-job: complete', { companiesScanned, signalsFound })
}
