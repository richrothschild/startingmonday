
import { execSync } from 'node:child_process'

// Only run outreach lint if any docs/outreach/*.csv file is staged
function stagedOutreachCsvs() {
  try {
    const out = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    return out
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean)
      .filter(f => /^docs\/outreach\/.*\.csv$/i.test(f))
      .filter(f => !/outplacement_priority_additions\.csv$/i.test(f))
  } catch (e) {
    return []
  }
}

const stagedCsvs = stagedOutreachCsvs()

if (stagedCsvs.length === 0) {
  console.log('No staged outreach CSVs, skipping outreach lint.')
  process.exit(0)
}

function run(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' })
  } catch (e) {
    process.exit(1)
  }
}

for (const file of stagedCsvs) {
  console.log(`Linting staged outreach file: ${file}`)
  run(`node scripts/lint-outreach-single-file.mjs ${file}`)
}
console.log('Outreach lint complete.')
