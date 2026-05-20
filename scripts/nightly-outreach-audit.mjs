import { execSync } from 'node:child_process'

function run(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' })
  } catch (e) {
    process.exit(1)
  }
}

console.log('Running outreach CSV format check...')
run('node scripts/check-outreach-format.mjs')
console.log('Running executive fit criteria check...')
run('node scripts/check-executive-fit-criteria.mjs')
console.log('Running outreach DB audit...')
run('node -r dotenv/config scripts/audit-outreach-db.mjs')
console.log('Outreach audit complete.')
