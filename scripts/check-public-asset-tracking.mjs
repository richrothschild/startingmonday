#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const isRailwayBuild = Boolean(process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_ID)
const sourceDirs = ['src']
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx'])
const publicAssetRefRegex = /["'`]\/(?!\/)([^"'`?#]+\.(?:png|jpe?g|webp|gif|svg|ico|avif))(?:\?[^"'`]*)?(?:#[^"'`]*)?["'`]/gi

/** @type {Set<string>} */
const referencedAssetPaths = new Set()
/** @type {string[]} */
const missingAssets = []
/** @type {string[]} */
const untrackedAssets = []

function hasGitIndex() {
  const result = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
    cwd: root,
    stdio: 'ignore',
  })
  return result.status === 0
}

function toPosix(relativePath) {
  return relativePath.replace(/\\/g, '/')
}

function walk(dir) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }

    if (!sourceExtensions.has(path.extname(entry.name))) continue

    const raw = fs.readFileSync(fullPath, 'utf8')
    let match = publicAssetRefRegex.exec(raw)
    while (match) {
      referencedAssetPaths.add(match[1])
      match = publicAssetRefRegex.exec(raw)
    }
    publicAssetRefRegex.lastIndex = 0
  }
}

function isTracked(relativePath) {
  const result = spawnSync('git', ['ls-files', '--error-unmatch', '--', relativePath], {
    cwd: root,
    stdio: 'ignore',
  })
  return result.status === 0
}

const canVerifyGitTracking = hasGitIndex()

for (const dir of sourceDirs) {
  walk(path.join(root, dir))
}

for (const assetPath of [...referencedAssetPaths].sort()) {
  const relativePublicPath = toPosix(path.join('public', assetPath))
  const fullPublicPath = path.join(root, relativePublicPath)

  if (!fs.existsSync(fullPublicPath)) {
    missingAssets.push(relativePublicPath)
    continue
  }

  if (canVerifyGitTracking && !isTracked(relativePublicPath)) {
    untrackedAssets.push(relativePublicPath)
  }
}

if (missingAssets.length > 0 || untrackedAssets.length > 0) {
  console.error('Public asset tracking guard failed.')

  if (missingAssets.length > 0) {
    console.error('Referenced assets missing on disk:')
    for (const file of missingAssets) {
      console.error(` - ${file}`)
    }
  }

  if (untrackedAssets.length > 0) {
    console.error('Referenced assets exist locally but are not committed:')
    for (const file of untrackedAssets) {
      console.error(` - ${file}`)
    }
  }

  console.error('Fix: add the files to git (and update .gitignore exceptions if needed).')
  process.exitCode = 1
} else {
  if (!canVerifyGitTracking && isRailwayBuild) {
    console.log('Public asset tracking guard: git index unavailable on Railway build, ran existence-only checks.')
  }
  console.log('Public asset tracking guard: pass')
}
