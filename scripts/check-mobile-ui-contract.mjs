#!/usr/bin/env node
import fs from 'fs'

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function assertContains(haystack, needle, message) {
  if (!haystack.includes(needle)) {
    throw new Error(message)
  }
}

const dashboardPath = 'src/app/(dashboard)/dashboard/page.tsx'
const cssPath = 'src/app/globals.css'
const navPath = 'src/components/BottomNav.tsx'

const dashboard = read(dashboardPath)
const css = read(cssPath)
const bottomNav = read(navPath)

// Jump chip layout contract: balanced two-column mobile, four-column desktop.
assertContains(
  dashboard,
  'grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]',
  'Mobile jump chip layout contract missing: expected 2-column mobile and 4-column desktop grid',
)

// Outreach gating contract: only owner/admin can see outreach hub entry points.
assertContains(
  dashboard,
  "const canUseOutreachHub = staffMember?.role === 'owner' || staffMember?.role === 'admin'",
  'Outreach visibility contract missing: expected owner/admin role gate',
)

// Bottom spacer contract: keep post-content blank area constrained.
assertContains(
  css,
  'padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));',
  'Bottom spacer contract missing: expected reduced nav-content-spacer padding',
)

// Bottom nav tap target contract.
assertContains(
  bottomNav,
  'min-h-[56px]',
  'Bottom nav contract missing: expected 56px mobile tab minimum height',
)

console.log('mobile-ui contract checks passed')
