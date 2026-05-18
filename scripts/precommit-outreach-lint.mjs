import { execSync } from 'node:child_process'

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
