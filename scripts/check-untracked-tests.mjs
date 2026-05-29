#!/usr/bin/env node
import { execSync } from 'node:child_process'

function getUntrackedFiles() {
  const output = execSync('git ls-files --others --exclude-standard', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function isTestFile(filePath) {
  return /(\.test\.|\.spec\.)/.test(filePath)
}

function main() {
  const untracked = getUntrackedFiles()
  const untrackedTests = untracked.filter(isTestFile)

  if (untrackedTests.length === 0) {
    console.log('Untracked test guard: pass')
    return
  }

  console.error('Untracked test guard: fail')
  console.error(`Found ${untrackedTests.length} untracked test/spec files.`)
  console.error('Commit or intentionally remove them before continuing.')

  const preview = untrackedTests.slice(0, 50)
  for (const file of preview) {
    console.error(`- ${file}`)
  }
  if (untrackedTests.length > preview.length) {
    console.error(`...and ${untrackedTests.length - preview.length} more`)
  }

  process.exit(1)
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
