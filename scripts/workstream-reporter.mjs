#!/usr/bin/env node

/**
 * Site Experience Orchestration (SXO) Status Reporter
 * 
 * Posts daily standup updates and weekly progress reviews to Slack for the SXO initiative.
 * Tracks A1-A7 agent implementations and J1-J12 implementation jobs.
 * 
 * Environment variables required:
 * - SLACK_WEBHOOK_URL: Incoming webhook URL from Slack (easiest setup)
 *   OR
 * - SLACK_BOT_TOKEN: Bot user token from Slack + SLACK_CHANNEL_ID
 * 
 * Run manually:
 *   node scripts/workstream-reporter.mjs --type daily
 *   node scripts/workstream-reporter.mjs --type weekly
 * 
 * Schedule with cron (e.g., in package.json or GitHub Actions):
 *   0 10 * * 1-5 node scripts/workstream-reporter.mjs --type daily     # Mon-Fri 10am
 *   0 9 * * 1 node scripts/workstream-reporter.mjs --type weekly      # Mon 9am
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// Load .env.local if not already loaded
function loadEnv() {
  const __dirname = fileURLToPath(new URL('.', import.meta.url))
  const envPath = resolve(__dirname, '../.env.local')
  try {
    const envContent = readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=')
        if (key && value && !process.env[key]) {
          process.env[key] = value
        }
      }
    })
  } catch {
    // .env.local not found or not readable — that is okay, use process.env as-is
  }
}

loadEnv()

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

// Parse report type from args: --type daily or --type=daily
let reportType = 'daily'
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--type' && process.argv[i + 1]) {
    reportType = process.argv[i + 1]
    break
  } else if (process.argv[i].startsWith('--type=')) {
    reportType = process.argv[i].replace('--type=', '')
    break
  }
}

const slackWebhook = process.env.SLACK_WEBHOOK_URL
const slackBotToken = process.env.SLACK_BOT_TOKEN || process.env.SLACK_USER_TOKEN
const slackChannelId = process.env.SLACK_CHANNEL_ID || process.env.SLACK_ALERT_CHANNEL_ID

const workDocs = {
  sxoPlan: resolve(import.meta.dirname, '../docs/site-experience-orchestration-plan.md'),
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Generators
// ─────────────────────────────────────────────────────────────────────────────

function generateDailyStandup() {
  const today = new Date().toISOString().split('T')[0]
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  const jobs = [
    { id: 'J1', title: 'Site Experience Standard config', status: 'In Progress' },
    { id: 'J2', title: 'Agent registry + shared lib', status: 'In Progress' },
    { id: 'J3', title: 'Route Inventory Agent', status: 'Done' },
    { id: 'J4', title: 'Experience Vitals Agent', status: 'In Progress' },
    { id: 'J5', title: 'Visual Sentinel extension', status: 'In Progress' },
    { id: 'J6', title: 'Cognitive Load & Fluency Agent', status: 'In Progress' },
    { id: 'J7', title: 'Trust Integrity Agent', status: 'Done' },
    { id: 'J8', title: 'Journey Synthetic Agent', status: 'In Progress' },
    { id: 'J9', title: 'Daily Experience Report', status: 'In Progress' },
    { id: 'J10', title: 'Weekly Issues + Monthly Trends', status: 'In Progress' },
    { id: 'J11', title: 'Watchdog + seeding', status: 'In Progress' },
    { id: 'J12', title: 'Calibration loop', status: 'Done' },
  ]

  const inProgress = jobs.filter(j => j.status === 'In Progress').length
  const done = jobs.filter(j => j.status === 'Done').length

  return [
    ':timer_clock: *Daily Standup — ' + dayName + ' ' + today + '*',
    ':rocket: *Site Experience Orchestration (SXO) Agent Fleet*',
    '',
    '*Foundation: 7 Agents + 12 Implementation Jobs*',
    'Progress: ' + done + '/' + jobs.length + ' jobs complete, ' + inProgress + ' in progress',
    '',
    '*Core Sprint Focus:*',
    '  1. Harden trust telemetry artifacts and route-evidence clarity',
    '  2. Finish J1/J2 foundation maturity (shared config + reporting kit)',
    '  3. Deepen portfolio rollup from workflow-health into artifact normalization',
    '',
    '*Job Status Summary:*',
    ...jobs.map(j => {
      const icon = j.status === 'Done' ? '✅' : j.status === 'In Progress' ? '🟡' : '⬜'
      return '  ' + icon + ' ' + j.id + ': ' + j.title
    }),
    '',
    '*Critical Dependencies This Week:*',
    '  ⚠️  J1 SES thresholds wired into agent gates (blocker for J4/J5/J6)',
    '  ⚠️  J2 shared reporting kit completion (unblocks J9/J10 consolidation)',
    '  ⚠️  J4/J8 baseline data collection (needed for weekly report)',
    '',
    ':link: *Docs*',
    '  • <https://github.com/richrothschild/startingmonday/blob/main/docs/site-experience-orchestration-plan.md|SXO Full Plan>',
    '  • Post questions in #product',
    '  • Escalate blockers to @rich',
  ].join('\n')
}

function generateWeeklyReview() {
  const monday = new Date()
  monday.setDate(monday.getDate() - monday.getDay() + 1)
  const friday = new Date(monday)
  friday.setDate(friday.getDate() + 4)

  const mondayStr = monday.toISOString().split('T')[0]
  const fridayStr = friday.toISOString().split('T')[0]

  return [
    ':bar_chart: *Weekly Review — Site Experience Orchestration (SXO)*',
    'Week of ' + mondayStr + ' to ' + fridayStr,
    '',
    '*📊 Initiative Overview*',
    '  Goal: Build observable, world-class site experience monitoring (7 agents, 12 jobs)',
    '  Vision: Continuous experience verification matching luxury benchmark standards',
    '  Status: Foundation phase (J1-J3, J12) + agent build-out (J4-J11)',
    '  Reporting parity: Daily → Weekly → Monthly trends + Slack watchdog',
    '',
    '*🤖 Agent Implementation Status*',
    '',
    '  ✅ A1: Route Inventory Agent (DONE)',
    '     • Canonical route crawl with metadata (tier, template, audit timestamp)',
    '     • Kills partial-scan compliance claims permanently',
    '     • Foundation for all downstream agents',
    '',
    '  ✅ A7: Trust Integrity Agent (DONE)',
    '     • Parity contracts: signal counts, date staleness, placeholder detection',
    '     • P0 escalation on any mismatch (per AGENTS.md addendum)',
    '     • Ready for weekly issues aggregation',
    '',
    '  ✅ A12: Calibration Loop (DONE)',
    '     • Page Experience Auditor artifact ingestion + workflow-native publication',
    '     • Quarterly calibration for deterministic vs human auditor deltas',
    '',
    '  🟡 A2: Experience Vitals Agent (IN PROGRESS)',
    '     • Core Web Vitals baseline (LCP, CLS, INP, TTFB, FCP)',
    '     • Lab metrics desktop + mobile via Playwright/Lighthouse',
    '     • P50/P75 luxury budgets per route',
    '     • Next: Tighten enforcement, expand route sampling',
    '',
    '  🟡 A3: Visual & Palette Sentinel (IN PROGRESS)',
    '     • Rendered verification: screenshot-based darkness/contrast',
    '     • Typography discipline, accent-count ceiling',
    '     • CSS bleed detection via layout-shift diffing',
    '     • Next: Add rendered screenshot diffs, font telemetry',
    '',
    '  🟡 A4: Cognitive Load & Fluency Agent (IN PROGRESS)',
    '     • Deterministic scoring: choice count, CTA density, competing emphasis',
    '     • Fluency scoring: reading grade, headline scannability, info scent',
    '     • Monthly: Full LLM auditor on worst-5 routes + score movers',
    '     • Next: Fold auditor outcomes back into deterministic model',
    '',
    '  🟡 A5: Journey Synthetic Agent (IN PROGRESS)',
    '     • Full-journey experience: signup → onboarding → first briefing',
    '     • Duration percentiles + abandonment risk per step',
    '     • Hourly (tier-1) + daily (tier-2) cadence',
    '     • Next: Add journey metric normalization into portfolio rollup',
    '',
    '  🟡 A6: Experience Daily Report (IN PROGRESS)',
    '     • Consolidation: one ledger-backed aggregator',
    '     • All-agent health roll-up + per-route issue summary',
    '     • Next: Merge experience daily + trust daily reporting',
    '',
    '  🟡 A7: Experience Trends & Governance (IN PROGRESS)',
    '     • Weekly: per-route issues + recommended actions, worst-5/best-5 movers',
    '     • Monthly: trend classification (improving/flat/worsening) per dimension',
    "     • Devil's advocate: unmonitored risks + fired mitigations",
    '     • Next: Feed directionality into action prioritization + escalation copy',
    '',
    '*🏗️ Foundation Jobs Status*',
    '',
    '  🟡 J1: Site Experience Standard config',
    '     • Initial scaffold: config/site-experience-standard.json',
    '     • Next: Wire SES thresholds into active agent gates (single source of truth)',
    '',
    '  🟡 J2: Agent registry + shared lib',
    '     • Shared kit partially implemented (experience-agents.mjs, experience-workflows.mjs)',
    '     • Next: Finish migrating all daily/weekly/monthly scripts to helper kit',
    '',
    '  🟡 J11: Watchdog + seeding',
    '     • Freshness signal tracking + weekly report links',
    '     • Next: Tighten freshness windows after one more weekly cycle',
    '',
    '*:warning: Blockers This Week*',
    '  • J1 SES threshold wiring needed before A2/A3/A4 enforcement tightens',
    '  • J2 shared kit completion needed to unblock consolidated reporting',
    '  • A4 deterministic model requires auditor calibration data (in flight)',
    '',
    '*:memo: Next Week Focus (Week of 2026-07-15)*',
    '  J1: Complete SES threshold config wiring',
    '  J2: Finish experience-agents shared kit migration',
    '  A2: First main seed of Experience Vitals Agent',
    '  A4: Begin A4 calibration dispatch with monthly LLM auditor',
    '  J10: Expand portfolio rollup artifact normalization',
    '',
    ':link: *Key Documents*',
    '  • <https://github.com/richrothschild/startingmonday/blob/main/docs/site-experience-orchestration-plan.md|SXO Full Plan>',
    '  • <https://github.com/richrothschild/startingmonday/blob/main/docs/site-experience-orchestration-plan.md#3-the-agent-fleet-what-is-needed|Agent Fleet Specs>',
    '  • Questions? Post in #product or escalate to @rich',
  ].join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// Slack Posting
// ─────────────────────────────────────────────────────────────────────────────

async function postSlackText(text) {
  // Try webhook first (simpler, no auth issues)
  if (slackWebhook) {
    try {
      const response = await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`Slack webhook returned ${response.status}`)
      }

      console.log('✓ Posted to Slack via webhook')
      return { ok: true }
    } catch (error) {
      console.error('✗ Slack webhook failed:', error instanceof Error ? error.message : String(error))
      return { ok: false, error: 'webhook failed' }
    }
  }

  // Fallback to bot token + channel ID
  if (slackBotToken && slackChannelId) {
    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${slackBotToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: slackChannelId,
          text,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload.ok) {
        throw new Error(`Slack API error: ${payload.error || response.statusText}`)
      }

      console.log('✓ Posted to Slack via bot token')
      return { ok: true }
    } catch (error) {
      console.error('✗ Slack bot token failed:', error instanceof Error ? error.message : String(error))
      return { ok: false, error: 'bot token failed' }
    }
  }

  console.error('✗ Slack not configured. Set SLACK_WEBHOOK_URL or (SLACK_BOT_TOKEN + SLACK_CHANNEL_ID)')
  return { ok: false, error: 'slack not configured' }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n:workstream-reporter: Running ${reportType} report generator...\n`)

  // Validate input
  if (!['daily', 'weekly'].includes(reportType)) {
    console.error(`❌ Invalid report type: ${reportType}. Use 'daily' or 'weekly'.`)
    process.exit(1)
  }

  // Generate report text
  const text = reportType === 'daily' ? generateDailyStandup() : generateWeeklyReview()

  // Attempt to post
  const result = await postSlackText(text)

  if (!result.ok) {
    console.error(`\n❌ Failed to post ${reportType} report: ${result.error}`)
    console.log('\n📋 Report content (would have been posted):')
    console.log('─'.repeat(80))
    console.log(text)
    console.log('─'.repeat(80))
    process.exit(1)
  }

  console.log(`\n✅ ${reportType.toUpperCase()} report posted to Slack`)
  console.log('\n📋 Content preview:')
  console.log('─'.repeat(80))
  console.log(text)
  console.log('─'.repeat(80))
  console.log('')
}

main().catch(error => {
  console.error('Fatal error:', error instanceof Error ? error.message : String(error))
  process.exit(1)
})
