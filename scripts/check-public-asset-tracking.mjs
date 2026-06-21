#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const sourceDirs = ['src']
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mdx'])
const publicAssetRefRegex = /["'`]\/(?!\/)([^"'`?#]+\.(?:png|jpe?g|webp|gif|svg|ico|avif))(?:\?[^"'`]*)?(?:#[^"'`]*)?["'`]/gi

/** @type {Set<string>} */
const referencedAssetPaths = new Set()
/** @type {string[]} */
const missingAssets = []
/** @type {string[]} */
const untrackedAssets = []

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

  if (!isTracked(relativePublicPath)) {
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
  console.log('Public asset tracking guard: pass')
}
