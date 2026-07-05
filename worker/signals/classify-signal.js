import Anthropic from '@anthropic-ai/sdk'
import { HAIKU } from '../lib/models.js'
import { logger } from '../lib/logger.js'
import { writeIngestDlq } from '../lib/ingest-dlq.js'
import {
  CLASSIFY_MAX_TOKENS,
  buildClassifyPrompt,
  parseClassifyResponse,
  normalizeClassification,
} from './classify-signal-core.js'

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

const SIGNAL_PRIORITIES = {
  cio:          'Leadership changes in technology functions, digital transformation announcements, and IT investment decisions are high-priority signals for this candidate.',
  cto:          'Engineering leadership changes, product launches, funding rounds with engineering buildout, and technical architecture announcements are high-priority signals.',
  cdo_data:     'data_platform and ai_investment signals are the highest priority for this candidate. Also flag Chief Data or AI Officer appointments, data governance regulatory changes, and analytics infrastructure announcements.',
  cdo_digital:  'Digital transformation announcements, customer experience investments, and e-commerce or omnichannel initiatives are high-priority signals.',
  ciso:         'breach_disclosure and regulatory_change signals are the highest priority for this candidate. Also flag CISO departures, compliance deadline announcements, and any board-level governance change that elevates security accountability.',
  cpo:          'Product launches and pivots, competitor feature announcements, product leadership changes, and app store or review rating movements are high-priority signals.',
  coo:          'M&A announcements, revenue pressure or EBITDA signals, operational leadership changes, and CEO changes are the highest-priority signals for this candidate.',
  vp_technology:'Technology leadership changes, CIO or CTO role openings, and technology transformation announcements are high-priority signals.',
}

const MAX_ATTEMPTS = 2

// Classifies a news article as a hiring-relevant signal using Claude Haiku.
// Retries once on failure; on final failure writes to the ingest DLQ (when a
// supabase client is provided) instead of dropping the signal silently.
// Options: { companyContext: { sector, isPublic }, supabase }
// Returns { is_signal, entity_match, signal_type, confidence, signal_summary,
//           outreach_angle, focus_tags, evidence_snippets, partner_entities }
// or { is_signal: false, classification_failed: true } on unrecoverable failure.
export async function classifySignal(companyName, article, roleType = null, options = {}) {
  const signalPriority = roleType ? (SIGNAL_PRIORITIES[roleType] ?? '') : ''
  const prompt = buildClassifyPrompt(
    companyName,
    article,
    roleType,
    options.companyContext ?? null,
    signalPriority,
  )

  let lastError = null
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const message = await getClient().messages.create({
        model: HAIKU,
        max_tokens: CLASSIFY_MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      })
      const raw = message.content[0]?.text?.trim() ?? ''
      return normalizeClassification(parseClassifyResponse(raw))
    } catch (err) {
      lastError = err
      logger.warn('classify-signal: attempt failed', {
        company: companyName,
        attempt,
        error: err.message,
      })
    }
  }

  logger.error('classify-signal: all attempts failed', {
    company: companyName,
    error: lastError?.message,
  })

  if (options.supabase) {
    await writeIngestDlq(options.supabase, {
      source: 'classify-signal',
      companyName,
      payload: {
        title: article?.title ?? null,
        link: article?.link ?? null,
        pubDate: article?.pubDate ?? null,
        roleType,
      },
      error: lastError?.message ?? 'unknown classification failure',
    })
  }

  return { is_signal: false, classification_failed: true }
}
