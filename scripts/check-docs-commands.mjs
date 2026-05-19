import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const readmePath = path.join(root, 'README.md')
const packagePath = path.join(root, 'package.json')

function main() {
  const readme = fs.readFileSync(readmePath, 'utf8')
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  const scripts = new Set(Object.keys(pkg.scripts ?? {}))

  const matches = [...readme.matchAll(/npm run ([a-zA-Z0-9:_-]+)/g)].map((m) => m[1])
  const unique = [...new Set(matches)]
  const missing = unique.filter((name) => !scripts.has(name))

  if (missing.length > 0) {
    console.error('README command check failed. Missing npm scripts:')
    for (const name of missing) console.error(`- ${name}`)
    process.exitCode = 1
    return
  }

  console.log(`README command check passed (${unique.length} npm scripts validated).`)
}

main()
