import { type NextRequest, NextResponse } from 'next/server'
import { validateCronRequest } from '@/lib/cron-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

const OWNER_EMAIL = process.env.OWNER_EMAIL

const PILLAR_LABELS: Record<string, string> = {
  search_craft:  'Search Craft',
  market_intel:  'Market Intelligence',
  behind_build:  'Behind the Build',
  user_story:    'User Story',
  engagement:    'Engagement',
}

type SocialPost = {
  id: string
  post_date: string
  pillar: string
  draft_text: string
  is_posted: boolean
  posted_at: string | null
  buffer_scheduled_at: string | null
  notes: string | null
}

export async function GET(request: NextRequest) {
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!OWNER_EMAIL) {
    return NextResponse.json({ error: 'OWNER_EMAIL not configured' }, { status: 500 })
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const admin = createAdminClient()
  const { data: posts } = await admin
    .from('social_posts')
    .select('id, post_date, pillar, draft_text, is_posted, posted_at, buffer_scheduled_at, notes')
    .gte('post_date', since)
    .order('post_date', { ascending: true })

  const typedPosts = (posts ?? []) as SocialPost[]

  if (typedPosts.length === 0) {
    return NextResponse.json({ ok: true, sent: false, reason: 'No posts this week' })
  }

  const rows = typedPosts.map(p => {
    const dateLabel = new Date(p.post_date + 'T12:00:00Z').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    })
    const pillar = PILLAR_LABELS[p.pillar] ?? p.pillar
    const statusHtml = p.is_posted
      ? '<span style="color:#15803d;font-weight:600;">Posted</span>'
      : p.buffer_scheduled_at
        ? `<span style="color:#2563eb;font-weight:600;">Scheduled ${new Date(p.buffer_scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' })} CT</span>`
        : '<span style="color:#94a3b8;">Draft only</span>'
    const preview = p.draft_text.slice(0, 300) + (p.draft_text.length > 300 ? '...' : '')
    const notesHtml = p.notes
      ? `<p style="font-size:12px;color:#64748b;margin:8px 0 0 0;font-style:italic;">Notes: ${p.notes}</p>`
      : ''
    return `
      <div style="border:1px solid #e2e8f0;border-radius:4px;padding:16px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
          <span style="font-size:13px;font-weight:600;color:#0f172a;">${dateLabel}</span>
          <span style="font-size:11px;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:3px;">${pillar}</span>
        </div>
        <div style="margin-bottom:8px;">${statusHtml}</div>
        <p style="font-size:13px;color:#334155;margin:0;white-space:pre-wrap;line-height:1.5;">${preview}</p>
        ${notesHtml}
      </div>
    `
  }).join('')

  const postedCount = typedPosts.filter(p => p.is_posted).length
  const weekOf = new Date(since + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  await sendEmail({
    to: OWNER_EMAIL,
    subject: `LinkedIn digest: ${postedCount}/${typedPosts.length} posts this week (${weekOf})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px 0;color:#334155;">
        <p style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 4px 0;">LinkedIn Weekly Digest</p>
        <p style="font-size:13px;color:#64748b;margin:0 0 20px 0;">
          Week of ${weekOf} -- ${postedCount} of ${typedPosts.length} posts went live
        </p>
        ${rows}
        <p style="font-size:12px;color:#94a3b8;margin:20px 0 0 0;border-top:1px solid #f1f5f9;padding-top:12px;">
          Manage posts at startingmonday.app/dashboard/admin/social
        </p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true, sent: true, postCount: typedPosts.length, postedCount })
}
