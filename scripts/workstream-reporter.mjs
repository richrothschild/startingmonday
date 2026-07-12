#!/usr/bin/env node

/**
 * Dual Workstream Status Reporter (EMI Sprint 6 + Luxury-Modern Phase 0)
 * 
 * Posts daily standup updates and weekly summaries to Slack for both initiatives.
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
    // .env.local not found or not readable — that's okay, use process.env as-is
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
  emiWrapup: resolve(import.meta.dirname, '../docs/emi-sprint-6-wrap-up-2026-07-11.md'),
  luxuryModern: resolve(import.meta.dirname, '../docs/luxury-modern-phase-0-kickoff-2026-07-11.md'),
  actionChecklist: resolve(import.meta.dirname, '../docs/action-checklist-this-week-2026-07-11.md'),
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Reliability Report Generator
// ─────────────────────────────────────────────────────────────────────────────

function loadLatestAgentReport(agentName) {
  const __dirname = fileURLToPath(new URL('.', import.meta.url))
  const reportPath = resolve(__dirname, `../docs/status/${agentName}.latest.json`)
  try {
    const content = readFileSync(reportPath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

function generateAgentReliabilitySection() {
  // Load reports from key orchestration agents
  const agents = [
    'experience-vitals',
    'trust-integrity',
    'cognitive-load',
    'accessibility-sweep',
    'mobile-responsive',
    'journey-synthetic',
  ]

  let totalP0 = 0
  let totalP1 = 0
  let totalP2 = 0
  const agentStatus = []

  for (const agent of agents) {
    const report = loadLatestAgentReport(agent)
    if (!report) continue

    // Extract issue counts based on report structure
    let p0Count = report.p0Count || 0
    let p1Count = report.p1Count || 0
    let p2Count = report.p2Count || 0

    // Handle trust reports with escalations
    if (agent === 'trust-integrity' && report.findings) {
      const p0Findings = report.findings.filter((f) => f.severity === 'P0')
      p0Count = p0Findings.length
    }

    totalP0 += p0Count
    totalP1 += p1Count
    totalP2 += p2Count

    const status = p0Count > 0 ? '🔴 critical' : p1Count > 0 ? '🟡 warning' : p2Count > 0 ? '🟠 caution' : '🟢 healthy'
    agentStatus.push(`  • ${agent}: ${status} (P0=${p0Count}, P1=${p1Count}, P2=${p2Count})`)
  }

  return {
    agentStatus,
    totalP0,
    totalP1,
    totalP2,
    healthStatus:
      totalP0 > 0 ? '🔴 CRITICAL' : totalP1 > 0 ? '🟡 DEGRADED' : totalP2 > 0 ? '🟠 CAUTION' : '🟢 HEALTHY',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Generators
// ─────────────────────────────────────────────────────────────────────────────

function generateDailyStandup() {
  const today = new Date().toISOString().split('T')[0]
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  return [
    `:timer_clock: *Daily Standup — ${dayName} ${today}*`,
    `:rocket: *Dual Workstream Status*`,
    '',
    '📋 *EMI Sprint 6 (Completion by 2026-07-18)*',
    '  • EMI-501: Tune objections & create scripts',
    '  • EMI-502: Finalize SLOs for critical flows',
    '  • EMI-503: Lock Q4 operating cadence',
    '  • EMI-504: Publish capstone & remediation plan',
    '  Action: Check `/docs/emi-sprint-6-wrap-up-2026-07-11.md` for detailed progress',
    '',
    '🎨 *Luxury-Modern Phase 0 (Completion by 2026-07-25)*',
    '  • Design system: Premium tokens + 5 components',
    '  • Messaging: Hero headlines for 5 pages',
    '  • Metrics: Baseline capture + GA4 setup',
    '  • Page briefs: Figma redesigns + copy specs',
    '  Action: Check `/docs/luxury-modern-phase-0-kickoff-2026-07-11.md` for specs',
    '',
    ':clipboard: *Critical Dependencies This Week*',
    '  ⚠️  Metrics access (Engineering) — needed by Mon 2026-07-15',
    '  ⚠️  Rich + Chris EMI-503 sync — needed by Fri 2026-07-12',
    '  ⚠️  Design token approval — needed by Thu 2026-07-18',
    '  ⚠️  GA4 instrumentation live — needed by Thu 2026-07-18',
    '',
    ':memo: *Action Items Due Today*',
    '  If you own a workstream, complete items in `/docs/action-checklist-this-week-2026-07-11.md`',
    '',
    ':link: *Docs*',
    '  • <#product> channel for questions',
    '  • Escalate blockers to @rich immediately',
  ].join('\n')
}

function generateWeeklyReview() {
  const monday = new Date()
  monday.setDate(monday.getDate() - monday.getDay() + 1)
  const friday = new Date(monday)
  friday.setDate(friday.getDate() + 4)

  const mondayStr = monday.toISOString().split('T')[0]
  const fridayStr = friday.toISOString().split('T')[0]

  // Load agent reliability metrics
  const { agentStatus, totalP0, totalP1, totalP2, healthStatus } = generateAgentReliabilitySection()

  return [
    `:bar_chart: *Weekly Review — Week of ${mondayStr} to ${fridayStr}*`,
    '',
    '*🎯 EMI Sprint 6 Status*',
    '  Sprint goal: Lock EMI system for Q4 execution',
    '  Timeline: Complete by 2026-07-18, go/no-go decision 2026-07-19',
    '  Success criteria: All 4 tickets (EMI-501/502/503/504) complete & approved',
    '  This week:',
    '    ✓ EMI-501 objections draft (by Mon)',
    '    ✓ EMI-502 SLOs finalized (by Wed)',
    '    ✓ EMI-503 cadence locked (by Thu)',
    '    ✓ EMI-504 capstone drafted (by Fri)',
    '  Owner: Rich (Founder Office) + Chris (GTM)',
    '',
    '*🎨 Luxury-Modern Phase 0 Status*',
    '  Phase goal: Establish design system & approve page redesigns',
    '  Timeline: Complete by 2026-07-25, Phase 1 engineering start 2026-07-26',
    '  Success criteria: All workstreams at 80% complete',
    '  This week:',
    '    ✓ Design tokens v1 (by Wed)',
    '    ✓ 5 hero headlines approved (by Thu)',
    '    ✓ GA4 instrumentation live (by Thu)',
    '    ✓ 5 page redesign mocks 50% draft (by Thu)',
    '  Owner: Product + Design + Engineering + Growth',
    '',
    '*🤖 Service Reliability Status (Orchestration Layer)*',
    `  Overall health: ${healthStatus}`,
    `  P0 issues: ${totalP0}  |  P1 issues: ${totalP1}  |  P2 issues: ${totalP2}`,
    '',
    '  Agent status:',
    ...agentStatus,
    '',
    '*:warning: Blockers This Week*',
    '  If any blocker prevents progress by stated date, escalate to Rich immediately:',
    '    • Metrics access delayed → Engineering Lead → Rich',
    '    • Design resources unavailable → Design Lead → Rich',
    '    • GA4 setup blocked → Analytics Lead → Rich',
    '    • Agent P0 issues detected → Engineering Lead → Rich',
    '',
    '*:memo: Next Week Focus*',
    '  Week of 2026-07-15 (Monday standup):',
    '    • First drafts reviewed (objections, tokens, headlines)',
    '    • Final week to complete all Phase 0 work',
    '    • Prepare for Phase 1 engineering kickoff (Mon 2026-07-26)',
    '    • Verify all agent health metrics remain below P0 threshold',
    '',
    ':link: *Key Documents*',
    '  • EMI Sprint 6: `/docs/emi-sprint-6-wrap-up-2026-07-11.md`',
    '  • Luxury-Modern: `/docs/luxury-modern-phase-0-kickoff-2026-07-11.md`',
    '  • Daily checklist: `/docs/action-checklist-this-week-2026-07-11.md`',
    '  • Executive summary: `/docs/dual-workstream-executive-summary-2026-07-11.md`',
    '  • Agent reports: `/docs/status/` (*.latest.json files)',
    '',
    ':question: Questions? Post in #product or escalate to @rich',
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
