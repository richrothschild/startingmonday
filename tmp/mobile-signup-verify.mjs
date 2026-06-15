/**
 * Mobile signup + onboarding UX verification
 * Runs against staging. Captures screenshots at each step.
 * Usage: doppler run -- node tmp/mobile-signup-verify.mjs
 */
import { chromium, webkit } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE_URL = process.env.BASE_URL || 'https://starting-monday-staging.up.railway.app'
const SCREENSHOT_DIR = path.join(process.cwd(), 'tmp', 'mobile-screenshots')
const MOBILE_VIEWPORT = { width: 390, height: 844 }  // iPhone 12/13/14
const USE_WEBKIT = process.env.BROWSER === 'webkit'

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

const EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL
const PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD

async function snap(page, name) {
  const file = path.join(SCREENSHOT_DIR, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  console.log(`  📸 ${name}.png`)
  return file
}

async function checkOverflow(page, label) {
  const result = await page.evaluate(() => {
    const root = document.documentElement
    const horizontalOverflow = root.scrollWidth > window.innerWidth + 2
    const overflowingEls = []
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.right > window.innerWidth + 2 && rect.width > 0) {
        overflowingEls.push({
          tag: el.tagName,
          class: el.className?.toString?.().slice(0, 60),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        })
      }
    })
    return { horizontalOverflow, overflowingEls: overflowingEls.slice(0, 5) }
  })
  if (result.horizontalOverflow) {
    console.log(`  ⚠️  HORIZONTAL OVERFLOW on ${label}:`, JSON.stringify(result.overflowingEls, null, 2))
  } else {
    console.log(`  ✅ No horizontal overflow on ${label}`)
  }
  return result
}

async function checkTapTargets(page, label) {
  const small = await page.evaluate(() => {
    const MIN = 44 // Apple HIG minimum tap target
    const issues = []
    document.querySelectorAll('button, a, input, select, textarea, [role="button"]').forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0 && (rect.height < MIN || rect.width < MIN)) {
        issues.push({
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 40),
          h: Math.round(rect.height),
          w: Math.round(rect.width),
        })
      }
    })
    return issues.slice(0, 10)
  })
  if (small.length) {
    console.log(`  ⚠️  Small tap targets on ${label}:`, JSON.stringify(small, null, 2))
  } else {
    console.log(`  ✅ Tap targets look ok on ${label}`)
  }
  return small
}

async function checkFontSizes(page, label) {
  const tiny = await page.evaluate(() => {
    const issues = []
    document.querySelectorAll('p, span, label, li, td, th, div').forEach(el => {
      if (!el.children.length || el.tagName === 'LABEL') {
        const text = el.textContent?.trim()
        if (!text) return
        const size = parseFloat(window.getComputedStyle(el).fontSize)
        if (size < 13) {
          issues.push({
            tag: el.tagName,
            text: text.slice(0, 50),
            size,
          })
        }
      }
    })
    return issues.slice(0, 10)
  })
  if (tiny.length) {
    console.log(`  ⚠️  Text below 13px on ${label}:`, JSON.stringify(tiny, null, 2))
  } else {
    console.log(`  ✅ Font sizes ok on ${label}`)
  }
  return tiny
}

const findings = []
function finding(severity, page_name, issue, recommendation) {
  findings.push({ severity, page_name, issue, recommendation })
  console.log(`  ${severity === 'high' ? '🔴' : '🟡'} [${page_name}] ${issue}`)
}

;(async () => {
  const engine = USE_WEBKIT ? webkit : chromium
  console.log(`\nBrowser engine: ${USE_WEBKIT ? 'WebKit (Safari)' : 'Chromium'}`)
  const browser = await engine.launch()
  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  })
  const page = await context.newPage()

  // ── 1. SIGNUP PAGE ──────────────────────────────────────────────
  console.log('\n── 1. Signup page ──')
  await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await snap(page, '01-signup-initial')

  const overflowSignup = await checkOverflow(page, 'signup')
  if (overflowSignup.horizontalOverflow) finding('high', 'signup', 'Horizontal overflow detected', 'Find and constrain the overflowing element with max-w-full or overflow-hidden')

  const tapSignup = await checkTapTargets(page, 'signup')
  tapSignup.forEach(t => finding('high', 'signup', `Tap target too small: ${t.tag} "${t.text}" (${t.h}×${t.w}px)`, 'Ensure minimum 44×44px touch targets per Apple HIG'))

  const fontsSignup = await checkFontSizes(page, 'signup')
  fontsSignup.forEach(f => finding('high', 'signup', `Text too small: "${f.text}" at ${f.size}px`, 'Minimum 13px for body text, 16px for form inputs to avoid iOS auto-zoom'))

  // Check if email input triggers iOS zoom (font-size < 16px)
  const inputFontSize = await page.evaluate(() => {
    const input = document.querySelector('input[type="email"], input[name="email"]')
    if (!input) return null
    return parseFloat(window.getComputedStyle(input).fontSize)
  })
  if (inputFontSize && inputFontSize < 16) {
    finding('high', 'signup', `Email input font-size is ${inputFontSize}px — iOS will auto-zoom the page on focus`, 'Set font-size: 16px on all inputs to prevent iOS viewport zoom')
  } else {
    console.log(`  ✅ Email input font-size: ${inputFontSize}px (no iOS zoom risk)`)
  }

  // Scroll to bottom and screenshot
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(300)
  await snap(page, '02-signup-scrolled-bottom')
  await page.evaluate(() => window.scrollTo(0, 0))

  // Check CTA button is visible without scrolling on initial load
  const ctaVisible = await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"], button.cta, button')
    if (!btn) return { found: false }
    const rect = btn.getBoundingClientRect()
    return { found: true, text: btn.textContent?.trim().slice(0, 40), inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight }
  })
  if (!ctaVisible.inViewport) {
    finding('high', 'signup', 'Primary CTA button not visible on initial mobile load without scrolling', 'Reorder page so the primary action is above the fold on mobile')
  } else {
    console.log(`  ✅ CTA "${ctaVisible.text}" visible above fold`)
  }

  // ── 2. FILL SIGNUP FORM ─────────────────────────────────────────
  console.log('\n── 2. Signup form interaction ──')
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first()
  if (await emailInput.count()) {
    await emailInput.tap()
    await page.waitForTimeout(400)
    await snap(page, '03-signup-email-focused')

    // Check if keyboard pushes content up correctly (viewport shifts)
    const viewportAfterFocus = await page.evaluate(() => ({
      scrollY: window.scrollY,
      visibleHeight: window.visualViewport?.height ?? window.innerHeight,
    }))
    console.log(`  📊 After email focus: scrollY=${viewportAfterFocus.scrollY}, visibleHeight=${viewportAfterFocus.visibleHeight}`)

    await emailInput.fill('test-mobile@example.com')
    await page.waitForTimeout(200)
    await snap(page, '04-signup-form-filled')
  } else {
    console.log('  ⚠️  Could not find email input')
    finding('high', 'signup', 'Email input not found by standard selectors', 'Check input has type=email or name=email')
  }

  // ── 3. LOGIN PAGE ───────────────────────────────────────────────
  console.log('\n── 3. Login page ──')
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await snap(page, '05-login-initial')

  await checkOverflow(page, 'login')
  const tapLogin = await checkTapTargets(page, 'login')
  tapLogin.forEach(t => finding('medium', 'login', `Tap target too small: ${t.tag} "${t.text}" (${t.h}×${t.w}px)`, 'Minimum 44×44px'))

  // Check all inputs for iOS zoom risk
  const loginInputSizes = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(i => ({
      type: i.type,
      placeholder: i.placeholder,
      fontSize: parseFloat(window.getComputedStyle(i).fontSize),
    }))
  })
  loginInputSizes.forEach(i => {
    if (i.fontSize < 16) finding('high', 'login', `Input [${i.type}] "${i.placeholder}" font-size ${i.fontSize}px — triggers iOS auto-zoom`, 'Set font-size: 16px on all form inputs')
  })

  // ── 4. ONBOARDING (authenticated) ──────────────────────────────
  if (EMAIL && PASSWORD) {
    console.log('\n── 4. Login and test onboarding ──')
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })

    const emailField = page.locator('input[type="email"]').first()
    const passwordField = page.locator('input[type="password"]').first()
    const submitBtn = page.locator('button[type="submit"]').first()

    if (await emailField.count() && await passwordField.count()) {
      await emailField.fill(EMAIL)
      await passwordField.fill(PASSWORD)
      await submitBtn.tap()
      await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 }).catch(() => {})
      await page.waitForTimeout(1000)
      await snap(page, '06-post-login')

      const currentUrl = page.url()
      console.log(`  📍 After login: ${currentUrl}`)

      if (currentUrl.includes('/onboarding')) {
        console.log('  → On onboarding flow')
        await checkOverflow(page, 'onboarding-start')
        await checkTapTargets(page, 'onboarding-start')
        await snap(page, '07-onboarding-step1')

        // Scroll through the page
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(300)
        await snap(page, '08-onboarding-step1-bottom')
      } else if (currentUrl.includes('/dashboard')) {
        console.log('  → User already onboarded, checking dashboard mobile layout')
        await checkOverflow(page, 'dashboard')
        const tapDash = await checkTapTargets(page, 'dashboard')
        tapDash.forEach(t => finding('medium', 'dashboard', `Tap target too small: ${t.tag} "${t.text}" (${t.h}×${t.w}px)`, 'Minimum 44×44px'))
        await snap(page, '07-dashboard-mobile')
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await snap(page, '08-dashboard-mobile-bottom')

        // Navigate to onboarding manually to check that flow
        await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'networkidle' }).catch(() => {})
        await page.waitForTimeout(800)
        const onboardUrl = page.url()
        if (onboardUrl.includes('/onboarding')) {
          await snap(page, '09-onboarding-direct')
          await checkOverflow(page, 'onboarding')
          const tapOnboard = await checkTapTargets(page, 'onboarding')
          tapOnboard.forEach(t => finding('medium', 'onboarding', `Tap target too small: ${t.tag} "${t.text}" (${t.h}×${t.w}px)`, 'Minimum 44×44px'))
          await checkFontSizes(page, 'onboarding')
        } else {
          console.log(`  ℹ️  /onboarding redirected to ${onboardUrl} (user already completed onboarding)`)
        }
      }
    } else {
      console.log('  ⚠️  Could not find login form inputs')
    }
  } else {
    console.log('\n── 4. Skipping authenticated flows (no PLAYWRIGHT_TEST_EMAIL in env) ──')
  }

  await browser.close()

  // ── REPORT ──────────────────────────────────────────────────────
  console.log('\n\n══════════════════════════════════════════')
  console.log('FINDINGS SUMMARY')
  console.log('══════════════════════════════════════════')
  if (findings.length === 0) {
    console.log('✅ No issues found')
  } else {
    const high = findings.filter(f => f.severity === 'high')
    const medium = findings.filter(f => f.severity === 'medium')
    console.log(`\n🔴 HIGH (${high.length})`)
    high.forEach((f, i) => {
      console.log(`  ${i + 1}. [${f.page_name}] ${f.issue}`)
      console.log(`     Fix: ${f.recommendation}`)
    })
    console.log(`\n🟡 MEDIUM (${medium.length})`)
    medium.forEach((f, i) => {
      console.log(`  ${i + 1}. [${f.page_name}] ${f.issue}`)
      console.log(`     Fix: ${f.recommendation}`)
    })
  }
  console.log(`\nScreenshots saved to: tmp/mobile-screenshots/`)
})()
