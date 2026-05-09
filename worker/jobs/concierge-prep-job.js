import Anthropic from '@anthropic-ai/sdk'
import { logger } from '../lib/logger.js'
import { getSupabase } from '../lib/supabase.js'
import { HAIKU } from '../lib/models.js'

const CONCIERGE_PREP_LOCK_KEY = 9341827650n

export async function runConciergePrepJob() {
  const supabase = getSupabase()

  const { data: locked } = await supabase.rpc('try_advisory_lock', { p_key: CONCIERGE_PREP_LOCK_KEY })
  if (!locked) {
    logger.warn('concierge-prep-job: another instance running — skipping')
    return
  }

  try {
    const windowStart = new Date().toISOString()
    const windowEnd   = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Find calls in the next 24h that have not yet had an agenda generated
    const { data: calls, error } = await supabase
      .from('concierge_calls')
      .select('id, user_id, scheduled_at, agenda')
      .eq('status', 'scheduled')
      .gte('scheduled_at', windowStart)
      .lte('scheduled_at', windowEnd)

    if (error || !calls?.length) {
      logger.info('concierge-prep-job: no calls to prep')
      return
    }

    const callsNeedingAgenda = calls.filter(c => !c.agenda || c.agenda.length === 0)
    if (!callsNeedingAgenda.length) {
      logger.info('concierge-prep-job: all upcoming calls already have agendas')
      return
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    let prepped = 0

    for (const call of callsNeedingAgenda) {
      try {
        const [{ data: profile }, { data: companies }, { data: recentSignals }, { data: contacts }] = await Promise.all([
          supabase
            .from('user_profiles')
            .select('full_name, current_title, target_titles, target_sectors, target_locations, momentum_score')
            .eq('user_id', call.user_id)
            .single(),
          supabase
            .from('companies')
            .select('name, stage, updated_at')
            .eq('user_id', call.user_id)
            .is('archived_at', null)
            .order('updated_at', { ascending: false })
            .limit(20),
          supabase
            .from('company_signals')
            .select('signal_type, signal_summary, companies(name)')
            .eq('user_id', call.user_id)
            .gte('signal_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .order('signal_date', { ascending: false })
            .limit(10),
          supabase
            .from('contacts')
            .select('name, company, last_contact_date, relationship_strength')
            .eq('user_id', call.user_id)
            .order('last_contact_date', { ascending: true })
            .limit(10),
        ])

        if (!profile) continue

        const stageGroups = (companies ?? []).reduce((acc, c) => {
          ;(acc[c.stage] ??= []).push(c.name)
          return acc
        }, {})

        const stageStr = Object.entries(stageGroups)
          .map(([stage, names]) => `${stage}: ${names.join(', ')}`)
          .join('\n')

        const signalStr = (recentSignals ?? [])
          .map(s => `${s.companies?.name}: ${s.signal_type} — ${s.signal_summary?.slice(0, 80)}`)
          .join('\n') || 'None in last 14 days'

        const staleContacts = (contacts ?? [])
          .filter(c => c.last_contact_date && new Date(c.last_contact_date) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .map(c => `${c.name} at ${c.company}`)
          .slice(0, 5)

        const msg = await client.messages.create({
          model: HAIKU,
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `Prepare a focused strategy call agenda for a ${profile.current_title ?? 'senior technology executive'} in active job search.

Pipeline summary:
${stageStr || 'No companies tracked yet'}

Recent signals (last 14 days):
${signalStr}

Contacts not reached in 30+ days:
${staleContacts.join(', ') || 'None identified'}

Momentum score: ${profile.momentum_score ?? 'not computed'}

Generate 5 focused agenda items. Each should be actionable and specific to this person's pipeline. Prioritize: items that need a decision, stalled relationships, and signals worth acting on.

Return JSON only:
[{"topic": "...", "detail": "one sentence, specific and actionable", "priority": "high|medium|low"}]`,
          }],
        })

        const raw = (msg.content[0]?.text ?? '[]').trim()
          .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()

        let agenda
        try {
          agenda = JSON.parse(raw)
          if (!Array.isArray(agenda)) agenda = []
        } catch {
          agenda = []
        }

        agenda = agenda.filter(a => a?.topic && a?.detail).slice(0, 7)
        if (agenda.length === 0) continue

        await supabase
          .from('concierge_calls')
          .update({ agenda })
          .eq('id', call.id)

        prepped++
        logger.info('concierge-prep-job: prepped', { callId: call.id, userId: call.user_id, items: agenda.length })
      } catch (err) {
        logger.error('concierge-prep-job: failed for call', { callId: call.id, error: err.message })
      }
    }

    logger.info('concierge-prep-job: complete', { prepped })
  } finally {
    await supabase.rpc('advisory_unlock', { p_key: CONCIERGE_PREP_LOCK_KEY })
  }
}
