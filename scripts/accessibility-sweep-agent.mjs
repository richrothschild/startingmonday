#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { loadSES, getTierThresholds, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'accessibility-sweep.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'accessibility-sweep.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_ESCALATION_CHANNEL || 'a11y---platform'

const W3C_AA_CONTRAST_THRESHOLD = 4.5 // WCAG AA for normal text
const WCAG_AAA_CONTRAST_THRESHOLD = 7.0 // WCAG AAA for enhanced clarity

function nowIso() {
  return new Date().toISOString()
}

function generateLuminance(color) {
  // Parse hex or rgb color
  let r, g, b
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    r = Number.parseInt(hex.slice(0, 2), 16) / 255
    g = Number.parseInt(hex.slice(2, 4), 16) / 255
    b = Number.parseInt(hex.slice(4, 6), 16) / 255
  } else if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g)
    if (!match || match.length < 3) return 0
    r = Number.parseInt(match[0], 10) / 255
    g = Number.parseInt(match[1], 10) / 255
    b = Number.parseInt(match[2], 10) / 255
  } else {
    return 0
  }

  // Apply gamma correction
  const adjust = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const rLinear = adjust(r)
  const gLinear = adjust(g)
  const bLinear = adjust(b)

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

function calculateContrastRatio(fgColor, bgColor) {
  const fgLum = generateLuminance(fgColor)
  const bgLum = generateLuminance(bgColor)

  const lighter = Math.max(fgLum, bgLum)
  const darker = Math.min(fgLum, bgLum)

  return (lighter + 0.05) / (darker + 0.05)
}

function checkContrastCompliance(ratio, level = 'AA', fontSize = 16) {
  if (level === 'AAA') {
    return fontSize >= 14 ? ratio >= WCAG_AAA_CONTRAST_THRESHOLD : ratio >= WCAG_AAA_CONTRAST_THRESHOLD
  }

  // AA level
  if (fontSize >= 18 || (fontSize >= 14 && Number.parseInt(String(fontSize).split('.')[0], 10) >= 14 * 1.5)) {
    return ratio >= 3.0 // Large text
  }

  return ratio >= W3C_AA_CONTRAST_THRESHOLD // Normal text
}

async function scanAccessibilityIssues(page, routePath = '/') {
  const issues = []

  try {
    // Scan color contrast
    const contrastResults = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, span, a, button, label, li')
      const results = []

      for (const el of elements) {
        if (!el.textContent || el.textContent.trim().length === 0) continue

        const computed = window.getComputedStyle(el)
        const fgColor = computed.color
        const bgColor = computed.backgroundColor
        const fontSize = Number.parseInt(computed.fontSize, 10)

        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          results.push({
            element: el.tagName,
            fgColor,
            bgColor,
            fontSize,
            text: el.textContent.slice(0, 50),
          })
        }
      }

      return results
    })

    for (const result of contrastResults) {
      const ratio = calculateContrastRatio(result.fgColor, result.bgColor)
      const isCompliant = checkContrastCompliance(ratio, 'AA', result.fontSize)

      if (!isCompliant) {
        issues.push({
          route: routePath,
          type: 'color-contrast',
          element: result.element,
          severity: ratio < 3.0 ? 'P1' : 'P2',
          contrastRatio: ratio.toFixed(2),
          required: W3C_AA_CONTRAST_THRESHOLD,
          text: result.text,
          message: `Color contrast ${ratio.toFixed(2)}:1 below WCAG AA (${W3C_AA_CONTRAST_THRESHOLD}:1) for ${result.element} with text "${result.text}"`,
        })
      }
    }

    // Scan landmarks
    const landmarks = await page.evaluate(() => {
      const mains = document.querySelectorAll('main')
      const navs = document.querySelectorAll('nav[aria-label], nav')
      const asides = document.querySelectorAll('aside')

      return {
        mainCount: mains.length,
        navCount: navs.length,
        asideCount: asides.length,
        hasContentInfo: document.querySelector('[role="contentinfo"]') !== null,
      }
    })

    if (landmarks.mainCount === 0) {
      issues.push({
        route: routePath,
        type: 'landmark-missing',
        landmark: 'main',
        severity: 'P0',
        message: 'Missing <main> landmark; main content region not identified for assistive tech',
      })
    }

    if (landmarks.mainCount > 1) {
      issues.push({
        route: routePath,
        type: 'landmark-duplicate',
        landmark: 'main',
        severity: 'P1',
        count: landmarks.mainCount,
        message: `Multiple <main> landmarks (${landmarks.mainCount}); only one per page allowed`,
      })
    }

    // Scan ARIA labels
    const ariaResults = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button')
      const icons = document.querySelectorAll('[role="img"]')
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea')

      const results = {
        buttonsMissingLabel: [],
        iconsMissingLabel: [],
        inputsMissingLabel: [],
      }

      for (const btn of buttons) {
        const hasLabel = btn.textContent.trim().length > 0 || btn.getAttribute('aria-label') || btn.getAttribute('title')
        if (!hasLabel) {
          results.buttonsMissingLabel.push(btn.outerHTML.slice(0, 80))
        }
      }

      for (const icon of icons) {
        const hasLabel = icon.getAttribute('aria-label')
        if (!hasLabel) {
          results.iconsMissingLabel.push(icon.outerHTML.slice(0, 80))
        }
      }

      for (const input of inputs) {
        const hasLabel = input.getAttribute('aria-label') || document.querySelector(`label[for="${input.id}"]`)
        if (!hasLabel) {
          results.inputsMissingLabel.push(`<input id="${input.id || 'no-id'}" />`)
        }
      }

      return results
    })

    if (ariaResults.buttonsMissingLabel.length > 0) {
      issues.push({
        route: routePath,
        type: 'aria-label-missing',
        element: 'button',
        severity: 'P1',
        count: ariaResults.buttonsMissingLabel.length,
        examples: ariaResults.buttonsMissingLabel.slice(0, 2),
        message: `${ariaResults.buttonsMissingLabel.length} buttons missing accessible label (text or aria-label)`,
      })
    }

    if (ariaResults.iconsMissingLabel.length > 0) {
      issues.push({
        route: routePath,
        type: 'aria-label-missing',
        element: 'img-role',
        severity: 'P1',
        count: ariaResults.iconsMissingLabel.length,
        message: `${ariaResults.iconsMissingLabel.length} icon elements missing aria-label`,
      })
    }

    if (ariaResults.inputsMissingLabel.length > 0) {
      issues.push({
        route: routePath,
        type: 'label-missing',
        element: 'input',
        severity: 'P2',
        count: ariaResults.inputsMissingLabel.length,
        message: `${ariaResults.inputsMissingLabel.length} form inputs missing associated label or aria-label`,
      })
    }

    // Scan heading hierarchy
    const headingHierarchy = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      if (headings.length === 0) return null

      const levels = headings.map((h) => Number.parseInt(h.tagName[1], 10))
      const violations = []

      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1) {
          violations.push({
            prev: `H${levels[i - 1]}`,
            curr: `H${levels[i]}`,
            skip: levels[i] - levels[i - 1],
          })
        }
      }

      return { levels, violations }
    })

    if (headingHierarchy && headingHierarchy.violations.length > 0) {
      issues.push({
        route: routePath,
        type: 'heading-hierarchy',
        severity: 'P2',
        violations: headingHierarchy.violations,
        message: `Heading hierarchy skipped levels (e.g., H1 → H${headingHierarchy.violations[0].curr}); maintain sequential order`,
      })
    }
  } catch (error) {
    console.warn(`Accessibility scan error on ${routePath}:`, error instanceof Error ? error.message : String(error))
  }

  return issues
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Accessibility Sweep Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push('')

  lines.push('## Summary')
  lines.push('')
  lines.push(`Total routes scanned: ${report.routesScanned}`)
  lines.push(`Total issues: ${report.totalIssues}`)
  if (report.p0Count > 0) {
    lines.push(`**P0 (Critical): ${report.p0Count}** ⚠️`)
  }
  if (report.p1Count > 0) {
    lines.push(`**P1 (High): ${report.p1Count}** 🔴`)
  }
  if (report.p2Count > 0) {
    lines.push(`**P2 (Medium): ${report.p2Count}** 🟡`)
  }
  lines.push('')

  // Group issues by type
  const byType = new Map()
  for (const issue of report.issues) {
    if (!byType.has(issue.type)) {
      byType.set(issue.type, [])
    }
    byType.get(issue.type).push(issue)
  }

  for (const [issueType, issues] of byType) {
    lines.push(`## ${issueType.replace(/-/g, ' ').toUpperCase()}`)
    lines.push('')
    for (const issue of issues) {
      lines.push(`- **${issue.route}** [${issue.severity}]`)
      lines.push(`  - ${issue.message}`)
      if (issue.contrastRatio) {
        lines.push(`  - Ratio: ${issue.contrastRatio}:1 (required: ${issue.required})`)
      }
      if (issue.count) {
        lines.push(`  - Count: ${issue.count}`)
      }
    }
    lines.push('')
  }

  lines.push('## Recommendations')
  lines.push('')
  if (report.p0Count > 0) {
    lines.push('1. **Address P0 issues immediately** — Missing main landmark prevents entire page being accessible')
  }
  if (report.p1Count > 0) {
    lines.push('2. **Fix P1 color contrast violations** — WCAG AA compliance required for public/funnel routes')
  }
  if (report.p2Count > 0) {
    lines.push('3. **Improve heading hierarchy** — Better semantic structure aids navigation')
  }
  if (report.totalIssues === 0) {
    lines.push('✅ No accessibility issues detected!')
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const headline = report.totalIssues === 0
    ? '✅ Accessibility sweep: no issues'
    : `❌ Accessibility sweep: ${report.totalIssues} issues`

  const details = [
    `Routes: ${report.routesScanned}`,
    report.p0Count > 0 ? `P0: ${report.p0Count}` : null,
    report.p1Count > 0 ? `P1: ${report.p1Count}` : null,
    report.p2Count > 0 ? `P2: ${report.p2Count}` : null,
  ].filter(Boolean)

  return [
    headline,
    `Channel: ${report.channel}`,
    details.join(' | '),
    report.totalIssues === 0 ? 'Status: Compliant' : 'Status: Review required',
  ].join('\n')
}

async function main() {
  const routes = ['/', '/pricing', '/dashboard', '/dashboard/contacts']
  const email = process.env.PLAYWRIGHT_TEST_EMAIL
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const allIssues = []
  let scannedCount = 0

  try {
    // Log in if credentials available
    if (email && password) {
      try {
        await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 })
        await page.fill('input[type="email"]', email)
        await page.fill('input[type="password"]', password)
        await page.click('button[type="submit"]')
        await page.waitForURL(`${baseUrl}/dashboard**`, { timeout: 30000 })
        console.log('Logged in for protected route scanning')
      } catch (error) {
        console.warn('Login skipped:', error instanceof Error ? error.message : String(error))
      }
    }

    for (const route of routes) {
      try {
        const isProtected = route.includes('/dashboard')
        if (isProtected && (!email || !password)) {
          console.log(`Skipping ${route} (protected, no credentials)`)
          continue
        }

        await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
        await page.locator('main').first().waitFor({ state: 'visible', timeout: 10000 })

        const issues = await scanAccessibilityIssues(page, route)
        allIssues.push(...issues)
        scannedCount++
        console.log(`✓ Scanned ${route}: ${issues.length} issues`)
      } catch (error) {
        console.warn(`Scan failed for ${route}:`, error instanceof Error ? error.message : String(error))
      }
    }
  } finally {
    await browser.close()
  }

  const p0Issues = allIssues.filter((i) => i.severity === 'P0')
  const p1Issues = allIssues.filter((i) => i.severity === 'P1')
  const p2Issues = allIssues.filter((i) => i.severity === 'P2')

  const report = {
    generatedAt: nowIso(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    channel: slackChannel,
    routesScanned: scannedCount,
    totalIssues: allIssues.length,
    p0Count: p0Issues.length,
    p1Count: p1Issues.length,
    p2Count: p2Issues.length,
    issues: allIssues,
  }

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  })

  // Post to Slack only if P0 issues detected
  if (p0Issues.length > 0) {
    await postSlackText({
      webhookUrl: slackWebhook,
      text: buildSlackText(report),
    })
  }

  console.log(`Accessibility sweep completed (${scannedCount} routes, ${allIssues.length} issues).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
