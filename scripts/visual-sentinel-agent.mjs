#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { loadSES, getTierThresholds, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)
const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'visual-sentinel.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'visual-sentinel.latest.md')

const slackWebhook = process.env.SLACK_UI_DELIVERY_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_UI_DELIVERY_CHANNEL || 'reliability---service'

// Extract visual discipline thresholds from SES
const visualDiscipline = ses?.visualDiscipline ?? {}
const MAX_FONT_FAMILIES = visualDiscipline.maxDistinctFontFamilies ?? 2
const MAX_ACCENT_COLORS = visualDiscipline.maxAccentColorFamilies ?? 2
const MOTION_CONSTRAINTS = visualDiscipline.motion ?? {
  maxConcurrentAnimations: 6,
  maxDurationMs: 450,
  layoutShiftingAnimationAllowed: false,
}

function nowIso() {
  return new Date().toISOString()
}

async function extractFontFamilies(page) {
  return page.evaluate(() => {
    const styles = document.querySelectorAll('style, [style]')
    const fonts = new Set()
    for (const style of styles) {
      const text = style.textContent || style.getAttribute('style') || ''
      const matches = text.match(/font-family:\s*([^;,]+)/g) || []
      for (const match of matches) {
        const family = match.replace(/font-family:\s*/, '').trim().replace(/['"]/g, '')
        if (family) fonts.add(family.split(',')[0].trim())
      }
    }
    const computed = new Map()
    document.querySelectorAll('*').forEach((el) => {
      const family = window.getComputedStyle(el).fontFamily
      if (family) computed.set(family.split(',')[0].trim(), true)
    })
    return Array.from(computed.keys()).slice(0, 10)
  })
}

async function extractAccentColors(page) {
  return page.evaluate(() => {
    const accentPattern = /(text|bg|border|shadow)-(indigo|blue|purple|pink|red|orange|yellow|green|emerald|teal|cyan)-[0-9]+/g
    const bodyText = document.documentElement.outerHTML
    const matches = new Set(Array.from(bodyText.matchAll(accentPattern), (m) => m[2]))
    return Array.from(matches)
  })
}

async function extractAnimations(page) {
  return page.evaluate(() => {
    const styles = document.querySelectorAll('style')
    const animations = new Set()
    const animationDurations = new Map()

    for (const style of styles) {
      const text = style.textContent || ''
      // Extract animation names and durations
      const animMatches = text.match(/@keyframes\s+(\w+)/g) || []
      for (const match of animMatches) {
        const name = match.replace(/@keyframes\s+/, '')
        animations.add(name)
      }

      // Extract animation durations
      const durationMatches = text.match(/animation[-\w]*:\s*[\w\s]+\s+([\d.]+m?s)/g) || []
      for (const match of durationMatches) {
        const duration = match.match(/([\d.]+m?s)$/)?.[1]
        if (duration) {
          const ms = duration.includes('ms')
            ? Number.parseInt(duration, 10)
            : Number.parseInt(duration, 10) * 1000
          animationDurations.set(duration, ms)
        }
      }
    }

    return {
      animationCount: animations.size,
      durations: Object.fromEntries(animationDurations),
    }
  })
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Visual Sentinel Agent Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push(`Base URL: ${report.baseUrl}`)
  lines.push(`Pass: ${report.pass}`)
  lines.push('')

  lines.push('## Thresholds (from SES)')
  lines.push(`- Max distinct font families: ${MAX_FONT_FAMILIES}`)
  lines.push(`- Max accent color families: ${MAX_ACCENT_COLORS}`)
  lines.push(`- Max concurrent animations: ${MOTION_CONSTRAINTS.maxConcurrentAnimations}`)
  lines.push(`- Max animation duration: ${MOTION_CONSTRAINTS.maxDurationMs}ms`)
  lines.push(`- Layout shifting animations allowed: ${MOTION_CONSTRAINTS.layoutShiftingAnimationAllowed}`)
  lines.push('')

  lines.push('## Route Results')
  lines.push('')
  for (const route of report.routes) {
    lines.push(`### ${route.route}`)
    lines.push(`- Font families: ${route.fontFamilies.length} (threshold: ${MAX_FONT_FAMILIES}) ${route.fontFamilies.length > MAX_FONT_FAMILIES ? '❌' : '✓'}`)
    lines.push(`- Accent colors: ${route.accentColors.length} (threshold: ${MAX_ACCENT_COLORS}) ${route.accentColors.length > MAX_ACCENT_COLORS ? '❌' : '✓'}`)
    lines.push(`- Animations: ${route.animations.animationCount} concurrent`)
    lines.push(`- Max animation duration: ${Object.values(route.animations.durations)[0] ?? 0}ms`)
    lines.push('')
  }

  lines.push('## Findings')
  lines.push('')
  if (report.findings.length === 0) {
    lines.push('- None')
  } else {
    for (const finding of report.findings) {
      lines.push(`- [${finding.severity}] ${finding.route}: ${finding.message}`)
    }
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

async function main() {
  const baseUrl = (process.env.PLAYWRIGHT_BASE_URL || 'https://startingmonday.app').replace(/\/$/, '')
  const email = process.env.PLAYWRIGHT_TEST_EMAIL
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD

  if (!email || !password) {
    throw new Error('Missing PLAYWRIGHT_TEST_EMAIL or PLAYWRIGHT_TEST_PASSWORD')
  }

  const routesToCheck = [
    { path: '/', label: 'Home' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/contacts', label: 'Contacts' },
  ]

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ baseURL: baseUrl })
  const page = await context.newPage()

  const findings = []
  const routes = []

  try {
    for (const routeConfig of routesToCheck) {
      await page.goto(routeConfig.path, { waitUntil: 'domcontentloaded', timeout: 30000 })

      const fontFamilies = await extractFontFamilies(page)
      const accentColors = await extractAccentColors(page)
      const animations = await extractAnimations(page)

      routes.push({
        route: routeConfig.path,
        fontFamilies,
        accentColors,
        animations,
      })

      // Check font families
      if (fontFamilies.length > MAX_FONT_FAMILIES) {
        findings.push({
          severity: 'P1',
          route: routeConfig.path,
          message: `Distinct font families (${fontFamilies.length}) exceed limit (${MAX_FONT_FAMILIES}): ${fontFamilies.join(', ')}`,
        })
      }

      // Check accent colors
      if (accentColors.length > MAX_ACCENT_COLORS) {
        findings.push({
          severity: 'P1',
          route: routeConfig.path,
          message: `Accent color families (${accentColors.length}) exceed limit (${MAX_ACCENT_COLORS}): ${accentColors.join(', ')}`,
        })
      }

      // Check animation durations
      const maxDuration = Math.max(...Object.values(animations.durations).map((d) => d ?? 0), 0)
      if (maxDuration > MOTION_CONSTRAINTS.maxDurationMs) {
        findings.push({
          severity: 'P2',
          route: routeConfig.path,
          message: `Animation duration (${maxDuration}ms) exceeds limit (${MOTION_CONSTRAINTS.maxDurationMs}ms)`,
        })
      }
    }

    const report = {
      generatedAt: nowIso(),
      baseUrl,
      sesVersion: ses.version,
      sesReviewBy: ses.reviewBy,
      visualDisciplineConfig: {
        maxDistinctFontFamilies: MAX_FONT_FAMILIES,
        maxAccentColorFamilies: MAX_ACCENT_COLORS,
        motion: MOTION_CONSTRAINTS,
      },
      routes,
      findings,
      pass: findings.length === 0,
    }

    writeLatestReportFiles({
      jsonPath: reportJsonPath,
      markdownPath: reportMdPath,
      report,
      markdown: buildMarkdown(report),
    })

    await postSlackText({
      webhookUrl: slackWebhook,
      text: [
        report.pass ? '*Visual sentinel: no issues detected*' : `*Visual sentinel: ${findings.length} finding(s)*`,
        `Channel: ${slackChannel}`,
        `Routes scanned: ${routes.length}`,
        '',
        '*Findings*',
        ...(findings.length === 0 ? ['- None'] : findings.slice(0, 10).map((f) => `- [${f.severity}] ${f.route}: ${f.message}`)),
      ].join('\n'),
    })

    console.log(`Visual sentinel agent completed (${routes.length} routes, ${findings.length} findings).`)
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
