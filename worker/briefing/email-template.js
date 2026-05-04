// Renders the daily briefing as an HTML email string.
// Uses table-based layout for broad email client compatibility.
const SIGNAL_LABELS = {
  funding:       'Funding',
  exec_departure: 'Exec Departure',
  exec_hire:     'Exec Hire',
  acquisition:   'Acquisition',
  expansion:     'Expansion',
  layoffs:       'Layoffs',
  ipo:           'IPO',
  new_product:   'New Product',
  award:         'Award',
}

export function renderBriefingEmail(context, briefing) {
  const { userName, totalCompanies, newMatches, followUps, signals = [], todayStr } = context
  const { intro = '', signalAlerts = [], matchInsights = [], followUpSuggestions = [], closing = '' } = briefing

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
  const firstName = userName.split(' ')[0]

  const signalSection = signalAlerts.length ? `
      <tr><td style="padding: 0 0 32px 0;">
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; margin-bottom: 18px;">Company Signals</div>
        ${signalAlerts.map(s => `
        <div style="margin-bottom: 14px; padding: 18px 20px; background: #fffbeb; border: 1px solid #fde68a; border-left: 3px solid #d97706; border-radius: 0 4px 4px 0;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <span style="font-weight: 700; font-size: 15px; color: #0f172a;">${esc(s.company)}</span>
            <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 20px;">${esc(SIGNAL_LABELS[s.signalType] ?? s.signalType)}</span>
          </div>
          <div style="font-size: 14px; color: #334155; line-height: 1.65; margin-bottom: 8px;">${esc(s.summary)}</div>
          ${s.angle ? `<div style="font-size: 13px; color: #78716c; line-height: 1.6; font-style: italic;">${esc(s.angle)}</div>` : ''}
        </div>`).join('')}
      </td></tr>` : ''

  const matchSection = matchInsights.length ? `
      <tr><td style="padding: 0 0 32px 0;">
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; margin-bottom: 18px;">New Matches</div>
        ${matchInsights.map(m => `
        <div style="margin-bottom: 14px; padding: 18px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-left: 3px solid #0f172a; border-radius: 0 4px 4px 0;">
          <div style="font-weight: 700; font-size: 15px; color: #0f172a; margin-bottom: 6px;">${esc(m.company)}</div>
          <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">${(m.roles ?? []).map(esc).join('&nbsp;&nbsp;·&nbsp;&nbsp;')}</div>
          <div style="font-size: 14px; color: #334155; line-height: 1.65;">${esc(m.insight)}</div>
        </div>`).join('')}
      </td></tr>` : ''

  const followUpSection = followUpSuggestions.length ? `
      <tr><td style="padding: 0 0 32px 0;">
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; margin-bottom: 18px;">Open Actions</div>
        ${followUpSuggestions.map(f => `
        <div style="margin-bottom: 10px; padding: 16px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #64748b; border-radius: 0 4px 4px 0;">
          <div style="font-weight: 600; font-size: 14px; color: #0f172a; margin-bottom: 5px;">${esc(f.person)}&nbsp;&mdash;&nbsp;${esc(f.action)}</div>
          <div style="font-size: 13px; color: #475569; line-height: 1.6;">${esc(f.suggestion)}</div>
        </div>`).join('')}
      </td></tr>` : ''

  const actionsDueColor  = followUps.length > 0 ? '#b91c1c' : '#0f172a'
  const signalsColor     = signals.length > 0   ? '#b45309' : '#0f172a'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Starting Monday &mdash; Daily Briefing</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr><td style="background:#0f172a;padding:36px 48px 32px 48px;">
        <div style="color:#334155;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:18px;">Starting Monday</div>
        <div style="color:#ffffff;font-size:26px;font-weight:700;line-height:1.2;margin-bottom:8px;">Good morning, ${esc(firstName)}.</div>
        <div style="color:#64748b;font-size:13px;letter-spacing:0.01em;">${formatDate(todayStr)}</div>
      </td></tr>

      <!-- Stats bar -->
      <tr><td style="background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="25%" style="padding:20px 12px;text-align:center;border-right:1px solid #e2e8f0;">
              <div style="font-size:22px;font-weight:700;color:#0f172a;line-height:1;">${totalCompanies}</div>
              <div style="font-size:10px;color:#94a3b8;margin-top:5px;letter-spacing:0.07em;text-transform:uppercase;">Companies</div>
            </td>
            <td width="25%" style="padding:20px 12px;text-align:center;border-right:1px solid #e2e8f0;">
              <div style="font-size:22px;font-weight:700;color:${signalsColor};line-height:1;">${signals.length}</div>
              <div style="font-size:10px;color:#94a3b8;margin-top:5px;letter-spacing:0.07em;text-transform:uppercase;">Signals</div>
            </td>
            <td width="25%" style="padding:20px 12px;text-align:center;border-right:1px solid #e2e8f0;">
              <div style="font-size:22px;font-weight:700;color:#0f172a;line-height:1;">${newMatches.length}</div>
              <div style="font-size:10px;color:#94a3b8;margin-top:5px;letter-spacing:0.07em;text-transform:uppercase;">Matches</div>
            </td>
            <td width="25%" style="padding:20px 12px;text-align:center;">
              <div style="font-size:22px;font-weight:700;color:${actionsDueColor};line-height:1;">${followUps.length}</div>
              <div style="font-size:10px;color:#94a3b8;margin-top:5px;letter-spacing:0.07em;text-transform:uppercase;">Actions Due</div>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:36px 48px 28px 48px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">

          <!-- Intro -->
          <tr><td style="padding:0 0 32px 0;font-size:15px;color:#334155;line-height:1.7;">${esc(intro)}</td></tr>

          ${signalSection}
          ${matchSection}
          ${followUpSection}

          <!-- Closing + CTA -->
          <tr><td style="padding:4px 0 0 0;border-top:1px solid #e2e8f0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="padding:28px 0 4px 0;text-align:center;">
                <div style="font-size:14px;color:#475569;line-height:1.7;margin-bottom:24px;">${esc(closing)}</div>
                <a href="${appUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:13px 36px;border-radius:4px;font-size:14px;font-weight:600;letter-spacing:0.03em;">Open Dashboard &nbsp;&rarr;</a>
              </td></tr>
            </table>
          </td></tr>

        </table>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:20px 48px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.8;letter-spacing:0.02em;">
          Starting Monday &nbsp;&middot;&nbsp; Daily Intelligence Briefing<br>
          <a href="${appUrl}/settings" style="color:#94a3b8;text-decoration:underline;">Manage preferences</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
