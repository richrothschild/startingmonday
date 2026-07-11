#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { loadSES, getTierThresholds, postSlackText, writeLatestReportFiles } from './lib/agent-report-kit.mjs'

const sesPath = path.join(process.cwd(), 'config', 'site-experience-standard.json')
const ses = loadSES(sesPath)

const reportJsonPath = path.join(process.cwd(), 'docs', 'status', 'mobile-responsive.latest.json')
const reportMdPath = path.join(process.cwd(), 'docs', 'status', 'mobile-responsive.latest.md')

const slackWebhook = process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || ''
const slackChannel = process.env.SLACK_ESCALATION_CHANNEL || 'ui---delivery'

// Viewport sizes for testing
const VIEWPORTS = [
  { name: 'mobile-xs', width: 320, height: 568 }, // iPhone SE
  { name: 'mobile-sm', width: 375, height: 812 }, // iPhone X
  { name: 'tablet', width: 768, height: 1024 }, // iPad
  { name: 'desktop', width: 1920, height: 1080 }, // Desktop
]

const TOUCH_TARGET_MIN = 44 // pixels
const MIN_FONT_SIZE_MOBILE = 16 // pixels
const MIN_FONT_SIZE_DESKTOP = 14 // pixels

function nowIso() {
  return new Date().toISOString()
}

async function validateMobileResponsiveness(page, routePath = '/') {
  const issues = []

  for (const viewport of VIEWPORTS) {
    try {
      page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(500) // Allow reflow

      // Check touch targets
      const touchResults = await page.evaluate((minSize) => {
        const clickables = document.querySelectorAll('button, a, input[type="checkbox"], input[type="radio"]')
        const results = []

        for (const el of clickables) {
          const rect = el.getBoundingClientRect()
          const width = Math.round(rect.width)
          const height = Math.round(rect.height)

          if (width < minSize || height < minSize) {
            results.push({
              element: el.tagName,
              text: el.textContent.slice(0, 30),
              width,
              height,
              size: `${width}x${height}`,
            })
          }
        }

        return results
      }, TOUCH_TARGET_MIN)

      if (touchResults.length > 0 && viewport.width <= 768) {
        // Only flag on mobile/tablet
        issues.push({
          route: routePath,
          viewport: viewport.name,
          type: 'touch-target-size',
          severity: viewport.width <= 375 ? 'P1' : 'P2', // Higher severity on phones
          count: touchResults.length,
          examples: touchResults.slice(0, 2),
          message: `${touchResults.length} touch targets below ${TOUCH_TARGET_MIN}px on ${viewport.name} (${viewport.width}px)`,
        })
      }

      // Check font sizes
      const fontResults = await page.evaluate((minSize) => {
        const textElements = document.querySelectorAll('p, span, a, button, label')
        const results = []

        for (const el of textElements) {
          if (!el.textContent || el.textContent.trim().length === 0) continue

          const computed = window.getComputedStyle(el)
          const fontSize = Number.parseInt(computed.fontSize, 10)

          if (fontSize < minSize && el.textContent.trim().length > 10) {
            results.push({
              element: el.tagName,
              fontSize,
              text: el.textContent.slice(0, 30),
            })
          }
        }

        return results
      }, MIN_FONT_SIZE_MOBILE)

      if (fontResults.length > 0 && viewport.width <= 768) {
        issues.push({
          route: routePath,
          viewport: viewport.name,
          type: 'font-size-too-small',
          severity: 'P2',
          count: fontResults.length,
          minRequired: MIN_FONT_SIZE_MOBILE,
          examples: fontResults.slice(0, 2),
          message: `${fontResults.length} elements below ${MIN_FONT_SIZE_MOBILE}px on ${viewport.name}`,
        })
      }

      // Check layout shifts (horizontal overflow)
      const overflowResults = await page.evaluate(() => {
        const html = document.documentElement
        const viewport = window.innerWidth
        const scrollWidth = document.body.scrollWidth

        if (scrollWidth > viewport + 1) {
          return {
            hasOverflow: true,
            excess: scrollWidth - viewport,
            scrollWidth,
            viewportWidth: viewport,
          }
        }

        return { hasOverflow: false }
      })

      if (overflowResults.hasOverflow) {
        issues.push({
          route: routePath,
          viewport: viewport.name,
          type: 'horizontal-overflow',
          severity: 'P1',
          excess: overflowResults.excess,
          message: `Horizontal scroll detected on ${viewport.name} (${overflowResults.excess}px excess)`,
        })
      }

      // Check button/link spacing
      const spacingResults = await page.evaluate((minSpacing) => {
        const buttons = document.querySelectorAll('button')
        const closeButtons = []

        for (let i = 0; i < buttons.length - 1; i++) {
          const rect1 = buttons[i].getBoundingClientRect()
          const rect2 = buttons[i + 1].getBoundingClientRect()

          // Check if on same row
          if (Math.abs(rect1.top - rect2.top) < 10) {
            const gap = rect2.left - rect1.right
            if (gap < minSpacing && gap > 0) {
              closeButtons.push({
                gap: Math.round(gap),
                text1: buttons[i].textContent.slice(0, 20),
                text2: buttons[i + 1].textContent.slice(0, 20),
              })
            }
          }
        }

        return closeButtons
      }, 8)

      if (spacingResults.length > 0 && viewport.width <= 768) {
        issues.push({
          route: routePath,
          viewport: viewport.name,
          type: 'button-spacing-tight',
          severity: 'P2',
          count: spacingResults.length,
          message: `${spacingResults.length} button pairs with tight spacing (< 8px)`,
        })
      }
    } catch (error) {
      console.warn(`Mobile check failed on ${routePath} ${viewport.name}:`, error instanceof Error ? error.message : String(error))
    }
  }

  return issues
}

function buildMarkdown(report) {
  const lines = []
  lines.push('# Mobile Responsive Validation Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`SES Version: ${report.sesVersion}`)
  lines.push('')

  lines.push('## Summary')
  lines.push('')
  lines.push(`Routes tested: ${report.routesTested}`)
  lines.push(`Viewports: ${report.viewportsTested}`)
  lines.push(`Total issues: ${report.totalIssues}`)
  if (report.p1Count > 0) {
    lines.push(`**P1 (Critical): ${report.p1Count}** ⚠️`)
  }
  if (report.p2Count > 0) {
    lines.push(`**P2 (Medium): ${report.p2Count}** 🟡`)
  }
  lines.push('')

  // Group by viewport
  const byViewport = new Map()
  for (const issue of report.issues) {
    const key = issue.viewport
    if (!byViewport.has(key)) {
      byViewport.set(key, [])
    }
    byViewport.get(key).push(issue)
  }

  for (const [viewport, issues] of byViewport) {
    lines.push(`## ${viewport.toUpperCase()}`)
    lines.push('')

    // Group by type
    const byType = new Map()
    for (const issue of issues) {
      if (!byType.has(issue.type)) {
        byType.set(issue.type, [])
      }
      byType.get(issue.type).push(issue)
    }

    for (const [issueType, typeIssues] of byType) {
      for (const issue of typeIssues) {
        lines.push(`- **${issue.route}** [${issue.severity}] ${issueType.replace(/-/g, ' ')}`)
        lines.push(`  - ${issue.message}`)
        if (issue.count) {
          lines.push(`  - Affected items: ${issue.count}`)
        }
      }
    }
    lines.push('')
  }

  lines.push('## Recommendations')
  lines.push('')
  if (report.p1Count > 0) {
    lines.push('1. **Fix P1 issues immediately** — Horizontal overflow and inadequate touch targets on phones severely impact UX')
  }
  if (report.p2Count > 0) {
    lines.push('2. **Address P2 issues** — Small fonts and tight spacing reduce readability and usability')
  }
  if (report.totalIssues === 0) {
    lines.push('✅ All mobile responsive checks passed!')
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

function buildSlackText(report) {
  const headline = report.totalIssues === 0
    ? '✅ Mobile responsive: no issues'
    : `❌ Mobile responsive: ${report.totalIssues} issues`

  const details = [
    `Routes: ${report.routesTested}`,
    report.p1Count > 0 ? `P1: ${report.p1Count}` : null,
    report.p2Count > 0 ? `P2: ${report.p2Count}` : null,
  ].filter(Boolean)

  return [
    headline,
    `Channel: ${report.channel}`,
    details.join(' | '),
    report.totalIssues === 0 ? 'Status: Responsive' : 'Status: Review required',
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
  let testedCount = 0

  try {
    // Log in if credentials available
    if (email && password) {
      try {
        await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 })
        await page.fill('input[type="email"]', email)
        await page.fill('input[type="password"]', password)
        await page.click('button[type="submit"]')
        await page.waitForURL(`${baseUrl}/dashboard**`, { timeout: 30000 })
        console.log('Logged in for protected route testing')
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

        const issues = await validateMobileResponsiveness(page, route)
        allIssues.push(...issues)
        testedCount++
        console.log(`✓ Tested ${route}: ${issues.length} mobile issues`)
      } catch (error) {
        console.warn(`Test failed for ${route}:`, error instanceof Error ? error.message : String(error))
      }
    }
  } finally {
    await browser.close()
  }

  const p1Issues = allIssues.filter((i) => i.severity === 'P1')
  const p2Issues = allIssues.filter((i) => i.severity === 'P2')

  const report = {
    generatedAt: nowIso(),
    sesVersion: ses.version,
    sesReviewBy: ses.reviewBy,
    channel: slackChannel,
    routesTested: testedCount,
    viewportsTested: VIEWPORTS.length,
    totalIssues: allIssues.length,
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

  // Post to Slack only if P1 issues detected
  if (p1Issues.length > 0) {
    await postSlackText({
      webhookUrl: slackWebhook,
      text: buildSlackText(report),
    })
  }

  console.log(`Mobile responsive validation completed (${testedCount} routes, ${allIssues.length} issues).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
