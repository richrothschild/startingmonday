
import { execSync } from 'node:child_process'

// Only run outreach lint if any docs/outreach/*.csv file is staged
function stagedOutreachCsvs() {
  try {
    const out = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    return out.split('\n').some(f => f.match(/^docs\/outreach\/.*\.csv$/i))
  } catch (e) {
    return false
  }
}

if (!stagedOutreachCsvs()) {
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

console.log('Linting outreach signature...')
run('node scripts/lint-outreach-signature.mjs')
console.log('Linting outreach forbidden phrases...')
run('node scripts/lint-outreach-forbidden.mjs')
console.log('Linting outreach first sentence...')
run('node scripts/lint-outreach-first-sentence.mjs')
console.log('Linting outreach subject...')
run('node scripts/lint-outreach-subject.mjs')
console.log('Outreach lint complete.')
