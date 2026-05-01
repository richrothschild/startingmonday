// End-to-end test for WBS 1.5 — Daily Briefing Engine.
// Sends a test briefing using real DB data (or synthetic data with --synthetic).
// Usage:
//   node --env-file=.env.local scripts/test-briefing.mjs
//   node --env-file=.env.local scripts/test-briefing.mjs --synthetic
//   node --env-file=.env.local scripts/test-briefing.mjs --dry-run   (saves HTML, no email send)

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const dir = dirname(fileURLToPath(import.meta.url))

// Inline the briefing modules (same source, loaded with env already set)
const { assembleContext } = await import('../worker/briefing/assemble-context.js')
const { generateBriefing } = await import('../worker/briefing/generate-briefing.js')
const { renderBriefingEmail } = await import('../worker/briefing/email-template.js')
const { sendBriefing } = await import('../worker/briefing/send-briefing.js')

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const SYNTHETIC = args.includes('--synthetic')

// ── Supabase client ────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Synthetic context (no DB required) ────────────────────────────────────────

const SYNTHETIC_CONTEXT = {
  userEmail: 'rothschild@gmail.com',
  userName: 'Richard Rothschild',
  targetTitles: ['CIO', 'VP of Technology', 'Head of Digital Transformation'],
  totalCompanies: 12,
  todayStr: new Date().toISOString().slice(0, 10),
  newMatches: [
    {
      companyName: 'Accenture',
      aiScore: 87,
      aiSummary: '2 strong matches found: VP Technology and Head of Digital Transformation',
      matchingRoles: [
        { title: 'VP Technology', score: 87, isNew: true, summary: 'Senior VP role overseeing digital platforms' },
        { title: 'Head of Digital Transformation', score: 82, isNew: true, summary: 'Global transformation leadership role' },
      ],
    },
    {
      companyName: 'JPMorgan Chase',
      aiScore: 74,
      aiSummary: '1 match: Managing Director, Technology Infrastructure',
      matchingRoles: [
        { title: 'Managing Director, Technology Infrastructure', score: 74, isNew: false, summary: 'MD-level role leading global infra modernization' },
      ],
    },
  ],
  followUps: [
    {
      id: 'fu-1',
      dueDate: new Date().toISOString().slice(0, 10),
      note: 'Check in after intro call',
      contact: { name: 'Jennifer Park', title: 'Chief People Officer' },
    },
    {
      id: 'fu-2',
      dueDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      note: 'Send updated resume deck',
      contact: null,
    },
  ],
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nStarting Monday — Briefing Test`)
  console.log(`Mode: ${SYNTHETIC ? 'synthetic' : 'live DB'}${DRY_RUN ? ' + dry-run (no email)' : ''}\n`)

  let context

  if (SYNTHETIC) {
    context = SYNTHETIC_CONTEXT
    console.log('Using synthetic context.')
  } else {
    // Fetch the first user from the DB
    const { data: users, error } = await supabase.from('users').select('id, email').limit(5)
    if (error || !users?.length) {
      console.error('No users found in DB. Try --synthetic flag.')
      process.exit(1)
    }

    console.log(`Found ${users.length} user(s):`)
    users.forEach((u, i) => console.log(`  ${i + 1}. ${u.email}`))
    console.log()

    // Use first user
    const user = users[0]
    console.log(`Assembling context for: ${user.email}`)
    context = await assembleContext(supabase, user.id, user.email)

    if (!context) {
      console.log('\n  → No actionable data found (no new matches, no overdue follow-ups).')
      console.log('  → Use --synthetic to test with sample data.')
      process.exit(0)
    }
  }

  console.log(`Context: ${context.newMatches.length} match(es), ${context.followUps.length} follow-up(s), ${context.totalCompanies} companies`)

  // Generate briefing via Claude Sonnet
  console.log('\nGenerating briefing via Claude Sonnet...')
  const briefing = await generateBriefing(context)
  console.log(`  Subject: ${briefing.subject}`)
  console.log(`  Matches: ${(briefing.matchInsights ?? []).length}, Follow-ups: ${(briefing.followUpSuggestions ?? []).length}`)

  // Render HTML
  const html = renderBriefingEmail(context, briefing)
  console.log(`  HTML: ${html.length} chars`)

  // Save HTML preview
  const previewPath = resolve(dir, '../.briefing-preview.html')
  writeFileSync(previewPath, html, 'utf8')
  console.log(`  Preview saved → ${previewPath}`)

  if (DRY_RUN) {
    console.log('\nDry-run mode — email not sent. Open the preview file in a browser.')
    return
  }

  // Send to test addresses
  const TO_ADDRESSES = ['rothschild@gmail.com', 'richard@startingmonday.app']
  console.log(`\nSending to: ${TO_ADDRESSES.join(', ')}`)

  for (const to of TO_ADDRESSES) {
    try {
      const result = await sendBriefing({ to, subject: briefing.subject, html })
      console.log(`  ✓ ${to} — messageId: ${result.id}`)
    } catch (err) {
      console.error(`  ✗ ${to} — ${err.message}`)
    }
  }

  console.log('\nDone.')
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
