import { type NextRequest, NextResponse } from 'next/server'
import { validateCronRequest } from '@/lib/cron-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { getOwnerEmail } from '@/lib/owner-email'
import { sendSlackMessage } from '@/lib/slack'
import {
  DEFAULT_HUMAN_TONE_PASS_THRESHOLD,
  evaluateHumanTone,
  humanToneSkeleton,
} from '@/lib/outreach/human-tone-guard'

type OutreachQueuedRow = {
  id: string | number
  recipient_name: string | null
  recipient_email: string | null
  sender_email: string | null
  subject: string | null
  message_body: string | null
  delivery_status: string | null
  outreach_channel: string | null
  sent_at?: string | null
}

type ScoredRow = {
  id: string | number
  recipientName: string
  recipientEmail: string
  senderEmail: string
  status: string
  channel: string
  subject: string
  score: number
  passed: boolean
  reasons: string[]
}

type ChannelSummary = {
  channel: string
  total: number
  passed: number
  failed: number
  averageScore: number
  minScore: number
  passRate: number
}

const PASS_THRESHOLD = Number(process.env.OUTREACH_TONE_GUARD_PASS_THRESHOLD ?? DEFAULT_HUMAN_TONE_PASS_THRESHOLD)

function isQueuedUnsentStatus(status: string | null): boolean {
  const normalized = (status ?? '').toLowerCase().trim()
  if (!normalized) return true
  return ['pending', 'queued', 'draft', 'scheduled'].includes(normalized)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildHtmlSummary(
  summary: {
    queuedRowsScanned: number
    scoredRows: number
    passed: number
    failed: number
    averageScore: number
    passRate: number
  },
  byChannel: ChannelSummary[],
  failures: ScoredRow[],
): string {
  const rows = failures.slice(0, 25)
  const tableRows = rows.length
    ? rows.map((f) => {
      const reasons = f.reasons.length ? f.reasons.join('; ') : '-'
      return `<tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#0f172a;">${escapeHtml(String(f.id))}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155;">${escapeHtml(f.channel)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155;">${escapeHtml(f.recipientName || f.recipientEmail)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155;">${escapeHtml(f.status)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#991b1b;font-weight:600;">${f.score}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155;">${escapeHtml(f.subject)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155;">${escapeHtml(reasons)}</td>
      </tr>`
    }).join('')
    : '<tr><td colspan="7" style="padding:10px;color:#64748b;">No below-threshold rows.</td></tr>'

  const channelRows = byChannel.length
    ? byChannel.map((c) => `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#0f172a;">${escapeHtml(c.channel)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155;">${c.total}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#166534;">${c.passed}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#991b1b;">${c.failed}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155;">${c.averageScore}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155;">${c.passRate}%</td>
    </tr>`).join('')
    : '<tr><td colspan="6" style="padding:10px;color:#64748b;">No queued rows found.</td></tr>'

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="760" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
    <tr><td style="background:#0f172a;padding:20px 24px;">
      <div style="font-size:18px;font-weight:700;color:#ffffff;">Weekly Outreach Human Tone Guard</div>
      <div style="font-size:13px;color:#94a3b8;margin-top:4px;">${new Date().toUTCString()}</div>
    </td></tr>
    <tr><td style="padding:20px 24px;">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
        <span style="background:#e2e8f0;color:#0f172a;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:600;">Queued rows scanned: ${summary.queuedRowsScanned}</span>
        <span style="background:#e2e8f0;color:#0f172a;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:600;">Scored rows: ${summary.scoredRows}</span>
        <span style="background:#dcfce7;color:#166534;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:600;">Passed (>=${PASS_THRESHOLD}): ${summary.passed}</span>
        <span style="background:#fee2e2;color:#991b1b;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:600;">Failed: ${summary.failed}</span>
        <span style="background:#fef3c7;color:#92400e;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:600;">Avg score: ${summary.averageScore}</span>
        <span style="background:#f8fafc;color:#334155;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:600;">Pass rate: ${summary.passRate}%</span>
      </div>

      <p style="font-size:13px;color:#334155;line-height:1.5;margin:0 0 14px 0;">
        Human Tone Guard rubric scores each queued email from 0 to 100. Threshold is <strong>${PASS_THRESHOLD}</strong>. Rows below threshold are listed for rewrite.
      </p>

      <h3 style="font-size:14px;color:#0f172a;margin:0 0 8px 0;">Per-channel summary</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:14px;">
        <thead><tr style="background:#f8fafc;">
          <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;">CHANNEL</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;">TOTAL</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;">PASSED</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;">FAILED</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;">AVG</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;">PASS RATE</th>
        </tr></thead>
        <tbody>${channelRows}</tbody>
      </table>

      <h3 style="font-size:14px;color:#0f172a;margin:0 0 8px 0;">Below-threshold queued rows</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
        <thead><tr style="background:#f8fafc;">
          <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;">ID</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;">CHANNEL</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;">RECIPIENT</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;">STATUS</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;">SCORE</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;">SUBJECT</th>
          <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;">LOW-SCORING METRICS</th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
      </table>

      <p style="margin-top:14px;font-size:11px;color:#64748b;">Action for fails: node scripts/depitch-queued-outreach.mjs --apply</p>
    </td></tr>
  </table>
</body></html>`
}

function buildSlackSummary(
  summary: {
    queuedRowsScanned: number
    scoredRows: number
    passed: number
    failed: number
    averageScore: number
    passRate: number
  },
  byChannel: ChannelSummary[],
  failures: ScoredRow[],
): string {
  const top = failures.slice(0, 8)
  return [
    '*Starting Monday Weekly Outreach Human Tone Guard*',
    `- Queued rows scanned: ${summary.queuedRowsScanned}`,
    `- Scored rows: ${summary.scoredRows}`,
    `- Passed (>=${PASS_THRESHOLD}): ${summary.passed}`,
    `- Failed: ${summary.failed}`,
    `- Avg score: ${summary.averageScore}`,
    `- Pass rate: ${summary.passRate}%`,
    '',
    '*By channel*',
    ...(byChannel.length
      ? byChannel.map((c) => `- ${c.channel}: ${c.passed}/${c.total} passed, avg ${c.averageScore}`)
      : ['- none']),
    '',
    '*Top fails*',
    ...(top.length
      ? top.map((f) => {
          const reasons = f.reasons.slice(0, 2).join(' | ')
          return `- id ${f.id} [${f.channel}] score ${f.score}: ${reasons || 'metric quality issues'}`
        })
      : ['- none']),
    '',
    'Action for fails: node scripts/depitch-queued-outreach.mjs --apply',
  ].join('\n')
}

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const to = process.env.OUTREACH_TONE_GUARD_EMAIL_TO ?? getOwnerEmail() ?? 'rothschild@gmail.com'

  const { data, error } = await admin
    .from('outreach_logs')
    .select('id, recipient_name, recipient_email, sender_email, subject, message_body, delivery_status, outreach_channel, sent_at')
    .is('sent_at', null)
    .order('id', { ascending: false })
    .limit(2000)

  if (error) {
    const message = error.message || 'Failed to query outreach logs'
    console.error(JSON.stringify({ ts: new Date().toISOString(), event: 'outreach_tone_guard_query_error', message }))
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const unsentRows = ((data ?? []) as unknown as OutreachQueuedRow[])
    .filter((row) => !row.sent_at)
    .filter((row) => isQueuedUnsentStatus(row.delivery_status))

  if (!unsentRows.length) {
    return NextResponse.json({
      ok: true,
      sent: false,
      queuedRowsScanned: 0,
      scoredRows: 0,
      reason: 'No queued outreach rows found',
    })
  }

  const skeletonCount = new Map<string, number>()
  for (const row of unsentRows) {
    const skeleton = humanToneSkeleton({
      subject: row.subject ?? '',
      body: row.message_body ?? '',
      recipientName: row.recipient_name ?? undefined,
    })
    skeletonCount.set(skeleton, (skeletonCount.get(skeleton) ?? 0) + 1)
  }

  const scoredRows: ScoredRow[] = unsentRows.map((row) => {
    const skeleton = humanToneSkeleton({
      subject: row.subject ?? '',
      body: row.message_body ?? '',
      recipientName: row.recipient_name ?? undefined,
    })
    const result = evaluateHumanTone({
      subject: row.subject ?? '',
      body: row.message_body ?? '',
      recipientName: row.recipient_name ?? undefined,
    }, {
      threshold: PASS_THRESHOLD,
      duplicateCount: skeletonCount.get(skeleton) ?? 1,
    })

    return {
      id: row.id,
      recipientName: row.recipient_name ?? '',
      recipientEmail: row.recipient_email ?? '',
      senderEmail: row.sender_email ?? '',
      status: row.delivery_status ?? 'pending',
      channel: row.outreach_channel ?? 'unknown',
      subject: row.subject ?? '',
      score: result.score,
      passed: result.passed,
      reasons: result.reasons,
    }
  })

  const failures = scoredRows
    .filter((row) => !row.passed)
    .sort((a, b) => a.score - b.score)

  const grouped = new Map<string, ScoredRow[]>()
  for (const row of scoredRows) {
    const list = grouped.get(row.channel) ?? []
    list.push(row)
    grouped.set(row.channel, list)
  }

  const byChannel: ChannelSummary[] = Array.from(grouped.entries())
    .map(([channel, rows]) => {
      const passed = rows.filter((r) => r.passed).length
      const failed = rows.length - passed
      const averageScore = Number((rows.reduce((sum, r) => sum + r.score, 0) / rows.length).toFixed(1))
      const minScore = rows.reduce((min, r) => Math.min(min, r.score), 100)
      const passRate = Number(((passed / rows.length) * 100).toFixed(1))
      return { channel, total: rows.length, passed, failed, averageScore, minScore, passRate }
    })
    .sort((a, b) => a.averageScore - b.averageScore)

  const passed = scoredRows.length - failures.length
  const summary = {
    queuedRowsScanned: unsentRows.length,
    scoredRows: scoredRows.length,
    passed,
    failed: failures.length,
    averageScore: Number((scoredRows.reduce((sum, row) => sum + row.score, 0) / scoredRows.length).toFixed(1)),
    passRate: Number(((passed / scoredRows.length) * 100).toFixed(1)),
  }

  const subject = `Weekly outreach tone guard: ${passed}/${scoredRows.length} passed (>=${PASS_THRESHOLD}), fails ${failures.length}`
  const html = buildHtmlSummary(summary, byChannel, failures)
  const emailResult = await sendEmail({ to, subject, html })
  const emailError = (emailResult as { error?: { message?: string } } | null)?.error?.message
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 502 })
  }

  const slackResult = await sendSlackMessage({ text: buildSlackSummary(summary, byChannel, failures) })

  return NextResponse.json({
    ok: true,
    sent: {
      email: true,
      slack: slackResult.ok,
    },
    slackError: slackResult.ok ? null : slackResult.error,
    threshold: PASS_THRESHOLD,
    summary,
    byChannel,
    fails: failures.slice(0, 25).map((f) => ({
      id: f.id,
      channel: f.channel,
      score: f.score,
      recipientEmail: f.recipientEmail,
      reasons: f.reasons,
    })),
  })
}
