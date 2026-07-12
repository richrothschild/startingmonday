#!/usr/bin/env node
/**
 * Experience Cognitive Load & Fluency Agent
 *
 * Deterministic per-route scoring on two dimensions:
 *  1. Cognitive Load: interactive-element count, competing CTAs, form fields, choice sets, notifications
 *  2. Fluency: reading grade of headline+lede, information scent, heading hierarchy, scannability
 *
 * Grade gates: fluency ≥ A-, load ≥ A- for dashboard; per-tier for public routes
 *
 * Cadence: weekly deterministic sweep; monthly LLM Page Experience Auditor on worst-5 + movers
 *
 * Usage:
 *   node scripts/experience-cognitive-scorer.mjs [--output-json=tmp/cognitive-scores.json] [--base-url=https://startingmonday.app]
 */
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'
import { loadSES, getTierThresholds, writeLatestReportFiles, postSlackText } from './lib/agent-report-kit.mjs'

const ROOT = process.cwd()
const argv = process.argv.slice(2)
const baseUrlArg = argv.find((a) => a.startsWith('--base-url='))
const outputJsonArg = argv.find((a) => a.startsWith('--output-json='))
const BASE_URL = (baseUrlArg?.split('=')[1] || process.env.SENTINEL_BASE_URL || 'https://startingmonday.app').replace(/\/$/, '')
const OUTPUT_JSON = outputJsonArg?.split('=')[1] || 'tmp/cognitive-scores.json'
const INVENTORY_PATH = path.join(ROOT, 'docs', 'status', 'route-inventory.latest.json')
const OUTPUT_DIR = path.join(ROOT, 'docs', 'status')

function loadInventory() {
  if (!fs.existsSync(INVENTORY_PATH)) {
    console.warn(`Route inventory not found at ${INVENTORY_PATH}`)
    return []
  }
  try {
    const data = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'))
    return (data.routes || []).filter((r) => !r.dynamic && r.authGated === false)
  } catch (err) {
    console.error(`Failed to load inventory: ${err.message}`)
    return []
  }
}

/**
 * Calculate Flesch-Kincaid reading grade level for text
 */
function calculateReadingGrade(text) {
  // Remove HTML tags and normalize
  const cleaned = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = cleaned.match(/[A-Za-z0-9']+/g) || []
  const sentences = cleaned.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const syllables = cleaned.split(/[aeiouy]+/).filter(Boolean).length

  if (words.length === 0 || sentences.length === 0) return 0

  // Flesch-Kincaid Grade Level formula
  const grade = 0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59
  return Math.max(0, Math.round(grade * 10) / 10)
}

/**
 * Score cognitive load dimension (0-100, higher = worse/more load)
 */
async function scoreCognitiveLoad(page) {
  const metrics = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button:not([aria-hidden="true"])')
    const links = document.querySelectorAll('a[href]:not([aria-hidden="true"])')
    const inputs = document.querySelectorAll('input, textarea, select')
    const notifications = document.querySelectorAll('[role="alert"], [aria-live]')
    const badges = document.querySelectorAll('[class*="badge"], [class*="label"]')

    // Count competing CTAs (buttons + links that look like CTAs)
    const ctas = Array.from(buttons).filter((b) => {
      const text = b.textContent.toLowerCase()
      return /(sign up|start|try|get|explore|learn|view|click|buy|subscribe)/i.test(text)
    }).length

    // Estimate choice sets (select dropdowns, radio groups, checkbox groups)
    const selects = document.querySelectorAll('select').length
    const radioGroups = new Set(Array.from(document.querySelectorAll('input[type="radio"]')).map((r) => r.name)).size
    const checkboxGroups = new Set(Array.from(document.querySelectorAll('input[type="checkbox"]')).map((c) => c.name)).size

    const totalInteractiveElements = buttons.length + links.length + inputs.length
    const totalNotifications = notifications.length + badges.length

    return {
      buttonCount: buttons.length,
      linkCount: links.length,
      ctaCount: ctas,
      inputCount: inputs.length,
      notificationBadgeCount: totalNotifications,
      choiceSetCount: selects + radioGroups + checkboxGroups,
      totalInteractiveElements,
    }
  })

  // Score load: penalize high element counts and competing CTAs
  let score = 0
  score += Math.max(0, (metrics.totalInteractiveElements - 10) * 2) // Base penalty for too many interactive elements
  score += metrics.ctaCount * 8 // Competing CTAs are high-penalty
  score += metrics.choiceSetCount * 10 // Form fields increase load
  score += metrics.notificationBadgeCount * 12 // Notifications compete for attention

  // Cap at 100
  score = Math.min(100, score)

  return { score, metrics }
}

/**
 * Score fluency dimension (0-100, higher = better/more fluent)
 * Focuses on: readability, information scent, heading hierarchy, scannability
 */
async function scoreFlluency(page) {
  const content = await page.evaluate(() => {
    // Get headline (h1 or main heading)
    const h1 = document.querySelector('h1')
    const headline = h1?.textContent || ''

    // Get lede (first paragraph after headline or in main landmark)
    const main = document.querySelector('main')
    const firstPara = main?.querySelector('p') || document.querySelector('p')
    const lede = firstPara?.textContent || ''

    // Analyze heading hierarchy
    const h2s = document.querySelectorAll('h2')
    const h3s = document.querySelectorAll('h3')
    const h4Plus = document.querySelectorAll('h4, h5, h6')

    // Get all links and their context
    const links = Array.from(document.querySelectorAll('a[href]')).map((a) => ({
      label: a.textContent.trim().slice(0, 100),
      href: a.href,
      context: a.closest('p')?.textContent || a.parentElement?.textContent || '',
    }))

    // Estimate scannability: shorter chunks are more scannable
    const paragraphs = document.querySelectorAll('p')
    const avgParagraphLength = Array.from(paragraphs).reduce((sum, p) => sum + p.textContent.length, 0) / (paragraphs.length || 1)

    return {
      headline,
      lede,
      headingCount: { h2: h2s.length, h3: h3s.length, h4Plus: h4Plus.length },
      paragraphCount: paragraphs.length,
      avgParagraphLength,
      links,
    }
  })

  // Calculate reading grades
  const headlineGrade = calculateReadingGrade(content.headline)
  const ledeGrade = calculateReadingGrade(content.lede)

  // Analyze information scent (how well do link labels match their destinations?)
  let scent = 0
  if (content.links.length > 0) {
    const meaningfulLinks = content.links.filter((l) => l.label.length > 3 && !/(click here|more|read|learn|view)/i.test(l.label))
    scent = meaningfulLinks.length / content.links.length
  }

  // Analyze hierarchy quality
  const hierarchyScore = content.headingCount.h2 > 0 ? 1 : 0.5
  const hierarchyBreaks = content.headingCount.h4Plus > content.headingCount.h2 ? -20 : 0

  // Scannability: penalize long paragraphs
  let scannabilityScore = 100
  if (content.avgParagraphLength > 500) scannabilityScore -= 20
  if (content.avgParagraphLength > 800) scannabilityScore -= 20
  if (content.avgParagraphLength > 1200) scannabilityScore -= 20

  // Overall fluency score (higher is better)
  let score = 100
  score -= Math.max(0, headlineGrade - 8) * 5 // Headline should be simple
  score -= Math.max(0, ledeGrade - 10) * 3 // Lede can be slightly denser
  score -= (1 - scent) * 20 // Penalize poor information scent
  score -= (1 - hierarchyScore) * 15 // Penalize weak hierarchy
  score += hierarchyBreaks
  score -= Math.max(0, 100 - scannabilityScore)

  score = Math.max(0, Math.min(100, score))

  return {
    score,
    metrics: {
      headlineGrade,
      ledeGrade,
      informationScent: (scent * 100).toFixed(0),
      hierarchyScore: (hierarchyScore * 100).toFixed(0),
      scannabilityScore,
      headingCount: content.headingCount,
    },
  }
}

/**
 * Convert 0-100 score to letter grade A-F
 * Load: higher score is worse (inverted)
 * Fluency: higher score is better
 */
function scoreToGrade(score, isLoad = false) {
  if (isLoad) {
    // For load, invert: 0-20=A, 21-35=B, etc.
    if (score <= 20) return 'A'
    if (score <= 35) return 'B'
    if (score <= 50) return 'C'
    if (score <= 65) return 'D'
    return 'F'
  } else {
    // For fluency: 80-100=A, 70-79=B, etc.
    if (score >= 80) return 'A'
    if (score >= 70) return 'B'
    if (score >= 60) return 'C'
    if (score >= 50) return 'D'
    return 'F'
  }
}

/**
 * Score a single route
 */
async function scoreRoute(route, baseUrl) {
  let browser
  try {
    browser = await chromium.launch()
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    page.setDefaultTimeout(10000)
    page.setDefaultNavigationTimeout(10000)

    const url = `${baseUrl}${route}`
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForLoadState('networkidle')

    const loadResult = await scoreCognitiveLoad(page)
    const fluencyResult = await scoreFlluency(page)

    await page.close()
    await context.close()

    return {
      available: true,
      load: {
        score: loadResult.score,
        grade: scoreToGrade(loadResult.score, true),
        metrics: loadResult.metrics,
      },
      fluency: {
        score: fluencyResult.score,
        grade: scoreToGrade(fluencyResult.score, false),
        metrics: fluencyResult.metrics,
      },
    }
  } catch (err) {
    if (browser) await browser.close()
    return { available: false, error: err.message }
  }
}

async function main() {
  const inventory = loadInventory()
  console.log(`Loaded inventory: ${inventory.length} static routes`)

  const scores = []
  const routesByTier = new Map()

  // Score all routes with sampling to avoid timeout
  const sampleRoutes = inventory.slice(0, 15)
  console.log(`Scoring ${sampleRoutes.length} sample routes...`)

  for (const route of sampleRoutes) {
    process.stdout.write(`  ${route.route}...`)
    const score = await scoreRoute(route.route, BASE_URL)

    if (score.available) {
      scores.push({ route: route.route, tier: route.tier, ...score })

      if (!routesByTier.has(route.tier)) {
        routesByTier.set(route.tier, [])
      }
      routesByTier.get(route.tier).push({ route: route.route, ...score })

      console.log(` [${score.load.grade}/${score.fluency.grade}]`)
    } else {
      console.log(` ERROR: ${score.error}`)
    }
  }

  // Analyze results
  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    routesScored: scores.length,
    routesAnalyzed: inventory.length,
    scoringRate: inventory.length > 0 ? ((scores.length / inventory.length) * 100).toFixed(1) : 0,
  }

  // Grade distribution
  const loadGrades = {}
  const fluencyGrades = {}
  for (const score of scores) {
    loadGrades[score.load.grade] = (loadGrades[score.load.grade] || 0) + 1
    fluencyGrades[score.fluency.grade] = (fluencyGrades[score.fluency.grade] || 0) + 1
  }

  summary.gradeDistribution = {
    load: loadGrades,
    fluency: fluencyGrades,
  }

  // Identify worst scorers for audit
  summary.worstLoad = scores.sort((a, b) => b.load.score - a.load.score).slice(0, 5).map((s) => ({ route: s.route, grade: s.load.grade, score: s.load.score }))
  summary.worstFluency = scores.sort((a, b) => a.fluency.score - b.fluency.score).slice(0, 5).map((s) => ({ route: s.route, grade: s.fluency.grade, score: s.fluency.score }))

  // Dashboard-specific checks (must be A- or better)
  const dashboardRoutes = scores.filter((s) => s.tier === 'dashboard')
  summary.dashboardCompliance = {
    routes: dashboardRoutes.length,
    fluencyA_minus_or_better: dashboardRoutes.filter((s) => s.fluency.grade >= 'A' || (s.fluency.grade === 'A' && s.fluency.score >= 90)).length,
    loadA_minus_or_better: dashboardRoutes.filter((s) => s.load.grade === 'A').length,
  }

  const report = {
    generatedAt: summary.generatedAt,
    summary,
    scores,
  }

  fs.mkdirSync(path.dirname(path.join(ROOT, OUTPUT_JSON)), { recursive: true })
  fs.writeFileSync(path.join(ROOT, OUTPUT_JSON), JSON.stringify(report, null, 2))

  console.log('\nCognitive Load & Fluency Agent')
  console.log(`- routes scored: ${summary.routesScored}/${summary.routesAnalyzed}`)
  console.log(`- load grades: ${JSON.stringify(summary.gradeDistribution.load)}`)
  console.log(`- fluency grades: ${JSON.stringify(summary.gradeDistribution.fluency)}`)
  console.log(`- worst load: ${summary.worstLoad.map((s) => `${s.route}[${s.grade}]`).join(', ')}`)
  console.log(`- worst fluency: ${summary.worstFluency.map((s) => `${s.route}[${s.grade}]`).join(', ')}`)
  console.log(`- dashboard compliance: fluency A- or better=${summary.dashboardCompliance.fluencyA_minus_or_better}/${summary.dashboardCompliance.routes}, load A=${summary.dashboardCompliance.loadA_minus_or_better}/${summary.dashboardCompliance.routes}`)

  return report
}

const report = await main()
