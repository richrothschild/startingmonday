#!/usr/bin/env node
import { execSync } from 'node:child_process'

function getDirtyEntries() {
  const output = execSync('git status --porcelain=v1 --untracked-files=all', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  return output
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => ({
      status: line.slice(0, 2),
      path: line.slice(3),
    }))
}

function main() {
  const dirtyEntries = getDirtyEntries()

  if (dirtyEntries.length === 0) {
    console.log('Push clean-worktree guard: pass')
    return
  }

  console.error('Push clean-worktree guard: fail')
  console.error(`Found ${dirtyEntries.length} local changes outside git history.`)
  console.error('Commit, stash, or intentionally discard them before pushing so production matches your workspace.')

  const preview = dirtyEntries.slice(0, 100)
  for (const entry of preview) {
    console.error(`- ${entry.status} ${entry.path}`)
  }
  if (dirtyEntries.length > preview.length) {
    console.error(`...and ${dirtyEntries.length - preview.length} more`)
  }

  process.exit(1)
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}