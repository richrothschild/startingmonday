import Anthropic from '@anthropic-ai/sdk'
import { getSupabase } from '../lib/supabase.js'
import { sendEmail } from '../lib/send-email.js'
import { trackUsage } from '../lib/usage-tracker.js'
import { logger } from '../lib/logger.js'
import { HAIKU } from '../lib/models.js'
import { watermarkEmailHtml } from '../lib/watermark.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'

let _anthropic = null
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _anthropic
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function getCompanySuggestions({ currentTitle, targetSectors, existingCompanyNames }) {
  const sectorsStr = (targetSectors ?? []).join(', ') || 'Not specified'
  const existingStr = (existingCompanyNames ?? []).slice(0, 10).join(', ') || 'None yet'

  const prompt = `A senior executive is passively monitoring the job market. Give them 2 specific companies they should add to their watchlist.

Profile:
- Title: ${currentTitle ?? 'Senior executive'}
- Target sectors: ${sectorsStr}
- Already watching: ${existingStr}

Return exactly 2 company names they are NOT already watching. Pick companies where someone at this level would be a plausible hire. Avoid obvious Fortune 50 logos. One well-known, one under-the-radar.

Format: return only a JSON array of 2 strings, e.g. ["Company A", "Company B"]. No explanation.`

  const response = await getAnthropic().messages.create({
    model: HAIKU,
    max_tokens: 80,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '[]'
  const parsed = JSON.parse(text)
  return Array.isArray(parsed) ? parsed.filter(s => typeof s === 'string').slice(0, 2) : []
}

function buildDigestEmail({ firstName, companies, scanMatches, suggestedCompanies }) {
  const subject = 'Your weekly market intelligence — Starting Monday'

  const matchItems = scanMatches.map(m => `
    <tr>
      <td style="padding:10px 20px;border-bottom:1px solid #f8fafc;">
        <span style="font-size:14px;font-weight:600;color:#0f172a">${esc(m.companyName)}</span>
        <br>
        <span style="font-size:13px;color:#64748b">${esc(m.roles.join(', '))}</span>
        ${m.summary ? `<br><span style="font-size:12px;color:#94a3b8;line-height:1.5">${esc(m.summary)}</span>` : ''}
      </td>
    </tr>`).join('')

  const suggestionItems = suggestedCompanies.map(name => `
    <tr>
      <td style="padding:10px 20px;border-bottom:1px solid #f8fafc;">
        <a href="${esc(`${APP_URL}/dashboard/companies/new?name=${encodeURIComponent(name)}`)}"
           style="font-size:14px;font-weight:600;color:#0f172a;text-decoration:none;">
          + ${esc(name)}
        </a>
        <span style="font-size:12px;color:#94a3b8;margin-left:8px">Click to add</span>
      </td>
    </tr>`).join('')

  const companiesWatching = companies.length

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="540" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <tr><td style="background:#0f172a;padding:36px 48px 32px 48px;">
        <div style="color:#334155;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:18px;">Starting Monday</div>
        <div style="color:#ffffff;font-size:24px;font-weight:700;line-height:1.2;">This week&rsquo;s signals, ${esc(firstName)}.</div>
        <div style="color:#94a3b8;font-size:13px;margin-top:8px;">Watching ${companiesWatching} ${companiesWatching === 1 ? 'company' : 'companies'}.</div>
      </td></tr>

      ${scanMatches.length > 0 ? `
      <tr><td style="padding:28px 48px 8px 48px;">
        <p style="font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;margin:0 0 12px 0;">Roles spotted this week</p>
      </td></tr>
      <tr><td style="padding:0 28px 24px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;">
          <tbody>${matchItems}</tbody>
        </table>
      </td></tr>` : `
      <tr><td style="padding:28px 48px 24px 48px;">
        <p style="font-size:14px;color:#64748b;margin:0;">No new role matches this week at your target companies. The watchlist is running.</p>
      </td></tr>`}

      ${suggestedCompanies.length > 0 ? `
      <tr><td style="padding:0 48px 8px 48px;">
        <p style="font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;margin:0 0 12px 0;">Companies to add to your watchlist</p>
        <p style="font-size:13px;color:#64748b;margin:0 0 12px 0;">Based on your profile, these may be worth monitoring.</p>
      </td></tr>
      <tr><td style="padding:0 28px 24px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;">
          <tbody>${suggestionItems}</tbody>
        </table>
      </td></tr>` : ''}

      <tr><td style="padding:0 48px 40px 48px;">
        <a href="${esc(`${APP_URL}/dashboard`)}"
           style="display:inline-block;background:#0f172a;color:#ffffff;font-size:13px;font-weight:700;padding:12px 24px;border-radius:4px;text-decoration:none;">
          Open your watchlist &rarr;
        </a>
      </td></tr>

      <tr><td style="padding:24px 48px 8px 48px;border-top:1px solid #e2e8f0;">
        <p style="font-size:12px;color:#94a3b8;margin:0 0 6px 0;line-height:1.7;">
          Your Starting Monday account is private. Your watchlist and search activity are visible only to you.
        </p>
      </td></tr>
      <tr><td style="padding:0 48px 32px 48px;">
        <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6;">
          Starting Monday &mdash; startingmonday.app
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`

  return { subject, html }
}

export async function runMarketDigestJob() {
  const supabase = getSupabase()
  logger.info('market-digest-job: starting')

  // Monitor tier users + trialing users who opted for weekly briefing
  const { data: monitorUsers, error: monitorErr } = await supabase
    .from('users')
    .select('id, email')
    .eq('subscription_tier', 'monitor')
    .in('subscription_status', ['active', 'trialing'])

  const { data: trialingUsers, error: trialingErr } = await supabase
    .from('user_profiles')
    .select('user_id, briefing_frequency')
    .eq('briefing_frequency', 'weekly')

  if (monitorErr || trialingErr) {
    logger.error('market-digest-job: query failed', {
      monitorError: monitorErr?.message,
      trialingError: trialingErr?.message,
    })
    return
  }

  const trialingWeeklyIds = new Set((trialingUsers ?? []).map(p => p.user_id))

  // Merge: monitor users + trialing-weekly users (deduplicated)
  const allUserIds = new Set((monitorUsers ?? []).map(u => u.id))
  for (const id of trialingWeeklyIds) allUserIds.add(id)

  if (allUserIds.size === 0) {
    logger.info('market-digest-job: no eligible users — done')
    return
  }

  // Fetch emails for any trialing-weekly users not already in monitorUsers
  const monitorUserMap = Object.fromEntries((monitorUsers ?? []).map(u => [u.id, u]))
  const missingIds = [...trialingWeeklyIds].filter(id => !monitorUserMap[id])

  if (missingIds.length > 0) {
    const { data: extraUsers } = await supabase
      .from('users')
      .select('id, email')
      .in('id', missingIds)
      .in('subscription_status', ['trialing', 'active'])
    for (const u of (extraUsers ?? [])) monitorUserMap[u.id] = u
  }

  const users = Object.values(monitorUserMap).filter(u => allUserIds.has(u.id))

  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  let sent = 0
  let anthropicCalls = 0

  for (const user of users) {
    try {
      const [{ data: profile }, { data: companies }, { data: scanResults }] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('full_name, current_title, target_sectors, onboarding_completed_at')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('companies')
          .select('id, name')
          .eq('user_id', user.id)
          .is('archived_at', null)
          .order('created_at', { ascending: true }),
        supabase
          .from('scan_results')
          .select('company_id, ai_score, ai_summary, raw_hits, companies(name)')
          .eq('user_id', user.id)
          .eq('status', 'success')
          .gte('scanned_at', since7d)
          .gt('ai_score', 0)
          .order('ai_score', { ascending: false })
          .limit(10),
      ])

      if (!profile?.onboarding_completed_at) continue

      const firstName = profile.full_name?.split(' ')[0] ?? 'there'
      const companyList = companies ?? []
      const existingNames = companyList.map(c => c.name)

      const scanMatches = (scanResults ?? [])
        .map(scan => ({
          companyName: scan.companies?.name ?? 'Unknown',
          roles: (scan.raw_hits ?? [])
            .filter(h => h.is_match)
            .map(h => h.title)
            .filter(Boolean),
          summary: scan.ai_summary,
        }))
        .filter(m => m.roles.length > 0)

      let suggestedCompanies = []
      try {
        suggestedCompanies = await getCompanySuggestions({
          currentTitle: profile.current_title,
          targetSectors: profile.target_sectors,
          existingCompanyNames: existingNames,
        })
        anthropicCalls++
        await trackUsage(supabase, { service: 'anthropic', requests: 1, tokens: 150 })
      } catch (err) {
        logger.warn(`market-digest-job: suggestion call failed for ${user.email}`, { error: err.message })
      }

      const { subject, html } = buildDigestEmail({
        firstName,
        companies: companyList,
        scanMatches,
        suggestedCompanies,
      })

      await sendEmail({
        to: user.email,
        subject,
        html: watermarkEmailHtml(html, user.id),
      })
      await trackUsage(supabase, { service: 'resend', requests: 1 })
      sent++
      logger.info(`market-digest-job: sent to ${user.email}`, { matches: scanMatches.length, suggestions: suggestedCompanies.length })
    } catch (err) {
      logger.error(`market-digest-job: error for ${user.email}`, { error: err.message })
    }
  }

  logger.info('market-digest-job: complete', { sent, total: users.length, anthropicCalls })
}
