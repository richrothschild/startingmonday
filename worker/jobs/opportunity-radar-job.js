import Anthropic from '@anthropic-ai/sdk'
import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { HAIKU } from '../lib/models.js'

const OPPORTUNITY_RADAR_LOCK_KEY = 9258137064n

export async function runOpportunityRadarJob() {
  const supabase = getSupabase()

  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: OPPORTUNITY_RADAR_LOCK_KEY })
  if (!locked) {
    logger.warn('opportunity-radar-job: another instance running — skipping')
    return
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .in('subscription_status', ['active', 'trialing'])
      .limit(500)

    if (error || !users?.length) {
      logger.info('opportunity-radar-job: no eligible users')
      return
    }

    const userIds = users.map(u => u.id)

    const [{ data: profiles }, { data: allCompanies }] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('user_id, role_type, current_title, target_titles, target_sectors, target_locations')
        .in('user_id', userIds),
      supabase
        .from('companies')
        .select('user_id, name')
        .in('user_id', userIds)
        .is('archived_at', null),
    ])

    const profileByUserId = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))
    const companiesByUser = (allCompanies ?? []).reduce((acc, c) => {
      ;(acc[c.user_id] ??= []).push(c.name)
      return acc
    }, {})

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    let generated = 0

    for (const user of users) {
      const profile = profileByUserId[user.id]
      if (!profile?.role_type && !profile?.current_title) continue

      const existingCompanies = companiesByUser[user.id] ?? []
      if (existingCompanies.length === 0) continue

      try {
        const roleLabel   = profile.current_title ?? profile.role_type ?? 'senior executive'
        const sectors     = (profile.target_sectors  ?? []).join(', ') || 'not specified'
        const locations   = (profile.target_locations ?? []).join(', ') || 'US'
        const existingStr = existingCompanies.slice(0, 20).join(', ')

        const msg = await client.messages.create({
          model: HAIKU,
          max_tokens: 600,
          messages: [{
            role: 'user',
            content: `A ${roleLabel} is monitoring their job market. They currently watch: ${existingStr}.
Target sectors: ${sectors}
Target locations: ${locations}

Suggest 3 companies they are NOT watching where a ${roleLabel} search is likely based on recent organizational or market activity. For each, explain specifically why this company may be relevant right now.

Return a JSON array of 3 objects:
[{"company_name": "...", "reason": "one sentence, specific and factual — not generic", "signal_type": one of exec_departure|exec_hire|transformation_budget|funding|acquisition|expansion|board_change or null, "confidence": 0-100}]
Output JSON only, no markdown fences.`,
          }],
        })

        const raw = (msg.content[0]?.text ?? '[]').trim()
          .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()

        let hits
        try {
          hits = JSON.parse(raw)
          if (!Array.isArray(hits)) hits = []
        } catch {
          hits = []
        }

        hits = hits.filter(h => h?.company_name && h?.reason).slice(0, 3)
        if (hits.length === 0) continue

        // Replace existing radar for this user with fresh results
        await supabase.from('opportunity_radar').delete().eq('user_id', user.id)
        await supabase.from('opportunity_radar').insert(
          hits.map(h => ({
            user_id:      user.id,
            company_name: String(h.company_name),
            reason:       String(h.reason),
            signal_type:  h.signal_type ?? null,
            confidence:   typeof h.confidence === 'number' ? h.confidence : null,
          }))
        )

        generated++
        logger.info('opportunity-radar-job: generated', { userId: user.id, hits: hits.length })
      } catch (err) {
        logger.error('opportunity-radar-job: failed for user', { userId: user.id, error: err.message })
      }
    }

    logger.info('opportunity-radar-job: complete', { generated })
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: OPPORTUNITY_RADAR_LOCK_KEY })
  }
}
