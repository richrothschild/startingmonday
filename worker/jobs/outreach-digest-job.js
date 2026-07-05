import { getSupabase } from '../lib/supabase.js'
import { sendEmail } from '../lib/send-email.js'
import { logger } from '../lib/logger.js'

const OWNER_EMAIL = process.env.NOTIFY_EMAIL ?? process.env.OWNER_EMAIL

function statusBadge(status) {
  const s = status ?? 'unknown'
  const color =
    s === 'email.delivered'  ? '#15803d' :
    s === 'sent'             ? '#2563eb' :
    s === 'email.bounced'    ? '#dc2626' :
    s === 'email.complained' ? '#dc2626' :
    s === 'simulated'        ? '#94a3b8' :
    '#92400e'
  return `<span style="background:${color};color:#fff;font-size:11px;padding:2px 6px;border-radius:3px;font-weight:600;">${s}</span>`
}

function channelLabel(channel) {
  const map = {
    coaches: 'Coaches',
    search_firms: 'Search Firms',
    outplacement_firms: 'Outplacement',
    executives: 'Executives',
  }
  return map[channel ?? ''] ?? channel ?? '-'
}

function buildHtml(sends24h, stuck, bounced, sinceLabel) {
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  function rows(items) {
    if (!items.length) {
      return '<tr><td colspan="5" style="padding:12px;color:#94a3b8;font-size:13px;">None</td></tr>'
    }
    return items.map(r => `
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:8px 12px;font-size:13px;color:#0f172a;">${r.recipient_name ?? '-'}</td>
        <td style="padding:8px 12px;font-size:12px;color:#475569;">${r.recipient_email ?? '-'}</td>
        <td style="padding:8px 12px;font-size:12px;color:#475569;">${channelLabel(r.outreach_channel)}</td>
        <td style="padding:8px 12px;font-size:12px;color:#475569;">${r.subject ?? '-'}</td>
        <td style="padding:8px 12px;">${statusBadge(r.delivery_status)}</td>
      </tr>`).join('')
  }

  const alertBanner = (bounced.length > 0 || stuck.length > 0)
    ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:12px 16px;margin-bottom:20px;">
        <span style="font-size:13px;font-weight:600;color:#dc2626;">
          &#9888; Action needed: ${bounced.length} bounce${bounced.length !== 1 ? 's' : ''},
          ${stuck.length} send${stuck.length !== 1 ? 's' : ''} unconfirmed after 24h
        </span>
       </div>`
    : `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:12px 16px;margin-bottom:20px;">
        <span style="font-size:13px;font-weight:600;color:#15803d;">&#10003; All recent sends confirmed delivered</span>
       </div>`

  const bouncedSection = bounced.length > 0 ? `
    <div style="font-size:14px;font-weight:700;color:#dc2626;margin-bottom:8px;">Bounces / Complaints (${bounced.length})</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fecaca;border-radius:4px;margin-bottom:24px;">
      <thead><tr style="background:#fef2f2;">
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#dc2626;">NAME</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#dc2626;">EMAIL</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#dc2626;">CHANNEL</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#dc2626;">SUBJECT</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#dc2626;">STATUS</th>
      </tr></thead>
      <tbody>${rows(bounced)}</tbody>
    </table>` : ''

  const stuckSection = stuck.length > 0 ? `
    <div style="font-size:14px;font-weight:700;color:#92400e;margin-bottom:8px;">Unconfirmed after 24h (${stuck.length}) - verify in Resend dashboard</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fde68a;border-radius:4px;margin-bottom:24px;">
      <thead><tr style="background:#fffbeb;">
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#92400e;">NAME</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#92400e;">EMAIL</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#92400e;">CHANNEL</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#92400e;">SUBJECT</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#92400e;">STATUS</th>
      </tr></thead>
      <tbody>${rows(stuck)}</tbody>
    </table>` : ''

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
  <tr><td style="background:#0f172a;padding:20px 24px;">
    <div style="color:#fff;font-size:18px;font-weight:700;">Outreach Send Digest</div>
    <div style="color:#94a3b8;font-size:13px;margin-top:4px;">${dateLabel}</div>
  </td></tr>
  <tr><td style="padding:20px 24px;">
    ${alertBanner}
    <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:8px;">Sends in last 24h (${sends24h.length})</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:4px;margin-bottom:24px;">
      <thead><tr style="background:#f8fafc;">
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;">NAME</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;">EMAIL</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;">CHANNEL</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;">SUBJECT</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;">STATUS</th>
      </tr></thead>
      <tbody>${rows(sends24h)}</tbody>
    </table>
    ${bouncedSection}
    ${stuckSection}
    <p style="font-size:11px;color:#94a3b8;margin-top:16px;">Outreach send digest  -  startingmonday.app  -  Since ${sinceLabel}</p>
  </td></tr>
</table>
</body></html>`
}

export async function runOutreachDigestJob() {
  if (!OWNER_EMAIL) {
    logger.warn('outreach-digest-job: NOTIFY_EMAIL not set - skipping')
    return
  }

  const supabase = getSupabase()
  const now = new Date()
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const since48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
  const sinceLabel = new Date(since24h).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })

  const cols = 'id,recipient_email,recipient_name,subject,outreach_channel,fit_tier,send_mode,delivery_status,resend_message_id,sent_at'

  const { data: sends24h, error: sendsError } = await supabase
    .from('outreach_logs')
    .select(cols)
    .gte('sent_at', since24h)
    .eq('send_mode', 'live')
    .order('sent_at', { ascending: false })
    .limit(100)

  if (sendsError) {
    logger.error('outreach-digest-job: query error', { message: sendsError.message })
    return
  }

  const rows24h = sends24h ?? []
  const bounced = rows24h.filter(r =>
    r.delivery_status === 'email.bounced' || r.delivery_status === 'email.complained',
  )

  const { data: stuckRows } = await supabase
    .from('outreach_logs')
    .select(cols)
    .lt('sent_at', since24h)
    .gte('sent_at', since48h)
    .eq('send_mode', 'live')
    .eq('delivery_status', 'sent')
    .order('sent_at', { ascending: false })
    .limit(50)

  const stuck = stuckRows ?? []

  if (rows24h.length === 0 && stuck.length === 0) {
    logger.info('outreach-digest-job: no outreach activity in last 24h - skipping digest')
    return
  }

  const subject = bounced.length > 0 || stuck.length > 0
    ? `ALERT Outreach alert: ${bounced.length} bounce, ${stuck.length} unconfirmed - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : `Outreach digest: ${rows24h.length} send${rows24h.length !== 1 ? 's' : ''} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  const html = buildHtml(rows24h, stuck, bounced, sinceLabel)

  await sendEmail({ to: OWNER_EMAIL, subject, html })

  logger.info('outreach-digest-job: sent', {
    sends24h: rows24h.length,
    bounced: bounced.length,
    stuck: stuck.length,
  })
}
