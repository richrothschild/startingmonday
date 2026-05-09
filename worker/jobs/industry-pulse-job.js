import Anthropic from '@anthropic-ai/sdk'
import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { fetchSectorNews } from '../signals/fetch-sector-news.js'
import { HAIKU } from '../lib/models.js'

const INDUSTRY_PULSE_LOCK_KEY = 9173645028n

const ROLE_LABELS = {
  cio:           'CIO',
  cto:           'CTO',
  cdo_data:      'Chief Data Officer',
  cdo_digital:   'Chief Digital Officer',
  ciso:          'CISO',
  cpo:           'Chief Product Officer',
  coo:           'COO',
  vp_technology: 'VP of Technology',
}

export async function runIndustryPulseJob() {
  const supabase = getSupabase()

  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: INDUSTRY_PULSE_LOCK_KEY })
  if (!locked) {
    logger.warn('industry-pulse-job: another instance running — skipping')
    return
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .in('subscription_status', ['active', 'trialing'])
      .limit(500)

    if (error || !users?.length) {
      logger.info('industry-pulse-job: no eligible users')
      return
    }

    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, role_type, target_sectors')
      .in('user_id', users.map(u => u.id))
      .not('role_type', 'is', null)

    if (!profiles?.length) {
      logger.info('industry-pulse-job: no profiles with role_type')
      return
    }

    // Deduplicate by role_type + sorted sectors to avoid redundant API calls
    const pulseCache = new Map()
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    let generated = 0

    for (const profile of profiles) {
      const roleType = profile.role_type
      const sectors  = (profile.target_sectors ?? []).slice(0, 3)
      const cacheKey = `${roleType}:${[...sectors].sort().join(',')}`

      try {
        let bullets = pulseCache.get(cacheKey)

        if (!bullets) {
          const articles = await fetchSectorNews(roleType, sectors)
          if (articles.length === 0) continue

          const articlesText = articles
            .map(a => `- ${a.title}${a.description ? ': ' + a.description.slice(0, 120) : ''}`)
            .join('\n')

          const roleLabel  = ROLE_LABELS[roleType] ?? 'executive'
          const sectorStr  = sectors.length > 0 ? sectors.join(', ') : 'the market'

          const msg = await client.messages.create({
            model: HAIKU,
            max_tokens: 400,
            messages: [{
              role: 'user',
              content: `You are writing a brief sector intelligence summary for a ${roleLabel} candidate in ${sectorStr}.

Recent headlines about ${roleLabel} appointments and moves:
${articlesText}

Write 3 concise bullets summarizing what these signals mean for a ${roleLabel} candidate. Focus on:
- Volume and pace of ${roleLabel} movement this week
- Notable patterns (internal vs. external hires, company types that are hiring)
- Any structural insight (transformation mandates, board changes driving leadership moves)

Each bullet: one factual sentence. No filler phrases. Return a JSON array of 3 strings only.`
            }],
          })

          const raw = (msg.content[0]?.text ?? '[]').trim()
            .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
          try {
            const parsed = JSON.parse(raw)
            bullets = Array.isArray(parsed) ? parsed.filter(b => typeof b === 'string').slice(0, 3) : []
          } catch {
            bullets = []
          }

          if (bullets.length > 0) pulseCache.set(cacheKey, bullets)
        }

        if (!bullets?.length) continue

        await supabase.from('industry_pulse').insert({
          user_id:  profile.user_id,
          role_type: roleType,
          bullets,
        })

        generated++
        logger.info('industry-pulse-job: generated', { userId: profile.user_id, bullets: bullets.length })
      } catch (err) {
        logger.error('industry-pulse-job: failed for user', { userId: profile.user_id, error: err.message })
      }
    }

    logger.info('industry-pulse-job: complete', { generated, cached: pulseCache.size })
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: INDUSTRY_PULSE_LOCK_KEY })
  }
}
