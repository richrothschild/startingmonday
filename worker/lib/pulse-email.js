import { sendEmail } from './send-email.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function sendPipelinePulse({ to, firstName, newSignals, draftReadyCount, overdueCount, staleCompanyCount, totalCompanies }) {
  const subject = newSignals.length > 0
    ? `${newSignals.length} new signal${newSignals.length !== 1 ? 's' : ''} this week - Starting Monday`
    : `Your search health this week - Starting Monday`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pipeline Pulse &mdash; Starting Monday</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <tr><td style="background:#0f172a;padding:28px 40px;">
        <div style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:12px;">Starting Monday &mdash; Pipeline Pulse</div>
        <div style="color:#ffffff;font-size:22px;font-weight:700;line-height:1.2;">
          ${esc(firstName ? `${firstName}'s search health` : 'Your search health')}
        </div>
      </td></tr>

      <tr><td style="padding:32px 40px 8px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="text-align:center;padding:14px 8px;border:1px solid #e2e8f0;border-radius:4px;">
              <div style="font-size:26px;font-weight:700;color:${newSignals.length > 0 ? '#f97316' : '#94a3b8'};">${newSignals.length}</div>
              <div style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin-top:4px;">New Signals</div>
            </td>
            <td style="width:8px;"></td>
            <td style="text-align:center;padding:14px 8px;border:1px solid #e2e8f0;border-radius:4px;">
              <div style="font-size:26px;font-weight:700;color:${draftReadyCount > 0 ? '#f97316' : '#94a3b8'};">${draftReadyCount}</div>
              <div style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin-top:4px;">Drafts Ready</div>
            </td>
            <td style="width:8px;"></td>
            <td style="text-align:center;padding:14px 8px;border:1px solid #e2e8f0;border-radius:4px;">
              <div style="font-size:26px;font-weight:700;color:${overdueCount > 0 ? '#ef4444' : '#94a3b8'};">${overdueCount}</div>
              <div style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin-top:4px;">Actions Due</div>
            </td>
            <td style="width:8px;"></td>
            <td style="text-align:center;padding:14px 8px;border:1px solid #e2e8f0;border-radius:4px;">
              <div style="font-size:26px;font-weight:700;color:${staleCompanyCount > 0 ? '#64748b' : '#94a3b8'};">${staleCompanyCount}</div>
              <div style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin-top:4px;">Quiet (30d)</div>
            </td>
          </tr>
        </table>
      </td></tr>

      ${newSignals.length > 0 ? `
      <tr><td style="padding:24px 40px 8px 40px;">
        <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b;margin:0 0 12px 0;">Signals this week</p>
        ${newSignals.slice(0, 5).map(sig => `
        <div style="border-left:3px solid #f97316;padding:8px 12px;margin-bottom:8px;background:#fff7ed;">
          <p style="font-size:12px;font-weight:700;color:#9a3412;margin:0 0 2px 0;">${esc(sig.company_name)}</p>
          <p style="font-size:13px;color:#334155;margin:0;">${esc(sig.signal_summary)}</p>
        </div>`).join('')}
        ${newSignals.length > 5 ? `<p style="font-size:12px;color:#64748b;margin:8px 0 0 0;">+${newSignals.length - 5} more on the dashboard.</p>` : ''}
      </td></tr>` : ''}

      ${draftReadyCount > 0 ? `
      <tr><td style="padding:16px 40px 8px 40px;">
        <p style="font-size:13px;color:#334155;line-height:1.65;margin:0;">
          ${draftReadyCount} outreach draft${draftReadyCount !== 1 ? 's are' : ' is'} ready to send. Open the Signals page to review and copy.
        </p>
      </td></tr>` : ''}

      ${overdueCount > 0 ? `
      <tr><td style="padding:8px 40px;">
        <p style="font-size:13px;color:#ef4444;line-height:1.65;margin:0;">
          ${overdueCount} follow-up action${overdueCount !== 1 ? 's are' : ' is'} overdue. Log into the dashboard to clear the queue.
        </p>
      </td></tr>` : ''}

      <tr><td style="padding:24px 40px 32px 40px;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:#0f172a;border-radius:4px;padding:13px 26px;">
              <a href="${APP_URL}/dashboard" style="color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;display:block;">
                Open dashboard &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;">
        <p style="font-size:11px;color:#94a3b8;margin:0;line-height:1.6;">
          Starting Monday Executive &mdash; daily search health summary.<br>
          <a href="${APP_URL}/settings/billing" style="color:#64748b;">Manage subscription</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`

  await sendEmail({ to, subject, html })
}
