#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const APP_DIR = path.join(process.cwd(), 'src', 'app')

const EXCLUDED_PREFIXES = [
  '/api',
  '/dashboard',
  '/settings',
  '/team',
  '/onboarding',
]

const EXCLUDED_EXACT = new Set([
  '/auth/callback',
  '/guide',
])

function toRouteFromSegments(segments) {
  const urlSegments = []
  for (const segment of segments) {
    if (!segment) continue
    if (segment.startsWith('(') && segment.endsWith(')')) continue
    if (segment.startsWith('[') && segment.endsWith(']')) return null
    urlSegments.push(segment)
  }

  if (urlSegments.length === 0) return '/'
  return `/${urlSegments.join('/')}`
}

function isPublicRoute(route) {
  if (!route) return false
  if (EXCLUDED_EXACT.has(route)) return false
  if (EXCLUDED_PREFIXES.some((prefix) => route === prefix || route.startsWith(`${prefix}/`))) return false
  return true
}

function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(fullPath, acc)
      continue
    }

    if (!(entry.name === 'page.tsx' || entry.name === 'page.ts')) continue

    const relDir = path.relative(APP_DIR, path.dirname(fullPath))
    const segments = relDir === '' ? [] : relDir.split(path.sep)
    const route = toRouteFromSegments(segments)

    if (isPublicRoute(route)) {
      acc.add(route)
    }
  }
}

export function discoverPublicMobileRoutes() {
  const routes = new Set()
  if (!fs.existsSync(APP_DIR)) return []

  walk(APP_DIR, routes)

  // Ensure core auth and legal pages remain covered.
  routes.add('/login')
  routes.add('/signup')
  routes.add('/privacy')
  routes.add('/terms')

  return [...routes].sort((a, b) => a.localeCompare(b))
}

if (process.argv.includes('--print')) {
  console.log(JSON.stringify(discoverPublicMobileRoutes(), null, 2))
}
