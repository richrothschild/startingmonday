const fs = require('fs')
const path = require('path')

const targets = ['src', 'public', 'worker', 'supabase', 'page1.html', 'page1_new.html']
const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.md', '.html', '.json', '.txt', '.sql', '.css'])
const patterns = [
  '\u00e2\u20ac\u00a2',
  '\u00e2\u20ac\u201d',
  '\u00e2\u20ac\u201c',
  '\u00e2\u20ac\u2122',
  '\u00e2\u20ac\u0153',
  '\u00e2\u20ac\u009c',
  '\u00e2\u20ac\u009d',
  '\u00e2\u20ac\u00a6',
  '\u00e2\u2020\u2019',
  '\u00c2\u00b7',
  '\u00f0',
].map((value) => JSON.parse(`"${value}"`))

function shouldScan(filePath) {
  return exts.has(path.extname(filePath).toLowerCase())
}

function visit(target, files) {
  const full = path.join(process.cwd(), target)
  if (!fs.existsSync(full)) return
  const stat = fs.statSync(full)
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(full)) {
      visit(path.join(target, entry), files)
    }
    return
  }
  if (shouldScan(full)) files.push(full)
}

const files = []
for (const target of targets) visit(target, files)

const matches = []
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')
  for (const pattern of patterns) {
    const index = text.indexOf(pattern)
    if (index !== -1) {
      const line = text.slice(0, index).split('\n').length
      matches.push(`${path.relative(process.cwd(), file)}:${line}:${pattern}`)
      break
    }
  }
}

if (matches.length > 0) {
  console.log(matches.join('\n'))
  process.exit(1)
}

console.log('No mojibake matches found in scanned source/assets.')
