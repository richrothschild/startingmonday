#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const matrixPath = path.join(root, 'docs', 'status', 'monitoring-coverage-matrix.latest.json')
const outDir = path.join(root, 'tests', 'e2e', 'generated')
const routeSpecPath = path.join(outDir, 'page-routes.generated.spec.ts')
const actionSpecPath = path.join(outDir, 'action-contracts.generated.spec.ts')

if (!fs.existsSync(matrixPath)) {
  console.error('Missing monitoring matrix. Run: npm run monitor:matrix:generate')
  process.exit(1)
}

const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'))

const routeTargets = matrix.routes
  .filter((r) => r.tier === 'tier0' || r.tier === 'tier1')
  .map((r) => ({
    route: r.route,
    authClass: r.authClass,
    hasDynamicSegment: r.hasDynamicSegment,
    concreteExample: r.concreteExample,
    tier: r.tier,
  }))

const actionTargets = matrix.actions
  .filter((a) => a.tier === 'tier0' || a.tier === 'tier1')
  .filter((a) => a.methods.includes('GET') || a.methods.includes('POST'))
  .map((a) => ({
    path: a.path,
    methods: a.methods,
    tier: a.tier,
    hasDynamicSegment: a.hasDynamicSegment,
  }))

const routeSpec = [
  "import { test, expect, type Page } from '@playwright/test'",
  "import { attachJourneyGuards } from '../monitoring.helpers'",
  '',
  `const routeTargets = ${JSON.stringify(routeTargets, null, 2)} as const`,
  '',
  'async function ensureAuthSession(page: Page) {',
  "  await page.goto('/dashboard')",
  "  return !/\\/login(?:$|[/?#])/.test(page.url())",
  '}',
  '',
  'for (const target of routeTargets) {',
  "  test(`generated route coverage: ${target.route}`, async ({ page }) => {",
  "    if (target.authClass === 'authenticated') {",
  '      const ok = await ensureAuthSession(page)',
  "      test.skip(!ok, 'Auth session unavailable for authenticated route coverage')",
  '    }',
  '',
  '    if (target.hasDynamicSegment && !target.concreteExample) {',
  "      test.skip(true, 'No concrete route example configured for dynamic segment route')",
  '    }',
  '',
  "    if (target.hasDynamicSegment && target.concreteExample && target.concreteExample.includes('example-')) {",
  "      test.skip(true, 'Placeholder example route configured; provide real fixture id for dynamic route coverage')",
  '    }',
  '',
  '    const path = (target.hasDynamicSegment && target.concreteExample) ? target.concreteExample : target.route',
  '    const guards = await attachJourneyGuards(page)',
  "    const res = await page.goto(path, { waitUntil: 'domcontentloaded' })",
  '',
  "    expect(res?.status(), 'Route response should not be 404').not.toBe(404)",
  "    await expect(page.locator('body')).toBeVisible()",
  "    await expect(page.locator('body')).not.toContainText(/404|not found/i)",
  "    expect(guards.pageErrors, `Page errors: ${guards.pageErrors.join(' | ')}`).toHaveLength(0)",
  "    expect(guards.consoleErrors, `Console errors: ${guards.consoleErrors.join(' | ')}`).toHaveLength(0)",
  "    const bodyText = (await page.locator('body').innerText().catch(() => '')).trim()",
  '    if (bodyText.length === 0) {',
  "      await expect(page.locator('.animate-pulse, [aria-busy=\"true\"], [data-testid=\"loading\"]').first()).toBeVisible()",
  '    }',
  '  })',
  '}',
  '',
].join('\n')

const actionSpec = [
  "import { test, expect } from '@playwright/test'",
  '',
  `const actionTargets = ${JSON.stringify(actionTargets, null, 2)} as const`,
  '',
  'const ACCEPTABLE_STATUS = new Set([200, 201, 202, 204, 400, 401, 403, 405, 422, 429])',
  '',
  'for (const target of actionTargets) {',
  "  test(`generated action contract: ${target.path}`, async ({ request }) => {",
  '    if (target.hasDynamicSegment) {',
  "      test.skip(true, 'Dynamic action path requires fixture id mapping')",
  '    }',
  '',
  '    const methods = [...target.methods] as string[]',
  "    const method = methods.includes('GET') ? 'GET' : (methods.includes('POST') ? 'POST' : methods[0])",
  '',
  "    const res = method === 'GET'",
  "      ? await request.get(target.path, { failOnStatusCode: false })",
  "      : await request.post(target.path, { data: {}, failOnStatusCode: false })",
  '',
  "    const msg = 'Unexpected status ' + res.status() + ' for ' + target.path + ' [' + method + ']'",
  '    expect(ACCEPTABLE_STATUS.has(res.status()), msg).toBe(true)',
  '  })',
  '}',
  '',
].join('\n')

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(routeSpecPath, routeSpec)
fs.writeFileSync(actionSpecPath, actionSpec)

console.log(`Wrote ${path.relative(root, routeSpecPath)}`)
console.log(`Wrote ${path.relative(root, actionSpecPath)}`)
