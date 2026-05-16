import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

config({ path: resolve(process.cwd(), '.env.local') })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
const OWNER_EMAIL = process.env.OWNER_EMAIL ?? process.env.NOTIFY_EMAIL ?? ''
const LIZ_EMAIL_ENV = process.env.LIZ_EMAIL ?? ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const RESEND_FROM = process.env.RESEND_FROM_ADDRESS ?? 'briefing@startingmonday.app'

function assertConfig() {
  const missing = []
  if (!SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (!RESEND_API_KEY) missing.push('RESEND_API_KEY')
  if (!OWNER_EMAIL) missing.push('OWNER_EMAIL or NOTIFY_EMAIL')
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`)
  }
}

function buildEmailHtml({ launchUrl, ownerEmail }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#0f172a;line-height:1.6;">
      <p style="font-size:16px;margin:0 0 12px 0;">Hi Liz,</p>
      <p style="font-size:14px;margin:0 0 12px 0;">The internal launch page is ready with the exact implementation sequence for getting the Starting Monday LinkedIn company page live and consistent with approved brand standards.</p>

      <p style="font-size:14px;margin:0 0 8px 0;"><strong>Launch page:</strong> <a href="${launchUrl}">${launchUrl}</a></p>

      <p style="font-size:14px;margin:16px 0 8px 0;"><strong>Execute these steps in order:</strong></p>
      <ol style="font-size:14px;padding-left:20px;margin:0 0 12px 0;">
        <li>Open LinkedIn company admin and go to Edit Page.</li>
        <li>Upload avatar: <code>public/brand/starting-monday-logo-option-b.svg</code></li>
        <li>Upload banner: <code>public/brand/linkedin-company-banner.svg</code></li>
        <li>Set headline to: <strong>Be ready before the market knows.</strong></li>
        <li>Use the approved About copy from the internal launch page references.</li>
        <li>Add missing fields: location and services.</li>
        <li>Publish weekday content from <code>/dashboard/admin/social</code> in this order for week 1: executives, search firms, executive coaches, outplacement firms, executives.</li>
        <li>Reply to meaningful comments same day and log outcomes in social notes.</li>
        <li>Track week 1 metrics: impressions, comments, saves, profile visits, new followers, qualified DMs.</li>
      </ol>

      <p style="font-size:14px;margin:0 0 12px 0;">Rich is CC'd for visibility and approvals.</p>
      <p style="font-size:14px;margin:0;">Thanks.</p>
      <p style="font-size:13px;color:#475569;margin:12px 0 0 0;">Starting Monday</p>
      <p style="font-size:12px;color:#94a3b8;margin:16px 0 0 0;border-top:1px solid #e2e8f0;padding-top:10px;">CC: ${ownerEmail}</p>
    </div>
  `
}

function validateEmailPayload({ to, cc, subject, html, launchUrl }) {
  const checks = [
    subject.includes('LinkedIn Company Page Launch'),
    html.includes('starting-monday-logo-option-b.svg'),
    html.includes('linkedin-company-banner.svg'),
    html.includes('Be ready before the market knows.'),
    html.includes('/dashboard/admin/social'),
    html.includes(launchUrl),
    Boolean(to),
    Boolean(cc),
  ]

  if (checks.some((ok) => !ok)) {
    throw new Error('Email validation failed. Required instructions or recipients are missing.')
  }
}

async function resolveLizEmail() {
  if (LIZ_EMAIL_ENV) return LIZ_EMAIL_ENV

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await admin
    .from('staff_members')
    .select('email, role')
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to query staff_members: ${error.message}`)
  const rows = data ?? []

  const lizByName = rows.find((row) => /liz/i.test(row.email))
  if (lizByName?.email) return lizByName.email

  throw new Error('Could not resolve Liz email. Set LIZ_EMAIL in environment and retry.')
}

async function run() {
  assertConfig()

  const checkOnly = process.argv.includes('--check-only')
  const lizEmail = await resolveLizEmail()
  const launchUrl = `${APP_URL}/dashboard/admin/linkedin-company-launch`
  const subject = 'Starting Monday - LinkedIn Company Page Launch Instructions'
  const html = buildEmailHtml({ launchUrl, ownerEmail: OWNER_EMAIL })

  validateEmailPayload({
    to: lizEmail,
    cc: OWNER_EMAIL,
    subject,
    html,
    launchUrl,
  })

  console.log(`To: ${lizEmail}`)
  console.log(`CC: ${OWNER_EMAIL}`)
  console.log(`Subject: ${subject}`)
  console.log(`Launch URL: ${launchUrl}`)

  if (checkOnly) {
    console.log('Check-only mode complete. Email body validation passed.')
    return
  }

  const resend = new Resend(RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: RESEND_FROM,
    to: [lizEmail],
    cc: [OWNER_EMAIL],
    subject,
    html,
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
  console.log(`Email sent successfully. id=${data?.id ?? 'unknown'}`)
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
