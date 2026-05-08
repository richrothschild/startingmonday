import { sendEmail } from './send-email.js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function sendSignalAlert({ to, companyName, patternName, summary, outreachAngle }) {
  const subject = `${patternName} &mdash; ${companyName}`.replace(/&mdash;/g, '—')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(patternName)} &mdash; ${esc(companyName)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <tr><td style="background:#0f172a;padding:28px 40px;">
        <div style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:12px;">Starting Monday &mdash; Intelligence Alert</div>
        <div style="color:#f97316;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">${esc(patternName)}</div>
        <div style="color:#ffffff;font-size:24px;font-weight:700;line-height:1.2;">${esc(companyName)}</div>
      </td></tr>

      <tr><td style="padding:32px 40px;">
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 24px 0;">${esc(summary)}</p>

        ${outreachAngle ? `
        <div style="border-left:3px solid #f97316;padding:14px 16px;margin-bottom:28px;background:#fff7ed;">
          <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9a3412;margin:0 0 6px 0;">Outreach angle</p>
          <p style="font-size:14px;color:#7c2d12;line-height:1.65;margin:0;">${esc(outreachAngle)}</p>
        </div>` : ''}

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
          Starting Monday Executive &mdash; real-time intelligence alerts.<br>
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

export async function sendRoleFitAlert({ to, companyName, companyId, matchTitles }) {
  const roleList = matchTitles.slice(0, 3).join(', ')
  const subject = `New role at ${companyName}: ${matchTitles[0]}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New role at ${esc(companyName)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <tr><td style="background:#0f172a;padding:28px 40px;">
        <div style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:12px;">Starting Monday &mdash; Role Alert</div>
        <div style="color:#ffffff;font-size:24px;font-weight:700;line-height:1.2;">${esc(companyName)}</div>
      </td></tr>

      <tr><td style="padding:32px 40px;">
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 8px 0;">
          A matching role just appeared on their career page.
        </p>
        <p style="font-size:17px;font-weight:700;color:#0f172a;margin:0 0 24px 0;">${esc(roleList)}</p>
        <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0 0 28px 0;">
          This was detected before it reaches LinkedIn or any job board. Generate your prep brief now.
        </p>

        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:#f97316;border-radius:4px;padding:13px 26px;">
              <a href="${APP_URL}/dashboard/companies/${companyId}/prep" style="color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;display:block;">
                Generate prep brief &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;">
        <p style="font-size:11px;color:#94a3b8;margin:0;line-height:1.6;">
          Starting Monday Executive &mdash; role alerts before they go public.<br>
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
