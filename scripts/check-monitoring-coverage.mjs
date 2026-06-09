#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const matrixPath = path.join(root, 'docs', 'status', 'monitoring-coverage-matrix.latest.json')
const strict = process.argv.includes('--strict')
const json = process.argv.includes('--json')

if (!fs.existsSync(matrixPath)) {
  console.error('Missing monitoring matrix. Run: npm run monitor:matrix:generate')
  process.exit(1)
}

const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'))

const tier0RouteUncovered = matrix.routes.filter((r) => r.tier === 'tier0' && !r.covered)
const tier0ActionUncovered = matrix.actions.filter((a) => a.tier === 'tier0' && !a.covered)
const tier1RouteCoverage = matrix.summary.routesByTier.tier1?.coveragePct ?? 100
const tier1ActionCoverage = matrix.summary.actionsByTier.tier1?.coveragePct ?? 100

const result = {
  generatedAt: matrix.generatedAt,
  ok: true,
  strict,
  thresholds: {
    tier0RoutesUncoveredMax: 0,
    tier0ActionsUncoveredMax: 0,
    tier1RouteCoverageMin: strict ? 75 : 50,
    tier1ActionCoverageMin: strict ? 60 : 35,
  },
  summary: matrix.summary,
  violations: [],
}

if (tier0RouteUncovered.length > 0) {
  result.ok = false
  result.violations.push({
    id: 'tier0-routes-uncovered',
    message: `${tier0RouteUncovered.length} tier0 routes uncovered`,
    routes: tier0RouteUncovered.map((r) => r.route),
  })
}

if (tier0ActionUncovered.length > 0) {
  result.ok = false
  result.violations.push({
    id: 'tier0-actions-uncovered',
    message: `${tier0ActionUncovered.length} tier0 actions uncovered`,
    actions: tier0ActionUncovered.map((a) => `${a.path} [${a.methods.join(',')}]`),
  })
}

if (tier1RouteCoverage < result.thresholds.tier1RouteCoverageMin) {
  result.ok = false
  result.violations.push({
    id: 'tier1-route-coverage-low',
    message: `tier1 route coverage ${tier1RouteCoverage}% is below ${result.thresholds.tier1RouteCoverageMin}%`,
  })
}

if (tier1ActionCoverage < result.thresholds.tier1ActionCoverageMin) {
  result.ok = false
  result.violations.push({
    id: 'tier1-action-coverage-low',
    message: `tier1 action coverage ${tier1ActionCoverage}% is below ${result.thresholds.tier1ActionCoverageMin}%`,
  })
}

if (json) {
  console.log(JSON.stringify(result, null, 2))
} else {
  console.log(`Monitoring coverage check: ${result.ok ? 'PASS' : 'FAIL'}`)
  console.log(`Routes coverage: ${matrix.summary.routes.covered}/${matrix.summary.routes.total} (${matrix.summary.routes.coveragePct}%)`)
  console.log(`Actions coverage: ${matrix.summary.actions.covered}/${matrix.summary.actions.total} (${matrix.summary.actions.coveragePct}%)`)
  if (result.violations.length) {
    for (const violation of result.violations) {
      console.log(`- ${violation.message}`)
    }
  }
}

if (!result.ok) process.exit(1)
